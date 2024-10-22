export interface Answer {
    text: string;
    isCorrect: boolean;
  }
  
  export interface Question {
    text: string;
    answers: Answer[];
    feedback?: string | null; // Allow feedback to be null
  }
  
  export interface Quiz {
    name: string;
    questions: Question[];
  }
  