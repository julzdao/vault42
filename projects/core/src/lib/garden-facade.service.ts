import { computed, inject, Injectable } from "@angular/core";
import { V42GardenIndexService } from "./garden-index.service";
import { V42GardenNavigationService } from "./garden-nav.service";
import { V42_GARDEN_CONFIG } from "./garden-config";
import { buildNotePreviews, filterNotes, getNotebookSubfolderTree, toSearchCandidates } from "./garden-utils";

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