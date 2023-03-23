import * as fs from 'fs'
import * as path from 'path'
import express, { Request } from 'express'
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
    const docPath = getCleanFileName(req.query.f);
    const savedDoc = loadFromFile(docPath);

    const incomingDoc: BaseStoreDataType = req.body;
    const differences: BaseStoreDataType = diff(incomingDoc, savedDoc)
    if (Object.keys(differences || {}).length) {
        const diffsToSave: BaseStoreDataType = {};
        for (const key in differences) {
            diffsToSave[key] = incomingDoc[key] || null; // use explicit null for deletion
        }
        fs.appendFileSync(docPath, JSON.stringify(diffsToSave) + "\n");
        console.log("Saved")
    } else {
        console.log("Nothing to save")
    }
})

app.get("/load", (req, res) => {
    console.log("Loaded")

    const docPath = getCleanFileName(req.query.f);
    const savedDoc = loadFromFile(docPath);
    res.json(savedDoc)
})

const getCleanFileName = (queryString: Request['query'][string]): string => {
    if (!queryString) throw Error("No query provided");
    if (typeof queryString != "string") throw Error("Invalid document name");
    const cleanDocName = String(queryString).replace(/\W/g, "_");
    const cleanFilePath = fileDBLocation + "/" + cleanDocName + ".json"
    return cleanFilePath;
}

const loadFromFile = (fileName: string): BaseStoreDataType => {
    let savedDoc: BaseStoreDataType = {}

    if (fs.existsSync(fileName)) {
        const wholeDoc: string = fs.readFileSync(fileName).toString();
        const docDeltas: Array<BaseStoreDataType> = wholeDoc
            .split("\n")
            .filter(i => i)
            .map((doc: string) => JSON.parse(doc));
        savedDoc = docDeltas.reduce((currentDoc, delta) => {
            Object.assign(currentDoc, delta);
            return currentDoc;
        }, {});
    }
    return savedDoc
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})