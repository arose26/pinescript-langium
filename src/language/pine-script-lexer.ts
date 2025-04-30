import { createToken } from 'chevrotain';
import { DefaultLexer, type LangiumCoreServices } from 'langium';

/**
 * Custom lexer for PineScript that handles the less than operator correctly.
 */
export class PineScriptLexer extends DefaultLexer {
    constructor(services: LangiumCoreServices) {
        super(services);

        // Define arrow token first to give it higher priority
        const arrow = createToken({
            name: 'ARROW',
            pattern: /=>/,
            categories: [{ name: 'operator' }],
            line_breaks: false,
            start_chars_hint: ['='],
            group: 'operator'
        });

        // Define custom tokens for comparison operators
        const lessThan = createToken({
            name: 'LessThan',
            pattern: /</,
            categories: [{ name: 'comparison' }],
            line_breaks: false,
            start_chars_hint: ['<'],
            group: 'comparison'
        });

        const lessThanEqual = createToken({
            name: 'LessThanEqual',
            pattern: /<=/,
            categories: [{ name: 'comparison' }],
            line_breaks: false,
            start_chars_hint: ['<'],
            group: 'comparison'
        });

        const greaterThan = createToken({
            name: 'GreaterThan',
            pattern: />/,
            categories: [{ name: 'comparison' }],
            line_breaks: false,
            start_chars_hint: ['>'],
            group: 'comparison'
        });

        const greaterThanEqual = createToken({
            name: 'GreaterThanEqual',
            pattern: />=/,
            categories: [{ name: 'comparison' }],
            line_breaks: false,
            start_chars_hint: ['>'],
            group: 'comparison'
        });

        // Add custom tokens to the lexer in order of priority
        this.tokenTypes['=>'] = arrow;
        this.tokenTypes['<='] = lessThanEqual;
        this.tokenTypes['>='] = greaterThanEqual;
        this.tokenTypes['<'] = lessThan;
        this.tokenTypes['>'] = greaterThan;
    }
}
