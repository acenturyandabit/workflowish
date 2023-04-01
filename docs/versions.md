# Version 1.0
- Dot point to do list
    - Add dot points when ENTER is pressed
    - Delete dot points which are empty when backspace is pressed

# Version 1.1
- Save to Localforage
- Ignore ctrl+S for save
- Rearrange code so it follows Clean Code `main-functions-first`

# Version 1.2
- Can use `up` and `down` to navigate between items
- can use `alt-up` and `alt-down` to rearrange items
- Add linter

# Verison 2.0
- Make it look like old polymorph
- Add a help with instructions on how to use it so far

# Version 2.1
- Can use `tab` at start of item to make child of item above
- Can use `shift-tab` when cursor at start of item to make sibling of current parent
- Corresponding updates to the instructions

# Version 2.1.1
- Up will focus on children of sibling if children of sibling exist
- Up will exit from children if at first child
- Down will exit from children if no further children

# Version 2.1.2
- Indenting and unindenting will focus on children correctly
- Editing item does not move focus to the start or end of the contenteditable
- Deleting freshly created items should work

# Version 2.1.3
- Improved commit message checking rules

# Version 2.2
- Add `ctrl-up` and `ctrl-down` to collapse / uncollapse
- Show little arrows for collapsed / uncollapsed items
- [FIX] Enter adds new items below instead of above current item
- [FIX] Backspace deletion focuses on previous item
- Corresponding updates to the instructions

# Version 2.2.1
- Add `shift-enter` to add new items as children
- Document this

# Version 2.2.2
- Add initial test

# Version 2.2.3
- [FIX] Focus crashes on some empty items
- Move the help screen into Workflowish

# Version 2.3
`The peace of mind version`
- Add a file menu
- Add configurable save sources
- Add ability to POST to specified endpoint
- Make a simple backend which saves JSON deltas one per line (slow but somewhat RAM/disk efficient)
- Detach the model from the save process

# Version 2.3.1
- [FIX] Backend diff engine not working correctly
- [FIX] Reduce length of new keys
- Add a line border to show indentation depth
- Add old polymorph import source

# (Current) Version 2.4
`The MVP Mobile Version`
- Deployment with the web server
- Add push-pull functionality on save
     - Breaking change! Now all stored items must have a lastModifiedUnixMillis
     - Breaking change! Now trees are stored as rendered (i.e. with a childArray rather than with a parent pointer)
        - this makes it more flexible
        - this also better suits a data model where we fetch individual items from the datamodel on an as-needed basis rather than dumping every change to every consumer always.
     - Breaking change! Now items cannot be deleted, only set to dataless objects
- Add mobile autosave with appropriate throttling
- Make it a PWA
- Add a password
- Add the sticky buttons

# Version 2.4.1
- Remove the notion of 'id' from items; replace with key
- Fix bug where on load, Enter key doesn't work because setFocusedActionReceiver is undefined
- Fix bug where its possible to use focus buttons to leave focus by spamming 'Up'
- Fix bug where ctrl/alt/shift hides keyboard
- Fix bug where clicking doesnt change focus
- Better (hidden) password prompt

# Version 2.5
`The scripting engine version`
- Create an event bus
- Create a popup scripting engine in the file menu

# Version 2.5.1
- Allow appending imports in the text importer, to allow incremental addition of items

# Version 2.6
`The Search version`
- Add search

# Version 2.7
- Make contribution guide
- Add structural readability checker
- Add github todo-to-issue
- Do versioning with tags rather than the current scheme
- Add a screenshot in the README to show how it works
- Push to github
- Create config-fold-check to fold config files

# Version 3.1
`The multifile version`
- Add an open different files dialog
- Load configurations from query path, which inform file loading
- Recent documents should show on open file menu
- Visiting site with blank URL should show open file dialog

# Version 3.1.1
- Visiting site with blank URL should load last opened document
- Little popup to give user peace of mind when ctrl-s is pressed
- Pressing Enter will either insert an item before OR after the current element, based on the current caret index (front or back)

# Version 3.1.2
- Add github ci
- Add automated versions.md file checking: check that past/future versions are in-order
- Add automated roadmap checking: explicitly alert maintainer when versions past version n+1 have been modified

# Version 3.3
`The symlink version`
- Add Symlinks

# Version 4.1 
- Add a tabbing window manager

# Miscellaneous technical debt
- Refactor KVStores so it acts like CoreDataLake in terms of the 'changed' flag
- Refactor TextImportKVStore so that it doesn't use dirty this.settings hacks
