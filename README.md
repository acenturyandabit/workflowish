# Polymorph
`acenturyandabit`'s personal task management app. A love letter to tiling window managers, tabs, and recursive lists.

[TODO: Pop a gif here]

## Current Features
- A to-do list, with infinitely nestable, collapsible bullet points.
    - Elaborate each task with further levels of detail
- Keyboard-first nagivation
    - Work fast. No more dialogs and buttons - just use your keyboard for everything, from entering new tasks to enterming metadata (todo).
- Localstorage save: Keep your data on your own device.

## Future features
- Scripting engine: Create scripts to automatically rearrange tasks and parse your own metadata tags

## How to use 
1. Clone this repository.
2. `npm install .`
3. `npm run`
4. Follow the URL in your browser.

## Developing
### Roadmap and issue tracking
My personal roadmap is in `versions.md`. You may pick any unfinished issue you would like to work on, from any version number.

### Code style
Upon `npm run`, this repository will install some githooks which automatically lint your code before you commit. These will be checked by CICD in future. The tests are:
- Correct (incremented) version number, compared to previous version
- Corresponding correct 'Current' flag in the `docs/versions.md` file so we have a good changelog.
    - Philosophy: Fast commits = good 
    - TODO: Branch versioning should only apply to master branch commits
- eslint
- jest testing

## Release process
- Bump `docs/versions.md`
- Commit messages should be like: `Version x.x: <message>`
