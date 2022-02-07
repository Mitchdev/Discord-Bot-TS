export interface TranslateError {
  Message: string;
}

export interface Translate {
  detectedLanguage: TranslateDetectedLanguage;
  translations: TranslateTranslations[];
}

interface TranslateDetectedLanguage {
  language: string;
  score: number;
}

interface TranslateTranslations {
  text: string;
  to: string;
}
