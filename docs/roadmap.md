# Version 2.8
`The up-to-date dev practices version`
- Do versioning with tags rather than the current scheme
  - Make commit messages at least 10 chars + capitalised start to encourage good practice
- Autogenerate the changelog rather than forcing users to update it manually, 
  but also preserve its utility as a planning space. 
  - Separate versions.md which keeps last version + future plans, and 
    changelog.md which keeps all versions in reverse order with newest on top.
  - split versions.md into roadmap.md, then use checkbox notation (cool!) to seed todo-to-issue
  - Make a local script that automatically appends commit message to changelog on each commit
    - add commit message one above the first heading that isn't 'latest'
    - create latest if it doesn't exist
  - Make a tag script in npm scripts that auto tags and edits the changelog
    - npm run release --major/--minor/--subminor [name]
      - auto commit and tag after renaming changelog

# Version 3.0
`The Github release version`
- Add a premade base document on first start / empty load
- Add a screenshot in the README to show how it works
- Push to github
- Add github todo-to-issue
- Create a github release flow of the built frontend only
- Make contribution guide
- Extract MVC interface from ScriptingEngine / Workflowish into a template
- Add something that automatically credits non-acenturyandabit contributors
- better password entry dialog

# Version 3.1
`The symlink version`
- Add Symlinks
- Allow scripting engine to arbitrarily add and delete items; and create symlinks.
- Move Workflowy global out of scripting engine

# Version 3.2
`The multifile version`
- [FIX] load button in file dialog actually merges with data lake not overwrites
- Add an open different files dialog
- Load configurations from query path, which inform file loading
- Recent documents should show on open file menu
- Visiting site with blank URL should show open file dialog

# Version 3.2.1
- Visiting site with blank URL should load last opened document
- Little popup from savesources to give user extra peace of mind when ctrl-s is pressed
- Alt + Enter will split a line down with the remaining text after the caret. Alt + Shift + Enter will make it a child.
- Pressing Enter will either insert an item before OR after the current element, based on the current caret index (front or back)
- Scripting: Add a console
- Warn if unsaved before closing

- Make load button on savesources overwrite existing coredatalake rather than merge
  - Allow appending imports in the text importer with a sync button, to allow incremental addition of items

# Version 4.0 
- Add a tabbing / window manager (back to what polymorph _really_ was at the very beginning)

# Noncritical technical debt
- Refactor KVStores so it acts like CoreDataLake in terms of the 'changed' flag
- Refactor TextImportKVStore so that it doesn't use dirty this.settings hacks
- Remove the notion of 'id' from items; replace with key
- Fix mobile bug where on load, Enter key doesn't work because setFocusedActionReceiver is undefined

# Unroadmapped features
- Better (hidden) password prompt
- Create a SetInterval implementation for the ScriptRunner
- [devops] Create config-fold-check to fold config files
- [devops] Add structural readability checker
  - Main functions should go first.
