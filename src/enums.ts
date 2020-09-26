export enum ActionInputs {
  GITHUB_TOKEN = 'github_token',
  BRANCH_BASE = 'base',
  BRANCH_COMPARE = 'compare',
  WAIT_FOR_CI = 'wait_for_ci'
}

export enum GithubStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  FAILURE = 'failure',
  PENDING = 'pending'
}
