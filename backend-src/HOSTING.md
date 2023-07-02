# Hosting

## Usage

To use this http backend after creating the server, in the frontend click File > Save Sources; then add a new save source "HTTP Save Source". In the settings, add:

- Save URL: `http://[your hostname and port]/save?f=[desired filename]`
- Load URL: `http://[your hostname and port]/load?f=[desired filename]`
- Sync URL: `http://[your hostname and port]/sync?f=[desired filename]`

## Security measures

### I don't want other folks reading my documents

You can assign a password to your document: for each `document.json` file created, if there is an adjacent `document.pass` file, the text in the file will be compared with the password in the HTTP header before reads / writes. Note this password can be saved by the browser, so use a long random string rather than a human memorable password.

### I don't want other folks saving random things on my server

You can disable the creation of new saved documents by moving / copying the `config.sample.json` to `config.json` in the backend directory, and settings `canCreateDocuments` to `false`. To create new documents, you can either manually create the file for the document in fileDB, or temporarily turn on `canCreateDocuments`, create the document, then turn it off again (restarting the server each time). Raise an issue if you have a need to do this frequently.
