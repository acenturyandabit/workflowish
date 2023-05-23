import * as fs from 'fs'
import * as path from 'path'
import express, { Request } from 'express'
import cors from 'cors'
import bodyParser from "body-parser"
import getDiffsAndResolvedItems from '../src/CoreDataLake/getResolvedItems'
import { BaseStoreDataType } from '../src/CoreDataLake'
import { IncomingHttpHeaders } from 'http'
import { testDocuments } from './testDocuments'

const thisFileDirectory = path.dirname(__filename)
const fileDBLocation = thisFileDirectory + "/filedb"


if (!fs.existsSync(fileDBLocation)) {
    fs.mkdirSync(fileDBLocation)
}

export const appFactory_build = (): ReturnType<typeof express> => {
    const app = express()
    app.use(express.static(thisFileDirectory + "/static"))
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(cors());

    app.get("/testBuildsOK", (_, res) => {
        res.sendStatus(200);
    })

    app.post('/save', (req, res) => {
        console.log("Saving")
        const docPath = getCleanFileName(req.query.f);
        if (!checkAuthPasses(docPath, req.headers)) {
            res.sendStatus(401);
        } else {
            innerSaveOrSync(docPath, req.body);
        }
        console.log("Saved")
    })


    app.post('/sync', (req, res) => {
        console.log("Syncing")
        const docPath = getCleanFileName(req.query.f);
        if (!checkAuthPasses(docPath, req.headers)) {
            res.sendStatus(401);
        } else {
            const resolved = innerSaveOrSync(docPath, req.body);
            res.send(resolved);
        }
        console.log("Synced");
    })

    const innerSaveOrSync = (docPath: string, incomingDoc: BaseStoreDataType): BaseStoreDataType => {
        const savedDoc = loadFromFile(docPath);

        const { resolved, incomingDiffs } = getDiffsAndResolvedItems(incomingDoc, savedDoc)
        if (Object.keys(incomingDiffs).length) {
            fs.appendFileSync(docPath, JSON.stringify(incomingDiffs) + "\n");
        } else {
            console.log("Nothing to save")
        }
        return resolved;
    }

    app.get("/load", (req, res) => {
        console.log("Loaded")
        const queryString = req.query.f;
        if (!queryString) throw Error("No query provided");
        if (typeof queryString != "string") throw Error("Invalid document name");
        if (queryString in testDocuments) {
            console.log("generating")
            res.json(testDocuments[queryString]());
        } else {
            const docPath = getCleanFileName(queryString);
            if (!checkAuthPasses(docPath, req.headers)) {
                res.sendStatus(401);
            } else {
                const savedDoc = loadFromFile(docPath);
                res.json(savedDoc)
            }
        }
    })

    return app;
}

const getCleanFileName = (queryString: Request['query'][string]): string => {
    const cleanDocName = String(queryString).replace(/\W/g, "_");
    const cleanFilePath = fileDBLocation + "/" + cleanDocName + ".json"
    return cleanFilePath;
}

const checkAuthPasses = (docPath: string, headers: IncomingHttpHeaders): boolean => {
    const passwordFile = docPath.replace(/.json$/, ".pass");
    let authPassed = false;
    if (fs.existsSync(passwordFile)) {
        const savedPassword = fs.readFileSync(passwordFile).toString();
        authPassed = (savedPassword == headers.password);
    } else if (headers.password) {
        fs.writeFileSync(passwordFile, headers.password.toString());
        authPassed = true;
    } else {
        authPassed = true;
    }
    return authPassed
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
    for (const key in savedDoc) {
        if (savedDoc[key] == null) {
            delete savedDoc[key];
        }
    }
    return savedDoc
}