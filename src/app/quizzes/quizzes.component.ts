import { Component } from '@angular/core';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css'],
})
export class QuizzesComponent {
  selectedFile: File | null = null;

}
