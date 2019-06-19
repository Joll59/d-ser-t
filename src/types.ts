export interface UnhandledCharacters {
    unhandledCharacters?: UnhandledCharacter[];
}

export interface UnhandledCharacter {
    character: string;
    sources: UnhandledWord[];
}

export interface UnhandledWord {
    word: string;
    transcriptions: string[];
}