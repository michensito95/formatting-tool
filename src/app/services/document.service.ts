import { Injectable } from '@angular/core';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import * as mammoth from 'mammoth';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor() {}

  // Method to parse the document and convert it to HTML
  async parseDocument(file: File): Promise<HTMLElement[]> {
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

    // Create a temporary DOM to parse HTML
    const parser = new DOMParser();
    const docHtml = parser.parseFromString(html, 'text/html');

    const elements = Array.from(docHtml.body.children) as HTMLElement[]; // Cast to HTMLElement[]
    console.log("Parsed HTML Elements:", elements); // Log the parsed elements
    return elements; // Return the parsed elements
  }

  // Method to process the document and generate a downloadable file
  async processDocument(file: File): Promise<string> {
    const sectionChildren = await this.parseDocument(file); // Get the parsed elements

    // Check if valid content was found
    if (sectionChildren.length === 0) {
      console.error("No valid content found to process.");
      throw new Error("No valid content found to process.");
    }

    // Process the HTML elements to create docx paragraphs
    const paragraphs = this.processHtmlElements(sectionChildren);

    // Create a document with a single section
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    // Generate the document blob and initiate download
    const blob = await Packer.toBlob(doc);
    const downloadLink = `Processed_${file.name.replace('.docx', '.docx')}`;
    saveAs(blob, downloadLink); // Download the document

    return downloadLink; // Return the download link
  }

  // Helper method to process HTML elements and convert them into Paragraphs
  private processHtmlElements(elements: HTMLElement[]): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      console.log("Processing element:", element); // Log the element being processed

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
            : `${element.innerText};Y;N;N;;Y;`; // Append YNN method
          paragraphOptions.text = textContent; // For H5
          paragraphOptions.heading = HeadingLevel.HEADING_5;
          break;
        case 'P':
          // Additional processing for paragraphs can be added here if needed
          break;
        default:
          console.warn("Unhandled element type:", element.tagName); // Warn for unhandled element types
      }

      // Create a new Paragraph instance
      if (paragraphOptions.text) {
        const paragraph = new Paragraph(paragraphOptions);
        paragraphs.push(paragraph); // Push the paragraph to the array
      }
    }

    console.log("Generated Paragraphs:", paragraphs); // Log the generated paragraphs
    return paragraphs; // Return the array of paragraphs
  }
}
