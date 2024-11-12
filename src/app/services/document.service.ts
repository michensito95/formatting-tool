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
    let lastH2Text: string | null = null; // Store the last processed H2 text
    let lastH3Text: string | null = null; // Store the last processed H3 text
    let currentWordCount = 0; // Track the current word count
    let currentH5Text: string | null = null; // Store the current H5 text for repetition
  
    // Iterate over each HTML element
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      console.log("Processing element:", element); // Log the element being processed
  
      const paragraphOptions: any = {
        text: element.innerText, // Default text content
      };
  
      // Apply heading levels based on the tag
      switch (element.tagName) {
        case 'H1':
          paragraphs.push(new Paragraph({
            text: element.innerText,
            heading: HeadingLevel.HEADING_1,
          }));
          break;
          
        case 'H2': // Process H2 and generate corresponding H5
          lastH2Text = element.innerText; // Store the last processed H2 text
          currentH5Text = `${lastH2Text};Y;N;N;VR;;Y;`; // H5 text derived from H2
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
  
        case 'H3': // Process H3 and generate corresponding H5
          if (lastH3Text !== element.innerText) {
            lastH3Text = element.innerText; // Store the last processed H3 text
            paragraphs.push(new Paragraph({
              text: lastH3Text,
              heading: HeadingLevel.HEADING_3,
            }));
            // Add the corresponding H5 based on the last processed H3
            paragraphs.push(new Paragraph({
              text: `${lastH3Text};Y;N;N;VR;;Y;`, // H5 text derived from H3 with YNN format
              heading: HeadingLevel.HEADING_5,
            }));
            currentWordCount = 0; // Reset the word count for the new section
          }
          break;
  
        case 'H5': // Handle H5 elements (titles inside content objects)
          // Format H5 text: if it includes "Activity", don't append the YNN string
          currentH5Text = element.innerText.includes('Activity')
            ? element.innerText
            : `${element.innerText};Y;N;VR;;Y;`; // Append YNN method
  
          // Split the H5 into words and check if it exceeds 200 words
          const wordsInH5 = currentH5Text.trim().split(/\s+/); // Split into words
          const totalH5Words = wordsInH5.length;
  
          // If the H5 text exceeds 200 words, split it
          if (totalH5Words > 200) {
            let chunkStart = 0;
            // Split the H5 text into chunks of 200 words
            while (chunkStart < wordsInH5.length) {
              const chunk = wordsInH5.slice(chunkStart, chunkStart + 200).join(' '); // Join words back into text
  
              // Add the chunk as a paragraph
              paragraphs.push(new Paragraph({
                text: chunk, // Chunk of 200 words
              }));
  
              // Add the H5 text after the chunk (repeat the H5)
              paragraphs.push(new Paragraph({
                text: currentH5Text, // Repeating the full H5 text after each chunk
                heading: HeadingLevel.HEADING_5,
              }));
  
              chunkStart += 200; // Move to the next chunk of 200 words
            }
          } else {
            // If it's less than 200 words, just add the H5 as normal
            paragraphs.push(new Paragraph({
              text: currentH5Text, // Single H5
              heading: HeadingLevel.HEADING_5,
            }));
          }
          break;
  
        case 'UL': // Handle unordered lists (ul)
          const ulItems = Array.from(element.children);
          ulItems.forEach((li) => {
            if (li.tagName === 'LI') {
              const listItem = li as HTMLElement; // Cast li to HTMLElement
              paragraphs.push(new Paragraph({
                text: `• ${listItem.innerText}`, // Bullet point with a bullet symbol
              }));
            }
          });
          break;
  
        case 'OL': // Handle ordered lists (ol)
          const olItems = Array.from(element.children);
          olItems.forEach((li, index) => {
            if (li.tagName === 'LI') {
              const listItem = li as HTMLElement; // Cast li to HTMLElement
              paragraphs.push(new Paragraph({
                text: `${index + 1}. ${listItem.innerText}`, // Numbered point
              }));
            }
          });
          break;
  
        case 'P': // Add regular paragraphs and count words
          const wordsInParagraph = element.innerText.split(/\s+/).length;
          currentWordCount += wordsInParagraph;
  
          paragraphs.push(new Paragraph({
            text: element.innerText,
          }));
  
          // Check if we need to repeat the last H5 after every 200 words
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
