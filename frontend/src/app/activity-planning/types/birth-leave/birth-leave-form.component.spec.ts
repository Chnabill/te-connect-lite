import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthLeaveFormComponent } from './birth-leave-form.component';

describe('BirthLeaveFormComponent', () => {
  let component: BirthLeaveFormComponent;
  let fixture: ComponentFixture<BirthLeaveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirthLeaveFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BirthLeaveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
