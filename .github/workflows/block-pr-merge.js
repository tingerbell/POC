const { Octokit } = require('@octokit/rest');

const token = process.argv[2];
const owner = process.argv[3];
const repo = process.argv[4];
const prNumber = parseInt(process.argv[5]);

const octokit = new Octokit({ auth: token });

async function blockPRMerge() {
  try {
    // Create a comment on the PR to block the merge
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: 'Merging this pull request is blocked due to failing merge conditions.',
    });

    // Set the PR status to failed to block the merge
    await octokit.rest.repos.createCommitStatus({
      owner,
      repo,
      sha: process.env.GITHUB_SHA,
      state: 'failure',
      target_url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
      description: 'Merge blocked due to failing conditions',
      context: 'Merge Conditions',
    });

    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

blockPRMerge();
