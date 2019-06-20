///////////////////////////////////////////////////////////////////////////////
//
// TranscriptionAnalyzer
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

///////////////////////////////////////////////////////////////////////////////
//
// TranscriptionFileService
//
///////////////////////////////////////////////////////////////////////////////
export interface TestDatum {
    recording: string;
    transcription: string;
}

export type TestData = TestDatum[];

export interface TestResult {
    actualTranscription: string;
    expectedTranscription: string;
    wordErrorRate: number;
};

///////////////////////////////////////////////////////////////////////////////
//
// TranscriptionService
//
///////////////////////////////////////////////////////////////////////////////
export interface TranscriptionServiceConfig {
    endpointID?: string;
    serviceRegion: string;
    subscriptionKey: string;
}
