import * as fs from 'fs'
import * as path from 'path'
import express from 'express'
import cors from 'cors'
import bodyParser from "body-parser"
import diff from './diff'
import { BaseStoreDataType } from '../src/CoreDataLake'

const thisFileDirectory = path.dirname(__filename)
const fileDBLocation = thisFileDirectory + "/filedb"


if (!fs.existsSync(fileDBLocation)) {
    fs.mkdirSync(fileDBLocation)
}

const app = express()
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());
const port = 5174

app.post('/save', (req) => {
    console.log("Saving")
    const cleanDocName = String(req.query.f).replace(/\W/g, "_");
    const cleanFilePath = fileDBLocation + "/" + cleanDocName + ".json"
    let baseDoc: BaseStoreDataType = {}
    const incomingDoc: BaseStoreDataType = req.body;
    if (fs.existsSync(cleanFilePath)) {
        const wholeDoc: string = fs.readFileSync(cleanFilePath).toString();
        const docDeltas: Array<BaseStoreDataType> = wholeDoc
            .split("\n")
            .filter(i => i)
            .map((doc: string) => JSON.parse(doc));
        baseDoc = docDeltas.reduce((currentDoc, delta) => {
            Object.assign(currentDoc, delta);
            return currentDoc;
        }, {});
    }
    const differences: BaseStoreDataType = diff(incomingDoc, baseDoc)
    if (Object.keys(differences).length) {
        const diffsToSave: BaseStoreDataType = {};
        for (const key in differences) {
            diffsToSave[key] = incomingDoc[key] || null; // use explicit null for deletion
        }
        console.log("Saved")
        fs.appendFileSync(cleanFilePath, JSON.stringify(diffsToSave) + "\n");
    } else {
        console.log("Nothing to save")
    }
})

app.get("/load", (req, res) => {
    console.log("Loaded")
    const cleanDocName = String(req.query.f).replace(/\W/g, "_");
    const cleanFilePath = fileDBLocation + "/" + cleanDocName + ".json"
    let loadedDoc: BaseStoreDataType = {}
    if (fs.existsSync(cleanFilePath)) {
        const wholeDoc: string = fs.readFileSync(cleanFilePath).toString();
        const docDeltas: Array<BaseStoreDataType> = wholeDoc
            .split("\n")
            .map((doc: string) => JSON.parse(doc));
        loadedDoc = docDeltas.reduce((currentDoc, delta) => {
            Object.assign(currentDoc, delta);
            return currentDoc;
        }, {});
    }
    res.json(loadedDoc)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})