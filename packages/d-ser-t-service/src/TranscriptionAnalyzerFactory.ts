import { ITranscriptionAnalyzer } from './interfaces/ITranscriptionAnalyzer';
import { TranscriptionAnalyzerCI } from './TranscriptionAnalyzerCI';
import { TranscriptionAnalyzer } from './TranscriptionAnalyzer';

export default class TranscriptionAnalyzerFactory {
    static createTranscriptionAnalyzer = (exceptionList?: string): ITranscriptionAnalyzer => {
        if (exceptionList) {
            return new TranscriptionAnalyzerCI(exceptionList);
        }

        return new TranscriptionAnalyzer();
    }
}