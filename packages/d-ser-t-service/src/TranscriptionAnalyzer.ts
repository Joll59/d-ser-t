import { TranscriptionAnalyzerBase } from './TranscriptionAnalyzerBase';

export class TranscriptionAnalyzer extends TranscriptionAnalyzerBase {

    constructor() {
        super();
    }

    /**
     * The STT service will **sometimes** return commas, periods, question
     * marks, and more. When we discover patterns that only sometimes occur from
     * the STT service, we will account for and clean them here.
     *
     * At this point, the actual transcription is already lowercase and "okay"
     * is converted to "ok".
     *
     * We do not pass expected transcriptions through this function because we
     * would have to assume no typos were made. Instead, we expect the human
     * completing the transcription file to do so correctly.
     */
    public cleanActualTranscription = (actualTranscription: string): string => {
        return this.cleanTranscription(actualTranscription)
            // Replace commas, periods, and question marks with an empty string.
            .replace(/,|\.|\?/g, ``)
            // Plural words are sometimes returned with " 's" at the end. Replace
            // the space and apostrophe with "s".
            .replace(/\s's\b/g, `s`);
    };
}