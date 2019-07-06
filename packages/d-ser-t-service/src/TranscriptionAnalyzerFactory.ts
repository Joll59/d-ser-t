import { ITranscriptionAnalyzer } from './interfaces/ITranscriptionAnalyzer';
import { TranscriptionAnalyzerCI } from './TranscriptionAnalyzerCI';
import { TranscriptionAnalyzer } from './TranscriptionAnalyzer';

export default class TranscriptionAnalyzerFactory {
    static createTranscriptionAnalyzer = (exceptionList?: string): ITranscriptionAnalyzer => {
        if (exceptionList) {
            console.log("Creating a TranscriptionAnalyzer for CI");
            return new TranscriptionAnalyzerCI(exceptionList);
        }
        console.log("Creating a TranscriptionAnalyzer");
        return new TranscriptionAnalyzer();
    }
}