///////////////////////////////////////////////////////////////////////////////
//
// TranscriptionAnalyzerCI
//
///////////////////////////////////////////////////////////////////////////////
export interface CleanUpConfig {
    replaceExpressions: { [key: string]: string };
}

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
// TranscriptionFileService and XmlWriterService
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
}

export interface TestMetaData {
    transcriptionFile: string;
    sentenceErrorRate: string;
    averageWordErrorRate: string;
    totalTestingTime: string;
}

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

///////////////////////////////////////////////////////////////////////////////
//
// Harness Config
//
///////////////////////////////////////////////////////////////////////////////
export interface HarnessConfig {
    audioDirectory?: string;
    audioFile?: string;
    concurrentCalls?: string;
    endpointId?: string;
    outFile?: string;
    region: string;
    subscriptionKey: string;
    transcriptionFile?: string;
    exceptions?: string;
}
