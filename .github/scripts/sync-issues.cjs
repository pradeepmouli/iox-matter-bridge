// Kept outside workflow YAML so multiline Markdown cannot break its indentation.
const SYNC_LABELS = ['device-support', 'enhancement', 'bug'];
const TRACKING_LABELS = ['synced-to-udi-js', 'copilot-tracked', 'needs-triage'];

function marker(context, issue) {
  return `<!-- synced-from: ${context.repo.owner}/${context.repo.repo}#${issue.number} -->`;
}

async function prepareSync({ github, context, issueNumber, token }) {
  const number = Number(issueNumber);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new Error('The issue number must be a positive integer.');
  }
  // Events may have queued before an earlier run finished. Check current state.
  const { data: issue } = await github.rest.issues.get({ ...context.repo, issue_number: number });
  const labels = issue.labels.map(label => typeof label === 'string' ? label : label.name);
  if (issue.pull_request || labels.includes('synced-to-udi-js') || !SYNC_LABELS.some(label => labels.includes(label))) {
    return null;
  }
  if (!token) {
    throw new Error('UDI_JS_ISSUES_TOKEN is not configured. A separately authorized token with Issues read/write access to pradeepmouli/udi-js is required; GITHUB_TOKEN cannot write to another repository.');
  }
  return issue;
}

async function copyIssue({ github, context, issue, target, core }) {
  const reference = marker(context, issue);
  const { data: account } = await github.rest.users.getAuthenticated();
  // Search indexing is eventually consistent. List all pages instead so a retry
  // after target creation but before source labeling does not create a duplicate.
  const existing = await github.paginate(github.rest.issues.listForRepo, { ...target, state: 'all', per_page: 100 });
  let synced = existing.find(candidate => !candidate.pull_request && candidate.user?.id === account.id && candidate.body?.startsWith(reference + '\n'));
  if (!synced) {
    const { data } = await github.rest.issues.create({
      ...target,
      title: `[iox-matter-bridge] ${issue.title}`,
      body: [
        reference,
        `**Synced from:** ${issue.html_url}`,
        `**Original Author:** @${issue.user.login}`,
        `**Created:** ${issue.created_at}`,
        '', '---', '',
        issue.body || 'No description provided.',
        '', '---', '',
        `*Automatically copied from the [iox-matter-bridge repository](${issue.html_url}).*`,
      ].join('\n'),
    });
    synced = data;
  }
  const labels = issue.labels
    .map(label => typeof label === 'string' ? label : label.name)
    .filter(label => !TRACKING_LABELS.includes(label));
  if (labels.length) {
    try {
      await github.rest.issues.addLabels({ ...target, issue_number: synced.number, labels });
    } catch (error) {
      core.warning(`Issue exists, but target labels could not be copied: ${error.message}`);
    }
  }
  core.info(`Synced issue: ${synced.html_url}`);
  return { number: synced.number, html_url: synced.html_url };
}

async function markSynced({ github, context, issue, synced, target }) {
  const expectedUrl = `https://github.com/${target.owner}/${target.repo}/issues/${synced?.number}`;
  if (!Number.isSafeInteger(synced?.number) || synced.number <= 0 || synced.html_url !== expectedUrl) {
    throw new Error('Cannot mark the source as synced without a valid target issue.');
  }
  const reference = marker(context, issue);
  const source = { ...context.repo, issue_number: issue.number };
  const comments = await github.paginate(github.rest.issues.listComments, { ...source, per_page: 100 });
  if (!comments.some(comment => comment.user?.login === 'github-actions[bot]' && comment.user.type === 'Bot' && comment.body?.startsWith(reference + '\n') && comment.body.includes(synced.html_url))) {
    await github.rest.issues.createComment({
      ...source,
      body: [
        reference,
        '✅ **Issue Synced to udi-js**', '',
        `This issue has been copied to [udi-js](${synced.html_url}), where the source code and development are tracked.`, '',
        'This issue remains open here for reference. Please continue development discussion in the linked issue.',
      ].join('\n'),
    });
  }
  await github.rest.issues.addLabels({ ...source, labels: ['synced-to-udi-js', 'copilot-tracked'] });
}

module.exports = { prepareSync, copyIssue, markSynced };
