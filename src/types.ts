///////////////////////////////////////////////////////////////////////////////
//
// helpers
//
///////////////////////////////////////////////////////////////////////////////
export interface TestDatum {
    recording: string;
    transcription: string;
}

export type TestData = TestDatum[];

export interface TestResults {
    actual: string;
    errorRate: number;
    expected: string;
};

///////////////////////////////////////////////////////////////////////////////
//
// TranscriptionAnalysisService
//
///////////////////////////////////////////////////////////////////////////////
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