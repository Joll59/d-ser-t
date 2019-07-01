import {
    TranscriptionAnalyzerCI
} from '../src/TranscriptionAnalyzerCI';

const configFile: string = `../CiCleanUpConfig.json`;
const transcriptAnalyzer = new TranscriptionAnalyzerCI(configFile);

describe("Can TranscriptionAnalyzerCI transcribe", () => {
    it("should handle punctuations", () => {
        expect(transcriptAnalyzer.cleanActualTranscription("hello, this. is a Test?"))
            .toEqual("hello this is a test");
    });
    it("should handle words in exception list", () => {
        expect(transcriptAnalyzer.cleanActualTranscription("all right, this is a test?"))
            .toEqual("alright this is a test");
    });
    it("should handle 's", () => {
        expect(transcriptAnalyzer.cleanActualTranscription("all right, it 's a test?"))
            .toEqual("alright its a test");
    });
});