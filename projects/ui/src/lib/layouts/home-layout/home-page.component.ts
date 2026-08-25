import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  V42GardenFacadeService
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
import { V42NoteLayout } from '../note-layout/note-layout.component';
import { V42Logo } from '../../components/main-logo';

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
    V42NoteRowItem,
    V42NoteLayout,
    V42Logo
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class V42HomeLayoutComponent implements OnInit {
  protected readonly facade = inject(V42GardenFacadeService);

  // Signals, re-exported for template readability. Bind with `()` in the template.
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly index = this.facade.index;
  readonly selected = this.facade.selected;
  readonly listingNotes = this.facade.listingNotes;
  readonly featuredNotes = this.facade.featuredNotes;
  readonly remainingNotes = this.facade.remainingNotes;
  readonly notePreviews = this.facade.notePreviews;
  readonly searchCandidates = this.facade.searchCandidates;
  readonly notebookSubfolderTree = this.facade.notebookSubfolderTree;
  readonly logoName = this.facade.brandName;

  ngOnInit(): void {
    void this.facade.load();
  }

  async onNavigateTop(event: { notebook?: string }): Promise<void> {
    await this.facade.navigateWith({
      notebook: event.notebook,
      note: undefined,
      q: undefined,
      from: undefined,
      subfolder: undefined,
      subfolder3: undefined,
    });
  }

  async onSubfolderSelect(subfolder?: string): Promise<void> {
    await this.facade.navigateWith({
      note: undefined,
      from: undefined,
      subfolder,
      subfolder3: undefined,
    });
  }

  async onSearchSelect(candidate: SearchCandidate): Promise<void> {
    const targetNote = this.index().notes.find((entry) => entry.slug === candidate.slug);
    const scope = this.facade.deriveScopeFromNote(targetNote);

    await this.facade.navigateWith({
      note: candidate.slug,
      notebook: candidate.notebook,
      subfolder: scope.subfolder,
      subfolder3: scope.subfolder3,
      from: 'search',
    });
  }

  async openNote(slug: string, origin?: string): Promise<void> {
    await this.facade.openNote(slug, origin);
  }

  trackByNote(_: number, note: NoteRecord): string {
    return note.slug;
  }

  get notebook(): string | undefined {
    return this.facade.params().notebook;
  }

  get subfolder(): string | undefined {
    return this.facade.params().subfolder;
  }

  get q(): string | undefined {
    return this.facade.params().q;
  }

  get listingTitle(): string {
    if (this.subfolder) return this.subfolder;
    if (this.notebook) return this.notebook;
    return 'All Notes';
  }

  get listingSubtitle(): string {
    const count = this.listingNotes().length;
    if (this.subfolder && this.notebook) return `${count} notes in ${this.notebook} / ${this.subfolder}`;
    if (this.notebook) return `${count} notes in ${this.notebook}`;
    return `${count} notes across all notebooks`;
  }
}