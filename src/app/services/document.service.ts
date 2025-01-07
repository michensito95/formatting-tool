import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as docx from 'docx';
import { HeadingLevel, TextRun, Paragraph, AlignmentType, IStylesOptions , Packer,   } from "docx";
import * as mammoth from 'mammoth';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor() {}

  // Method to process course document formatting
  processCourseDocument(elements: HTMLElement[]): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    let lastH2Text: string | null = null;
    let lastH3Text: string | null = null;
    let currentWordCount = 0;
  
    const addH5AfterWordCount = (subtitle: string | null) => {
      if (subtitle && currentWordCount >= 200) {
        paragraphs.push(new Paragraph({
          text: `${subtitle};Y;N;VR;;Y;`,
          heading: HeadingLevel.HEADING_5,
        }));
        currentWordCount = 0; // Reset word count
      }
    };
  
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const text = (element as HTMLElement).innerText; // Cast to HTMLElement
  
      switch (element.tagName) {
        case 'H1':
          paragraphs.push(new Paragraph({
            text,
            heading: HeadingLevel.HEADING_1,
          }));
          break;
  
        case 'H2':
          lastH2Text = text;
          lastH3Text = null; // Reset H3 when a new H2 starts
          paragraphs.push(new Paragraph({
            text: lastH2Text,
            heading: HeadingLevel.HEADING_2,
          }));
          paragraphs.push(new Paragraph({
            text: `${lastH2Text};Y;N;N;VR;;Y;`,
            heading: HeadingLevel.HEADING_5,
          }));
          currentWordCount = 0; // Reset word count
          break;
  
        case 'H3':
          lastH3Text = text; // Set the last H3 for repetition
          paragraphs.push(new Paragraph({
            text: lastH3Text,
            heading: HeadingLevel.HEADING_3,
          }));
          paragraphs.push(new Paragraph({
            text: `${lastH3Text};Y;N;N;VR;;Y;`,
            heading: HeadingLevel.HEADING_5,
          }));
          currentWordCount = 0; // Reset word count
          break;
  
        case 'H5':
          paragraphs.push(new Paragraph({
            text: text.includes('Activity')
              ? text
              : `${text};Y;N;VR;;Y;`,
            heading: HeadingLevel.HEADING_5,
          }));
          currentWordCount = 0; // Reset word count for new H5
          break;
  
        case 'P': // Regular paragraphs
          const wordsInParagraph = text.split(/\s+/).length;
          currentWordCount += wordsInParagraph;
          paragraphs.push(new Paragraph({ text }));
          addH5AfterWordCount(lastH3Text || lastH2Text); // Use H3 or H2 for repetition
          break;
  
        case 'UL': // Unordered list
          Array.from(element.children).forEach((li) => {
            if (li instanceof HTMLElement) {
              const listText = li.innerText; // Cast `li` to HTMLElement
              paragraphs.push(new Paragraph({
                text: `• ${listText}`,
              }));
              currentWordCount += listText.split(/\s+/).length;
            }
          });
          addH5AfterWordCount(lastH3Text || lastH2Text); // Use H3 or H2 for repetition
          break;
  
        case 'OL': // Ordered list
          Array.from(element.children).forEach((li, index) => {
            if (li instanceof HTMLElement) {
              const listText = li.innerText; // Cast `li` to HTMLElement
              paragraphs.push(new Paragraph({
                text: `${index + 1}. ${listText}`,
              }));
              currentWordCount += listText.split(/\s+/).length;
            }
          });
          addH5AfterWordCount(lastH3Text || lastH2Text); // Use H3 or H2 for repetition
          break;
  
        default:
          console.warn("Unhandled element type:", element.tagName);
      }
    }
  
    // Final check at the end of processing
    addH5AfterWordCount(lastH3Text || lastH2Text);
  
    console.log("Generated Paragraphs:", paragraphs);
    return paragraphs;
  }
  
  
  // Method to process the assessment document
  processAssessmentDocument(elements: HTMLElement[]): docx.Paragraph[] {
    const paragraphs: docx.Paragraph[] = [];
  
    // Loop through all elements in the parsed HTML
    elements.forEach((element: HTMLElement) => {
      const text = element.textContent?.trim() || '';
  
      if (element.tagName === 'P') {
        // Handling Questions (custom style H9)
        if (text.startsWith('Question:')) {
          paragraphs.push(new docx.Paragraph({
            text: text.replace('Question:', '').trim(),
            style: 'CustomHeading9', // Apply custom style for H9 (Title)
          }));
        }
        // Handling Answers (custom style H10)
        else if (text.startsWith('Answer:')) {
          paragraphs.push(new docx.Paragraph({
            text: text.replace('Answer:', '').trim(),
            style: 'CustomHeading10', // Apply custom style for H10 (Answers)
            bullet: { level: 0 }, // Bullet points for answers
          }));
        }
        // Handling Feedback or Comments (custom style H11)
        else if (text.startsWith('Feedback:') || text.startsWith('Comment:')) {
          paragraphs.push(new docx.Paragraph({
            text: text.replace('Feedback:', '').replace('Comment:', '').trim(),
            style: 'CustomHeading11', // Apply custom style for H11 (Feedback)
          }));
        }
      }
      // Handle any unordered list (UL) and ordered list (OL) elements
      else if (element.tagName === 'UL') {
        const ulItems = Array.from(element.children);
        ulItems.forEach((li) => {
          if (li.tagName === 'LI') {
            const listItem = li as HTMLElement;
            paragraphs.push(new docx.Paragraph({
              text: `• ${listItem.innerText}`, // Bullet point for each list item
            }));
          }
        });
      }
      else if (element.tagName === 'OL') {
        const olItems = Array.from(element.children);
        olItems.forEach((li, index) => {
          if (li.tagName === 'LI') {
            const listItem = li as HTMLElement;
            paragraphs.push(new docx.Paragraph({
              text: `${index + 1}. ${listItem.innerText}`, // Numbered point
            }));
          }
        });
      }
    });
  
    return paragraphs;
  }
  generateAssessmentDocument(paragraphs: docx.Paragraph[]): docx.Document {
    return new docx.Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Heading9',
            name: 'Heading 9',
            basedOn: 'Heading1',
            next: 'Normal',
            run: { font: 'Calibri', size: 24, bold: true },
          },
          {
            id: 'Heading10',
            name: 'Heading 10',
            basedOn: 'Heading2',
            next: 'Normal',
            run: { font: 'Calibri', size: 22, bold: false },
          },
          {
            id: 'Heading11',
            name: 'Heading 11',
            basedOn: 'Heading3',
            next: 'Normal',
            run: { font: 'Calibri', size: 20 },
          },
          {
            id: 'Heading12',
            name: 'Heading 12',
            basedOn: 'Heading4', // You can change this to whatever suits your hierarchy
            next: 'Normal',
            run: { font: 'Calibri', size: 18 },
        },
        ],
      },
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });
  }
  
  // Method to process the file and format it as a docx document
  processFile(file: File, isAssessment: boolean): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const arrayBuffer = e.target.result;

            // Use convertToHtml instead of extractRawText
            mammoth.convertToHtml({ arrayBuffer })
                .then((result) => {
                    const htmlContent = result.value;
                    console.log("Extracted HTML Content:", htmlContent); // Log HTML content
                    
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, 'text/html');
                    const elements = Array.from(doc.body.children) as HTMLElement[]; // Cast to HTMLElement[]
                    
                    console.log("Parsed Elements Length:", elements.length); // Log the number of elements
                    console.log("Parsed Elements:", elements); // Log the actual elements
                    
                    // Process the document differently for assessment or course
                    const paragraphs = isAssessment
                        ? this.processAssessmentDocument(elements)
                        : this.processCourseDocument(elements);

                    // If the document is an assessment, use generateAssessmentDocument
                    const docxDocument = isAssessment
                        ? this.generateAssessmentDocument(paragraphs)  // Custom function for assessment documents
                        : new docx.Document({
                            sections: [
                                {
                                    properties: {},
                                    children: paragraphs,
                                },
                            ],
                        });

                    docx.Packer.toBlob(docxDocument).then((blob: Blob) => {
                        console.log("Generated Blob:", blob); // Log Blob details
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
    console.log("Downloading File with Blob:", blob);
  }
}
