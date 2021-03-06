import * as fs from 'fs';
import * as path from 'path';

import { UnhandledCharacters } from './types';

export default class Utils {
    /**
     * Reads a JSON file and returns the data as a JSON object. If no file has
     * been created, an empty JSON object is returned instead.
     */
    public static readJSONFileSync = (filePath: string): object => {
        let json: object = {};
        try {
            const data = fs.readFileSync(
                path.resolve(__dirname, filePath),
                'utf8'
            );
            json = JSON.parse(data);
        } catch {
            console.log(`Could not open ${filePath} for the STT service . . .`);
        }
        return json;
    };

    /**
     * Overwrite the contents of some JSON file, or add content to a new JSON
     * file.
     */
    public static writeJSONFileSync = (
        filePath: string,
        data: UnhandledCharacters
    ): void => {
        fs.writeFileSync(
            path.resolve(__dirname, filePath),
            JSON.stringify(data)
        );
    };

    /**
     * Extract regex pattern. /\\s's\\b/g" --> \\s's\\b. If no regex pattern
     * exists, return undefined.
     *
     * @returns regex pattern or undefined if none found
     * @param input string
     */
    public static extractRegExPattern = (input: string): string | undefined => {
        if (input.length < 2) {
            console.warn(`${input} is not a regex pattern`);
        }
        if (
            input.charAt(0) === `/` &&
            input.charAt(input.length - 2) === `/` &&
            input.charAt(input.length - 1) === `g`
        ) {
            return input.substr(1, input.length - 3);
        }
        return undefined;
    };

    /**
     * Gets current timestamp and returns a formatted string.
     */
    public static getCurrentTimestamp(): string {
        const now: Date = new Date();
        const date: string[] = [
            String(now.getUTCFullYear()),
            String(now.getUTCMonth() + 1),
            String(now.getUTCDate()),
        ];
        const time: string[] = [
            String(now.getUTCHours()),
            String(now.getUTCMinutes()),
            String(now.getUTCSeconds()),
        ];

        this.zeroPrefix(date);
        this.zeroPrefix(time);

        return [date.join('-'), time.join(':')].join(' ');
    }

    /**
     * Add a "0" in front of single-digit values in an array (for timestamp
     * formatting).
     *
     * @param arr Array of elements to modify
     */
    public static zeroPrefix(arr: string[]): string[] {
        arr.forEach((elem, i) => {
            if (Number(elem) < 10 && Number(elem) >= 0) {
                arr[i] = '0' + elem;
            }
        });

        return arr;
    }
}
