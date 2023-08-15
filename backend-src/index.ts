import { appFactory_build } from "./app";
import { Config } from "./backend_config";

const port = Number(process.argv[2]) || 5174;
const config = new Config();
const app = appFactory_build(config);
app.listen(port, () => {
    console.log(`Workflowish backend listening on port ${port}`)
})