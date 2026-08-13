import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { V42Logo } from '../main-logo';

@Component({
  selector: 'v42-top-nav',
  standalone: true,
  imports: [CommonModule, V42Logo],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss',
})
export class V42TopNavComponent {
  @Input({required: true}) brandName!: string;
  
  @Input() notebooks: string[] = [];
  @Input() current?: string;
  @Output() navigate = new EventEmitter<{ notebook?: string }>();
}
