import {Directive, HostListener, inject, input, signal} from '@angular/core';
import {
  NoteRecord, V42GardenFacadeService
} from '@vault42/core';

@Directive({
  selector: '[hovernote]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HoverNoteDirective {

  private readonly facade = inject(V42GardenFacadeService);
  hovernote = input.required<NoteRecord>();

  onMouseEnter(): void {
    this.facade.setHoveredNote(this.hovernote());
  }

  onMouseLeave(): void {
    this.facade.setHoveredNote(undefined);
  }


}