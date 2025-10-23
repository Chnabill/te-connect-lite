import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceptionalLeaveFormComponent } from './exceptional-leave-form.component';

describe('ExceptionalLeaveFormComponent', () => {
  let component: ExceptionalLeaveFormComponent;
  let fixture: ComponentFixture<ExceptionalLeaveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExceptionalLeaveFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExceptionalLeaveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
