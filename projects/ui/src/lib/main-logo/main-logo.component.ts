import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'v42-main-logo',
  imports: [],
  templateUrl: './main-logo.component.html',
  styleUrl: './main-logo.component.scss',
})
export class V42Logo {
  @Input({required: true}) logoName!: string;
  @Input() clickable = true;
  @Input() variant: 'default' | 'footer' = 'default';
  @Output() navigate = new EventEmitter<{ notebook?: string }>();
}
