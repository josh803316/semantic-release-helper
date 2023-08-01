const slackifyMarkdown = require("slackify-markdown");
const { chunkifyString } = require("semantic-release-slack-bot/lib/chunkifier");
const willPublishPackages = process.env.PUBLISH_TO_NPM === "true" ? true : false;

// Console logs will be removed soon
console.log({ PUBLISH_TO_NPM: process.env.PUBLISH_TO_NPM });
console.log({ willPublishPackages });

const sortCommitGroup = (a, b) => {
  const tags = [':rocket: FEATURES', ':bug: FIXES', ':racing_car: PERFORMANCE', ':hammer_and_wrench: CHORES', ':book: DOCS',
    ':construction: REFACTOR', ':nail_care: STYLING', ':thermometer: TEST'];
  rankA = tags.indexOf(a.title);
  rankB = tags.indexOf(b.title);

  return rankA - rankB
};

const onSuccessFunction = (pluginConfig, context) => {
  const releaseNotes = slackifyMarkdown(context.nextRelease.notes);
  const text = `A new version of \`${process.env.SEMANTIC_RELEASE_PACKAGE}\` has been released to \*Production!\*`;
  const headerBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text,
    },
  };

  return {
    text,
    blocks: [
      headerBlock,
      ...chunkifyString(releaseNotes, 2900).map((chunk) => {
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: chunk,
          },
        };
      }),
    ],
  };
};

const onFailFunction = (pluginConfig, context) => {
  const nextReleaseNotes = context.nextRelease?.notes || 'No notes existed';
  const releaseNotes = slackifyMarkdown(nextReleaseNotes);
  const text = `A failure happened during the attempted release of \`${process.env.SEMANTIC_RELEASE_PACKAGE}\``;
  const headerBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text,
    },
  };

  return {
    text,
    blocks: [
      headerBlock,
      ...chunkifyString(releaseNotes, 2900).map((chunk) => {
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: chunk,
          },
        };
      }),
    ],
  };
};

let pluginList = [
  [
    "@semantic-release/commit-analyzer",
    {
      preset: "angular",
      releaseRules: [
        { type: "chore", release: "patch" },
        { type: "docs", release: "patch" },
        { type: "refactor", release: "patch" },
        { type: "style", release: "patch" },
        { type: "test", release: "patch" },
      ],
      parserOpts: {
        headerPattern: "^(\\w*)\\:\\s*(\\[?([A-Z]{1}[A-Z0-9]+-\\d+)\\]?)?\\s*(?!\\s)(.*)$",
        headerCorrespondence: ["type", "linear", "linear", "subject"],
      },
    },
  ],
  [
    "@semantic-release/release-notes-generator",
    {
      preset: "conventionalcommits",
      presetConfig: {
        issuePrefixes: ["SKE"],
        issueUrlFormat: "https://linear.app/project-hygeia/issue/{{prefix}}{{id}}",
        types: [
          { type: "feat", section: ":rocket: FEATURES" },
          { type: "fix", section: ":bug: FIXES" },
          { type: "perf", section: ":racing_car: PERFORMANCE" },
          { type: "chore", section: ":hammer_and_wrench: CHORES", hidden: false },
          { type: "docs", section: ":book: DOCS", hidden: false },
          { type: "refactor", section: ":construction: REFACTOR", hidden: false },
          { type: "style", section: ":nail_care: STYLING", hidden: false },
          { type: "test", section: ":thermometer: TEST", hidden: false },
        ],
      },
      parserOpts: {
        headerPattern: "^(\\w*)\\:\\s*(\\[?([A-Z]{1}[A-Z0-9]+-\\d+)\\]?)?\\s*(?!\\s)(.*)$",
        headerCorrespondence: ["type", "linear", "linear", "subject"],
        noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
      },
      writerOpts: {
        groupBy: "type",
        commitGroupsSort: sortCommitGroup
      }
    },
  ],
  [
    "semantic-release-slack-bot",
    {
      notifyOnSuccess: false,
      notifyOnFail: false,
      markdownReleaseNotes: false,
      slackWebhook: "REDACTED_SLACK_WEBHOOK",
      branchesConfig: [
        {
          pattern: "lts/*",
          notifyOnFail: true,
        },
        {
          pattern: "main",
          markdownReleaseNotes: false,
          notifyOnSuccess: true,
          onSuccessFunction,
          notifyOnFail: true,
          onFailFunction,
        },
      ],
    },
  ],
  [
    "@semantic-release/exec",
    {
      verifyReleaseCmd: "sh ./ci/release.sh ${nextRelease.version}", // eslint-disable-line no-template-curly-in-string
      prepareCmd: "sh ./ci/release.sh ${nextRelease.version}", // eslint-disable-line no-template-curly-in-string
    },
  ],
  "@semantic-release/github",
];

const npmPublishConfig = [
  "@semantic-release/npm",
  {
    npmPublish: willPublishPackages,
  },
];

console.log({ pluginList: JSON.stringify(pluginList) });

if (willPublishPackages === true) {
  pluginList.push(npmPublishConfig);
}

console.log({ pluginList: JSON.stringify(pluginList) });

module.exports = {
  branches: ["main", "stage"],
  plugins: pluginList,
};
