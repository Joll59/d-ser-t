
import { TranscriptionAnalyzer } from '../src/index';

const transcriptAnalyzer = new TranscriptionAnalyzer();

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
        expect(transcriptAnalyzer.cleanActualTranscription('test-harness')).not.toEqual('test harness');
    });

    it('Lowercases strings', () => {
        expect(transcriptAnalyzer.cleanActualTranscription("THIS IS SPARTA"))
            .toStrictEqual('this is sparta');
    });
});