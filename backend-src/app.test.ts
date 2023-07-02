import { appFactory_build } from "./app";
import request from "supertest"
import { test } from "@jest/globals";
import { Config } from "./backend_config";

const config = new Config("config.sample.json");
const app = appFactory_build(config);
test("Test the app works and doesn't have any missing import files.", () =>
    request(app)
        .get('/testBuildsOK')
        .expect(200)
)