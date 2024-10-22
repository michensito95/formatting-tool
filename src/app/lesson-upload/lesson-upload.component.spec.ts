import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonUploadComponent } from './lesson-upload.component';

describe('LessonUploadComponent', () => {
  let component: LessonUploadComponent;
  let fixture: ComponentFixture<LessonUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LessonUploadComponent]
    });
    fixture = TestBed.createComponent(LessonUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
