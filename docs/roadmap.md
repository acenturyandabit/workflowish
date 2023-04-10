# Version 3.4
`The symlink version`
- [ ] TODO: Refactor Workflowish to use Context and direct ID based set-ing to reduce dev complexity on symlinks
- [ ] TODO: Add editable Symlinks
- [ ] TODO: Make tab-indenting an item into/out of a symlink work
- [ ] TODO: Allow scripting engine to arbitrarily delete items
- [ ] TODO: Move Workflowy global out of scripting engine

# Version 3.5: Presentability V2
- [ ] TODO: Frontend version pinning for stability
- [ ] TODO: Automate build numbers
- [ ] TODO: Better password entry dialog

# Version 3.5.1
- [ ] TODO: Upgrade README screenshot to gif
- [ ] TODO: Check up on feature documentation
- [ ] TODO: Visiting site with blank URL should load last opened document
- [ ] TODO: Little popup from savesources to give user extra peace of mind when ctrl-s is pressed
- [ ] TODO: Alt + Enter will split a line down with the remaining text after the caret. Alt + Shift + Enter will make it a child.
- [ ] TODO: Pressing Enter will either insert an item before OR after the current element, based on the current caret index (front or back)
- [ ] TODO: Scripting: Add a console
- [ ] TODO: Warn if unsaved before closing
- [ ] TODO: Make Help dialog use the firstTimeDocument
- [ ] TODO: Add type hints to script editor https://stackoverflow.com/questions/43037243/provide-type-hints-to-monaco-editor

- [ ] TODO: Make load button on savesources overwrite existing coredatalake rather than merge
  - Allow appending imports in the text importer with a sync button, to allow incremental addition of items

# Version 4.0 
- [ ] TODO: Extract MVC interface from ScriptingEngine / Workflowish into a template
- [ ] TODO: Add something that automatically credits non-acenturyandabit contributors

# Noncritical technical debt
- [ ] TODO: Create a github release flow of the built frontend only
- [ ] TODO: Refactor KVStores so it acts like CoreDataLake in terms of the 'changed' flag
- [ ] TODO: Refactor TextImportKVStore so that it doesn't use dirty this.settings hacks
- [ ] TODO: Remove the notion of 'id' from items; replace with key
- [ ] TODO: Fix mobile bug where on load, Enter key doesn't work because setFocusedActionReceiver is undefined

# Unroadmapped features
- [ ] TODO: Better (hidden) password prompt
- [ ] TODO: Create a SetInterval implementation for the ScriptRunner
- [ ] TODO: [devops] Create config-fold-check to fold config files
- [ ] TODO: [devops] Add structural readability checker
  - Main functions should go first.

# Version 3.2
`The nicer multifile version`
- [ ] TODO: [FIX] load button in file dialog actually merges with data lake not overwrites
- [ ] TODO: Add an open different files dialog
- [ ] TODO: Load configurations from query path, which inform file loading
- [ ] TODO: Recent documents should show on open file menu
- [ ] TODO: Visiting site with blank URL should show open file dialog