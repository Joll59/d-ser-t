import {
    IDetailedSpeechPhrase,
    IPhrase,
    RecognitionStatus,
} from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/Exports';
import { ResponseAnalyzer, TranscriptionAnalyzer } from '../src/index';

const transcriptAnalyzer = new TranscriptionAnalyzer();

const responseAnalyzer = new ResponseAnalyzer(transcriptAnalyzer);

const calculateSERMock = jest.fn<string, any[]>(responseAnalyzer.calculateSER);

const FakeTestResults = {
    actualTranscription: 'this is only a sample',
    expectedTranscription: 'this is only a sample',
    wordErrorRate: 0,
};

const phrase = {
    Confidence: 0.9,
    Display: 'this is only a sample',
    ITN: 'this is only a sample',
    Lexical: 'this is only a sample',
    MaskedITN: 'this is only a sample',
};

const FakeNBest: IPhrase[] = [phrase];
const FakeRecognitionStatus: RecognitionStatus = RecognitionStatus.Success;

const FakeSpeechResponse: IDetailedSpeechPhrase = {
    Duration: 14231,
    NBest: FakeNBest,
    Offset: 1230012312,
    RecognitionStatus: FakeRecognitionStatus,
};

describe('ResponseAnalyzer', () => {
    describe('handleResponse', () => {
        it('returns a TestResult Obeject', () => {
            const responseResult = responseAnalyzer.handleResponse(
                FakeTestResults.expectedTranscription,
                FakeSpeechResponse
            );
            expect(responseResult).toEqual(FakeTestResults);
        });
    });

    describe('calculateSER', () => {
        const ser = calculateSERMock([FakeTestResults]);
        const wrongSer = calculateSERMock([
            {
                actualTranscription: 'hi',
                expectedTranscription: 'bye',
                wordErrorRate: 1.0,
            },
        ]);
        it('Calculates Sentence error rate', () => {
            expect(ser).toEqual('0.00');
        });

        it('returns accurate sentence error rate', () => {
            expect(wrongSer).toEqual('1.00');
        });
    });

    describe('reducerSum', () => {
        it('Sums up values provided', () => {
            expect(responseAnalyzer.reducerSum(12, 6)).toEqual(18);
        });
    });
});
