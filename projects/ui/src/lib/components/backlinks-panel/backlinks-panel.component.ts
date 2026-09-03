import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BacklinkEntry, NoteRecord, V42GardenFacadeService } from '@vault42/core';
import { HoverNoteDirective } from '../../directives/HoverNoteDirective';

@Component({
  selector: 'v42-backlinks-panel',
  standalone: true,
  imports: [CommonModule, HoverNoteDirective],
  templateUrl: './backlinks-panel.component.html',
  styleUrl: './backlinks-panel.component.scss',
})
export class V42BacklinksPanelComponent {
  protected readonly facade = inject(V42GardenFacadeService);

  @Input() backlinks: BacklinkEntry[] = [];
  @Output() openNote = new EventEmitter<string>();

  /**
   * Triggers on Mouse Over each backlink html <li> element.
   * @param slug - the note slug from the backlink.
   */
  onMouseOver(slug: string): void  { 
    const note = this.facade.findNoteBySlug(slug);
    if (note) {
      this.facade.setHoveredNote(note);
    }
  }

  /**
   * Resets the hovered note on mouse out from each backlink html <li> element.
   */
  onMouseOut(): void {
    this.facade.setHoveredNote(undefined);
  }
}
