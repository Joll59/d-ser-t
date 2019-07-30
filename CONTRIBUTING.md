# Contributing

Welcome to `d-ser-t`.

## Table of Contents

* [How to contribute to d-ser-t](#How-to-contribute-to-d-ser-t)
* [Building and Testing](#Building-and-Testing)
* [Code Style](#Code-Style)
   * [Imports](#Imports)
   * [Line Length](#Line-Length)
   * [Naming](#Naming)

## How to contribute to d-ser-t

#### **Did you find a bug?**

* **Do open up a GitHub issue if the bug is a security vulnerability**.

* **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/joll59/d-ser-t/issues).

* If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/joll59/d-ser-t/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

* If possible, use the relevant bug report templates to create the issue. **paste the content into the issue description**:

#### **Did you write a patch that fixes a bug?**

* Rebase master first.

* Open a new GitHub pull request with the patch.

* Ensure the PR description clearly describes the problem and solution. Include the relevant issue number if applicable.

* Before submitting, please ensure all tests are passing.

#### **Did you fix whitespace, format code, or make a purely cosmetic patch?**

Changes that are cosmetic in nature and do not add anything substantial to the stability, functionality, or testability AND will generally not be accepted.

#### **Do you intend to add a new feature or change an existing one?**

* Do not open an issue on GitHub to collect feedback about the change.
* GitHub issues are primarily intended for bug reports and fixes.

#### **Do you have questions about the source code?**

* Ask any question about how to use d-ser-t direct to current repo maintainer [joll59][email]

#### **Do you want to contribute to the documentation?**

* We encourage you to pitch in.

:heart: :heart: Thanks! :heart: :heart:

d-ser-t Team

[email]: <alajide@gmail.com>

## Code Style

### Imports

Import statements should be at the top of the file. They are organized into blocks in the following order:
1. Public npm packages.
2. Local modules in other directories.
3. Local modules in the current directory.

Within a block, imports statements are arranged alphabetically by package name or director path.

Within an import, symbols are listed alphabetically.

### Line Length

Each line of code or comments should be <= 80 characters.

### Naming

* **Abbreviations**</br>Abbreviations should not be used in any names unless they are common and readable.

* **Classes**</br>Names are `PascalCase`.

* **Functions, Member Functions**</br>Names are `camelCase`. Prefer private members whenever possible.

* **Variables, Member Variables**</br>Names are `camelCase`. Prefer const variables whenever possible. Prefer private and readonly for member variables whenever possible.

* **Interfaces**</br>Names are `PascalCase`. Use the `I` prefix for interfaces that are like abstract base classes, but not interfaces that are POJO structs. For example, `TranscriptionAnalyzerBase` implements `ITranscriptionAnalyzer`, but the `TestResult` interface is used as a type and will not have the `I` prefix.