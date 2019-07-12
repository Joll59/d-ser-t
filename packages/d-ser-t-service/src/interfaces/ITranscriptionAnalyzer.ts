export interface ITranscriptionAnalyzer {
    validateExpectedTranscription(expectedTranscription: string): void;
    cleanTranscription(expectedTranscription: string): string;
    cleanActualTranscription(actualTranscription: string, expectedTranscription: string): string;
    analyzeActualTranscription(actual: string): void;
    pushUnhandledOutput(char: string, word: string, actual: string): void;
}