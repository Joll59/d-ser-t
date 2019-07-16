
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

# Introduction

This is the monorepo containing both the [Dynamic Sentence Error Rate Testing Service](https://github.com/Joll59/d-ser-t/tree/master/packages/d-ser-t-service),`d-ser-t-service`, and its accompanying [CLI](https://github.com/Joll59/d-ser-t/tree/master/packages/d-ser-t-cli), `d-ser-t-cli`. What can I say, I am awesome at naming things. :grin:


# Getting Started

* install
    - `git clone git@github.com:Joll59/d-ser-t.git`
    - `cd d-ser-t`
    - `npm install`
        - this installs all dependencies for all packages.
* Instructions for running the packages individually:
    * Running d-ser-t via cli with [d-ser-t-cli](https://github.com/Joll59/d-ser-t/tree/master/packages/d-ser-t-cli)
    * Utilizing d-ser-t-service [d-ser-t-service](https://github.com/Joll59/d-ser-t/tree/master/packages/d-ser-t-service)

You are ready for local development, explore `package.json` for all available scripts.

__Packages are maintained using `lerna` at the top level__

### Deployment :shipit:

> `lerna version` bump versions.
>`npm publish` alias for `lerna publish --from-package`

### Contributing :electric_plug:

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on contributing, and the process for submitting pull requests to us.

### Versioning

We use [SemVer](https://semver.org/) for versioning.

# License

Licensed under the MIT License

See sources for licenses of dependencies.
