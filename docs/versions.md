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

# (Current) Version 2.2.3
- [FIX] Focus crashes on some empty items

# Version 2.3
- Make contribution guide
- Push to github

# Version 2.4
- Fancy up the README

# Version 3.0
- Add a file menu
- Add configurable save sources
- Add ability to POST to arbitrary endpoint

# Version 3.1
- Add an open different files dialog
- Load configurations from query path, which inform file loading
- Recent documents should show on open file menu
- Visiting site with blank URL should show open file dialog

# Version 3.1.1
- Visiting site with blank URL should load last opened document
- Little popup to give user peace of mind when ctrl-s is pressed

# Version 3.1.2
- Add github ci
- Add automated versions.md file checking: check that versions are in-order
- Add automated roadmap checking: explicitly alert maintainer when versions past version n+1 have been modified

# Version 3.1.3
- Add a line thingy that renders when objects unfold

# Version 3.2
- Add search and tagging

# Version 3.3
- Add Symlinks

# Version 4.0
- Create an event bus
- Detach the model from the save process, so that the event bus can be used (and so workflowy can be used standalone)
- Move the help screen into Workflowish

# Version 4.1 
- Add a tabbing window manager

# Version 4.2
- Add a Userscript runner hooked into the event bus

