# D-SER-T-CLI

## Using the project

This project requires Microsoft speech service, audio files and a corresponding transcriptions.txt file.

## Install

`npm install d-ser-t-cli`

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

### Calls to the Custom speech service is limited to 20 Maximum calls.
 <!--We need more information here -->

## Flags needed to run CLI. <Pass these Flags in> 
| flag  | alias  | value  |
|---|---|---|
| -s | subscription-key | Microsoft Speech Subscription Key |
| -r | service-region | Speech Service Region |
| -d | audio-directory [ optional ]  | Path to Directory of wav files |
| -e | endpoint-Id [ optional ]  | Custom Speech Endpoint ID |
| -t | transcription-file [ optional ]  | Transcription File Path, `.txt` file |
| -f | audio-file [ optional ]  | singular audio file `.wav` for console logging Speech Transcription ~~-t~~, ~~-d~~|
| -o | out-file [ optional ] | test output file: saves JSON Array [ defaults to `./test_results.json` ] |
| -c | concurrent-calls | concurrent service calls [defaults to 1] |
| Conflicts --> -f : (-d & -t) |   | Providing a singular file to transcribe, results in console log of transcription from service |

## Running
```
Sample
npm run d-ser-t -- -s [string] -r [string] -f [string]
```