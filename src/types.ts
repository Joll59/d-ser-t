export interface UnhandledCharacter {
    character: string;
    sources: UnhandledWord[];
}

export interface UnhandledCharacters {
    unhandledCharacters?: UnhandledCharacter[];
}

export interface UnhandledWord {
    word: string;
    transcriptions: string[];
}