import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { scoreCandidate } from '@vault42/core';
import { SearchCandidate } from '@vault42/core';

@Component({
  selector: 'v42-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class V42SearchBarComponent implements OnChanges {
  @Input() defaultQuery = '';
  @Input() notes: SearchCandidate[] = [];
  @Output() select = new EventEmitter<SearchCandidate>();

  open = false;
  query = '';
  activeIndex = 0;
  suggestions: SearchCandidate[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultQuery']) this.query = this.defaultQuery ?? '';
    this.rank();
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.open = !this.open;
      return;
    }
    if (event.key === 'Escape') this.open = false;
  }

  onInputKeydown(event: KeyboardEvent): void {
    this.rank();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, Math.max(0, this.suggestions.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const candidate = this.suggestions[this.activeIndex];
      if (candidate) this.choose(candidate);
      return;
    }

    setTimeout(() => this.rank(), 0);
  }

  choose(candidate: SearchCandidate): void {
    this.open = false;
    this.select.emit(candidate);
  }

  closeByBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) this.open = false;
  }

  private rank(): void {
    const q = this.query.trim();
    if (!q) {
      this.suggestions = this.notes.slice(0, 14);
      this.activeIndex = 0;
      return;
    }

    this.suggestions = this.notes
      .map((note) => ({ note, score: scoreCandidate(note, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => (b.score === a.score ? a.note.title.localeCompare(b.note.title) : b.score - a.score))
      .slice(0, 14)
      .map((entry) => entry.note);

    this.activeIndex = 0;
  }
}
