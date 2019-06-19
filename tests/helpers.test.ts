import * as path from 'path';

import {
    createTestData,
    parseTextFileContent,
    calculateSER
} from '../src/helpers';

import { TranscriptionAnalysisService } from '../src/TranscriptionAnalysisService';
import { TestResult } from '../src/types';

const analyzer = new TranscriptionAnalysisService();

const fakeFileContent = 'sample.wav\tthis is only a sample';
const fakeAudioFolder = './audio-recording-info'
const fakeItemInResult = { recording: path.join(fakeAudioFolder, fakeFileContent.split('\t')[0]), transcription: fakeFileContent.split('\t')[1]}
const testData = parseTextFileContent(fakeFileContent, fakeAudioFolder)
const TestResultsMock = jest.fn<TestResult, any[]>(()=> ({
    actualTranscription:'this is only a sample',
    expectedTranscription: 'this is only a sample',
    wordErrorRate: .023
}));
const calculateSERMock = jest.fn<string, any[]>(calculateSER);

describe('validateExpectedTranscription', () => {
    it('Throws an error when transcription is invalid', () => {
        expect( ()=>{
            analyzer.validateExpectedTranscription('I\'am not, ready')
        }).toThrowError(SyntaxError);
    });

    it('Not Throw an error when transcription is valid', () => {
        expect(() => {
            analyzer.validateExpectedTranscription('I\'am not ready')
        }).not.toThrowError(SyntaxError);
    });
})

describe('cleanExpectedTranscription', () => {
    it('Replaces hyphens with space', () => {
        expect(analyzer.cleanExpectedTranscription('test-harness')).toEqual('test harness');
    });

    it('Lowercases strings', () => {
        expect(analyzer.cleanExpectedTranscription("THIS IS SPARTA")).toStrictEqual('this is sparta');
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

describe('calculateSER', () => {

    const ser = calculateSERMock([TestResultsMock()])
    it('Calculates & Returns Sentence Error Rate', () => {
        expect(ser).toEqual("1.00");
    });

});
