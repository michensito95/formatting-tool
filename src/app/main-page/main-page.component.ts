import { Component } from '@angular/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent {
  isCourseExpanded: boolean = false;
  isAssessmentExpanded: boolean = false;
  isLogoHidden: boolean = false; // Property to control logo visibility

  // Toggle the course formatting section visibility
  toggleCourseFormatting(): void {
    this.isCourseExpanded = !this.isCourseExpanded;
    if (this.isCourseExpanded) {
      this.isAssessmentExpanded = false; // Ensure the other section is collapsed
    }
    this.isLogoHidden = true; // Hide the logo when either button is clicked
  }

  // Toggle the assessment formatting section visibility
  toggleAssessmentFormatting(): void {
    this.isAssessmentExpanded = !this.isAssessmentExpanded;
    if (this.isAssessmentExpanded) {
      this.isCourseExpanded = false; // Ensure the other section is collapsed
    }
    this.isLogoHidden = true; // Hide the logo when either button is clicked
  }
}
