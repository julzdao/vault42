import { computed, inject, Injectable, signal } from "@angular/core";
import { V42GardenIndexService } from "./garden-index.service";
import { V42GardenNavigationService } from "./garden-nav.service";
import { V42_GARDEN_CONFIG } from "./garden-config";
import { buildNotePreviews, filterNotes, getNotebookSubfolderTree, toSearchCandidates } from "./garden-utils";
import { NoteRecord } from "./garden.types";

@Injectable({ providedIn: 'root' })
export class V42GardenFacadeService {
  private readonly indexSvc = inject(V42GardenIndexService);
  private readonly nav = inject(V42GardenNavigationService);
  private readonly config = inject(V42_GARDEN_CONFIG);

  readonly loading = this.indexSvc.loading;
  readonly error = this.indexSvc.error;
  readonly params = this.nav.params;
  readonly index = this.indexSvc.index;
  readonly brandName = this.config.brandName;
  readonly defaultCover = this.config.defaultCover;
  readonly foldersConfig = this.config.folders;

  private readonly _hoveredNote = signal<NoteRecord | undefined>(undefined);
  readonly hoveredNote = this._hoveredNote.asReadonly();

  readonly notebookSubfolderTree = computed(() => {
    const p = this.params();
    return p.notebook ? getNotebookSubfolderTree(this.indexSvc.index().notes, p.notebook) : [];
  });

  readonly filtered = computed(() => {
    const p = this.params();
    return filterNotes(this.indexSvc.index().notes, p.q, p.notebook, p.subfolder, p.subfolder3);
  });

  readonly listingNotes = computed(() => [...this.filtered()].sort((a, b) => a.title.localeCompare(b.title)));

  readonly selected = computed(() => {
    const { note, notebook, subfolder, subfolder3 } = this.params();
    if (!note) return undefined;
    return this.filtered().find((n) => n.slug === note)
      ?? (!notebook && !subfolder && !subfolder3 ? this.indexSvc.index().notes.find((n) => n.slug === note) : undefined);
  });

  /**
   * Finds the note within the index depending on specified slug.
   * @param slug - the note slug
   * @returns the NoteRecord from the specified slug.
   */ 
  findNoteBySlug(slug: string) {
    return this.indexSvc.index().notes.find((entry) => entry.slug === slug);
  }

  /**
   * Sets the current "Hovered" note to display.
   * @param note - the NoteRecord.
   */
  setHoveredNote(note: NoteRecord | undefined): void {
    this._hoveredNote.set(note);
  }

  readonly notePreviews = computed(() => buildNotePreviews(this.indexSvc.index()));
  readonly searchCandidates = computed(() => toSearchCandidates(this.indexSvc.index()));
  readonly featuredNotes = computed(() => this.listingNotes().slice(0, this.config.featuredNotesMax));
  readonly remainingNotes = computed(() => this.listingNotes().slice(this.config.featuredNotesMax));

  load = () => this.indexSvc.load();
  navigateWith = this.nav.navigateWith.bind(this.nav);
  openNote = this.nav.openNote.bind(this.nav);
  goToTag = this.nav.goToTag.bind(this.nav);
  deriveScopeFromNote = this.nav.deriveScopeFromNote.bind(this.nav);
}