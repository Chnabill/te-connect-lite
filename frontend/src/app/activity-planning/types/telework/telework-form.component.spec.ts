import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeleworkFormComponent } from './telework-form.component';

describe('TeleworkFormComponent', () => {
  let component: TeleworkFormComponent;
  let fixture: ComponentFixture<TeleworkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeleworkFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeleworkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
