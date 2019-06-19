///////////////////////////////////////////////////////////////////////////////
//
// helpers
//
///////////////////////////////////////////////////////////////////////////////
export interface ITestDatum {
    recording: string;
    transcription: string;
}

export type TestData = ITestDatum[];

export interface ITestResult {
    actualTranscription: string;
    expectedTranscription: string;
    wordErrorRate: number;
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