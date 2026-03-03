const willPublishPackages = process.env.PUBLISH_TO_NPM === "true";

// Linear integration — set these env vars to override defaults.
// Turns [PRO-123] references in commits into clickable Linear links in release notes.
const linearIssuePrefix = process.env.LINEAR_ISSUE_PREFIX || "PRO";
const linearWorkspace = process.env.LINEAR_WORKSPACE || "project-hygeia";

const sortCommitGroup = (a, b) => {
  const order = [
    ":rocket: FEATURES",
    ":bug: FIXES",
    ":racing_car: PERFORMANCE",
    ":hammer_and_wrench: CHORES",
    ":book: DOCS",
    ":construction: REFACTOR",
    ":nail_care: STYLING",
    ":thermometer: TEST",
    ":closed_lock_with_key: SECURITY",
  ];
  return order.indexOf(a.title) - order.indexOf(b.title);
};

const pluginList = [
  [
    "@semantic-release/commit-analyzer",
    {
      preset: "conventionalcommits",
      releaseRules: [
        { breaking: true, release: "major" },
        { revert: true, release: "patch" },
        { type: "feat", release: "minor" },
        { type: "fix", release: "patch" },
        { type: "perf", release: "patch" },
        { type: "chore", release: "patch" },
        { type: "docs", release: "patch" },
        { type: "refactor", release: "patch" },
        { type: "style", release: "patch" },
        { type: "test", release: "patch" },
        { type: "security", release: "patch" },
      ],
    },
  ],
  [
    "@semantic-release/release-notes-generator",
    {
      preset: "conventionalcommits",
      presetConfig: {
        types: [
          { type: "feat", section: ":rocket: FEATURES" },
          { type: "fix", section: ":bug: FIXES" },
          { type: "perf", section: ":racing_car: PERFORMANCE" },
          { type: "chore", section: ":hammer_and_wrench: CHORES", hidden: false },
          { type: "docs", section: ":book: DOCS", hidden: false },
          { type: "refactor", section: ":construction: REFACTOR", hidden: false },
          { type: "style", section: ":nail_care: STYLING", hidden: false },
          { type: "test", section: ":thermometer: TEST", hidden: false },
          { type: "security", section: ":closed_lock_with_key: SECURITY", hidden: false },
        ],
        commitUrlFormat: "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}",
        compareUrlFormat: "{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}",
        userUrlFormat: "{{host}}/{{user}}",
        issuePrefixes: [`${linearIssuePrefix}-`],
        issueUrlFormat: `https://linear.app/${linearWorkspace}/issue/{{id}}`,
        dateFormat: "YYYY-MM-DD",
      },
      writerOpts: {
        groupBy: "type",
        commitGroupsSort: sortCommitGroup,
      },
    },
  ],
  [
    "@semantic-release/exec",
    {
      // Write the resolved version to /tmp/pre-release.version for downstream build scripts.
      prepareCmd: "./ci/release.sh ${nextRelease.version}", // eslint-disable-line no-template-curly-in-string
    },
  ],
  "@semantic-release/github",
];

if (willPublishPackages) {
  pluginList.push([
    "@semantic-release/npm",
    {
      npmPublish: true,
    },
  ]);
}

module.exports = {
  // Cut releases from main only.
  // To enable pre-releases from a dev branch add: { name: "dev", prerelease: "dev" }
  branches: ["main"],
  plugins: pluginList,
};
