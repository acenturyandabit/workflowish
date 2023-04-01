import { appFactory_build } from "./app";
import request from "supertest"
import { test } from "@jest/globals";

const app = appFactory_build();
test("Test the app works and doesn't have any missing import files.", () =>
    request(app)
        .get('/testBuildsOK')
        .expect(200)
)