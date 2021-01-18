/* eslint-disable github/no-then */
import * as core from '@actions/core';
import * as github from '@actions/github';
import {ActionInputs, GithubStatus} from './enums';
import {string2boolean} from './helpers';

const octokit = github.getOctokit(core.getInput(ActionInputs.GITHUB_TOKEN));
const repo = github.context.repo;

export async function run(): Promise<void> {
  try {
    const baseName = core.getInput(ActionInputs.BRANCH_BASE);
    const compareName = core.getInput(ActionInputs.BRANCH_COMPARE);
    const waitForCi = string2boolean(core.getInput(ActionInputs.WAIT_FOR_CI));
    const base = await getBranch(baseName);
    const compare = await getBranch(compareName);
    let compareStatus = null;

    if (base == null) {
      return core.setFailed(`Base branch (${baseName}) could not be found!`);
    }
    if (compare == null) {
      return core.setFailed(
        `Compare branch (${compareName}) could not be found!`
      );
    }
    if (waitForCi === true) {
      compareStatus = await getBranchStatus(compareName);

      if (compareStatus !== GithubStatus.SUCCESS) {
        // @TODO Implement a retrial mechanism
        return core.setFailed(
          `Compare branch (${compare}) not ready for merge! Current status is ${compareStatus}!`
        );
      }
    }
    await merge(baseName, compareName, compare.commit.sha);
    return;
  } catch (err) {
    return core.setFailed(`Merge failed! ${err.message}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBranch(branch: string): Promise<any> {
  try {
    const resultBranch = await octokit.repos
      .getBranch({
        ...repo,
        branch
      })
      .then(response => response.data);

    core.debug(
      `isBranchExist - getBranch returned ${JSON.stringify(resultBranch)}`
    );
    return resultBranch;
  } catch (err) {
    core.error(`isBranchExist - getBranch returned ${err.message}`);
    return null;
  }
}
export async function getBranchStatus(
  branch: string
): Promise<GithubStatus | null> {
  try {
    const resultStatus = await octokit.repos
      .listCommitStatusesForRef({
        ...repo,
        ref: branch
      })
      .then(response => response.data);

    core.debug(
      `getBranchStatus - listCommitStatusesForRef returned ${JSON.stringify(
        resultStatus
      )}`
    );
    if (resultStatus.length !== 0) {
      return resultStatus[0].state as GithubStatus;
    }
    return null;
  } catch (err) {
    core.error(
      `getBranchStatus - listCommitStatusesForRef returned ${err.message}`
    );
    return null;
  }
}

export async function merge(
  base: string,
  head: string,
  headSha: string
): Promise<boolean> {
  try {
    await octokit.repos
      .merge({
        ...repo,
        base,
        head
      })
      .then(response => response.data);

    core.debug(
      `merge - Successfully done! (${base} ← ${head} on sha ${headSha})`
    );
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
}

if (process.env.NODE_ENV !== 'test') {
  run();
}
