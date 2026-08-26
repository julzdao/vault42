import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V42SidebarNav } from './sidebar-nav.component';

describe('SearchNav', () => {
  let component: V42SidebarNav;
  let fixture: ComponentFixture<V42SidebarNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [V42SidebarNav],
    }).compileComponents();

    fixture = TestBed.createComponent(V42SidebarNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
