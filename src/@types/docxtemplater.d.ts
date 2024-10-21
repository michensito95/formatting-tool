// src/@types/docxtemplater.d.ts
declare module 'docxtemplater' {
    import PizZip from 'pizzip'; // Import the PizZip class

    // Exporting the Docxtemplater class with correct constructor signature
    export default class Docxtemplater {
        constructor(zip: InstanceType<typeof PizZip>, options?: { paragraphLoop?: boolean; linebreaks?: boolean });
        render(): void;
        setData(data: Record<string, any>): void;
        getFullText(): string;
        getZip(): InstanceType<typeof PizZip>; // Return the PizZip instance
    }
}
