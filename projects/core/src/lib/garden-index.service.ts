import { inject, Injectable, signal } from "@angular/core";
import { GardenContentSource } from "./garden-content";
import { GardenIndex } from "./garden.types";

@Injectable({ providedIn: 'root' })
export class V42GardenIndexService {
  private readonly contentService = inject(GardenContentSource);

  private readonly _index = signal<GardenIndex>({ generatedAt: '', notebooks: [], notes: [] });
  private readonly _loading = signal(true);
  private readonly _error = signal('');

  readonly index = this._index.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set('');
    const watchdog = setTimeout(() => {
      if (this._loading()) {
        this._error.set('Initialization timeout while loading content index.');
        this._loading.set(false);
      }
    }, 15000);

    try {
      this._index.set(await this.contentService.loadGardenIndex());
    } catch (err) {
      this._error.set(err instanceof Error ? err.message : 'Failed loading notes');
    } finally {
      clearTimeout(watchdog);
      this._loading.set(false);
    }
  }
}