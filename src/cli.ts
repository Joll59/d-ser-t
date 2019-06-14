import * as argv from 'yargs';
export default function () {
    const yargsArgs = argv
        .scriptName("test-harness")
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
                // required: true,
                requiresArg: true,
                type: 'string'
            },
            transcriptionFile: {
                alias: ['t', 'transcription-file'],
                description: 'Transcription .txt file mapping audio files to transcription',
                example: '<audiofile.wav> <tabcharacter"\\t"> <audio transcription> per line',
                // required: true,
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
            }
        })
        .conflicts("d", "f")
        .conflicts("f", "t")
        .conflicts('f', 'o')
        .usage('$0 -s [string] -r [string] -e [string] -d [string] -t [string]')
        .help('help')
        .argv;
    return yargsArgs;
}