import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V42Sidebar } from './sidebar.component';

describe('Sidebar', () => {
  let component: V42Sidebar;
  let fixture: ComponentFixture<V42Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [V42Sidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(V42Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
