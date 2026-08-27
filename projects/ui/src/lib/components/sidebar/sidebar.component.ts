import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { V42Logo } from '../main-logo';
import {
  formatCreatedDate,
  V42GardenFacadeService
} from '@vault42/core';
import { V42SidebarNav } from '../sidebar-nav';

@Component({
  selector: 'v42-sidebar',
  imports: [CommonModule, V42Logo, V42SidebarNav],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class V42Sidebar {
    
    protected readonly facade = inject(V42GardenFacadeService);

    readonly selected = this.facade.selected;
    readonly logoName = this.facade.brandName;
    readonly listingNotes = this.facade.listingNotes;
    @Output() navigate = new EventEmitter<{ notebook?: string }>();

    get coverImage(): string {
      const subfolderCover = this.facade.covers.find(x => x.id === this.subfolder);
      if (subfolderCover) {
        return subfolderCover.pathToCover;
      }
      const notebookCover = this.facade.covers.find(x => x.id === this.notebook);
      if (notebookCover) {
        return notebookCover.pathToCover;
      }

      return this.facade.defaultCover;
    } 

     get notebook(): string | undefined {
      return this.facade.params().notebook;
    }

    get subfolder(): string | undefined {
      return this.facade.params().subfolder;
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

    formatDate(value?: string): string | null {
      return formatCreatedDate(value);
    }

    async goToTag(tag: string): Promise<void> {
      await this.facade.goToTag(tag);
    }

    trackByTag(_: number, tag: string): string {
      return tag;
    }

    async onClickLogo(event: { notebook?: string }): Promise<void> {
      await this.facade.navigateWith({
        notebook: this.facade.params().notebook,
        note: undefined,
        q: undefined,
        from: undefined,
        subfolder: undefined,
        subfolder3: undefined,
      });
    }
}
