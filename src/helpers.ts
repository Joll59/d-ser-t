import * as fs from 'fs';
import { DetailedSpeechPhrase } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/ServiceMessages/DetailedSpeechPhrase';
import * as path from 'path';
import { wordErrorRate as calculateWER } from 'word-error-rate';

import { TranscriptionAnalysisService } from './TranscriptionAnalysisService';
import { ITestResult, TestData } from './types';

const validateFile = (filepath: string) => {
    if (filepath === undefined) {
        throw Error('Audio Folder Path or Transcription File Path not provided');
    }
    if (path.extname(filepath).substr(1) !== 'txt') {
        throw Error('Transcription File extension is not .txt');
    };

    return filepath = path.normalize(filepath);
}

const validateFolder = (folderpath: string) => {
    if (folderpath === undefined) {
        throw Error('Audio Folder Path or Transcription File Path not provided');
    }
    if (!fs.existsSync(folderpath) || !fs.lstatSync(folderpath).isDirectory()) {
        throw Error('Audio Folder Path provided is not a directory');
    };

    return folderpath = path.normalize(folderpath);
}

const retrieveFileContent = (filepath: string) => {
    return fs.readFileSync(filepath, 'utf8');
}

export const parseTextFileContent = (content: string, folderpath: string) => {
    return content
        .split(/\r?\n/)
        .map((item) => {
            let split = item.split('\t');
            split[0] = !!path.extname(split[0]).substr(1)? path.normalize(split[0]) : path.normalize(split[0].concat('.wav'));
            return { recording: path.join(folderpath, split[0]), transcription: split[1] };
        })
}

/**
* @param path A path to a .txt file.
* @param folderPath Audio folder path.
*/
export const createTestData = (filepath: string, folderpath: string): TestData => {
    folderpath = validateFolder(folderpath);
    filepath = validateFile(filepath);
    const filecontent = retrieveFileContent(filepath);
    return parseTextFileContent(filecontent, folderpath);
};

/**
* @param filePath path to save file.
* @param data data to be written to file.
*/
export const writeToTextFile = (filePath: string, data: Object | Array<Object>) => {
    try {
        !!path.extname(filePath).substr(1) ? filePath = path.normalize(filePath) : filePath.concat('.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'), 'utf8');
        console.info(`Writing to ${filePath} File`);
    } catch (error) {
        throw Error(error);
    }
}

/**
 * Creates, prints, and returns meta data for a single recording and its
 * expected transcription.
 *
 * @returns the `actualTranscription`, `expectedTranscription`, and
 * `wordErrorRate` for any one recording.
 */
export const handleResponse = (expectedTranscription: string, response: DetailedSpeechPhrase) => {
    try {
        const actualTranscription = response.NBest[0].Lexical.toLowerCase();

        const analyzer = new TranscriptionAnalysisService();

        // Check if the transcription contains special characters that the
        // system does not currently account for.
        analyzer.analyzeActualTranscription(actualTranscription);

        const wordErrorRate = calculateWER(actualTranscription, expectedTranscription);

        console.log(`Actual Response: "${actualTranscription}"`);
        console.log(`Expected Response: "${expectedTranscription}"`);
        console.log(`Word Error Rate: ${wordErrorRate}\n`);

        return { actualTranscription, expectedTranscription, wordErrorRate }
    } catch (error) {
        throw Error(error);
    }
}

/**
 * Sentence Error Rate (SER) is a measure of perfect transcriptions between 0
 * and 1. An SER of 0 would mean every recording was transcribed perfectly, and
 * an SER of 1 would mean no recordings were transcribed perfectly.
 */
export const calculateSER = (results: ITestResult[]) => {
    const totalTranscriptions = results.length;
    let incorrectTranscriptions = 0;

    for (const result of results) {
        if (result.wordErrorRate > 0) {
            incorrectTranscriptions++;
        }
    }

    return (incorrectTranscriptions / totalTranscriptions).toPrecision(3);
}
