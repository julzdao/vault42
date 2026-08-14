import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  GardenContentSource,
  V42_GARDEN_CONFIG,
  buildNotePreviews,
  filterNotes,
  formatCreatedDate,
  getNoteContext,
  getNotebookSubfolderTree,
  toSearchCandidates,
} from '@vault42/core';
import { GardenIndex, NoteRecord, SearchCandidate } from '@vault42/core';
import { V42BacklinksPanelComponent } from '../../components/backlinks-panel/backlinks-panel.component';
import { V42FooterNotesNavComponent } from '../../components/footer-notes/footer-notes-nav.component';
import { V42NoteCard } from '../../components/note-card/note-card.component';
import { V42NoteContentComponent } from '../../components/note-content/note-content.component';
import { V42NoteRowItem } from '../../components/note-row-item/note-row-item.component';
import { V42SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { V42SubfolderNavComponent } from '../../components/subfolder-nav/subfolder-nav.component';
import { V42TopNavComponent } from '../../components/top-nav/top-nav.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    V42TopNavComponent,
    V42SubfolderNavComponent,
    V42SearchBarComponent,
    V42NoteContentComponent,
    V42BacklinksPanelComponent,
    V42FooterNotesNavComponent,
    V42NoteCard,
    V42NoteRowItem
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class V42HomeLayoutComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(GardenContentSource);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly subscription = new Subscription();
  readonly config = inject(V42_GARDEN_CONFIG);
  readonly logoName = this.config.brandName;

  loading = true;
  error = '';
  index: GardenIndex = { generatedAt: '', notebooks: [], notes: [] };
  filtered: NoteRecord[] = [];
  selected?: NoteRecord;
  notePreviews: Record<string, { coverImage: string; coverUpdatedAt?: string }> = {};
  notebookSubfolderTree: Array<{ name: string; children: string[] }> = [];
  searchCandidates: SearchCandidate[] = [];
  listingNotes: NoteRecord[] = [];
  private lastRenderedNoteSlug?: string;

  q?: string;
  note?: string;
  notebook?: string;
  subfolder?: string;
  subfolder3?: string;
  from?: string;

  ngOnInit(): void {
    void this.loadFromParams(this.route.snapshot.queryParamMap);

    this.subscription.add(
      this.route.queryParamMap.subscribe((params) => {
        void this.loadFromParams(params);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  formatDate(value?: string): string | null {
    return formatCreatedDate(value);
  }

  async onNavigateTop(event: { notebook?: string }): Promise<void> {
    await this.navigateWith({
      notebook: event.notebook,
      note: undefined,
      q: undefined,
      from: undefined,
      subfolder: undefined,
      subfolder3: undefined,
    });
  }

  async onSubfolderSelect(subfolder?: string): Promise<void> {
    await this.navigateWith({
      note: undefined,
      from: undefined,
      subfolder,
      subfolder3: undefined,
    });
  }

  async onSearchSelect(candidate: SearchCandidate): Promise<void> {
    const targetNote = this.index.notes.find((entry) => entry.slug === candidate.slug);
    const scope = this.deriveScopeFromNote(targetNote);

    await this.navigateWith({
      note: candidate.slug,
      notebook: candidate.notebook,
      subfolder: scope.subfolder,
      subfolder3: scope.subfolder3,
      from: 'search',
    });
  }

  async openNote(slug: string, origin?: string): Promise<void> {
    const note = this.index.notes.find((entry) => entry.slug === slug);
    const targetNotebook = note?.notebook ?? this.notebook;
    const scope = this.deriveScopeFromNote(note);

    console.log("Current note has note coverImage value: " + note?.coverImage);

    await this.navigateWith({
      note: slug,
      notebook: targetNotebook,
      subfolder: scope.subfolder,
      subfolder3: scope.subfolder3,
      from: origin,
    });
  }

  async goToTag(tag: string): Promise<void> {
    await this.router.navigate(['/tag', encodeURIComponent(tag)]);
  }

  trackByTag(_: number, tag: string): string {
    return tag;
  }

  trackByNote(_: number, note: NoteRecord): string {
    return note.slug;
  }

  private deriveScopeFromNote(note?: NoteRecord): { subfolder?: string; subfolder3?: string } {
    if (!note) return { subfolder: undefined, subfolder3: undefined };

    const parts = note.relativePath.split('/').filter(Boolean);
    // notebook/<subfolder>/<file>.md
    const subfolder = parts.length >= 3 ? parts[1] : undefined;
    // notebook/<subfolder>/<subfolder3>/<file>.md
    const subfolder3 = parts.length >= 4 ? parts[2] : undefined;
    return { subfolder, subfolder3 };
  }

  get listingTitle(): string {
    if (this.subfolder) return `${this.subfolder}`;
    if (this.notebook) return `${this.notebook}`;
    return 'All Notes';
  }

  get listingSubtitle(): string {
    if (this.subfolder && this.notebook) {
      return `${this.listingNotes.length} notes in ${this.notebook} / ${this.subfolder}`;
    }
    if (this.notebook) {
      return `${this.listingNotes.length} notes in ${this.notebook}`;
    }
    return `${this.listingNotes.length} notes across all notebooks`;
  }

  private async loadFromParams(params: ParamMap): Promise<void> {
    this.loading = true;
    this.error = '';
    const watchdog = window.setTimeout(() => {
      if (!this.loading) return;
      this.error = 'Initialization timeout while loading content index.';
      this.loading = false;
      this.cdr.detectChanges();
    }, 15000);

    this.note = params.get('note') ?? undefined;
    this.q = params.get('q') ?? undefined;
    this.notebook = params.get('notebook') ?? undefined;
    this.subfolder = params.get('subfolder') ?? undefined;
    this.subfolder3 = params.get('subfolder3') ?? undefined;
    this.from = params.get('from') ?? undefined;

    try {
      this.index = await this.contentService.loadGardenIndex();
      this.recomputeState();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed loading notes';
    } finally {
      clearTimeout(watchdog);
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private recomputeState(): void {
    this.filtered = filterNotes(this.index.notes, this.q, this.notebook, this.subfolder, this.subfolder3);
    this.listingNotes = [...this.filtered].sort((a, b) => a.title.localeCompare(b.title));

    if (this.note) {
      const selectedFromFiltered = this.filtered.find((entry) => entry.slug === this.note);
      const selectedFromAll = !this.notebook && !this.subfolder && !this.subfolder3
        ? this.index.notes.find((entry) => entry.slug === this.note)
        : undefined;
      this.selected = selectedFromFiltered ?? selectedFromAll;
    } else {
      this.selected = undefined;
    }

    if (this.note && this.selected) {
      const expectedNotebook = this.selected.notebook;
      const expectedScope = this.deriveScopeFromNote(this.selected);
      const needsScopeSync =
        this.notebook !== expectedNotebook ||
        this.subfolder !== expectedScope.subfolder ||
        this.subfolder3 !== expectedScope.subfolder3;

      if (needsScopeSync) {
        void this.navigateWith({
          note: this.selected.slug,
          notebook: expectedNotebook,
          subfolder: expectedScope.subfolder,
          subfolder3: expectedScope.subfolder3,
        });
      }
    }

    const currentSlug = this.selected?.slug;
    if (currentSlug && currentSlug !== this.lastRenderedNoteSlug) {
      this.lastRenderedNoteSlug = currentSlug;
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
    } else if (!currentSlug) {
      this.lastRenderedNoteSlug = undefined;
    }

    this.notePreviews = buildNotePreviews(this.index);
    this.searchCandidates = toSearchCandidates(this.index);
    this.notebookSubfolderTree = this.notebook ? getNotebookSubfolderTree(this.index.notes, this.notebook) : [];
  }

  private async navigateWith(patch: {
    note?: string;
    q?: string;
    notebook?: string;
    subfolder?: string;
    subfolder3?: string;
    from?: string;
  }): Promise<void> {
    const has = (key: keyof typeof patch): boolean => Object.prototype.hasOwnProperty.call(patch, key);

    const next = {
      note: has('note') ? patch.note : this.note,
      q: has('q') ? patch.q : this.q,
      notebook: has('notebook') ? patch.notebook : this.notebook,
      subfolder: has('subfolder') ? patch.subfolder : this.subfolder,
      subfolder3: has('subfolder3') ? patch.subfolder3 : this.subfolder3,
      from: has('from') ? patch.from : this.from,
    };

    await this.router.navigate(['/'], {
      queryParams: {
        note: next.note || null,
        q: next.q || null,
        notebook: next.notebook || null,
        subfolder: next.subfolder || null,
        subfolder3: next.subfolder3 || null,
        from: next.from || null,
      },
    });
  }

  get featuredNotes(): NoteRecord[] {
    return this.listingNotes.slice(0, this.config.featuredNotesMax);
  }

  get remainingNotes(): NoteRecord[] {
    return this.listingNotes.slice(this.config.featuredNotesMax);
  }
}
