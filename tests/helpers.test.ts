import { validateExpectedTranscription, createTestData, parseTextFileContent, cleanExpectedTranscription } from '../src/helpers';


describe('validateExpectedTranscription', () => {
    test('Throws an error when transcription is invalid', () => {
        expect( ()=>{validateExpectedTranscription('I\'am not, ready')}).toThrowError(SyntaxError);
    });

    test('Not Throw an error when transcription is valid', () => {
        expect(() => { validateExpectedTranscription('I\'am not ready') }).not.toThrowError(SyntaxError);
    });
})

describe('cleanExpectedTranscription', () => {
    test('Replaces hyphens with space', () => {
        expect(cleanExpectedTranscription('test-harness')).toEqual('test harness');
    });

    test('Lowercases strings', () => {
        expect(cleanExpectedTranscription("THIS IS SPARTA")).toStrictEqual('this is sparta');
    });
})


describe('createTestData', ()=>{
    test('Throws an error when file path is undefined', () => {
        expect(() => { createTestData('', './audio-recording-info') }).toThrowError(Error);
    });

    test('Throws an error when folder path is undefined', () => {
        expect(() => { createTestData('./audio-recording-info/transcription.txt', '') }).toThrowError(Error);
    });

    test('Throws an error when folder path is NOT pointing at a folder', () => {
        expect(() => { createTestData('./audio-recording-info/transcription.txt', './jest.json') }).toThrowError(Error);
    });

    test('Throws an error when file extension is not .txt', () => {
        expect(() => { createTestData('./audio-recording-info/greatSample.mp3', '') }).toThrowError(Error);
    })

    describe('parseTextFileContent', () => {
    
        const sampleFileContent = 'sample.wav\tthis is only a sample';
        const fakeAudioFolder = './audio-recording-info'
        const fakeItemInResult = {recording:`${fakeAudioFolder}\\sample.wav`, transcription:'this is only a sample'}
        const results = parseTextFileContent(sampleFileContent, fakeAudioFolder)
        test('Returns Array', () => {
            expect(Array.isArray(results)).toBe(true)
        })
        test('Array Contains TestData', () => {
            expect(results[0]).toEqual(fakeItemInResult)
        });
    });
})
