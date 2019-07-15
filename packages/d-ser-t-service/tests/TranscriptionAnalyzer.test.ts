import {
    TranscriptionAnalyzerCI
} from '../src/TranscriptionAnalyzerCI';
import { TranscriptionAnalyzer } from '../src/TranscriptionAnalyzer';
import { TranscriptionAnalyzerBase } from '../src/TranscriptionAnalyzerBase';

const configFile: string = `../CiCleanUpConfig.json`;
const transcriptAnalyzerCI = new TranscriptionAnalyzerCI(configFile);
const transcriptAnalyzer = new TranscriptionAnalyzer();

describe("TranscriptionAnalyzerCI", () => {
    describe('cleanActualTranscription', () => {
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
        });
    });
});

describe('TranscriptionAnalyzer',() => {
    describe('cleanActualTranscription', () => {

        it('Does NOT replace hyphens with space', () => {
            expect(transcriptAnalyzer.cleanActualTranscription('test-harness', 'test-harness'))
            .not.toEqual('test harness');
        });

        it("fix addresses with 's errors", () => {
            expect(transcriptAnalyzer.cleanActualTranscription("item 's", "items"))
            .toStrictEqual("items");
        });

        it("Replaces commas, periods, and question marks with an empty string", () => {
            expect(transcriptAnalyzer.cleanActualTranscription('this,is a. test?', "this is a test"))
            .toStrictEqual("this is a test")
        })

    });
})

describe('TranscriptionAnalyzerBase', () => {
    class MockTranscriptioAnalyzer extends TranscriptionAnalyzerBase {
    }

    const mockTranscriptionAnalyzer = new MockTranscriptioAnalyzer();
    describe('validateExpectedTranscription', () => {
        it('Throws an error when transcription is invalid', () => {
            expect(() => {
                mockTranscriptionAnalyzer.validateExpectedTranscription('I\'am not, ready')
            }).toThrowError(SyntaxError);
        });

        it('Not Throw an error when transcription is valid', () => {
            expect(() => {
                mockTranscriptionAnalyzer.validateExpectedTranscription("i'am not ready")
            }).not.toThrowError(SyntaxError);
        });
    });

    describe('cleanActualTranscription', () => {
        it('Does NOT replace hyphens with space', () => {
            expect(mockTranscriptionAnalyzer.cleanActualTranscription('test-harness', 'test-harness'))
            .not.toEqual('test harness');
        });
    });

    describe('cleanTranscription', () => {

        it('Lowercases strings', () => {
            expect(mockTranscriptionAnalyzer.cleanActualTranscription("THIS IS SPARTA", 'this is sparta'))
            .toStrictEqual('this is sparta');
        });
        it('Replaces OKAY with ok',() => {
            expect(mockTranscriptionAnalyzer.cleanTranscription('okay I want In'))
            .toStrictEqual('ok i want in')
        })
    });
    describe('analyzeActualTranscription', () => {
        it('documents Unhandled characters and outputs to a file ', () => {

            mockTranscriptionAnalyzer.pushUnhandledOutput = jest.fn();
            mockTranscriptionAnalyzer.analyzeActualTranscription('nuh-huh');
            expect(mockTranscriptionAnalyzer.pushUnhandledOutput).toHaveBeenCalled();
        });
    });
});