import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingRhComponent } from './meeting-rh.component';

describe('MeetingRhComponent', () => {
  let component: MeetingRhComponent;
  let fixture: ComponentFixture<MeetingRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingRhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
