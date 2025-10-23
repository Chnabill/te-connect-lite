import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementManageComponent } from './announcement-manage.component';

describe('AnnouncementManageComponent', () => {
  let component: AnnouncementManageComponent;
  let fixture: ComponentFixture<AnnouncementManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
