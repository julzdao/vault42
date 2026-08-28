import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  SearchCandidate,
  V42GardenFacadeService
} from '@vault42/core';
import { V42SearchBarComponent } from '../search-bar/search-bar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'v42-sidebar-nav',
  imports: [V42SearchBarComponent],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.scss',
})
export class V42SidebarNav {

  protected readonly facade = inject(V42GardenFacadeService);
  private readonly router = inject(Router);
  readonly index = this.facade.index;
  readonly selected = this.facade.selected;
  readonly searchCandidates = this.facade.searchCandidates;
  @Output() select = new EventEmitter<string | undefined>();


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

  navigateHome() {
    this.router.navigate(['/']);
  }

  async onNavigateBack(): Promise<void> {
    await this.facade.navigateWith({
      notebook: this.facade.params().notebook,
      note: undefined,
      q: undefined,
      from: undefined,
      subfolder: undefined,
      subfolder3: undefined,
    });
  }

  async openNote(slug: string, origin?: string): Promise<void> {
    await this.facade.openNote(slug, origin);
  }

  get q(): string | undefined {
    return this.facade.params().q;
  }
}
