import { Injectable } from '@angular/core';
<<<<<<< Updated upstream
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
=======
>>>>>>> Stashed changes
import { saveAs } from 'file-saver';
import * as docx from 'docx';
import { HeadingLevel, TextRun, Paragraph } from 'docx';
import * as mammoth from 'mammoth';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor() {}

<<<<<<< Updated upstream
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
=======
  // Method to process course document formatting
  processCourseDocument(elements: HTMLElement[]): Paragraph[] {
>>>>>>> Stashed changes
    const paragraphs: Paragraph[] = [];

    // Iterate over each HTML element
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
<<<<<<< Updated upstream
      console.log("Processing element:", element); // Log the element being processed
=======
      console.log('Processing element:', element);
>>>>>>> Stashed changes

      const paragraphOptions: any = {
        text: element.innerText, // Default text content
      };

<<<<<<< Updated upstream
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
=======
      // Handle specific heading levels (H2, H3, H5) for courses
      switch (element.tagName) {
        case 'H2': // Course main container (mapped to Heading 2)
          paragraphOptions.heading = HeadingLevel.HEADING_2;
          break;
        case 'H3': // Subcontainer (mapped to Heading 3)
          paragraphOptions.heading = HeadingLevel.HEADING_3;
          break;
        case 'H5': // Titles inside CO (mapped to Heading 5)
          paragraphOptions.heading = HeadingLevel.HEADING_5;
          break;
        default:
          console.warn('Unhandled element type:', element.tagName); // Log unhandled tags
          break;
      }

      // Apply custom styles for H5 (titles inside the content object)
      if (element.tagName === 'H5') {
        paragraphOptions.children = [
          new TextRun({
            text: element.innerText,
            font: 'Arial',
            size: 16, // Example font size for H5
          }),
        ];
      }

      // Add the formatted paragraph to the list of paragraphs
      paragraphs.push(new Paragraph(paragraphOptions));
    }

    console.log('Generated Paragraphs:', paragraphs);
    return paragraphs;
  }

  // Method to process assessment document formatting
  processAssessmentDocument(elements: HTMLElement[]): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Iterate over each HTML element
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      console.log('Processing element:', element);

      const paragraphOptions: any = {
        text: element.innerText, // Default text content
      };

      // Handle specific heading levels for assessments
      switch (element.tagName) {
        case 'H1': // Assessment Title (mapped to Heading 9)
          paragraphOptions.heading = HeadingLevel.HEADING_1;
          break;
        case 'H2': // Assessment Question (mapped to Heading 10)
          paragraphOptions.heading = HeadingLevel.HEADING_2;
          break;
        case 'H3': // Assessment Answer (mapped to Heading 11)
          paragraphOptions.heading = HeadingLevel.HEADING_3;
          break;
        case 'H4': // Feedback or Comment section (mapped to Heading 12)
          paragraphOptions.heading = HeadingLevel.HEADING_4;
          break;
        default:
          console.warn('Unhandled element type:', element.tagName); // Log unhandled tags
          break;
      }

      // Apply custom styles for specific headings
      if (element.tagName === 'H1') {
        // Custom style for Title (mapped to H9)
        paragraphOptions.children = [
          new TextRun({
            text: element.innerText,
            bold: true,
            font: 'Arial',
            size: 28, // Custom font size for H9
          }),
        ];
      } else if (element.tagName === 'H2') {
        // Custom style for Question (mapped to H10)
        paragraphOptions.children = [
          new TextRun({
            text: element.innerText,
            font: 'Arial',
            size: 24, // Custom font size for H10
          }),
        ];
      } else if (element.tagName === 'H3') {
        // Custom style for Answer (mapped to H11)
        paragraphOptions.children = [
          new TextRun({
            text: element.innerText,
            font: 'Arial',
            size: 20, // Custom font size for H11
          }),
        ];
      } else if (element.tagName === 'H4') {
        // Custom style for Feedback/Comment (mapped to H12)
        paragraphOptions.children = [
          new TextRun({
            text: element.innerText,
            font: 'Arial',
            size: 18, // Custom font size for H12
          }),
        ];
      }

      // Add the formatted paragraph to the list of paragraphs
      paragraphs.push(new Paragraph(paragraphOptions));
    }

    console.log('Generated Paragraphs:', paragraphs);
    return paragraphs;
  }

  // Method to process the file and format it as a docx document
  processFile(file: File, isAssessment: boolean): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const arrayBuffer = e.target.result;
        mammoth.extractRawText({ arrayBuffer })
          .then((result) => {
            const htmlContent = result.value;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const elements = Array.from(doc.body.children) as HTMLElement[];  // Cast to HTMLElement[]

            const paragraphs = isAssessment
              ? this.processAssessmentDocument(elements) // For assessment documents
              : this.processCourseDocument(elements); // For course documents

            // Create a new docx document
            const docxDocument = new docx.Document({
              sections: [
                {
                  properties: {},
                  children: paragraphs,
                },
              ],
            });

            // Use static method to generate the docx file as a Blob
            docx.Packer.toBlob(docxDocument).then((blob: Blob) => {
              resolve(blob);
            }).catch((error) => reject(error));
          })
          .catch((error) => reject(error));
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Method to download the formatted document
  downloadDocument(blob: Blob, filename: string): void {
    saveAs(blob, filename);
>>>>>>> Stashed changes
  }
}
