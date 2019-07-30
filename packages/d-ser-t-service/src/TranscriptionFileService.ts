import * as fs from 'fs';
import * as path from 'path';

import { TestData } from './index';

export class TranscriptionFileService {
    validateFile = (filepath: string): string => {
        if (filepath === undefined) {
            throw Error('Transcription file path not provided');
        }
        if (path.extname(filepath).substr(1) !== 'txt') {
            throw Error('Transcription file extension is not .txt');
        }

        return path.normalize(filepath);
    };

    validateFolder = (folderpath: string): string => {
        if (folderpath === undefined) {
            throw Error('Audio folder path not provided');
        }
        if (
            !fs.existsSync(folderpath) ||
            !fs.lstatSync(folderpath).isDirectory()
        ) {
            throw Error('Audio folder path provided is not a directory');
        }

        return (folderpath = path.normalize(folderpath));
    };

    retrieveFileContent = (filepath: string): string => {
        return fs.readFileSync(filepath, 'utf8');
    };

    parseTextFileContent = (content: string, folderpath: string): TestData => {
        return content.split(/\r?\n/).map(item => {
            let split = item.split('\t');
            let filepath: string = !!path.extname(split[0]).substr(1)
                ? path.normalize(split[0])
                : path.normalize(split[0].concat('.wav'));
            return {
                recording: path.join(folderpath, filepath),
                transcription: split[1],
            };
        });
    };

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
    writeToTextFile = (
        filePath: string,
        data: Object | Array<Object>
    ): void => {
        try {
            !!path.extname(filePath).substr(1)
                ? (filePath = path.normalize(filePath))
                : filePath.concat('.json');
            fs.writeFileSync(
                filePath,
                JSON.stringify(data, null, '\t'),
                'utf8'
            );
            console.info(`Writing to ${filePath} File`);
        } catch (error) {
            throw Error(error);
        }
    };
}
