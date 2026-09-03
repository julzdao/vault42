import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getNoteContext } from '@vault42/core';
import { NoteRecord } from '@vault42/core';
import { HoverNoteDirective } from '../../directives/HoverNoteDirective';

const DESCRIPTION_CHAR_MAX = 70;

@Component({
  selector: 'v42-note-row-item',
  imports: [CommonModule, HoverNoteDirective],
  templateUrl: './note-row-item.component.html',
  styleUrl: './note-row-item.component.scss',
})
export class V42NoteRowItem {

  @Input({ required: true }) note!: NoteRecord;
  @Output() open = new EventEmitter<void>();

  trimmedDescription: string = "Default Description";

  ngOnInit() {
    this.trimmedDescription = this.trimDescription(this.note);
  }

  trimDescription(note: NoteRecord): string {
      return getNoteContext(note, DESCRIPTION_CHAR_MAX);
  }
}
