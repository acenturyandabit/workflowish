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

# Version 2.4
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
`All those major structural changes shouldn't make the app unusable`
- [FIX] bug where source sync overwrites some user changes
- [FIX] bug where saving deletion of multiple objects fails
- [FIX] collapse failing due to not updating lastUpdatedUnixMillis
- [FIX] root level rearrangement
- [FIX] not being allowed to delete root level nodes
- Shift-tab on any item causes Workflowish to blow up
  - 1. Shift tab is two operations which are not atomic, and this triggers
  the cycle detector because the cycle detector sees the same object twice.
    - THIS IS HARD TO FIX without breaking encapsulation or decopuling the 
    item renderer from the item itself.
    - But we've already got a precedent for breaking encapsulation by passing
    indexes through to the parent, so guess we're doing that again...
  - 2. cycle detector doesnt detect cycles, it detects duplicates, which 
  causes it to freak out more than necessary, but it should still freak out, 
  because the model should guarantee no node appears twice, even for a moment
    3. Cycle detector could crash softer, instead of whitescreening the whole app.
      - We can make it just delete items which are in lower levels of the
      hierarchy, because if they are duplicated then they're being rendered, which is good
- Tab to indent also doesn't work, because I missed a lastUpdatedMillis

# Version 2.5
`The scripting engine version`
- Fix nothing shows up on clean start
- Create a popup scripting engine in the file menu
  - Refactor Navbar Dialogs to idiomatic React
- Create a wrapper which executes scripts
- [FIX] mobile bug where clicking doesnt change focus
- Add usage guide for self hosting in README
- Make it so that when shift/alt/control are pressed in mobile, focus is not lost
- Add press/hold indicators to mobile buttons
- Fix mobile bug where its possible to use focus buttons to leave focus by spamming 'Up'
- Fix unindent creating duplicate entries

# (Current) Version 2.5.1
`Support for huge files`
- Old polymorph upgrade script
- Fix floaty button positioning for large amounts of items
- Allow appending imports in the text importer, to allow incremental addition of items

# Version 2.6
`The Search version`
- Add search

# Version 2.7
`The plays nicely with other software version`
- Context menu export this-and-siblings-and-children as bullet points

# Version 2.7
`The Github release version`
- Make contribution guide
- Extract MVC interface from ScriptingEngine / Workflowish into a template
- Add github todo-to-issue
- Do versioning with tags rather than the current scheme
- Autogenerate the changelog rather than forcing users to update it manually, 
  but also preserve its utility as a planning space. 
  - Separate versions.md which keeps last version + future plans, and 
    changelog.md which keeps all versions in reverse order with newest on top.
- Add a screenshot in the README to show how it works
- Create a release flow of the built frontend only
- Add a premade base document on first start / empty load
- Push to github

# Version 3.1
`The multifile version`
- Add an open different files dialog
- Load configurations from query path, which inform file loading
- Recent documents should show on open file menu
- Visiting site with blank URL should show open file dialog

# Version 3.1.1
- Visiting site with blank URL should load last opened document
- Little popup to give user peace of mind when ctrl-s is pressed
- Alt + Enter will split a line down with the remaining text after the caret. Alt + Shift + Enter will make it a child.
- Pressing Enter will either insert an item before OR after the current element, based on the current caret index (front or back)

# Version 3.1.2
- Add automated versions.md file checking: check that past/future versions are in-order
- Add automated roadmap checking: explicitly alert maintainer when versions past version n+1 have been modified

# Version 3.3
`The symlink version`
- Add Symlinks
- Press a modifier key to view item IDs
- them symlink to an item ID.

# Version 4.1 
- Add a tabbing window manager

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
