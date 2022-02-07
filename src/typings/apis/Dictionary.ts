export interface NormalDictionaryError {
  title: string;
  message: string;
  resolution: string;
}

export interface NormalDictionary {
  word: string;
  phonetic?: string;
  phonetics?: NormalDictionaryPhonetic[];
  origin?: string;
  meanings: NormalDictionaryMeaning[];
}

interface NormalDictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface NormalDictionaryMeaning {
  partOfSpeech?: string;
  definitions: NormalDictionaryMeaningDefinition[];
}

interface NormalDictionaryMeaningDefinition {
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
}

export interface UrbanDictionary {
  list: UrbanDictionaryDefinition[]
}

interface UrbanDictionaryDefinition {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls: string[];
  author: string;
  word: string;
  defid: number;
  current_vote: string;
  written_on: string;
  example: string;
  thumbs_down: number;
}
