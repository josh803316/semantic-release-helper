const willPublishPackages = process.env.PUBLISH_TO_NPM === 'true'

// Linear issue linking in release notes.
// Configure via env vars in each project's CI workflow — no defaults so repos
// that don't use Linear are unaffected.
//
//   LINEAR_ISSUE_PREFIX  — team key, e.g. "PRO" or "ENG"
//   LINEAR_WORKSPACE     — Linear workspace slug in the URL, e.g. "my-workspace"
//
// Example commit messages (ticket ref is ALWAYS optional):
//   fix: [PRO-5] Fix the bug       → type=fix, ticket=PRO-5, subject=Fix the bug
//   fix: Fix the bug               → type=fix, ticket=undefined, subject=Fix the bug
//   feat(scope): [PRO-42] New thing → type=feat, scope=scope, ticket=PRO-42, subject=New thing
const linearIssuePrefix = process.env.LINEAR_ISSUE_PREFIX
const linearWorkspace = process.env.LINEAR_WORKSPACE
const hasLinearConfig = Boolean(linearIssuePrefix && linearWorkspace)

// Custom parser — extracts optional [TICKET-N] bracket refs so that:
//   a) subjects in release notes are clean (no [PRO-5] prefix)
//   b) commits without a ticket ref are still processed normally
const parserOpts = {
  headerPattern: /^(\w*)(?:\(([^)]*)\))?\s*:\s*(?:\[([^\]]*)\]\s*)?(.+)$/,
  headerCorrespondence: ['type', 'scope', 'ticket', 'subject'],
  noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
}

const sortCommitGroup = (a, b) => {
  const order = [
    ':rocket: FEATURES',
    ':bug: FIXES',
    ':racing_car: PERFORMANCE',
    ':hammer_and_wrench: CHORES',
    ':book: DOCS',
    ':construction: REFACTOR',
    ':nail_care: STYLING',
    ':thermometer: TEST',
    ':closed_lock_with_key: SECURITY',
  ]
  return order.indexOf(a.title) - order.indexOf(b.title)
}

const releaseNotesPresetConfig = {
  types: [
    { type: 'feat', section: ':rocket: FEATURES' },
    { type: 'fix', section: ':bug: FIXES' },
    { type: 'perf', section: ':racing_car: PERFORMANCE' },
    { type: 'chore', section: ':hammer_and_wrench: CHORES', hidden: false },
    { type: 'docs', section: ':book: DOCS', hidden: false },
    { type: 'refactor', section: ':construction: REFACTOR', hidden: false },
    { type: 'style', section: ':nail_care: STYLING', hidden: false },
    { type: 'test', section: ':thermometer: TEST', hidden: false },
    { type: 'security', section: ':closed_lock_with_key: SECURITY', hidden: false },
  ],
  commitUrlFormat: '{{host}}/{{owner}}/{{repository}}/commit/{{hash}}',
  compareUrlFormat: '{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}',
  userUrlFormat: '{{host}}/{{user}}',
  dateFormat: 'YYYY-MM-DD',
  ...(hasLinearConfig
    ? {
        issuePrefixes: [`${linearIssuePrefix}-`],
        issueUrlFormat: `https://linear.app/${linearWorkspace}/issue/{{prefix}}{{id}}`,
      }
    : {}),
}

const pluginList = [
  [
    '@semantic-release/commit-analyzer',
    {
      preset: 'conventionalcommits',
      parserOpts,
      releaseRules: [
        { breaking: true, release: 'major' },
        { revert: true, release: 'patch' },
        { type: 'feat', release: 'minor' },
        { type: 'fix', release: 'patch' },
        { type: 'perf', release: 'patch' },
        { type: 'chore', release: 'patch' },
        { type: 'docs', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'style', release: 'patch' },
        { type: 'test', release: 'patch' },
        { type: 'security', release: 'patch' },
      ],
    },
  ],
  [
    '@semantic-release/release-notes-generator',
    {
      preset: 'conventionalcommits',
      parserOpts,
      presetConfig: releaseNotesPresetConfig,
      writerOpts: {
        groupBy: 'type',
        commitGroupsSort: sortCommitGroup,
      },
    },
  ],
  [
    '@semantic-release/exec',
    {
      prepareCmd: './ci/release.sh ${nextRelease.version}', // eslint-disable-line no-template-curly-in-string
    },
  ],
  '@semantic-release/github',
]

if (willPublishPackages) {
  pluginList.push([
    '@semantic-release/npm',
    {
      npmPublish: true,
    },
  ])
}

module.exports = {
  branches: ['main'],
  plugins: pluginList,
}
