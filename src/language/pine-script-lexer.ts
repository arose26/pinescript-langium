import { createToken } from 'chevrotain';
import { DefaultLexer, type LangiumCoreServices } from 'langium';

/**
 * Custom lexer for PineScript that handles the less than operator correctly.
 */
export class PineScriptLexer extends DefaultLexer {
    constructor(services: LangiumCoreServices) {
        super(services);
        
        // Define custom tokens for comparison operators
        const lessThan = createToken({
            name: 'LessThan',
            pattern: /</,
            categories: [],
            line_breaks: false,
            start_chars_hint: ['<'],
            group: 'comparison'
        });
        
        const lessThanEqual = createToken({
            name: 'LessThanEqual',
            pattern: /<=/,
            categories: [],
            line_breaks: false,
            start_chars_hint: ['<'],
            group: 'comparison'
        });
        
        const greaterThan = createToken({
            name: 'GreaterThan',
            pattern: />/,
            categories: [],
            line_breaks: false,
            start_chars_hint: ['>'],
            group: 'comparison'
        });
        
        const greaterThanEqual = createToken({
            name: 'GreaterThanEqual',
            pattern: />=/,
            categories: [],
            line_breaks: false,
            start_chars_hint: ['>'],
            group: 'comparison'
        });
        
        // Add custom tokens to the lexer
        this.tokenTypes['<'] = lessThan;
        this.tokenTypes['<='] = lessThanEqual;
        this.tokenTypes['>'] = greaterThan;
        this.tokenTypes['>='] = greaterThanEqual;
    }
}
