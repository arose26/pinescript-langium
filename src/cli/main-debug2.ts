import chalk from 'chalk';
import { Command } from 'commander';
import { PineScriptLanguageMetaData } from '../language/generated/module.js';
import { createPineScriptServices } from '../language/pine-script-module.js';
import { extractAstNode } from './cli-util.js';
import { generateJavaScript } from './generator-debug2.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { StartScript } from '../language/generated/ast.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (fileName: string, opts: { destination?: string }) => {
    const services = createPineScriptServices(NodeFileSystem).PineScript;
    const model = await extractAstNode(fileName, services) as StartScript;
    const generatedFilePath = generateJavaScript(model, fileName, opts.destination);
    console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
};

export default function () {
    const program = new Command();
    program.version(JSON.parse(packageContent).version);

    const fileExtensions = PineScriptLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code from PineScript source file')
        .action(generateAction);

    program.parse(process.argv);
}
