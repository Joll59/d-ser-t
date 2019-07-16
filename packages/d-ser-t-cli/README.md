
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

# D-SER-T-CLI

### Using the project

This CLI requires Microsoft speech service, a directory of audio files and a corresponding transcriptions text file.

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

### Install

`npm install d-ser-t-cli`
> globally install with `npm install -g d-ser-t-cli`

### Flags used by CLI.
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



### Notable Dependency
[`d-ser-t-service`](https://github.com/Joll59/d-ser-t/tree/master/packages/d-ser-t-service)

- creating a [transcription file](https://github.com/Joll59/d-ser-t/blob/master/packages/d-ser-t-service/README.md#creation-of-transcriptionstxt-file)
- [recording audio](https://github.com/Joll59/d-ser-t/blob/master/packages/d-ser-t-service/README.md#creating-your-audio-datafiles)

### Running
```powershell
## individual file
npm run d-ser-t -- -s [string] -r [string] -f [string]

## audio directory with transcription file
npm run d-ser-t -- -s [string] -r [string] -d [string] -t [string]

## if globally installed;
d-ser-t -s [string] -r [string] -f [string]
d-ser-t -s [string] -r [string] -d [string] -t [string]
```

### Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on contributing, and the process for submitting pull requests to us.

### Versioning
We use [SemVer](https://semver.org/) for versioning.