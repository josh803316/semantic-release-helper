[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
# @sketchy/semantic-release-config

Shareable config to run [Semantic Releases](https://github.com/semantic-release/semantic-release) at [Sketchy](https://github.com/sketchy).

## Plugins

This shareable configuration use the following plugins:
- [`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer)
- [`@semantic-release/release-notes-generator`](https://github.com/semantic-release/release-notes-generator)
- [`@semantic-release/exec`](https://github.com/semantic-release/exec)
- [`@semantic-release/git`](https://github.com/semantic-release/git)
- [`@semantic-release/npm`](https://github.com/semantic-release/npm)
- [`conventionalcommits.org convention`](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits)


## Install
Make sure that you have a Github token (personal access or new beta API token) and an NPM auth token setup for publishing this to the github packages list.

```bash
$ npm install --save-dev semantic-release @sketchy/semantic-release-config
```

If you're adding `semantic-release` in your CI/CD pipeline, be sure to add `@sketchy/semantic-release-config` there as well

## Usage

The shareable config can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

Via `.releaserc` file:
```json
{
  "branch": "main",
  "extends": "@sketchy/semantic-release-config"
}
```

## Publish
```bash
npm publish --access public
```

## Pubish Dry Run
Does everything publish would do except actually publishing to the registry
```bash
npm publish --dry-run
```

## Semantic Release Dry Run
Run on the `main` branch
```bash
npm run semantic-release ==dry-run
```

## Configuration

See each [plugin](#plugins) documentation for required installation and configuration steps.
