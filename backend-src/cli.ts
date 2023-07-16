import { program } from "commander";
import { loadFromFile } from "./docFileOps";

const main = () => {
    program
        .command("get-latest")
        .argument("filename")
        .option("-d, --drop-deleted", "Drop deleted items")
        .action(getLatestVersionOfFile);

    program.parse();
}

const getLatestVersionOfFile = (filename: string) => {
    const snapshot = loadFromFile(filename);
    console.log(JSON.stringify(snapshot));
}

main()