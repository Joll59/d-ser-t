const colors = require('colors');
import * as fs from 'fs';
import * as path from 'path';

import {
    UnhandledCharacter,
    UnhandledCharacters,
    UnhandledWord
} from './types';

interface ITranscriptionAnalyzer {
    validateExpectedTranscription(expectedTranscription: string): void;
    cleanTranscription(expectedTranscription: string): string;
    analyzeActualTranscription(actual: string): void;
    pushUnhandledOutput(char: string, word: string, actual: string): void;
}

export class TranscriptionAnalyzer implements ITranscriptionAnalyzer {
    private data: UnhandledCharacters;
    private readonly filePath = `../unhandledSTTOutput.json`;
    private readonly uncleanTranscriptionRegEx: RegExp = /[^a-z\s']/g;

    constructor() {
        this.data = this.readJSONFileSync();
    }

    /**
     * @throws if the transcriptions contain special characters like:
     *      ,<>/?!#$%^&*`~()_.
     * We prefer to throw rather than making a best guess at resolving typos.
     */
    public validateExpectedTranscription = (expectedTranscription: string): void => {
        if (this.uncleanTranscriptionRegEx.test(expectedTranscription)) {
            console.log(colors.red(
                `Error on expected transcription: "${expectedTranscription}"\n`));

            const message = `Transcriptions may only contain letters, apostrophes, and spaces.`;
            throw SyntaxError(message);
        }
    };

    /**
     * The STT service will not return hyphens, commas, periods, etc. Expect
     * that special characters in transcription files match the STT output.
     *
     * Some other oddities as we find them: `okay` is transcribed as `OK`. `you`
     *    is sometimes transcribed as `ya`. Apostrophes mid-word are sometimes
     *    preceded by a space.
     */
    public cleanTranscription = (transcription: string): string => {
        return transcription
            .toLowerCase()
            .replace(/\bokay\b/g, `ok`);
    };

    /**
     * The STT service occasionally has unexpected behavior. For example: Spoken
     *    `okay` is sometimes transcribed as `OK`.
     *
     * Any STT output that contains unexpected characters will be logged in
     * `unhandledSTTOutput.json`.
     */
    public analyzeActualTranscription = (actualTranscription: string): void => {
        this.cleanTranscription(actualTranscription);

        // This condition isn't necessary, but is fast for actual transcriptions
        // that are passed in clean.
        if (this.uncleanTranscriptionRegEx.test(actualTranscription)) {
            const words = actualTranscription.split(' ');
            for (const word of words) {
                const matches = word.match(this.uncleanTranscriptionRegEx);
                if (matches) {
                    for (const match of matches) {
                        this.pushUnhandledOutput(match, word, actualTranscription);
                    }
                }
            }
        }
    }

    /**
     * Any new instances of special characters that are not already accounted
     * for in `cleanTranscription` and `validateTranscription` will be added to
     * a JSON file. A human can go over `unhandledSTTOutput.json` and alter the
     * code in the aforementioned functions to account for any patterns.
     *
     * This is meant to help the investigation of output from the STT service.
     *
     * @param char a single special character found in an actual transcription.
     * @param word the word that contained the special character.
     * @param actual the actual transcription that contained the special
     * character.
     */
    public pushUnhandledOutput = (
        char: string,
        word: string,
        actual: string
    ): void => {
        if (this.data.unhandledCharacters) {
            let charIndex: number = -1;
            const chars: UnhandledCharacter[] = this.data.unhandledCharacters;

            // Check if the character matches any character already added. If
            // so, record the index for later.
            for (let i = 0; i < chars.length; i++) {

                if (chars[i].character === char) {
                    charIndex = i;
                    i = chars.length;
                }
            }

            // The character has already been added.
            if (charIndex !== -1) {
                const sources: UnhandledWord[] = chars[charIndex].sources;

                let sourceIndex: number = -1;
                // Check if the word matches any word already added. If so,
                // record the index for later.
                for (let j = 0; j < sources.length; j++) {

                    if (sources[j].word === word) {
                        sourceIndex = j;
                        j = sources.length;
                    }
                }

                // The word has already been added.
                if (sourceIndex !== -1) {
                    const transcriptions: string[] = sources[sourceIndex]
                        .transcriptions;

                    // Check if the transcription matches any transcription
                    // already added.
                    let transcriptIndex: number = transcriptions.indexOf(actual);

                    // The character and the word have already been added. Push
                    // the new transcription.
                    if (transcriptIndex === -1) {
                        this.data.unhandledCharacters[charIndex].sources[sourceIndex]
                            .transcriptions.push(actual);
                    }
                } else {
                    // The character is already added, but the word isn't; add
                    // the word and its transcription.
                    const newData: UnhandledWord = {
                        word,
                        transcriptions: [actual]
                    };
                    this.data.unhandledCharacters[charIndex].sources.push(newData);
                }
            } else {
                // The character has not already been added; add the character,
                // its word, and its transcription.
                const newData: UnhandledCharacter = {
                    character: char,
                    sources: [{
                        word,
                        transcriptions: [actual]
                    }]
                }
                this.data.unhandledCharacters.push(newData);
            }
        } else {
            this.data = {
                unhandledCharacters: [{
                    character: char,
                    sources: [{
                        word,
                        transcriptions: [actual]
                    }]
                }]
            };
        }

        // Overwrite the contents of the file.
        this.writeJSONFileSync();
    }

    /**
     * Reads a JSON file and returns the data as a JSON object. If no file has
     * been created, an empty JSON object is returned instead.
     */
    private readJSONFileSync = (): object => {
        let json: object = {};
        try {
            const data = fs.readFileSync(path.resolve(__dirname, this.filePath), 'utf8');
            json = JSON.parse(data);
        } catch {
            console.log(`Creating a file to store unhandled output from the STT service . . .`);
        }
        return json;
    }

    /**
     * Overwrite the contents of some JSON file, or add content to a new JSON
     * file.
     */
    private writeJSONFileSync = (): void => {
        fs.writeFileSync(path.resolve(__dirname, this.filePath), JSON.stringify(this.data));
    }
}