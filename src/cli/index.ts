import generateAction from './main.js';
import parseAction from './parse.js';
import { Command } from 'commander';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

const program = new Command();
program.version(JSON.parse(packageContent).version);

// Add the generate command
generateAction();

// Add the parse command
parseAction();

export default program;
