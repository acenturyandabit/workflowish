import { program } from "commander";
import { loadFromFile } from "./docFileOps";

const main = () => {
    program
        .command("get-latest")
        .argument("filename")
        .option("-d, --drop-deleted", "Drop deleted items")
        .action(getLatestCommand);

    program.parse();
}

const getLatestCommand = (filename: string) => {
    const snapshot = loadFromFile(filename);
    console.log(JSON.stringify(snapshot));
}

main()