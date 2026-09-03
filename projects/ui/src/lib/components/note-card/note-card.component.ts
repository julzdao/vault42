import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getNoteContext } from '@vault42/core';
import { NoteRecord } from '@vault42/core';
import { HoverNoteDirective } from '../../directives/HoverNoteDirective';

@Component({
  selector: 'v42-note-card',
  imports: [ HoverNoteDirective ],
  templateUrl: './note-card.component.html',
  styleUrl: './note-card.component.scss',
})
export class V42NoteCard {

  @Input({ required: true }) note!: NoteRecord;
  @Output() open = new EventEmitter<void>();

  summary(note: NoteRecord): string {
    if (note.description?.trim()) return note.description;
    return getNoteContext(note, 220);
  }
}
