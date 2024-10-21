// src/typings/custom-docx.d.ts
import { Document } from 'docx';

declare module 'docx' {
  interface Section {
    children: Paragraph[]; // Ensure children are defined as Paragraph[]
  }

  // We need to explicitly define sections in Document
  interface Document {
    sections: Section[]; // Ensure Document has sections
  }
}
