import * as fs from 'fs'
import * as path from 'path'
import express, { Request } from 'express'
import cors from 'cors'
import bodyParser from "body-parser"
import getDiffsAndResolvedItems from '../src/CoreDataLake/getResolvedItems'
import { BaseStoreDataType } from '../src/CoreDataLake'
import { IncomingHttpHeaders } from 'http'
import { testDocuments } from './testDocuments'
import { docFileOps } from './docFileOps'
import { Config } from './backend_config'

const thisFileDirectory = path.dirname(__filename)
const fileDBLocation = thisFileDirectory + "/filedb"


if (!fs.existsSync(fileDBLocation)) {
    fs.mkdirSync(fileDBLocation)
}

export const appFactory_build = (config: Config): ReturnType<typeof express> => {
    const app = express()
    app.use(express.static(thisFileDirectory + "/static"))
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(cors());

    app.get("/testBuildsOK", (_, res) => {
        res.sendStatus(200);
    })

    app.post('/save', (req, res) => {
        console.log(`Saving file ${req.query.f}`)
        const docPath = getCleanFileName(req.query.f);
        if (config.canCreateDocuments || fs.existsSync(docPath)) {
            if (!checkAuthPasses(docPath, req.headers)) {
                console.log("Authentication failed");
                res.sendStatus(401);
            } else {
                innerSaveOrSync(docPath, req.body);
                console.log(`Saved ${req.query.f} as ${docPath}`);
            }
        } else {
            console.log("Cannot create documents via HTTP in this server.");
            res.sendStatus(400);
        }
    })

    const latestUpdateByFile: Record<string, number> = {};

    app.get('/ping', (req, res) => {
        const docPath = getCleanFileName(req.query.f);
        if (!(docPath in latestUpdateByFile)) {
            res.sendStatus(400);
        } else {
            res.send(`${latestUpdateByFile[docPath]}`);
        }
    })

    app.post('/sync', (req, res) => {
        const docPath = getCleanFileName(req.query.f);
        if (!checkAuthPasses(docPath, req.headers)) {
            res.sendStatus(401);
        } else {
            const { resolved } = innerSaveOrSync(docPath, req.body);
            res.send(resolved);
        }
    })

    const innerSaveOrSync = (docPath: string, incomingDoc: BaseStoreDataType): { resolved: BaseStoreDataType, incomingDiffs: BaseStoreDataType } => {
        const savedDoc = new docFileOps().loadFromFile(docPath);

        const { resolved, incomingDiffs } = getDiffsAndResolvedItems(incomingDoc, savedDoc)
        if (Object.keys(incomingDiffs).length) {
            fs.appendFileSync(docPath, JSON.stringify(incomingDiffs) + "\n");
        } else {
            console.log("Nothing to save")
        }
        latestUpdateByFile[docPath] = 0;
        for (const key in resolved) {
            if (resolved[key]._lm > latestUpdateByFile[docPath]) {
                latestUpdateByFile[docPath] = resolved[key]._lm;
            }
        }
        return { resolved, incomingDiffs };
    }

    app.get("/load", (req, res) => {
        const queryString = req.query.f;
        if (!queryString) throw Error("No query provided");
        if (typeof queryString != "string") throw Error("Invalid document name");
        let errorStatus: number | undefined;
        let docToSend: BaseStoreDataType | undefined;
        const docPath = getCleanFileName(queryString);
        if (queryString in testDocuments) {
            docToSend = testDocuments[queryString]();
        } else {
            if (!checkAuthPasses(docPath, req.headers)) {
                errorStatus = 401;
            } else {
                docToSend = new docFileOps().loadFromFile(docPath);
            }
        }
        latestUpdateByFile[docPath] = 0;
        for (const key in docToSend) {
            if (docToSend[key]._lm > latestUpdateByFile[docPath]) {
                latestUpdateByFile[docPath] = docToSend[key]._lm;
            }
        }
        if (errorStatus == undefined) {
            res.json(docToSend)
        } else {
            res.sendStatus(errorStatus);
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
