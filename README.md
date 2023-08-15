# Workflowish

Self-hostable, offline friendly bullet list / outlining tool aimed at developers, featuring symbolic links and an inbuilt scripting engine for automation.

[https://acenturyandabit.github.io/workflowish/]

![Workflowish Screenshot](./public/readme-screenshot.png)

## Current Features

- A to-do list, with infinitely nestable, collapsible bullet points.
  - Elaborate each task with further levels of detail
- Keyboard-first nagivation
  - Work fast. No more dialogs and buttons - just use your keyboard for everything, from entering new tasks to entering metadata.
- Self hostable:
  - Docker / docker-compose for easily hosting on your home machine
  - Localstorage save: Keep your data on your own device.
  - HTTP save: GET/POST your JSONified data to any server; one possible implementation included.
- A scripting engine, to automate item renaming, addition of metadata, etc.
- Symlinks, so an item can appear in multiple places at once.

## Self hosting

1. Clone this repository
2. `docker-compose up`

## Developing

See [DEVELOPERS.md].
