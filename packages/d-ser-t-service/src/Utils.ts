import * as fs from 'fs';
import * as path from 'path';

import { UnhandledCharacters } from './types';

export default class Utils {
    /**
     * Reads a JSON file and returns the data as a JSON object. If no file has
     * been created, an empty JSON object is returned instead.
     */
    static readJSONFileSync = (filePath: string): object => {
        let json: object = {};
        try {
            const data = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
            json = JSON.parse(data);
        } catch {
            console.log(`Coulld not open ${filePath} for the STT service . . .`);
        } finally {
            console.log('Creation Success!!')
        }
        return json;
    }

    /**
     * Overwrite the contents of some JSON file, or add content to a new JSON
     * file.
     */
    static writeJSONFileSync = (filePath: string, data: UnhandledCharacters): void => {
        fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(data));
    }
}