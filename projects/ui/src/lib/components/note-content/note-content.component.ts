import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'v42-note-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './note-content.component.html',
  styleUrl: './note-content.component.scss',
})
export class V42NoteContentComponent {
  @Input() html = '';
  @Input() previews: Record<string, { coverImage: string; coverUpdatedAt?: string }> = {};
  @Output() openNote = new EventEmitter<string>();

  @ViewChild('preview') previewRef?: ElementRef<HTMLDivElement>;

  previewState = { visible: false, src: '', x: 0, y: 0 };

  onClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    let url: URL;
    try {
      url = new URL(anchor.href, window.location.origin);
    } catch {
      return;
    }

    const slug = url.searchParams.get('note');
    if (!slug) return;

    event.preventDefault();
    this.openNote.emit(slug);
  }

  onHover(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    let url: URL;
    try {
      url = new URL(anchor.href, window.location.origin);
    } catch {
      return;
    }

    const slug = url.searchParams.get('note');
    if (!slug) return;
  }

  hidePreview(): void {
    this.previewState = { ...this.previewState, visible: false };
  }
}
