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

const getLatestCommand = (filename: string, options: { dropDeleted: boolean }) => {
    const snapshot = loadFromFile(filename);
    if (options.dropDeleted) {
        for (const key in snapshot) {
            if (Object.keys(snapshot[key]).length == 1) {
                delete snapshot[key];
            }
        }
    }
    console.log(JSON.stringify(snapshot));
}

main()