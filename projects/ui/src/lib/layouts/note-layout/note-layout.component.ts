import { Component, EventEmitter, inject, Output } from '@angular/core';
import { formatCreatedDate, V42GardenFacadeService } from '@vault42/core';
import { V42BacklinksPanelComponent } from '../../components/backlinks-panel/backlinks-panel.component';
import { V42NoteContentComponent } from '../../components/note-content/note-content.component';
import { V42Logo } from '../../components/main-logo';

@Component({
  selector: 'v42-note-layout',
  standalone: true,
  imports: [V42NoteContentComponent, V42BacklinksPanelComponent, V42Logo],
  templateUrl: './note-layout.component.html',
  styleUrl: './note-layout.component.scss',
})
export class V42NoteLayout {
  protected readonly facade = inject(V42GardenFacadeService);

  readonly selected = this.facade.selected;
  readonly notePreviews = this.facade.notePreviews;
  readonly logoName = this.facade.brandName;

  @Output() navigate = new EventEmitter<{ notebook?: string }>();

  formatDate(value?: string): string | null {
    return formatCreatedDate(value);
  }

  async openNote(slug: string, origin?: string): Promise<void> {
    await this.facade.openNote(slug, origin);
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