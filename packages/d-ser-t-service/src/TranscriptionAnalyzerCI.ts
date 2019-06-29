import { TranscriptionAnalyzerBase } from './TranscriptionAnalyzerBase';
import { CleanUpConfig } from './types';
import Utils from './Utils';

export class TranscriptionAnalyzerCI extends TranscriptionAnalyzerBase {
    private readonly configFile: string;

    constructor(exceptions: string) {
        super();
        this.configFile = exceptions;
    }

    public cleanActualTranscription = (actualTranscription: string): string => {
        let result: string = this.cleanTranscription(actualTranscription)
            // Replace commas, periods, and question marks with an empty string.
            .replace(/,|\.|\?/g, ``)
            // Plural words are sometimes returned with " 's" at the end. Replace
            // the space and apostrophe with "s".
            .replace(/\s's\b/g, `s`);

        let config: CleanUpConfig = <CleanUpConfig>Utils.readJSONFileSync(this.configFile);

        for (let key in config.replaceExpressions) {
            let value = config.replaceExpressions[key];

            if (result.includes(key)) {
                result = result.replace(key, value);
            }
        }
        return result;
    };

}