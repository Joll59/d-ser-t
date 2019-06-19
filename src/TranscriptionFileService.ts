import * as fs from 'fs';
import * as path from 'path';

import { TestData } from './types';

export class TranscriptionFileService {
    validateFile = (filepath: string): string => {
        if (filepath === undefined) {
            throw Error('Audio Folder Path or Transcription File Path not provided');
        }
        if (path.extname(filepath).substr(1) !== 'txt') {
            throw Error('Transcription File extension is not .txt');
        };

        return filepath = path.normalize(filepath);
    }

    validateFolder = (folderpath: string): string => {
        if (folderpath === undefined) {
            throw Error('Audio Folder Path or Transcription File Path not provided');
        }
        if (!fs.existsSync(folderpath) || !fs.lstatSync(folderpath).isDirectory()) {
            throw Error('Audio Folder Path provided is not a directory');
        };

        return folderpath = path.normalize(folderpath);
    }

    retrieveFileContent = (filepath: string): string => {
        return fs.readFileSync(filepath, 'utf8');
    }

    parseTextFileContent = (content: string, folderpath: string): TestData => {
        return content
            .split(/\r?\n/)
            .map((item) => {
                let split = item.split('\t');
                return { recording: path.join(folderpath, split[0]), transcription: split[1] };
            });
    }

    /**
     * @param path A path to a .txt file.
     * @param folderPath Audio folder path.
     */
    createTestData = (filepath: string, folderpath: string): TestData => {
        folderpath = this.validateFolder(folderpath);
        filepath = this.validateFile(filepath);
        const filecontent = this.retrieveFileContent(filepath);
        return this.parseTextFileContent(filecontent, folderpath);
    };

    /**
     * @param filePath path to save file.
     * @param data data to be written to file.
     */
    writeToTextFile = (filePath: string, data: Object | Array<Object>): void => {
        try {
            !!path.extname(filePath).substr(1) ? filePath = path.normalize(filePath) : filePath.concat('.json');
            fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'), 'utf8');
            console.info(`Writing to ${filePath} File`);
        } catch (error) {
            throw Error(error);
        }
    }
}