import { TranscriptionAnalyzerBase } from './TranscriptionAnalyzerBase';
import { CleanUpConfig } from './types';
import Utils from './Utils';

export class TranscriptionAnalyzerCI extends TranscriptionAnalyzerBase {
    private readonly configFile: string;

    constructor(exceptions: string) {
        super();
        this.configFile = exceptions;
    }

    public cleanActualTranscription = (
        actualTranscription: string,
        expectedTranscription: string
    ): string => {
        let result: string = this.cleanTranscription(actualTranscription);
        const config: CleanUpConfig = Utils.readJSONFileSync(
            this.configFile
        ) as CleanUpConfig;

        // tslint:disable-next-line: forin
        for (const key in config.replaceExpressions) {
            const value = config.replaceExpressions[key];
            const regextStr = Utils.extractRegExPattern(key);

            if (regextStr) {
                const regex: RegExp = new RegExp(regextStr, 'g');
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
