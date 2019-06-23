import cli from './cli';
import { CustomSpeechTestHarness } from 'd-ser-t-service';

export const start = async () => {
  const harnessArgs = cli();
  const harness = new CustomSpeechTestHarness(harnessArgs);
  if (harnessArgs.singleFile) {
    harness.singleFileTranscription();
  } else {
    harness.multipleFileTranscription();
  }
};

try {
  start();
} catch (error) {
  console.error(error);
}