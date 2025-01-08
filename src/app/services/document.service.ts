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
    let currentQuestion: string | null = null;
    let answerCount = 0;

    elements.forEach((element: HTMLElement, index: number) => {
        let text = element.textContent?.trim() || ''; // Extract and trim text content
        console.log(`Processing Element #${index}: ${text}`); // Debugging log

        // Detect the assessment title (H9)
        if (/assessment|quiz|evaluation|lesson|sección|módulo|examen/i.test(text)) {
            paragraphs.push(new docx.Paragraph({
                text,
                style: 'Heading9',
            }));
            return;
        }

        // Detect questions (H10)
        if (/^\d+\./.test(text) || (element.tagName === 'OL' && element.children.length > 0)) {
            // Log warning if fewer than 4 answers were found for the previous question
            if (currentQuestion && answerCount < 4) {
                console.warn(`Expected 4 answers but found ${answerCount} for question: ${currentQuestion}`);
            }
            currentQuestion = text;
            answerCount = 0;

            // For ordered lists, use the first item as the question text if present
            if (element.tagName === 'OL' && element.children.length > 0) {
                const listItem = element.children[0] as HTMLElement;
                text = listItem.textContent?.trim() || ''; 
            }

            paragraphs.push(new docx.Paragraph({
                text: text.replace(/^\d+\./, '').trim(), // Remove numbering
                style: 'Heading10',
            }));
            return;
        }

        // Detect answers (H11) based on list structure or lettered format (e.g., a., b., c., d.)
        if ((element.tagName === 'UL' || element.tagName === 'OL' || /^[a-dA-D]\./i.test(text)) && currentQuestion) {
            console.log(`Answer detected: ${text}`); // Debugging log for answers

            // Check if answer is lettered (a., b., etc.)
            const letteredAnswerMatch = text.match(/^[a-dA-D]\./i);
            if (letteredAnswerMatch) {
                const answerText = text.replace(/^[a-dA-D]\./i, '').trim();
                paragraphs.push(new docx.Paragraph({
                    text: `${letteredAnswerMatch[0].toUpperCase()} ${answerText}`, // Maintain lettered format
                    style: 'Heading11',
                    bullet: { level: 0 },
                }));
                answerCount++;
            } else {
                // Handle bullet points in a list
                Array.from(element.children).forEach((li) => {
                    const answerText = (li as HTMLElement).textContent?.trim() || '';
                    if (answerText && answerCount < 4) {
                        paragraphs.push(new docx.Paragraph({
                            text: answerText,
                            style: 'Heading11',
                            bullet: { level: 0 },
                        }));
                        answerCount++;
                    }
                });
            }
            return;
        }

        // Detect feedback sections (H12) if "Feedback" is present
        const feedbackMatch = text.match(/feedback:\s*(.*)/i);
        if (feedbackMatch) {
            const feedbackContent = feedbackMatch[1].trim();
            paragraphs.push(new docx.Paragraph({
                text: `Feedback: ${feedbackContent}`,
                style: 'Heading12',
            }));
            return;
        }
    });

    // Log warning if the last question has fewer than 4 answers
    if (currentQuestion && answerCount < 4) {
        console.warn(`Expected 4 answers but found ${answerCount} for question: ${currentQuestion}`);
    }

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
