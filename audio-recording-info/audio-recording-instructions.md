## Speaker requirement

* English speaking.
* Proper tone, cadence, diction, pronunciation.

## Using [audacity](https://www.audacityteam.org/), to create audio files for transcription.

1. Install Audacity (free and cross-platform)
2. Set your recording settings
   * Correct mic selected (in toolbar near top)
   * Mono selected (in toolbar near top)
   * Project rate is 44100 Hz (bottom left)
3. Record all the samples
   * Hit record and speak all of your samples, back-to-back, with 1 - 1.5 sec of silence in between (try to be consistent). When finished, press stop
   * Try not to pause for more than 1 sec within a single sample (such as for commas or periods)
   * If you mess up: stop recording, select the messed up part to the end, and hit backspace
   * If you need a break: stop the recording, select the silence at the end, and hit backspace
   * When you're ready to resume, make sure cursor is at the end and press record again
4. Trim silence from beginning and end, if needed
5. Down sample to 16000 Hz
   * Select the track by clicking in the track box to the left of the track
   * Tracks -> Resample -> 16000 Hz
   * Change the project rate at the bottom to 16000 Hz
6. Split the track using labels
   * Select the track again
   * Analyze -> Silence Finder
   * Adjust "minimum duration of silence" based on how much you paused between recordings (I used 0.6s)
   * Adjust "label placement" based on how much silence you want before each recording (I used 0.4s)
   * This will create a label track with labels between each recording. Scroll through and make sure you don't have extra labels in the middle of recordings
   * Optional, Title each label to help with naming the tracks in a few steps.
        * Select the `S` on each individual label and rename to uttered phrase,  select right arrow on each label: `>`, drag right to mark end of phrase/labeling.
   * Ensure there's a label at the very beginning. If not, move to the beginning of the track ("skip to home" in top toolbar), Edit -> Labels -> Add Label at Selection (or Ctrl+B)
7. Optional, but recommended
   * Before exporting: Edit -> Preferences -> Import / Export -> uncheck "Show Metadata Tags editor before export"
8. Export to multiple WAV files
   * File -> Export -> Export Multiple...
   * Choose a folder to export to:
        * ```location/of/audiodata/folder```
   * Format: WAV signed 16-bit PCM
   * Split files based on: labels
   * Name files: Numbering before File name prefix (enter any prefix)
        * Conversely you can also choose to Export using Label/Track Name, tracks aren't numbered.
   * Press Export
   * Click OK (or enter(Ok) through all the metadata dialogs, if you skipped line 7 above.)


## Creating a transcription.txt File.
As you create your audio files, also keep track of the expected transcriptions in a text file called ```transcriptions.txt```.

Each line of the transcription file should have the name of one of the audio files, followed by the corresponding transcription. The file name and transcription should be separated by a tab.

_e.g._
>`01-Sample Audio.wav  This is only a test`

>`AnotherSamepl.wav    Testing one two Testing`
