import * as fs from 'fs';
import { DetailedSpeechPhrase } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/ServiceMessages/DetailedSpeechPhrase';
import * as path from 'path';
import { wordErrorRate as calculateWER } from 'word-error-rate';

// import { UnhandledCharacter, UnhandledWord } from './types';

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
            return { recording: `${folderpath}\\${split[0]}`, transcription: split[1] };
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
 *    `you` is sometimes transcribed as `ya`.
 *    Apostrophes mid-word are sometimes preceded by a space.
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
* @param filePath path to save file.
* @param data data to be written to file.
*/
export const writeToJSONFile = (filePath: string, data: Object | Array<Object>) => {
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
        // const actualTranscription = response.NBest[0].Lexical.toLowerCase();

        const actualTranscription = `here is so_me output that we might get with-weird characters®`;
        analyzeActualTranscription(actualTranscription);

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
 * The STT service occasionally has unexpected behavior. For example:
 *    Spoken `okay` is sometimes transcribed as `OK`.
 *
 * Any STT output that contains unexpected characters will be logged in
 * `unhandledSTTOutput.json`.
 *
 * NOTE: All expected and actual transcriptions will be lower case.
 */
const analyzeActualTranscription = (actual: string): void => {
    // This line isn't necessary, but is fast for clean actual transcriptions.
    if (/[^A-Za-z0-9\s']/g.test(actual)) {
        const words = actual.split(' ');
        for (const word of words) {
            const matches = word.match(/[^A-Za-z0-9\s']/g)
            if (matches) {
                for (const match of matches) {
                    pushUnhandledOutput(word, match, actual);
                }
            }
        }
    }
}

/**
 * Reads a JSON file and returns the data as a JSON object. If no file has been
 * created, an empty JSON object is returned instead.
 *
 * @param filePath the relative path from the `lib/` folder to some JSON file.
 */
const readJSONFileSync = (filePath: string): object => {
    let json: object = {};
    try {
        const data = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
        json = JSON.parse(data);
        console.log(json);
    } catch {
        console.log(`Creating a file to store unhandled output from the STT service . . .`);
    }
    return json;
}

/**
 * Overwrite the contents of some JSON file, or add content to a new JSON file.
 *
 * @param filePath the relative path from the `lib/` folder to some JSON file.
 * @param json some JSON object to write to the file.
 */
const writeJSONFileSync = (filePath: string, json: object) => {
    fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(json));
}

const pushUnhandledOutput = (word: string, match: string, actual: string) => {
    const filePath = `../unhandledSTTOutput.json`;

    let data: object = readJSONFileSync(filePath);

    // Modify the data, don't overwrite it.
    data = {
        b: 6
    };

    // Overwrite the contents of the file.
    writeJSONFileSync(filePath, data);
    console.log(data);
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
