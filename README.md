# Polymorph
`acenturyandabit`'s personal task management app. Basically a recursive list implementation (think Workflowy), but self-hostable, scriptable, and keyboard/mobile-first.

[TODO: Pop a gif here]

## Current Features
- A to-do list, with infinitely nestable, collapsible bullet points.
    - Elaborate each task with further levels of detail
- Keyboard-first nagivation
    - Work fast. No more dialogs and buttons - just use your keyboard for everything, from entering new tasks to enterming metadata (todo).
- Save source options:
    - Localstorage save: Keep your data on your own device.
    - HTTP save: GET/POST your JSONified data to any server; one possible implementation included.
- A scripting engine, to automate item renaming, addition of metadata, etc.

## Future features
See docs/versions.md.

## How to use 
1. Clone this repository.
2. `npm install .`
3. `npm run`
4. Follow the URL in your browser.

## Self hosting 
1. Clone this repository
2. `npm run build`
3. `npm run start-backend`
4. Navigate to localhost:5174.

## Developing
This repository uses git hooks to ensure some code quality standards and provide test automation.

### Roadmap and issue tracking
My personal roadmap is in `roadmap.md`. You may pick any unfinished issue you would like to work on, from any version number.

`changelog.md` is automatically maintained:
- The 'Latest' commits are filled in by git hooks.
- Version bumps can be performed by running `npm run verbump -- major/minor/patch MESSAGE`, but this should only be done by the repository owner, to prevent tags going everywhere.

`roadmap.md` is manually maintained. Feel free to clear out sections that have been implemented.

### Code style
Upon `npm run`, this repository will install some githooks which automatically lint your code before you commit. These will be checked by CICD in future. The tests are:
- eslint
- jest testing
- At least 10 letters and first letter capital commit messages.