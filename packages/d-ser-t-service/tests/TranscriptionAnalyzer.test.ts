/** /import {
    TranscriptionAnalyzerCI
} from '../src/TranscriptionAnalyzerCI'; */

import {
    TranscriptionAnalyzer
} from '../src/TranscriptionAnalyzer';

const transcriptAnalyzer = new TranscriptionAnalyzer();

describe("Can read file", () => {
    it("should read file", () => {
        expect(() => {
            transcriptAnalyzer.cleanActualTranscription("ok this is a okay Test")
        }).toEqual("ok this is a okay Test");
    });
});