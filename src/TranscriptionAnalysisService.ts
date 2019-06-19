import * as fs from 'fs';
import * as path from 'path';

import {
    UnhandledCharacter,
    UnhandledCharacters,
    UnhandledWord
} from './types';

interface ITranscriptionAnalysisService {
    validateExpectedTranscription(expectedTranscription: string): void;
    cleanExpectedTranscription(expectedTranscription: string): string;
    analyzeActualTranscription(actual: string): void;
    pushUnhandledOutput(char: string, word: string, actual: string): void;
}

export class TranscriptionAnalysisService implements ITranscriptionAnalysisService {
    // Declare any fields.

    constructor() { }

    /**
     * @throws if the transcriptions contain special characters like:
     *      ,<>/?!#$%^&*`~()_.
     * We prefer to throw rather than making a best guess at resolving typos.
     */
    public validateExpectedTranscription(expectedTranscription: string): void {
        if (/[^A-Za-z0-9\s-']/g.test(expectedTranscription)) {
            console.log("\x1b[31m",
                `Error on expected transcription: "${expectedTranscription}"\n`);

            const message = `Transcriptions may only contain letters, numbers, apostrophes, hyphens, and spaces.`;
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
    public cleanExpectedTranscription(expectedTranscription: string): string {
        return expectedTranscription
            .replace(/-/g, ` `)
            .replace(/\bokay\b/g, `ok`)
            .toLowerCase();
    };

    /**
     * The STT service occasionally has unexpected behavior. For example: Spoken
     *    `okay` is sometimes transcribed as `OK`.
     *
     * Any STT output that contains unexpected characters will be logged in
     * `unhandledSTTOutput.json`.
     *
     * NOTE: All expected and actual transcriptions will be lower case.
     */
    public analyzeActualTranscription(actual: string): void {
        // This line isn't necessary, but is fast for clean actual
        // transcriptions.
        if (/[^A-Za-z0-9\s']/g.test(actual)) {
            const words = actual.split(' ');
            for (const word of words) {
                const matches = word.match(/[^A-Za-z0-9\s']/g)
                if (matches) {
                    for (const match of matches) {
                        this.pushUnhandledOutput(match, word, actual);
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
    public pushUnhandledOutput(char: string, word: string, actual: string): void {
        const filePath = `../unhandledSTTOutput.json`;

        let data: UnhandledCharacters = this.readJSONFileSync(filePath);

        if (data.unhandledCharacters) {
            let charIndex: number = -1;
            const chars: UnhandledCharacter[] = data.unhandledCharacters;

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
                        data.unhandledCharacters[charIndex].sources[sourceIndex]
                            .transcriptions.push(actual);
                    }
                } else {
                    // The character is already added, but the word isn't; add
                    // the word and its transcription.
                    const newData: UnhandledWord = {
                        word,
                        transcriptions: [actual]
                    };
                    data.unhandledCharacters[charIndex].sources.push(newData);
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
                data.unhandledCharacters.push(newData);
            }
        } else {
            data = {
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
        this.writeJSONFileSync(filePath, data);
    }

    /**
     * Reads a JSON file and returns the data as a JSON object. If no file has
     * been created, an empty JSON object is returned instead.
     *
     * @param filePath the relative path from the `lib/` folder to some JSON
     * file.
     */
    private readJSONFileSync(filePath: string): object {
        let json: object = {};
        try {
            const data = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
            json = JSON.parse(data);
        } catch {
            console.log(`Creating a file to store unhandled output from the STT service . . .`);
        }
        return json;
    }

    /**
     * Overwrite the contents of some JSON file, or add content to a new JSON
     * file.
     *
     * @param filePath the relative path from the `lib/` folder to some JSON
     * file.
     * @param json some JSON object to write to the file.
     */
    private writeJSONFileSync(filePath: string, json: object): void {
        fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(json));
    }
}