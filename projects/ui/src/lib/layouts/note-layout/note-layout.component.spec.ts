import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V42NoteLayout } from './note-layout.component';

describe('NoteLayout', () => {
  let component: V42NoteLayout;
  let fixture: ComponentFixture<V42NoteLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [V42NoteLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(V42NoteLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
