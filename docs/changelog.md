# Latest 
- Resume autosync if failed

# Version 4.0.2: Various mobile and save fixes 
- Automatically upgrade data schema version
- Fix context menu
- Fix child order in context menu copying
- Make menu + search bar sticky when keyboard appears
- Restore sticky to omnibar on desktop
- Wrap item selection in command bar
- Improve mobile omnibar experience: ACT button and comma as separator
- Add focus to omnibar when act button pressed
- Remove duplicate lu command and rephrase other commands
- Remove search bar functionality
- fix command menu not showing up when > pressed in omnibar
- Fix Copy Symlink command
- Fix lc command + write tests
- Add autorun switch with hash
- Backend has ping endpoint to check version of document
- Autoping on frontend
- Add auth to ping endpoint
- Add dockerfile and docker-compose file

# Version 4.0.1: Post-Anki Minor Bugfixes 
- Sync only sends diffs
- fix bug which duplicates entire data object for every key
- Fix bug that prevents item deletion
- Remove minwidth constraint for phone
- Split the same subcard by time
- Fix bug where anki items update with wrong key
- Add datagrid for card statistics
- Fix sorting for card statistics
- Fix broken sorting by providing id in anki
- Fix intent of card staggering
- Improved test buttons layout
- Improve MUI styling and dependencies; add postfix to search bar for debugging; fix move commands
- upgrade vite to 4.0 to suppress build error

# Version 4.0.0: Anki memorization system; move to _lm key for last modified 
- Move focus to end of element to make it easier to delete items after each other
- Fix deletion getting rid of child items that have been outdented
- Focus correct item when editing near symlink items
- Focus on correct item after link creation
- Focus correct item wheen creating new items via commands
- Fix focus failing on item rearrange
- improve focus on insertion of new items
- Improve safety in script engine
- Add move command
- Allow interacting with mobile buttons using floaty buttons
- Fix focus jump on clicking item
- Add copy-symlink-under commands
- refactor tutorial; rename copy symlink commands; add tests for commands
- Fix duplicated symlink node
- Add replay buffer + fix tests
- Fix move symlink under behavior
- Ensure replay renderer does not consume resources if user did not request
- Add Anki Test and card statistics V1
- Don't send deleted items to frontend
- change from lastUpdatedMillis to _lm

# Version 3.7.0: New Item Modification Tracking System 
- Add CLI cleanup tools
- first round of top-down-update code removal
- fix focus traversal and child creation
- fix focus after arrangement
- fix ought not to interfere with other key commands
- copying symlinks creates a sibling symlink
- Better fix for alt movements
- Fix alt enter split item

# Version 3.6.0: Add omnibar 
- Refactor to separate omnibar and search
- Add CTRL+P for omnibar focus
- Highlight currently selected item
- Make Escape on omnibar return focus to last focused item
- Refactor to make Omnibar jump work
- Add link under command
- Fix bug where symlink children don't get expanded
- Fix grand+children of symlinked nodes not collapsing
- Fix backspace deletes item immediately + error thrown if try to fix with regular state getter
- Minor fixes, including correct tab to indent behavior, focus behaviour, deletion behaviour
- Fix performance issue due to compounding event handlers
- fix: deleting direct children of symlinks causes crash
- Better behaviour on duplicate item

# Version 3.5.0: More useful search 
- Fix minor focus bug
- Fix bug where matches under an existing match arent revealed
- Press enter to jump to searched item
- Fix sticky search not sticking in extremely long documents

# Version 3.4.0: The Symlink Version 
- Ability to use function to transform items (Not ideal yet - can't fetch arbitrary items synchronously)
- Allow indenting in and out of symlinks
- Refactor CTRL-F to increase modularity and readability
- Fix old update issue in symlink children
- Fix issue where pressing tab on direct child of symlink crashes
- Add smoke test for workflowish overall
- Fixed unindent bug for symlinks
- Make sure symlinked node is passed to update cycle
- Smaller symlink
- Add keyboard shortcuts for jumping

# Version 3.3.0: Miscellaneous Bugfixes 
- Add workflowish item creation in script engine
- Refactor the help screen so it uses workflowky + add symlink info to help screen
- Fix rearrangement with symlinks
- Allow created items to have custom ID
- Fix pre-commit hook not failing
- Fix console warning about nested elements
- Symlinked Nodes should not be readonly, only children should be readonly
- Check for duplication in rendering process to reduce stray items
- Password prefix for better security

# Version 3.2.0: Rudimentary symlinks 
- Rudimentary (readonly) symlinks

# Version 3.1.0: Deploy to github pages 
- Add github todo-to-issue
- Mass issue creation via todo-to-issue
- Partial implementation of deploy-to-github-pages script (hard because windows doesn't mix with bash)
- Github pages build for Version v3.0.0
- Github pages attempt in typescript
- Refactor <Item> in preparation for Symlink

# Version 3.0.0: Github release version 
- Create base document
- Rebrand to workflowish
- Alt+shift for showing item IDs
- Prevent deleting first item in empty list
- Prepare for github release

# Version 2.8.0: Commit process upgrades
- Automated version bumping
- New Commit System
- Add version bump shell script
- Also automate the changelog title

# Version 2.7
`The plays nicely with other software version`
- Context menu that exports the current node and its siblings and their children as bullet points to the clipboard
- scriptRunner: Add an easy way to determine items' parent elements
  - Press a modifier key to view item IDs, in support of this feature
- Allow expanding by tapping the arrow bullet on phone

# Version 2.6
`The Search version`
- Add search

# Version 2.5.1
`Support for huge files`
- Old polymorph upgrade script
- Fix floaty button positioning for large amounts of items

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

# Version 2.4
`The MVP Mobile Version`
- Deployment with the web server
- Add push-pull functionality on save
     - Breaking change! Now all stored items must have a _lm
     - Breaking change! Now trees are stored as rendered (i.e. with a childArray rather than with a parent pointer)
        - this makes it more flexible
        - this also better suits a data model where we fetch individual items from the datamodel on an as-needed basis rather than dumping every change to every consumer always.
     - Breaking change! Now items cannot be deleted, only set to dataless objects
- Add mobile autosave with appropriate throttling
- Make it a PWA
- Add a password
- Add the sticky buttons

# Version 2.3.1
- [FIX] Backend diff engine not working correctly
- [FIX] Reduce length of new keys
- Add a line border to show indentation depth
- Add old polymorph import source

# Version 2.3
`The peace of mind version`
- Add a file menu
- Add configurable save sources
- Add ability to POST to specified endpoint
- Make a simple backend which saves JSON deltas one per line (slow but somewhat RAM/disk efficient)
- Detach the model from the save process

# Version 2.2.3
- [FIX] Focus crashes on some empty items
- Move the help screen into Workflowish

# Version 2.2.2
- Add initial test

# Version 2.2.1
- Add `shift-enter` to add new items as children
- Document this

# Version 2.2
- Add `ctrl-up` and `ctrl-down` to collapse / uncollapse
- Show little arrows for collapsed / uncollapsed items
- [FIX] Enter adds new items below instead of above current item
- [FIX] Backspace deletion focuses on previous item
- Corresponding updates to the instructions

# Version 2.1.3
- Improved commit message checking rules

# Version 2.1.2
- Indenting and unindenting will focus on children correctly
- Editing item does not move focus to the start or end of the contenteditable
- Deleting freshly created items should work

# Version 2.1.1
- Up will focus on children of sibling if children of sibling exist
- Up will exit from children if at first child
- Down will exit from children if no further children

# Version 2.1
- Can use `tab` at start of item to make child of item above
- Can use `shift-tab` when cursor at start of item to make sibling of current parent
- Corresponding updates to the instructions

# Version 2.0
- Make it look like old polymorph
- Add a help with instructions on how to use it so far

# Version 1.2
- Can use `up` and `down` to navigate between items
- can use `alt-up` and `alt-down` to rearrange items
- Add linter

# Version 1.1
- Save to Localforage
- Ignore ctrl+S for save
- Rearrange code so it follows Clean Code `main-functions-first`

# Version 1.0
- Dot point to do list
    - Add dot points when ENTER is pressed
    - Delete dot points which are empty when backspace is pressed

