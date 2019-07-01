
import * as path from 'path';
import { TranscriptionFileService } from '../src/index';

const fakeFileContent = 'sample.wav\tthis is only a sample';
const fakeAudioFolder = './audio-recording-info';

const fakeItemInResult = {
    recording: path.join(fakeAudioFolder, fakeFileContent.split('\t')[0]),
    transcription: fakeFileContent.split('\t')[1]
};

const tfs = new TranscriptionFileService();
const testData = tfs.parseTextFileContent(fakeFileContent, fakeAudioFolder);


describe('createTestData', () => {
    it('Throws an error when file path is undefined', () => {
        expect(() => {
            tfs.createTestData('', './audio-recording-info')
        }).toThrowError(Error);
    });

    it('Throws an error when folder path is undefined', () => {
        expect(() => {
            tfs.createTestData('./audio-recording-info/transcription.txt', '')
        }).toThrowError(Error);
    });

    it('Throws an error when folder path is NOT pointing at a folder', () => {
        expect(() => {
            tfs.createTestData('./audio-recording-info/transcription.txt', './jest.json')
        }).toThrowError(Error);
    });

    it('Throws an error when file extension is not .txt', () => {
        expect(() => {
            tfs.createTestData('./audio-recording-info/greatSample.mp3', '')
        }).toThrowError(Error);
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