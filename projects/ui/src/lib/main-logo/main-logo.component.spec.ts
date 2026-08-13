import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V42Logo } from './main-logo.component';

describe('MainLogo', () => {
  let component: V42Logo;
  let fixture: ComponentFixture<V42Logo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [V42Logo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(V42Logo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
