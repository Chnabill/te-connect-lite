import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaternityLeaveFormComponent } from './maternity-leave-form.component';

describe('MaternityLeaveFormComponent', () => {
  let component: MaternityLeaveFormComponent;
  let fixture: ComponentFixture<MaternityLeaveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaternityLeaveFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaternityLeaveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
