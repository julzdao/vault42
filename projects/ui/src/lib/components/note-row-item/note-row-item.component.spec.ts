import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteRecord } from '@vault42/core';
import { V42NoteRowItem } from './note-row-item.component';
import { createMockNote } from '@vault42/core';

const mockNote: NoteRecord = createMockNote({
    title: 'Signals'
});

describe('NoteRowItem', () => {
  let component: V42NoteRowItem;
  let fixture: ComponentFixture<V42NoteRowItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [V42NoteRowItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(V42NoteRowItem);

    fixture.componentRef.setInput('note', mockNote);

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    expect(fixture.nativeElement.textContent)
      .toContain(mockNote.title);
  });

  it('should render the notebook category', () => {
    expect(fixture.nativeElement.textContent)
      .toContain(mockNote.notebook);
  });

});


