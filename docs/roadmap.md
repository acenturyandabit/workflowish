# Version 3.0
`The Github release version`
- Push to github
- Make alt + shift for showing the IDs.
- better password entry dialog
- [FIX] Deleting the first item on an empty document will cause help doc to reappear
- Add github todo-to-issue

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
- Upgrade README screenshot to gif
- Visiting site with blank URL should load last opened document
- Little popup from savesources to give user extra peace of mind when ctrl-s is pressed
- Alt + Enter will split a line down with the remaining text after the caret. Alt + Shift + Enter will make it a child.
- Pressing Enter will either insert an item before OR after the current element, based on the current caret index (front or back)
- Scripting: Add a console
- Warn if unsaved before closing
- Make Help dialog use the firstTimeDocument

- Make load button on savesources overwrite existing coredatalake rather than merge
  - Allow appending imports in the text importer with a sync button, to allow incremental addition of items

# Version 4.0 
- Extract MVC interface from ScriptingEngine / Workflowish into a template
- Add something that automatically credits non-acenturyandabit contributors

# Noncritical technical debt
- Create a github release flow of the built frontend only
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
