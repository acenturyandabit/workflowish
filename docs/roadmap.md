# Version 3.6.0

`Symlinks via keyboard: Link-to command`

- [ ] TODO: Bug where {Jump to original item of link} won't work on collapsed items

# Version 3.7.0

`Scripting engine upgrades`

- [ ] TODO: Scripting engine has a 'trust script' button which checks a checksum saved on the LOCAL MACHINE; autorun if the checksums match.
- [ ] TODO: Scripting: Add a console
- [ ] TODO: Add multiple tabs to the scripting engine.
- [ ] TODO: (refactor) Move Workflowy global out of scripting engine
- [ ] TODO: Allow scripting engine to arbitrarily delete items
- [ ] TODO: Add type hints to script editor <https://stackoverflow.com/questions/43037243/provide-type-hints-to-monaco-editor>
- [ ] TODO: Create a safe SetInterval / Settimeout implementation for the ScriptRunner

# Version 3.8.0

`Presentability III`

- [ ] TODO: Better password entry dialog
- [ ] TODO: Upgrade README screenshot to gif
- [ ] TODO: Check up on feature documentation
- [ ] TODO: Little popup from savesources to give user extra peace of mind when ctrl-s is pressed
- [ ] TODO: Automate build numbers
- [ ] TODO: Warn if unsaved before closing

# Save source tidy version

- [ ] TODO: [FIX] load button in file dialog actually merges with data lake not overwrites
- [ ] TODO: Make sync optional
- [ ] TODO: Allow appending imports in the text importer with a sync button, to allow incremental addition of items
- [ ] TODO: Refactor KVStores so it acts like CoreDataLake in terms of the 'changed' flag
- [ ] TODO: Refactor TextImportKVStore so that it doesn't use dirty this.settings hacks
- [ ] TODO: Refactor KVStores system to turn it into the component model

# Version 3.9.0

`Improved reversibility / useability`

- [ ] TODO: Pressing Enter will either insert an item before OR after the current element, based on the current caret index (front or back)
- [ ] TODO: Alt + Enter will split a line down with the remaining text after the caret. Alt + Shift + Enter will make it a child.
- [ ] TODO: Shift-enter should expand item; because allows to just undo quickly

# Version 3.10.0

`Extract Polycore as a design system`

- [ ] TODO: Remove the notion of 'id' from items; replace with key
- [ ] TODO: Extract MVC interface from ScriptingEngine / Workflowish into a template
- [ ] ATODO: Add new operators??

# Devops / build automation

- [ ] TODO: Create a github release flow of the built frontend only
- [ ] TODO: [devops] Add structural readability checker
  - Main functions should go first.

# Multifile version

- [ ] TODO: Visiting site with blank URL should load last opened document

# Noncritical technical debt

- [ ] TODO: Fix mobile bug where on load, Enter key doesn't work because setFocusedActionReceiver is undefined

# The nicer multifile version

- [ ] TODO: Add an open different files dialog
- [ ] TODO: Load configurations from query path, which inform file loading
- [ ] TODO: Recent documents should show on open file menu
- [ ] TODO: Visiting site with blank URL should show open file dialog

# Unroadmapped features

- Embeddings driven search rather than regular text search
- inline markdown processor for writing
- Image saving
