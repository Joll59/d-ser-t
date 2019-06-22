[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

# Speech Recognition Testing
This project tests speech recognition . It takes sample audio and expected transcriptions, and tests whether or not there is proper transcription of the audio file in real time.

## Using the project

This project requires Microsoft speech service, audio files and a corresponding transcriptions.txt file.

## Values needed to run test harness.
- Microsoft speech subscription key.
- Speech service region
    Optional Parameters
    - endpoint-id; necessary to use custom speech service
    - Concurrent calls; generally < 20.
    - audio-directory
    - transcription-file
    - output-file
    - audio-file

## Running this test Harness

### First Install

Install the project from npm

```npm install cris-test-harness```

### Import into Codebase.

If writing with TypeScript you can import it with `import`. If not, `require`.

```js
// with import
import { CustomSpeechTestHarness } from 'cris-test-harness';

// with require
const CustomSpeechTestHarness = require('cris-test-harness').CustomSpeechTestHarness;
```

### Pass values into the Test Harness

Create an instance of the test harness and pass the appropriate values as noted above.

```js
const testHarness = new CustomSpeechTestHarness(
  audioDirectory='path/to/audio/directory',
  concurrency='number of concurrent calls, ≥ 1',
  crisEndpointId='Custom Speech Endpoint ID',
  serviceRegion='Speech service region, e.g. westus',
  transcriptionFile='path/to/existing/transcription/file',
  audioFile="optional; use if there's a single file to transcribe",
  outFile='optional; defaults to ./test_results.json'
);
```

### Calls to the Custom speech service is limited to 20 Maximum calls.
 <!--We need more information here -->

### Note: if transcription Text File is edited in VSCODE, VSCODE adds a new line to end of all files, this will affect how tests are ran. Turn off that feature before saving.

## Creating your Audio Data/Files

First, we must create the audio files that we wish to test, along with their expected transcriptions.
Audio must be `.wav` files sampled at `16kHz`. My recommended approach for generating test audio is using Audacity to record `wav` files.

## Using [audacity](https://www.audacityteam.org/), to create audio files for transcription.

1. Install Audacity (free and cross-platform)
2. Set your recording settings
   * Correct mic selected (in toolbar near top)
   * Mono selected (in toolbar near top)
   * Project rate is 44100 Hz (bottom left) default, Speech Service Accepts 16000 Hz, change this setting to match.
3. Record all the samples
   * Hit record and speak all of your samples, back-to-back, with 1 - 1.5 sec of silence in between (try to be consistent). When finished, press stop
   * Try not to pause for more than 1 sec within a single sample (such as for commas or periods)
   * If you mess up: stop recording, select the messed up part to the end, and hit backspace
   * If you need a break: stop the recording, select the silence at the end, and hit backspace
   * When you're ready to resume, make sure cursor is at the end and press record again
4. Trim silence from beginning and end, if needed
5. Down sample to 16000 Hz if left at 44100 Hz
   * Select the track by clicking in the track box to the left of the track
   * Tracks -> Resample -> 16000 Hz
   * Change the project rate at the bottom to 16000 Hz
6. Split the track using labels
   * Select the track again
   * Analyze -> Silence Finder
   * Adjust "minimum duration of silence" based on how much you paused between recordings (I used 0.9s)
   * Adjust "label placement" based on how much silence you want before each recording (I used 0.4s)
   * This will create a label track with labels between each recording. Scroll through and make sure you don't have extra labels in the middle of recordings
   * Select the `S` on each individual label and rename,  select right arrow on each label: `>`, drag right to mark end of phrase/labeling.
   * Ensure there's a label at the very beginning. If not, move to the beginning of the track ("skip to home" in top toolbar), Edit -> Labels -> Add Label at Selection (or Ctrl+B)
7. Before exporting: Edit -> Preferences -> Import / Export -> uncheck "Show Metadata Tags editor before export"
8. Export to multiple WAV files
   * File -> Export -> Export Multiple...
   * Choose a folder to export to:
        * ```location/of/audiodata/folder```
   * Format: WAV signed 16-bit PCM
   * Split files based on: Labels
   * Choose to Export using Label/Track Name; tracks aren't numbered.
   * Press Export
   * Click OK

## Creation of transcriptions.txt file.

As you create your audio files, keep track of the expected transcriptions in a text file called ```transcriptions.txt```. The structure for `.txt` file is the same structure used for training a custom acoustic model. Each line of the transcription file should have the name of an audio file, followed by the corresponding transcription. The file name and transcription should be separated by a tab (\t).

Important: TXT files should be encoded as UTF-8 BOM and not contain any UTF-8 characters above U+00A1 in the Unicode characters table. Typically –, ‘, ‚, “ etc. This harness tries to address this by cleaning your data.

### Results stored in JSON format.
Testing stores test results in JSON format which is stored in `./test_results.json` by default, can be changed with a flag

## Version Support

* Node.js [LTS](https://github.com/nodejs/LTS#lts-schedule) `>= 10`
* git `>= 2`
