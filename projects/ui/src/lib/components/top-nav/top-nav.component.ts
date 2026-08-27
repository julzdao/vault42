import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { V42Logo } from '../main-logo';
import { V42GardenFacadeService } from '@vault42/core';

@Component({
  selector: 'v42-top-nav',
  standalone: true,
  imports: [CommonModule, V42Logo],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss',
})
export class V42TopNavComponent {

  protected readonly facade = inject(V42GardenFacadeService);

  @Input({required: true}) brandName!: string;
  
  @Input() notebooks: string[] = [];
  @Output() navigate = new EventEmitter<{ notebook?: string }>();

  get currentNotebook(): string | undefined {
    return this.facade.params().notebook;
  }
}
