import { Injectable } from '@angular/core';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor() {}

  // Method to parse the document
  async parseDocument(file: File): Promise<any> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value; // The HTML content extracted from the DOCX file

    // Create a temporary DOM to parse HTML
    const parser = new DOMParser();
    const docHtml = parser.parseFromString(html, 'text/html');

    return this.processHtmlElements(docHtml.body.children); // Return the parsed elements
  }

  // Method to process the document and generate a downloadable file
  async processDocument(file: File): Promise<string> {
    const sectionChildren = await this.parseDocument(file); // Call parseDocument to get the processed elements

    // Create a document with a single section
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sectionChildren,
        },
      ],
    });

    // Generate the document blob and initiate download
    const blob = await Packer.toBlob(doc);
    const downloadLink = `Processed_${file.name.replace('.docx', '.docx')}`;
    saveAs(blob, downloadLink); // Download the document

    return downloadLink; // Return the download link
  }

  // Helper method to process HTML elements and retain styles
  private processHtmlElements(elements: HTMLCollection): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      const paragraphOptions: any = {
        text: element.innerText, // Default text content
      };

      // Apply heading levels based on the tag
      switch (element.tagName) {
        case 'H1':
          paragraphOptions.heading = HeadingLevel.HEADING_1;
          break;
        case 'H2':
          paragraphOptions.heading = HeadingLevel.HEADING_2;
          break;
        case 'H3':
          paragraphOptions.heading = HeadingLevel.HEADING_3;
          break;
        case 'H5':
          const textContent = element.innerText.includes('Activity')
            ? element.innerText
            : `${element.innerText};Y;N;N;;Y;`;
          paragraphOptions.text = textContent; // For H5
          break;
        case 'P':
          // Additional processing for paragraphs can be added here if needed
          break;
        // Handle any other HTML elements if necessary
      }

      paragraphs.push(new Paragraph(paragraphOptions)); // Push the paragraph to the array
    }

    return paragraphs; // Return the array of paragraphs
  }
}
