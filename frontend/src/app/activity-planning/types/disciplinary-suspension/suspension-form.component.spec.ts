import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspensionFormComponent } from './suspension-form.component';

describe('SuspensionFormComponent', () => {
  let component: SuspensionFormComponent;
  let fixture: ComponentFixture<SuspensionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuspensionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuspensionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
