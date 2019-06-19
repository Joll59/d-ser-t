import * as fs from 'fs';
import * as path from 'path';

import { TestData } from './types';

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
