import { Component, computed, Directive, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { V42Logo } from '../main-logo';
import {
  formatCreatedDate,
  V42GardenFacadeService, FoldersConfig
} from '@vault42/core';
import { V42SidebarNav } from '../sidebar-nav';
import { HoverNoteDirective } from '../../directives/HoverNoteDirective';

interface SidebarDisplay {
  title: string | undefined;
  coverImage: string | undefined;
  fundamental: string;
}

@Component({
  selector: 'v42-sidebar',
  imports: [CommonModule, V42Logo, V42SidebarNav, HoverNoteDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class V42Sidebar {
    
    protected readonly facade = inject(V42GardenFacadeService);

    readonly selected = this.facade.selected;
    readonly logoName = this.facade.brandName;
    readonly listingNotes = this.facade.listingNotes;
    @Output() navigate = new EventEmitter<{ notebook?: string }>();

    readonly displayNote = computed(() => this.facade.hoveredNote() ?? this.facade.selected());

    /**
     * Displays the sidebar's display object, which is a combination of the selected note's cover image and fundamental data.
     * @returns The sidebar's display object
     */
    readonly display = computed<SidebarDisplay>(() => {
      const note = this.displayNote();
      if (note?.coverImage || note?.fundamental) {
        return {
          title: note.title,
          coverImage: note.coverImage,
          fundamental: note.fundamental ?? this.resolvedFolderConfig?.fundamental ?? "",
        };
      }
      return {
        title: note?.title,
        coverImage: note?.coverImage,
        fundamental: this.resolvedFolderConfig?.fundamental ?? "",
      };
    });

    private get resolvedFolderConfig(): FoldersConfig | undefined {
      const foldersConfig = this.facade.foldersConfig; 
      return foldersConfig.find(x => x.id === this.subfolder) 
        ?? foldersConfig.find(x => x.id === this.notebook);
    }

    get folderFundamental(): string {
      return this.resolvedFolderConfig?.fundamental ?? ""; // TODO: add default fundamental
    }

     get notebook(): string | undefined {
      return this.facade.params().notebook;
    }

    get subfolder(): string | undefined {
      return this.facade.params().subfolder;
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
