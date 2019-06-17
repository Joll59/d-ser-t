export interface UnhandledCharacter {
    unhandledCharacter: string;
    unhandledWords: UnhandledWord[];
}

export interface UnhandledWord {
    sourceWord: string;
    sourceTranscriptions: string[];
    isFakeSampleOutput?: boolean;
}