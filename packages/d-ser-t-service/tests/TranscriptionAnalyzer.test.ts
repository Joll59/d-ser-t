import {
    TranscriptionAnalyzerCI
} from '../src/TranscriptionAnalyzerCI';
import { TranscriptionAnalyzer } from '../src/TranscriptionAnalyzer';

const configFile: string = `../CiCleanUpConfig.json`;
const transcriptAnalyzerCI = new TranscriptionAnalyzerCI(configFile);
const transcriptAnalyzer = new TranscriptionAnalyzer();

describe("Can TranscriptionAnalyzerCI transcribe", () => {
    it("should handle punctuations", () => {
        expect(transcriptAnalyzerCI.cleanActualTranscription("hello, this. is a Test?", "hello this is a test"))
            .toEqual("hello this is a test");
    });
    it("should handle words in exception list", () => {
        expect(transcriptAnalyzerCI.cleanActualTranscription("all right, this is a test?", "alright this is a test"))
            .toEqual("alright this is a test");
    });
    it("should handle 's", () => {
        expect(transcriptAnalyzerCI.cleanActualTranscription("all right, it 's a test?", "alright its a test"))
            .toEqual("alright its a test");

describe('validateExpectedTranscription', () => {
    it('Throws an error when transcription is invalid', () => {
        expect(() => {
            transcriptAnalyzer.validateExpectedTranscription('I\'am not, ready')
        }).toThrowError(SyntaxError);
    });

    it('Not Throw an error when transcription is valid', () => {
        expect(() => {
            transcriptAnalyzer.validateExpectedTranscription('I\'am not ready')
        }).not.toThrowError(SyntaxError);
    });
});

describe('cleanActualTranscription', () => {
    it('Does NOT replace hyphens with space', () => {
        expect(transcriptAnalyzer.cleanActualTranscription('test-harness', 'test-harness'))
        .not.toEqual('test harness');
    });

    it('Lowercases strings', () => {
        expect(transcriptAnalyzer.cleanActualTranscription("THIS IS SPARTA", 'this is sparta'))
        .toStrictEqual('this is sparta');
    });
});