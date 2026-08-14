import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V42NoteCard } from './note-card.component';
import { createMockNote, NoteRecord } from '@vault42/core';

const mockNote: NoteRecord = createMockNote({
    title: 'Signals'
});

describe('NoteCard', () => {
  let component: V42NoteCard;
  let fixture: ComponentFixture<V42NoteCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [V42NoteCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(V42NoteCard);
    fixture.componentRef.setInput('note', mockNote);
    
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

