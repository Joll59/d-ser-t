import { 
    validateExpectedTranscription, 
    createTestData, 
    parseTextFileContent, 
    cleanExpectedTranscription,
    ITestResult,
    calculateSER } from '../src/helpers';
import * as path from 'path';

const sampleFileContent = 'sample.wav\tthis is only a sample';
const fakeAudioFolder = './audio-recording-info'
const fakeItemInResult = {recording:path.join(fakeAudioFolder, sampleFileContent.split('\t')[0]), transcription:'this is only a sample'}
const testData = parseTextFileContent(sampleFileContent, fakeAudioFolder)
const TestResultsMock = jest.fn<ITestResult, any[]>(()=> ({
    actualTranscription:'this is only a sample',
    expectedTranscription: 'this is only a sample',
    wordErrorRate: .023
}));
const calculateSERMock = jest.fn<string, any[]>(calculateSER);


describe('validateExpectedTranscription', () => {
    it('Throws an error when transcription is invalid', () => {
        expect( ()=>{validateExpectedTranscription('I\'am not, ready')}).toThrowError(SyntaxError);
    });

    it('Not Throw an error when transcription is valid', () => {
        expect(() => { validateExpectedTranscription('I\'am not ready') }).not.toThrowError(SyntaxError);
    });
})

describe('cleanExpectedTranscription', () => {
    it('Replaces hyphens with space', () => {
        expect(cleanExpectedTranscription('test-harness')).toEqual('test harness');
    });

    it('Lowercases strings', () => {
        expect(cleanExpectedTranscription("THIS IS SPARTA")).toStrictEqual('this is sparta');
    });
})


describe('createTestData', ()=>{
    it('Throws an error when file path is undefined', () => {
        expect(() => { createTestData('', './audio-recording-info') }).toThrowError(Error);
    });

    it('Throws an error when folder path is undefined', () => {
        expect(() => { createTestData('./audio-recording-info/transcription.txt', '') }).toThrowError(Error);
    });

    it('Throws an error when folder path is NOT pointing at a folder', () => {
        expect(() => { createTestData('./audio-recording-info/transcription.txt', './jest.json') }).toThrowError(Error);
    });

    it('Throws an error when file extension is not .txt', () => {
        expect(() => { createTestData('./audio-recording-info/greatSample.mp3', '') }).toThrowError(Error);
    })

    describe('parseTextFileContent', () => {
    
        it('Returns Array', () => {
            expect(Array.isArray(testData)).toBe(true)
        })
        it('Array Contains TestData', () => {
            expect(testData[0]).toEqual(fakeItemInResult)
        });
    });
});

describe('ITestResults', () => {
    it('should track expectedTranscription', () => {
        expect(TestResultsMock()).toHaveProperty('expectedTranscription')
    });

    it('should track actualTranscription', () => {
        expect(TestResultsMock()).toHaveProperty('actualTranscription')
    });

    it('should track wordErrorRate', () => {
        expect(TestResultsMock()).toHaveProperty('wordErrorRate')
    });
});

describe('calculateSER', () => {
    
    const ser = calculateSERMock([TestResultsMock()])
    it('Accept an array of ITestResult Objects',()=>{
        expect(calculateSERMock).toBeCalled()
    })
    it('Calculates Sentence Error Rate', () => {
        expect(ser).toEqual("1.00");
    });

});
