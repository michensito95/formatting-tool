import { Component } from '@angular/core';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-upload-assessment',
  templateUrl: './upload-assessment.component.html',
  styleUrls: ['./upload-assessment.component.css']
})
export class UploadAssessmentComponent {  // or UploadComponent
  selectedFile: File | null = null;
  downloadLink: Blob | null = null;  // Change type from string to Blob

  constructor(private documentService: DocumentService) { }

  // This method is triggered when a file is selected
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0]; // Store the selected file
    }
  }

  // This method processes the document and triggers download
  async onUpload(): Promise<void> {
    if (this.selectedFile) {
      // Call the processDocument method to handle the file
      this.downloadLink = await this.documentService.processFile(this.selectedFile, true); // Get the Blob from service

      // Ensure that you call the download logic after processing
      if (this.downloadLink) {
        // Create a download link and trigger the download
        const url = window.URL.createObjectURL(this.downloadLink);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'processed-document.docx'; // Set the default file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  // Clean up the object URL
      }
    }
  }
}
