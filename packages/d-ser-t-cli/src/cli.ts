import * as argv from 'yargs';
import {start} from './main';
argv
        .scriptName("d-ser-t")
        .options({
            subscriptionKey: {
                alias: ['s', 'key'],
                description: 'Microsoft speech subscription key',
                required: true,
                requiresArg: true,
                type: 'string'
            },
            region: {
                alias: ['r', 'service-region', 'sr'],
                description: 'Microsoft Speech service region',
                required: true,
                requiresArg: true,
                type: 'string'
            },
            endpointId: {
                alias: ['e', 'endpoint-Id'],
                description: 'Custom Speech endpoint ID',
                requiresArg: true,
                type: 'string',
            },
            audioDirectory: {
                alias: ['folder', 'd'],
                description: 'Directory containing PCM wav audio files slated for transcription',
                requiresArg: true,
                type: 'string'
            },
            transcriptionFile: {
                alias: ['t', 'transcription-file'],
                description: 'Transcription .txt file mapping audio files to transcription',
                example: '<audiofile.wav> <tabcharacter"\\t"> <audio transcription> per line',
                requiresArg: true,
                type: 'string'
            },
            audioFile: {
                alias: 'f',
                description: 'Singular audio file to transcribe, no transcription file, audio directory',
                type: 'string',
                requiresArg: true
            }, outFile: {
                alias: 'o',
                description: 'Where to save the test results',
                type: 'string',
                requiresArg: true
            }, concurrentCalls: {
                alias: ['c', 'cc'],
                description: 'Number of concurrent calls you want to make to speech service default is 5',
                type: 'string',
                requiresArg: true
            }, audioFolderOnly: {
                alias: ['afo'],
                description: 'a flag to establish you are only sending audio folder without transcription file',
                type: 'boolean',
                default: false,
                requiresArg: false
            }, exceptions: {
                alias: ['x', 'exceptions'],
                description: 'An exception file for transcribed words',
                required: false,
                requiresArg: true,
                type: 'string'
            }
        })
        .conflicts("d", "f")
        .conflicts("f", "t")
        .conflicts('f', 'o')
        .help('help')
        .alias('h', 'help')
        .showHelpOnFail(false, "Specify --help for available options")
        .command(["$0"], "Minimal command to run the service: -r [string] -s [string] -f [string]", ():any => {}, (argv) => {
            const values = {
                audioDirectory: argv.audioDirectory as string,
                audioFile: argv.audioFile  as string,
                concurrentCalls: argv.concurrentCalls  as string,
                transcriptionFile: argv.transcriptionFile  as string,
                subscriptionKey: argv.subscriptionKey  as string,
                endpointId: argv.endpointId  as string,
                outFile: argv.outFile  as string,
                region: argv.region  as string
            }
            start(values);
        })
        .argv;