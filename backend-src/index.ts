import { appFactory_build } from "./app";

const port = Number(process.argv[2]) || 5174;

const app = appFactory_build();
app.listen(port, () => {
    console.log(`Workflowish backend listening on port ${port}`)
})