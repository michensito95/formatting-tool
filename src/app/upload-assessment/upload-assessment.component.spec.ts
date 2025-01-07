import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAssessmentComponent } from './upload-assessment.component';

describe('UploadAssessmentComponent', () => {
  let component: UploadAssessmentComponent;
  let fixture: ComponentFixture<UploadAssessmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadAssessmentComponent]
    });
    fixture = TestBed.createComponent(UploadAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
