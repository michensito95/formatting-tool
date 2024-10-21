import { Component } from '@angular/core';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {
  feedbackMessage: string = '';
  feedbackType: 'Success' | 'Error' = 'Success';
  showPopup: boolean = false;

  openPopup(type: 'Success' | 'Error', message: string) {
    this.feedbackType = type;
    this.feedbackMessage = message;
    this.showPopup = true;

    // Hide the popup after 3 seconds
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }
}
