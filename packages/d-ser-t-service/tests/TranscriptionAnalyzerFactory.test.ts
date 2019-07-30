import { TranscriptionAnalyzer } from '../src/TranscriptionAnalyzer';
import { TranscriptionAnalyzerCI } from '../src/TranscriptionAnalyzerCI';
import TranscriptionAnalyzerFactory from '../src/TranscriptionAnalyzerFactory';

const configFile: string = `../CiCleanUpConfig.json`;

describe('Can return the right instance', () => {
    it('should return the CI object', () => {
        expect(
            TranscriptionAnalyzerFactory.createTranscriptionAnalyzer(
                configFile
            ) instanceof TranscriptionAnalyzerCI
        ).toEqual(true);
    });
    it('should return transcriptAnalyzer', () => {
        expect(
            TranscriptionAnalyzerFactory.createTranscriptionAnalyzer() instanceof
                TranscriptionAnalyzer
        ).toEqual(true);
    });
});
