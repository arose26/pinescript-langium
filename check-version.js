import fs from 'fs';
import { createPinescriptServices } from './out/language-server/pinescript-module.js';

// Create services
const services = createPinescriptServices({});

// Log the structure of the services object
console.log('Services structure:');
console.log(Object.keys(services));
if (services.Pinescript) {
    console.log('Pinescript services:');
    console.log(Object.keys(services.Pinescript));
    if (services.Pinescript.parser) {
        console.log('Parser services:');
        console.log(Object.keys(services.Pinescript.parser));
    }
}

// Read the test file
const content = fs.readFileSync('./examples/simple/version-annotation.pine', 'utf8');
console.log('\nFile content:');
console.log(content);
