import * as child_process from "child_process"
import * as fs from "fs"

if (fs.existsSync(".githooks/deployment")) {
    fs.rmSync(".githooks/deployment", { recursive: true, force: true })
}
const versions = child_process.execSync('git tag --sort=-creatordate').toString()
const latestVersion = versions.split("\n")[0].slice(1);
process.chdir(".githooks")
child_process.execSync('git clone --branch gh-pages --no-checkout .. deployment', { stdio: 'inherit' })
process.chdir("..")
child_process.execSync('vite build --outDir .githooks/deployment --base=/workflowish/', { stdio: 'inherit' })
process.chdir(".githooks/deployment")
child_process.execSync('git reset gh-pages')
child_process.execSync('git add .')
try {
    child_process.execSync(`git commit -m "Github pages build for Version ${latestVersion}"`)
} catch (e) {
    // Git commit will fail with warning on windows
}
child_process.execSync('git push')
process.chdir("..")
fs.rmSync("deployment", { recursive: true, force: true });
process.chdir("..")
console.log("All done! You may push the gh-pages branch now.")
