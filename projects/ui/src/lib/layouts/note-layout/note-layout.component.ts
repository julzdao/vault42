import { Component, EventEmitter, inject, Output } from '@angular/core';
import { formatCreatedDate, V42GardenFacadeService } from '@vault42/core';
import { V42BacklinksPanelComponent } from '../../components/backlinks-panel/backlinks-panel.component';
import { V42NoteContentComponent } from '../../components/note-content/note-content.component';
import { V42Logo } from '../../components/main-logo';
import { V42Sidebar } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'v42-note-layout',
  standalone: true,
  imports: [V42NoteContentComponent, V42BacklinksPanelComponent, V42Logo, V42Sidebar],
  templateUrl: './note-layout.component.html',
  styleUrl: './note-layout.component.scss',
})
export class V42NoteLayout {
  protected readonly facade = inject(V42GardenFacadeService);

  readonly selected = this.facade.selected;
  readonly notePreviews = this.facade.notePreviews;
  readonly logoName = this.facade.brandName;

  @Output() navigate = new EventEmitter<{ notebook?: string }>();

  async openNote(slug: string, origin?: string): Promise<void> {
    await this.facade.openNote(slug, origin);
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