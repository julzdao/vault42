import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BacklinkEntry } from '@vault42/core';

@Component({
  selector: 'v42-backlinks-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backlinks-panel.component.html',
  styleUrl: './backlinks-panel.component.scss',
})
export class V42BacklinksPanelComponent {
  @Input() backlinks: BacklinkEntry[] = [];
  @Output() openNote = new EventEmitter<string>();
}
