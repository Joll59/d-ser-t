[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![Build Status](https://dev.azure.com/yolajide/d-ser-t-pipeline/_apis/build/status/Joll59.d-ser-t?branchName=master)](https://dev.azure.com/yolajide/d-ser-t-pipeline/_build/latest?definitionId=1&branchName=master)
[![npm version](https://badge.fury.io/js/d-ser-t-service.svg)](https://badge.fury.io/js/d-ser-t-service)

# Dynamic Sentence Error Rate Testing Service: D-SER-T-SERVICE

This project quantifies speech audio transcription in near real time, by taking sample audio with expected transcriptions and outputting WER & SER for all utterances.

## Getting started

These instructions will get you started using the service. For development / contributing see [CONTRIBUTING.md](../../CONTRIBUTING.md).

### Prerequisites

* Node.js
* Microsoft speech service subscription key.
* Speech service region
  * Conditional Parameters
    - endpoint-id; _necessary to use custom speech_
    - Concurrent calls; _generally < 20_
    - audio-directory
    - transcription-file
    - output-file
    - audio-file

### Installing

Install the project from npm

```npm install d-ser-t-service```

### Import into Codebase.

```js
// with import
import { CustomSpeechTestHarness } from 'd-ser-t-service';

// with require
const CustomSpeechTestHarness = require('d-ser-t-service').CustomSpeechTestHarness;
```

### Pass values into the Test Harness

Create an instance of the test harness and pass the appropriate values as noted below.

```js
const testHarness = new CustomSpeechTestHarness(
  {
    audioDirectory='path/to/audio/directory',
    concurrency='number of concurrent calls, ≥ 1',
    crisEndpointId='Custom Speech Endpoint ID',
    serviceRegion='Speech service region, e.g. westus',
    transcriptionFile='path/to/existing/transcription/file.txt',
    audioFile="optional; use if there's a single file to transcribe",
    outFile='optional; defaults to ./test_results.json'
  }
);
```

### Call methods which satisfy your scenario

```js
/* Single file recognition, no transcription.txt file necessary
results outputs to terminal.*/
testHarness.singleFileTranscribe();
/* Multiple file recognition with a transcription.txt file and an audio directory.
results stored in `test_results.json` by default. */
testHarness.multipleFileTranscription();
```

### Results stored in JSON format.
Testing stores test results in JSON format which is stored in `../test_results/test_results.json` by default, storage location can be changed with a flag.

```JSON
sample test_results.json
{
  metaData: {
    "transcriptionFile": "<path to transcription>.txt",
    "sentenceErrorRate": "<ratio of occurence of an error in recognition> range 0 - 1",
    "averageWordErrorRate": "<average distribution of error in each recognition> range 0 - 1",
    "totalTestingTime": "<total transcription time>"
  },
  results: [
    {
      "actualTranscription": "Actual recognized output from the speech service.",
      "expectedTranscription": "Expected output from the speech service.",
      "wordErrorRate": 0.167
    }
  ]
}
```

### Creating your Audio Data/Files

First, we must create the audio files that we wish to test, along with their expected transcriptions.
Audio must be `.wav` files sampled at `16kHz`. My recommended approach for generating test audio is using Audacity to record `wav` files.

#### Using [audacity](https://www.audacityteam.org/), to create audio files for transcription.

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

### Creation of transcriptions.txt file.

> Note: if transcription Text File is edited in VSCODE, VSCODE optionally adds a new line to end of all files, this will affect how tests are ran. Disable feature before saving.

As you create your audio files, keep track of the expected transcriptions in a text file called ```transcriptions.txt```. The structure for `.txt` file is the same structure used for training a custom acoustic model. Each line of the transcription file should have the name of an audio file, followed by the corresponding transcription. The file name and transcription should be separated by a tab (\t).

Important: TXT files should be encoded as UTF-8 BOM and not contain any UTF-8 characters above U+00A1 in the Unicode characters table. Typically –, ‘, ‚, “ etc. This harness tries to address this by cleaning your data.

### Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on contributing, and the process for submitting pull requests to us.

### Versioning

We use [SemVer](https://semver.org/) for versioning.

### Authors

* **Katie Prochilo**
* **Vishesh Oberoi**
* **Yomi Lajide**

### Version Support

* Node.js [LTS](https://github.com/nodejs/LTS#lts-schedule) `>= 10`
