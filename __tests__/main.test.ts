// It can helps https://github.com/actions/toolkit/blob/master/docs/github-package.md

import nock from 'nock';
import {GithubStatus} from '../src/enums';

enum EnvVariable {
  GITHUB_REPOSITORY = 'GITHUB_REPOSITORY',

  // Actions Inputs
  GITHUB_TOKEN = 'INPUT_GITHUB_TOKEN',
  BRANCH_BASE = 'INPUT_BASE',
  BRANCH_COMPARE = 'INPUT_COMPARE',
  WAIT_FOR_CI = 'INPUT_WAIT_FOR_CI'
}

/**
 * Set up inputs
 */
const input_base = 'base';
const input_compare = 'compare';
const input_github_token = 'token';
const input_wait_for_ci = 'false';

/**
 * Set up environment
 */
process.env[EnvVariable.GITHUB_REPOSITORY] = 'foo/bar';
process.env[EnvVariable.GITHUB_TOKEN] = input_github_token;
process.env[EnvVariable.BRANCH_BASE] = input_base;
process.env[EnvVariable.BRANCH_COMPARE] = input_compare;
process.env[EnvVariable.WAIT_FOR_CI] = input_wait_for_ci;

/**
 * Set up Github API Endpoints
 */
const MockedGithubEndpoint = {
  getBranchBase: `/repos/${
    process.env[EnvVariable.GITHUB_REPOSITORY]
  }/branches/${input_base}`,
  getBranchCompare: `/repos/${
    process.env[EnvVariable.GITHUB_REPOSITORY]
  }/branches/${input_compare}`,
  getBranchStatusCompare: `/repos/${
    process.env[EnvVariable.GITHUB_REPOSITORY]
  }/commits/${input_compare}/statuses`,
  merge: `/repos/${process.env[EnvVariable.GITHUB_REPOSITORY]}/git/refs/heads/${
    process.env[EnvVariable.BRANCH_BASE]
  }`,

  failGetBranch: `/repos/${
    process.env[EnvVariable.GITHUB_REPOSITORY]
  }/branches/unk`
};

/**
 * Set up Nock
 */
const nockInstance = nock('https://api.github.com').persist();
nockInstance.get(MockedGithubEndpoint.getBranchBase).reply(200, {
  name: 'base'
});
nockInstance.get(MockedGithubEndpoint.getBranchCompare).reply(200, {
  name: 'compare'
});
nockInstance.get(MockedGithubEndpoint.failGetBranch).reply(404);
nockInstance.get(MockedGithubEndpoint.getBranchStatusCompare).reply(200, [
  {
    state: GithubStatus.SUCCESS
  }
]);
nockInstance.get(MockedGithubEndpoint.getBranchStatusCompare).reply(200, [
  {
    state: GithubStatus.SUCCESS
  }
]);
nockInstance.patch(MockedGithubEndpoint.merge).reply(200);

describe('Main', () => {
  let getBranch: Function;
  let getBranchStatus: Function;
  let run: Function;
  let merge: Function;

  beforeAll(async () => {
    const main = await import('./../src/main');

    getBranch = main.getBranch;
    getBranchStatus = main.getBranchStatus;
    run = main.run;
    merge = main.merge;
  });

  describe('getBranch', () => {
    it('should return not null if branch exists', async () => {
      const result = await getBranch(input_base);

      expect(result).not.toBeNull();
    });
    it('should return false if branch does not exists', async () => {
      const result = await getBranch('unk');

      expect(result).toBeNull();
    });
  });
  describe('getBranchStatus', () => {
    it('should return a Github Status', async () => {
      const result = await getBranchStatus(input_compare);

      expect(result).toEqual(GithubStatus.SUCCESS);
    });
  });
  describe('merge', () => {
    it('should merge branch compare in base', async () => {
      const result = await merge(input_base, input_compare);

      expect(result).toEqual(true);
    });
  });
});
