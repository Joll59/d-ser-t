import { ITranscriptionAnalyzer } from './interfaces/ITranscriptionAnalyzer';
import { TranscriptionAnalyzer } from './TranscriptionAnalyzer';
import { TranscriptionAnalyzerCI } from './TranscriptionAnalyzerCI';

export default class TranscriptionAnalyzerFactory {
    static createTranscriptionAnalyzer = (
        exceptionList?: string
    ): ITranscriptionAnalyzer => {
        if (exceptionList) {
            console.log('Creating a TranscriptionAnalyzer for CI');
            return new TranscriptionAnalyzerCI(exceptionList);
        }
        console.log('Creating a TranscriptionAnalyzer');
        return new TranscriptionAnalyzer();
    };
}
