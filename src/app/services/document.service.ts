import { Injectable } from '@angular/core';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import * as mammoth from 'mammoth';
import { Quiz } from '../models/quiz.model'; 


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

  private processHtmlElements(elements: HTMLElement[]): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    let lastH2Text: string | null = null; // Store the last processed H2 text
    let lastH3Text: string | null = null; // Store the last processed H3 text
    let currentWordCount = 0; // Track the current word count
    let currentH5Text: string | null = null; // Store the current H5 text for repetition

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
                // Process H2: store the text and create an H5
                lastH2Text = element.innerText; // Store the last processed H2 text
                currentH5Text = `${lastH2Text}. Y;N;N;VR;;Y;`; // H5 text derived from H2
                paragraphs.push(new Paragraph({
                    text: lastH2Text,
                    heading: HeadingLevel.HEADING_2,
                }));
                // Add the H5 for the H2
                paragraphs.push(new Paragraph({
                    text: currentH5Text,
                    heading: HeadingLevel.HEADING_5,
                }));
                currentWordCount = 0; // Reset the word count for the new section
                break;
            case 'H3':
                // Process H3: store the text and create an H5
                if (lastH3Text !== element.innerText) {
                    lastH3Text = element.innerText; // Store the last processed H3 text
                    paragraphs.push(new Paragraph({
                        text: lastH3Text,
                        heading: HeadingLevel.HEADING_3,
                    }));
                    // Add the corresponding H5 based on the last processed H3
                    paragraphs.push(new Paragraph({
                        text: `${lastH3Text}. Y;N;N;VR;;Y;`, // H5 text derived from H3 with YNN format
                        heading: HeadingLevel.HEADING_5,
                    }));
                    currentWordCount = 0; // Reset the word count for the new section
                }
                break;
            case 'H5':
                // Set the current H5 text for repetition
                currentH5Text = element.innerText.includes('Activity')
                    ? element.innerText
                    : `${element.innerText};Y;N;VR;;Y;`; // Append YNN method
                break;
            case 'P':
                // Add regular paragraphs, but also count the words
                const wordsInParagraph = element.innerText.split(/\s+/).length;
                currentWordCount += wordsInParagraph;

                // Add the paragraph to the document
                paragraphs.push(new Paragraph({
                    text: element.innerText,
                }));

                // Check if we need to repeat the last H5
                if (currentH5Text && currentWordCount >= 200) {
                    paragraphs.push(new Paragraph({
                        text: currentH5Text,
                        heading: HeadingLevel.HEADING_5,
                    }));
                    currentWordCount = 0; // Reset word count after repeating the H5
                }
                break;
            default:
                console.warn("Unhandled element type:", element.tagName); // Warn for unhandled element types
        }
    }

    console.log("Generated Paragraphs:", paragraphs); // Log the generated paragraphs
    return paragraphs; // Return the array of paragraphs
}



}
