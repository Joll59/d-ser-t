
import { ResponseAnalyzer, TranscriptionAnalyzer } from '../src/index';
import { IPhrase, RecognitionStatus, IDetailedSpeechPhrase } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/Exports';

const transcriptAnalyzer = new TranscriptionAnalyzer();

const responseAnalyzer = new ResponseAnalyzer(transcriptAnalyzer);

const calculateSERMock = jest.fn<string, any[]>(responseAnalyzer.calculateSER);

const FakeTestResults = {
    actualTranscription: 'this is only a sample',
    expectedTranscription: 'this is only a sample',
    wordErrorRate: 0
};

const phrase = {
    Confidence: .90,
    Lexical: 'this is only a sample',
    ITN: 'this is only a sample',
    MaskedITN: 'this is only a sample',
    Display: 'this is only a sample',
}

const FakeNBest: IPhrase[]= [phrase];
const FakeRecognitionStatus: RecognitionStatus = RecognitionStatus.Success;

const FakeSpeechResponse: IDetailedSpeechPhrase = {
    Duration:14231,
    NBest:FakeNBest,
    Offset: 1230012312,
    RecognitionStatus: FakeRecognitionStatus,
}

describe('hanldeResponse', ()=>{

    it('throws on errors',()=>{
        expect(() => {
            responseAnalyzer.handleResponse(FakeTestResults.actualTranscription, FakeSpeechResponse)
        })
        .toThrowError()
    })
    it('returns a TestResult Obeject',()=>{
        const responseResult = responseAnalyzer.handleResponse(FakeTestResults.actualTranscription, FakeSpeechResponse)
        expect(responseResult)
        .toEqual(FakeTestResults);
    });
})

describe('calculateSER', () => {
    const ser = calculateSERMock([FakeTestResults])
    it('Calculates & Returns Sentence Error Rate', () => {
        expect(ser)
        .toEqual("0.00");
    });
});

describe('reducerSum', ()=>{
    it('Sums up values provided', ()=> {
        expect(responseAnalyzer.reducerSum(12,6))
        .toEqual(18);
    })
})