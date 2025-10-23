import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentReportComponent } from './accident-report.component';

describe('AccidentReportComponent', () => {
  let component: AccidentReportComponent;
  let fixture: ComponentFixture<AccidentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccidentReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccidentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
