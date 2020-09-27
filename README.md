# Merge branch

A simple Github Action that merge a branch (compare) into another one (base)

## The example speaks better than the finest speeches

```yml
name: Scheduled merge master in stage

on:
  schedule:
    - cron: '0 4 * * *' # Every day at 4am

jobs:
  merge:
    runs-on: ubuntu-latest

    steps:
      - name: 'Merge'
        id: merge
        uses: imsamdez/actions.merge-branch@v1.0.6
        with:
          base: stage # Change this according to your need
          compare: master # Change this according to your need
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Wait for CI

You can pass the `wait_for_ci` options. At the moment, this options only checks if compared branch is in _ready_ state. If not, the action will fail (a retrial implementation may come later).

```yml
name: Scheduled merge master in stage

on:
  schedule:
    - cron: '0 4 * * *' # Every day at 4am

jobs:
  merge:
    runs-on: ubuntu-latest

    steps:
      - name: 'Merge'
        id: merge
        uses: imsamdez/actions.merge-branch@main
        with:
          base: stage
          compare: master
          github_token: ${{ secrets.GITHUB_TOKEN }}
          wait_for_ci: true # Here
```
