[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
# @josh803316/semantic-release-helper

Shareable semantic-release config for personal projects. Creates GitHub releases, generates changelog from conventional commits, and optionally publishes to GitHub Packages.

## Plugins

- [`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer) — determines version bump from commits
- [`@semantic-release/release-notes-generator`](https://github.com/semantic-release/release-notes-generator) — generates changelog
- [`@semantic-release/github`](https://github.com/semantic-release/github) — creates GitHub releases and tags
- [`@semantic-release/npm`](https://github.com/semantic-release/npm) — publishes to GitHub Packages (when `PUBLISH_TO_NPM=true`)
- [`semantic-release-slack-bot`](https://github.com/juanpabloaj/semantic-release-slack-bot) — Slack notifications (when `SLACK_WEBHOOK` env var is set)

## Install in a consuming project

### 1. Add `.npmrc` to authenticate with GitHub Packages

```
@josh803316:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

### 2. Install the package

```bash
npm install --save-dev @josh803316/semantic-release-helper
```

### 3. Add a `.releaserc` config

```json
{
  "extends": "@josh803316/semantic-release-helper"
}
```

Or add a `release.config.js` if you need to extend with project-specific steps (e.g. `@semantic-release/exec`):

```js
const baseConfig = require('@josh803316/semantic-release-helper');

module.exports = {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    // add project-specific plugins here
  ],
};
```

### 4. Add a GitHub Actions release workflow

```yaml
name: Release
on:
  push:
    branches: [main]

permissions:
  contents: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://npm.pkg.github.com

      - run: npm ci

      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SEMANTIC_RELEASE_PACKAGE: your-package-name
          # Set PUBLISH_TO_NPM: "true" only if publishing to GitHub Packages
          # Set SLACK_WEBHOOK secret if you want Slack notifications
```

## Commit convention

Uses [Angular conventional commits](https://www.conventionalcommits.org/). All commit types trigger at minimum a patch release:

| Type | Release | Section |
|------|---------|---------|
| `feat` | minor | :rocket: FEATURES |
| `fix` | patch | :bug: FIXES |
| `perf` | patch | :racing_car: PERFORMANCE |
| `chore` | patch | :hammer_and_wrench: CHORES |
| `docs` | patch | :book: DOCS |
| `refactor` | patch | :construction: REFACTOR |
| `style` | patch | :nail_care: STYLING |
| `test` | patch | :thermometer: TEST |

`BREAKING CHANGE` in commit footer → major release.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes | GitHub token for creating releases (built-in in Actions) |
| `NODE_AUTH_TOKEN` | Yes (if publishing) | Token for GitHub Packages auth (can reuse `GITHUB_TOKEN`) |
| `PUBLISH_TO_NPM` | No | Set to `"true"` to publish to GitHub Packages registry |
| `SLACK_WEBHOOK` | No | Slack incoming webhook URL — enables Slack notifications when set |
| `SEMANTIC_RELEASE_PACKAGE` | No | Package name shown in Slack notifications |

## Publishing this package itself

```bash
# Dry run (no publish)
npx semantic-release --dry-run

# Actual release — triggered automatically by CI on push to main
```

This package publishes itself via the `.github/workflows/release.yml` workflow using `GITHUB_TOKEN` (no extra secrets needed beyond an optional `SLACK_WEBHOOK`).
