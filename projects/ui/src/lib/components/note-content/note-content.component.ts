import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import {
  V42GardenFacadeService
} from '@vault42/core';

@Component({
  selector: 'v42-note-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './note-content.component.html',
  styleUrl: './note-content.component.scss',
})
export class V42NoteContentComponent {
   protected readonly facade = inject(V42GardenFacadeService);
   
  @Input() html = '';
  @Input() previews: Record<string, { coverImage: string; coverUpdatedAt?: string }> = {};
  @Output() openNote = new EventEmitter<string>();

  private parseNoteSlugFromHref(href: string): string | null {
    try {
      const url = new URL(href, window.location.origin);
      return url.searchParams.get('note');
    } catch {
      return null;
    }
  }

  onClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const slug = this.parseNoteSlugFromHref(anchor.href);
    if (!slug) return;

    event.preventDefault();
    this.openNote.emit(slug);
  }

  onMouseOver(event: MouseEvent): void {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a');
    if (!link) return;

    const slug = this.parseNoteSlugFromHref(link.getAttribute('href')!);
    if (!slug) return;

    const note = this.facade.findNoteBySlug(slug);
    if (note) {
      this.facade.setHoveredNote(note);
    }
  }

  onMouseOut(event: MouseEvent): void {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a');
    if (!link) return;
    this.facade.setHoveredNote(undefined);
  }
}
