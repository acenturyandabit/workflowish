# Workflowish

`acenturyandabit`'s personal task management app: a recursive list implementation (think Workflowy), but self-hostable, scriptable, and with a few extra tricks up its sleeve.

[https://acenturyandabit.github.io/workflowish/]

![Workflowish Screenshot](./public/readme-screenshot.png)

## Current Features

- A to-do list, with infinitely nestable, collapsible bullet points.
  - Elaborate each task with further levels of detail
- Keyboard-first nagivation
  - Work fast. No more dialogs and buttons - just use your keyboard for everything, from entering new tasks to entering metadata.
- Self hosted storage:
  - Localstorage save: Keep your data on your own device.
  - HTTP save: GET/POST your JSONified data to any server; one possible implementation included.
- A scripting engine, to automate item renaming, addition of metadata, etc.
- Symlinks, so an item can appear in multiple places at once.

## Self hosting

1. Clone this repository
2. `npm run build`
3. `npm run start-backend` opens up on port 5174 by default
4. `npm run start`
5. Follow the URL in your browser for the frontend.
6. To save documents on your machine, check out [backend-src/HOSTING.md].

## Developing

See [DEVELOPERS.md].
