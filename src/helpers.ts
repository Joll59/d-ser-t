import * as fs from 'fs';
import { DetailedSpeechPhrase } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/ServiceMessages/DetailedSpeechPhrase';
import * as path from 'path';
import { wordErrorRate as calculateWER } from 'word-error-rate';

export interface TestDatum {
    recording: string;
    transcription: string;
}

export type TestData = TestDatum[];

export interface TestResults {
    actual: string;
    errorRate: number;
    expected: string;
};


const validateFile = (filepath: string) =>{
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
    return  fs.readFileSync(filepath, 'utf8');
}

export const parseTextFileContent = (content: string, folderpath:string) => {
    return content
        .split(/\r?\n/)
        .map((item) => {
            let split = item.split('\t');
            return { recording: `${folderpath}\/${split[0]}.wav`, transcription: split[1] };
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
 * @throws if the transcriptions contain special characters like:
 *      ,<>/?!#$%^&*`~()_.
 * We prefer to throw rather than making a best guess at resolving typos.
 */
export const validateExpectedTranscription = (expectedTranscription: string) => {
    if (/[^A-Za-z0-9\s-']/g.test(expectedTranscription)) {
        console.log("\x1b[31m",
            `Error on expected transcription: "${expectedTranscription}"\n`);

        const message = `Transcriptions may only contain letters, numbers, apostrophes, hyphens, and spaces.`;
        throw SyntaxError(message);
    }
};

/**
 * The STT service will not return hyphens, commas, periods, etc. Expect that
 * special characters in transcription files match the STT output.
 *
 * Some other oddities as we find them:
 *    `okay` is transcribed as `OK`.
 */
export const cleanExpectedTranscription = (expectedTranscription: string): string => {
    return expectedTranscription
        .replace(/-/g, ` `)
        .replace(/\bokay\b/g, `ok`)
        .toLowerCase();
};

/**
* @param filePath path to save file.
* @param data data to be written to file.
*/
export const writeDataToFile = (filePath: string, data: Object | Array<Object>) => {
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
        console.log(`####****recognition status: ${response.RecognitionStatus} `);
        console.log(response.RecognitionStatus);
        console.log("\n****response: \n");
        console.log(response);
        console.log("****response.NBest[0]: \n");
        console.log(response.NBest[0]);
        
        const actualTranscription = response.NBest[0].Lexical;
        console.log("actualTranscription: " + actualTranscription)
        const wordErrorRate = calculateWER(actualTranscription, expectedTranscription);

        console.log(`Actual Response: "${actualTranscription}"`);
        console.log(`Expected Response: "${expectedTranscription}"`);
        console.log(`Word Error Rate: ${wordErrorRate}\n`);

        return { actualTranscription, wordErrorRate }
    } catch (error) {
        throw Error(error);
    }
}

/**
 * Sentence Error Rate (SER) is a measure of perfect transcriptions between 0
 * and 1. An SER of 0 would mean every recording was transcribed perfectly, and
 * an SER of 1 would mean no recordings were transcribed perfectly.
 */
export const calculateSER = (results: any) => {
    const totalTranscriptions = results.length;
    let incorrectTranscriptions = 0;

    for (const result of results) {
        if (result.wordErrorRate > 0) {
            incorrectTranscriptions++;
        }
    }

    return (incorrectTranscriptions / totalTranscriptions).toPrecision(3);
}
