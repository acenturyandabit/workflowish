# Developers
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

## Release process
- npm run verbump major/minor/patch message
- npm run deploy-to-gh-pages
- git push --force origin gh-pages:gh-pages