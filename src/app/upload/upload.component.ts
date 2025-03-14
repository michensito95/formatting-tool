import { Component } from '@angular/core';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  downloadLink: Blob | null = null;  

  constructor(private documentService: DocumentService) { }


  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }
  }


  async onUpload(): Promise<void> {
    if (this.selectedFile) {
      // Call the processDocument method to handle the file
      this.downloadLink = await this.documentService.processFile(this.selectedFile, false); 

      if (this.downloadLink) {

        const url = window.URL.createObjectURL(this.downloadLink);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Processed_${this.selectedFile.name}`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
      }
    }
  }
}
