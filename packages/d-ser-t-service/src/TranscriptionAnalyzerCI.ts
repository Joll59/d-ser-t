import { TranscriptionAnalyzerBase } from './TranscriptionAnalyzerBase';
import { CleanUpConfig } from './types';
import { Utils } from './Utils';

export class TranscriptionAnalyzerCI extends TranscriptionAnalyzerBase {
    private readonly configFile = `../CiCleanUpConfig.json`;

    constructor() {
        super();
    }

    public cleanActualTranscription = (actualTranscription: string): string => {

        let config: CleanUpConfig = <CleanUpConfig>Utils.readJSONFileSync(this.configFile);


        return this.cleanTranscription(actualTranscription)
            // Replace commas, periods, and question marks with an empty string.
            .replace(/,|\.|\?/g, ``)
            // Plural words are sometimes returned with " 's" at the end. Replace
            // the space and apostrophe with "s".
            .replace(/\s's\b/g, `s`);
    };

}