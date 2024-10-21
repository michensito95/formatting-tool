import { Component } from '@angular/core';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  downloadLink: string | null = null;

  constructor(private documentService: DocumentService) { }

  // This method is triggered when a file is selected
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0]; // Store the selected file
    }
  }

  // This method processes the document
  async onUpload(): Promise<void> {
    if (this.selectedFile) {
      // Call the processDocument method to handle the file
      this.downloadLink = await this.documentService.processDocument(this.selectedFile); // Get the download link for processed document
    }
  }
}
