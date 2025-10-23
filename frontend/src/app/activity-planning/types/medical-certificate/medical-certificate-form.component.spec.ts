import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalCertificateFormComponent } from './medical-certificate-form.component';

describe('MedicalCertificateFormComponent', () => {
  let component: MedicalCertificateFormComponent;
  let fixture: ComponentFixture<MedicalCertificateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalCertificateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalCertificateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
