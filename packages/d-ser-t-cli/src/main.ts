// // import cli from './cli';
import { CustomSpeechTestHarness } from 'd-ser-t-service';
import { HarnessConfig } from 'd-ser-t-service/lib/types'
export const start = async (harnessArgs: HarnessConfig) => {

    const harness = new CustomSpeechTestHarness(harnessArgs);
    if (harnessArgs.audioFile) {
        harness.singleFileTranscription();
    } else {
        harness.multipleFileTranscription();
    }
};