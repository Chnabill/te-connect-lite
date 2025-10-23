import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingLeaveFormComponent } from './wedding-leave.component';

describe('WeddingLeaveFormComponent', () => {
  let component: WeddingLeaveFormComponent;
  let fixture: ComponentFixture<WeddingLeaveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingLeaveFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingLeaveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
