import { inject, Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { map } from "rxjs";
import { NoteRecord } from "./garden.types";
import { V42GardenIndexService } from "./garden-index.service";

export interface GardenScope {
  note?: string; q?: string; notebook?: string; subfolder?: string; subfolder3?: string; from?: string;
}

@Injectable({ providedIn: 'root' })
export class V42GardenNavigationService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly indexSvc = inject(V42GardenIndexService);

  readonly params = toSignal(
    this.route.queryParamMap.pipe(map((qp) => this.toScope(qp))),
    { initialValue: this.toScope(this.route.snapshot.queryParamMap) }
  );

  private toScope(qp: ParamMap): GardenScope {
    return {
      note: qp.get('note') ?? undefined,
      q: qp.get('q') ?? undefined,
      notebook: qp.get('notebook') ?? undefined,
      subfolder: qp.get('subfolder') ?? undefined,
      subfolder3: qp.get('subfolder3') ?? undefined,
      from: qp.get('from') ?? undefined,
    };
  }

  async navigateWith(patch: Partial<GardenScope>): Promise<void> {
    const next = { ...this.params(), ...patch };
    await this.router.navigate(['/'], {
      queryParams: {
        note: next.note || null, q: next.q || null, notebook: next.notebook || null,
        subfolder: next.subfolder || null, subfolder3: next.subfolder3 || null, from: next.from || null,
      },
    });
  }

  deriveScopeFromNote(note?: NoteRecord): { subfolder?: string; subfolder3?: string } {
    if (!note) return {};
    const parts = note.relativePath.split('/').filter(Boolean);
    return { subfolder: parts.length >= 3 ? parts[1] : undefined, subfolder3: parts.length >= 4 ? parts[2] : undefined };
  }

  async openNote(slug: string, origin?: string): Promise<void> {
    // note lookup stays with the facade below — this service just executes the nav
    const note = this.indexSvc.index().notes.find((entry) => entry.slug === slug);
    const scope = this.deriveScopeFromNote(note);

    await this.navigateWith({
      note: slug,
      notebook: note?.notebook ?? this.params().notebook,
      subfolder: scope.subfolder,
      subfolder3: scope.subfolder3,
      from: origin,
    });
  }

  async goToTag(tag: string): Promise<void> {
    await this.router.navigate(['/tag', encodeURIComponent(tag)]);
  }
}