import { TranscriptionAnalyzerBase } from './TranscriptionAnalyzerBase';
import { CleanUpConfig } from './types';
import Utils from './Utils';

export class TranscriptionAnalyzerCI extends TranscriptionAnalyzerBase {
    private readonly configFile: string;

    constructor(exceptions: string) {
        super();
        this.configFile = exceptions;
    }

    public cleanActualTranscription = (actualTranscription: string, expectedTranscription: string): string => {
        let result: string = this.cleanTranscription(actualTranscription)
        let config: CleanUpConfig = <CleanUpConfig>Utils.readJSONFileSync(this.configFile);

        for (let key in config.replaceExpressions) {

            let value = config.replaceExpressions[key];
            const regextStr = Utils.extractRegExPattern(key);

            if (regextStr) {
                let regex: RegExp = new RegExp(regextStr, "g");
                result = result.replace(regex, value);
                continue;
            }

            if (expectedTranscription.includes(value) && result.includes(key)) {
                result = result.replace(key, value);
            }
        }
        return result;
    };

}