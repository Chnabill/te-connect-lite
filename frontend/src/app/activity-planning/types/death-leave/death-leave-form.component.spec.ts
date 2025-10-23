import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeathLeaveFormComponent } from './death-leave-form.component';

describe('DeathLeaveFormComponent', () => {
  let component: DeathLeaveFormComponent;
  let fixture: ComponentFixture<DeathLeaveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeathLeaveFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeathLeaveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
