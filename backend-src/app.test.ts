import request from "supertest"
import { test } from "@jest/globals";
import { Config } from "./backend_config";
import { appFactory_build } from "./app";

// esbuild doesn't allow Jest to mock exported functions! use test documents instead

const config = new Config("config.sample.json");
test("The app works and doesn't have any missing import files.", async () => {
    const app = appFactory_build(config);
    await request(app)
        .get('/testBuildsOK')
        .expect(200)
})


test("The app reports the correct ping on loading a file", async () => {
    const app = appFactory_build(config);
    await request(app)
        .get('/ping?f=lastmodified100')
        .expect(400);
    await request(app)
        .get('/load?f=lastmodified100')
        .expect(200);
    await request(app)
        .get('/ping?f=lastmodified100')
        .expect(200)
        .expect("100");
})