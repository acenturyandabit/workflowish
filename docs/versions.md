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

# (Current) Version 2.1.1
- Up will focus on children of sibling if children of sibling exist
- Up will exit from children if at first child
- Down will exit from children if no further children

# Version 2.1.2
- Indenting and unindenting will focus on children correctly
- Editing item does not move focus to the start or end of the contenteditable
- Deleting freshly created items should work

# Version 2.2
- Add `ctrl-up` and `ctrl-down` to collapse / uncollapse
- Show little arrows for collapsed / uncollapsed items
- [FIX] Enter adds new items below instead of above current item
- Corresponding updates to the instructions

# Version 2.3
- Add github ci
- Make issue tickets to allow collaboration
- Push to github

# Version 2.4
- Can load and save to a server instead of localforage, as a JSON blob
- A file menu to select the action on ctrl-S

# Version x.x.minor-bugs
- Little popup to give user peace of mind when ctrl-s is pressed