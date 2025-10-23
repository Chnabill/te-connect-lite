import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftChangeFormComponent } from './shift-change-form.component';

describe('ShiftChangeFormComponent', () => {
  let component: ShiftChangeFormComponent;
  let fixture: ComponentFixture<ShiftChangeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftChangeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftChangeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
