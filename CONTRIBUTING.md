# How to contribute to SecTester SDK Demo

## Table of contents

- [Your First Contribution](#your-first-contribution)
- [Forks and Branches](#forks-and-branches)
  - [Start a feature branch](#start-a-feature-branch)
  - [Commit Message Format](#commit-message-format)
- [How to work on SecTester SDK Demo](#how-to-work-on-sectester-sdk-demo)
- [Installation](#installation)
  - [Build](#build)
  - [Tests](#tests)
  - [Linting](#linting)
  - [Formatting](#formatting)

## Your First Contribution

Working on your first Pull Request? You can learn how from this free series, [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

## Forks and Branches

All contributions must be submitted as a [Pull Request (PR)](https://help.github.com/articles/about-pull-requests/) so you need to [fork this repo](https://help.github.com/articles/fork-a-repo/) on your GitHub account.

The main branch aka mainline is `master`, it contains the latest code, and it is undergoing major development. Any other branch is temporary and could be deleted. You can read more about the [Trank-based development](https://trunkbaseddevelopment.com/) to get a deep understanding of how it works.

> ⚡ All PRs must be against the `master` branch to be considered.

A valid PR must follow these points:

- Unit test is correctly implemented and covers the new scenario.
- If the code introduces a new feature, please add documentation or describe the feature in the PR description.
- The commit message follows [the conventional commit](#commit-message-format).
- The reviewer is assigned from the developers of the same project or code owners, possibly related to the task designed or a component affected.
- If you are going to work on new features or fix bugs or make significant architecture changes, create an issue before sending a PR, use [close keywords](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) to link an issue, and PR.

The PR, which is **NOT** planned to be merged, has to be converted to draft PR.

To release a new version, you should issue the following commands:

```bash
$ git fetch origin
$ git checkout master
$ git merge --squash branch-name
$ git commit -m 'message'
```

Use `--squash`, to leave the history of commits in feature-branch and prevents the Git merge command from creating a merge commit.

### Start a feature branch

To create a feature branch you should issue the following commands:

```bash
$ git fetch
$ git checkout --no-track -b branch-name origin/master
```

Each branch name consists of a **type**, **ref,** and **subject**.

```
<type>[<DELIMITER>#<ref>]/<subject>
```

Where `type` - can accept one of the values are described [below](#commit-message-format), `ref` \- reference GitHub issues, Jira tickets, or other PRs.

e.g. `fix-#184/multiple-hosts-are-duplicated` or `fix/multiple-hosts-are-duplicated`

The `type` and `subject` are mandatory, the `ref` is optional.

### Commit Message Format

The commits must follow the [https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/) naming convention. Please make sure to read the full guideline.

Each commit message consists of a **header**, a **body**, and a **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `header` is mandatory and must conform to the following format:

```
<type>(<scope>): <short summary>
│       │             │
│       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
│       │
│       └─⫸ Commit Scope depends on ubiquitous language, e.g. scan, request-executor, identity, dast, auth-object, etc.
│
└─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

The `header` should be limited to 100 symbols, make sure the first letter is not capitalized.

The `type` must be one of the following:

- **feat**: A new feature

- **fix**: A bug fix

- **docs**: Documentation only changes

- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)

- **refactor**: A code change that neither fixes a bug nor adds a feature

- **perf**: A code change that improves performance

- **test**: Adding missing or correcting existing tests

- **build**: Changes to the build process or auxiliary tools and libraries such as documentation generation

- **ci**: Changes to the CI/CD process

The `header` and `body` must use the imperative, present tense: "change" not "changed" nor "changes".

The `body` should include the motivation for the change and contrast this with previous behavior.

The `footer` can contain information about breaking changes and is also the place to reference GitHub issues (see details in [Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)), Jira tickets (see details in [Smart Commits](https://support.atlassian.com/bitbucket-cloud/docs/use-smart-commits/) guideline), and other PRs that this commit closes or is related to, i.e.:

```
feat(dast): add entry point statistics

add the amount of requests dispatched per entry point

closes #666
```

The full description should not repeat the short description. If the short description is self-explanatory, leave only the `footer`:

```
feat(dast): add the amount of requests per dispatched entry point

NLJ-480 #close
```

If the commit reverts a previous commit, it should begin with `revert:` , followed by the header of the reverted commit. In the body, it should say: `Reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

```
revert: add the amount of requests per dispatched entry point

Reverts commit 0000000
```

## How to work on SecTester SDK Demo

To ensure consistency throughout the source code, keep these rules in mind as you are working:

- Inspect the format, syntax errors, deviations before pushing to the branch.
- Don't use transpilation mode of the compiler. You can use it only to debug.
- We love OOP and, whenever possible, prefer them over closures and functions.

> ⚡ We use [husky](https://github.com/typicode/husky), [commitlint](https://github.com/conventional-changelog/commitlint#readme) and [lint-staged](https://github.com/okonet/lint-staged), they will help you to follow these rules.

## Installation

To install all dependencies used by this project, issue this command in your terminal:

```bash
$ npm ci
```

### Build

The project can be built manually by issuing the following command:

```bash
$ npm run build
```

The build artifacts will be stored in the `dist` folder.

### Tests

#### Running unit tests

Run this command in terminal to execute the unit tests via [Jest](https://jestjs.io/):

```bash
$ npm t
```

#### Running end-to-end tests

Run his command in terminal to execute the end-to-end tests:

```bash
$ npm run test:e2e
```

### Linting

This project uses [ESLint](https://eslint.org) for code linting.

> ⚡ ESLint can be configured via `.eslintrc.js` file in the project root folder.

To lint all the app and modules by running:

```bash
$ npm run lint
```

### Formatting

This project uses [Prettier](https://prettier.io/) for code formatting.

> ⚡ ESLint can be configured via `.prettierrc` file in the project root folder.

To format all the app and modules by running:

```bash
$ npm run format
```
