// Slack notifications — to enable:
//   1. Uncomment the Slack sections below
//   2. Set SLACK_WEBHOOK env var to your Slack incoming webhook URL
//   3. Set SEMANTIC_RELEASE_PACKAGE env var to your package name
//
// const slackifyMarkdown = require("slackify-markdown");
// const { chunkifyString } = require("semantic-release-slack-bot/lib/chunkifier");
// const slackWebhook = process.env.SLACK_WEBHOOK;
//
// const onSuccessFunction = (pluginConfig, context) => {
//   const releaseNotes = slackifyMarkdown(context.nextRelease.notes);
//   const text = `A new version of \`${process.env.SEMANTIC_RELEASE_PACKAGE}\` has been released to *Production!*`;
//   const headerBlock = { type: "section", text: { type: "mrkdwn", text } };
//   return {
//     text,
//     blocks: [
//       headerBlock,
//       ...chunkifyString(releaseNotes, 2900).map((chunk) => ({
//         type: "section",
//         text: { type: "mrkdwn", text: chunk },
//       })),
//     ],
//   };
// };
//
// const onFailFunction = (pluginConfig, context) => {
//   const nextReleaseNotes = context.nextRelease?.notes || "No notes existed";
//   const releaseNotes = slackifyMarkdown(nextReleaseNotes);
//   const text = `A failure happened during the attempted release of \`${process.env.SEMANTIC_RELEASE_PACKAGE}\``;
//   const headerBlock = { type: "section", text: { type: "mrkdwn", text } };
//   return {
//     text,
//     blocks: [
//       headerBlock,
//       ...chunkifyString(releaseNotes, 2900).map((chunk) => ({
//         type: "section",
//         text: { type: "mrkdwn", text: chunk },
//       })),
//     ],
//   };
// };

const willPublishPackages = process.env.PUBLISH_TO_NPM === "true";

const sortCommitGroup = (a, b) => {
  const tags = [
    ":rocket: FEATURES",
    ":bug: FIXES",
    ":racing_car: PERFORMANCE",
    ":hammer_and_wrench: CHORES",
    ":book: DOCS",
    ":construction: REFACTOR",
    ":nail_care: STYLING",
    ":thermometer: TEST",
  ];
  return tags.indexOf(a.title) - tags.indexOf(b.title);
};

const pluginList = [
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
        ],
      },
      writerOpts: {
        groupBy: "type",
        commitGroupsSort: sortCommitGroup,
      },
    },
  ],
  // Slack — uncomment block below and the Slack sections at the top of this file to enable
  // [
  //   "semantic-release-slack-bot",
  //   {
  //     notifyOnSuccess: false,
  //     notifyOnFail: false,
  //     markdownReleaseNotes: false,
  //     slackWebhook,
  //     branchesConfig: [
  //       {
  //         pattern: "main",
  //         markdownReleaseNotes: false,
  //         notifyOnSuccess: true,
  //         onSuccessFunction,
  //         notifyOnFail: true,
  //         onFailFunction,
  //       },
  //     ],
  //   },
  // ],
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
  branches: ["main"],
  plugins: pluginList,
};
