import {
    TranscriptionAnalyzerCI
} from '../src/TranscriptionAnalyzerCI';
import { TranscriptionAnalyzer } from '../src/TranscriptionAnalyzer';
import { TranscriptionAnalyzerBase } from '../src/TranscriptionAnalyzerBase';

const configFile: string = `../CiCleanUpConfig.json`;
const transcriptAnalyzerCI = new TranscriptionAnalyzerCI(configFile);
const transcriptAnalyzer = new TranscriptionAnalyzer();

describe("TranscriptionAnalyzerCI", () => {
    describe('cleanActualTranscription',()=>{
        it("should handle punctuations", () => {
            expect(transcriptAnalyzerCI.cleanActualTranscription("hello, this. is a Test?"))
            .toEqual("hello this is a test");
        });
        it("should handle words in exception list", () => {
            expect(transcriptAnalyzerCI.cleanActualTranscription("all right, this is a test?"))
            .toEqual("alright this is a test");
        });
        it("should handle 's", () => {
            expect(transcriptAnalyzerCI.cleanActualTranscription("all right, it 's a test?"))
            .toEqual("alright its a test");
        });
    })
});

describe('TranscriptionAnalyzer',()=>{
    describe('cleanActualTranscription', () => {

        it('Does NOT replace hyphens with space', () => {
            expect(transcriptAnalyzer.cleanActualTranscription('test-harness'))
            .not.toEqual('test harness');
        });
    });
})

describe('TranscriptionAnalyzerBase', ()=>{
    describe('validateExpectedTranscription', () => {
        it('Throws an error when transcription is invalid', () => {
            expect(() => {
                transcriptAnalyzer.validateExpectedTranscription('I\'am not, ready')
            }).toThrowError(SyntaxError);
        });

        it('Not Throw an error when transcription is valid', () => {
            expect(() => {
                transcriptAnalyzerCI.validateExpectedTranscription("i'am not ready")
            }).not.toThrowError(SyntaxError);
        });


    });
    describe('cleanTranscription', ()=>{
        it('Lowercases strings', () => {
            expect(transcriptAnalyzer.cleanTranscription("THIS IS SPARTA"))
            .toStrictEqual('this is sparta');
        });

        it('Replaces OKAY with ok',()=>{
            expect(transcriptAnalyzerCI.cleanTranscription('okay I want In'))
            .toStrictEqual('ok i want in')
        })
    });
    describe('analyzeActualTranscription', ()=>{
        it('documents Unhandled characters and outputs to a file ', ()=>{
            class MockTranscriptioAnalyzer extends TranscriptionAnalyzerBase {
            }

            const mockTranscriptionAnalyzer = new MockTranscriptioAnalyzer();
            mockTranscriptionAnalyzer.pushUnhandledOutput = jest.fn();
            mockTranscriptionAnalyzer.analyzeActualTranscription('nuh-huh');
            expect(mockTranscriptionAnalyzer.pushUnhandledOutput).toHaveBeenCalled();
        })
    })
})