import cli from './cli';
import { CustomSpeechTestHarness } from 'cris-test-harness';

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