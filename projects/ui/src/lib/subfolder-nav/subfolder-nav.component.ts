import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubfolderTreeItem } from '@vault42/core';

@Component({
  selector: 'v42-subfolder-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subfolder-nav.component.html',
  styleUrl: './subfolder-nav.component.scss',
})
export class V42SubfolderNavComponent {
  @Input() items: SubfolderTreeItem[] = [];
  @Input() currentSubfolder?: string;
  @Output() select = new EventEmitter<string | undefined>();
}
