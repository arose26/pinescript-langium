import { IndentationAwareTokenBuilder } from 'langium';
import { createToken } from 'chevrotain';

/**
 * Custom token builder for PineScript that handles the less than operator correctly.
 */
export class PineScriptTokenBuilder extends IndentationAwareTokenBuilder {
    constructor() {
        super({
            ignoreIndentationDelimiters: [
                ['LPAR', 'RPAR'],
                ['LSQB', 'RSQB']
            ]
        });
    }

    /**
     * Override the buildTokens method to handle the less than operator correctly.
     */
    override buildTokens(grammar: any, options: any) {
        const tokens = super.buildTokens(grammar, options);
        
        // Define custom tokens for comparison operators
        const lessThanEqual = createToken({
            name: 'LessThanEqual',
            pattern: /<=/, 
            line_breaks: false,
            start_chars_hint: ['<'],
            group: 'comparison'
        });
        
        const lessThan = createToken({
            name: 'LessThan',
            pattern: /</, 
            line_breaks: false,
            start_chars_hint: ['<'],
            group: 'comparison'
        });
        
        const greaterThanEqual = createToken({
            name: 'GreaterThanEqual',
            pattern: />=/, 
            line_breaks: false,
            start_chars_hint: ['>'],
            group: 'comparison'
        });
        
        const greaterThan = createToken({
            name: 'GreaterThan',
            pattern: />/, 
            line_breaks: false,
            start_chars_hint: ['>'],
            group: 'comparison'
        });
        
        // Add custom tokens to the token dictionary
        if (Array.isArray(tokens)) {
            return [...tokens, lessThanEqual, lessThan, greaterThanEqual, greaterThan];
        } else if (tokens && typeof tokens === 'object') {
            const tokenDict = tokens as Record<string, any>;
            tokenDict['<='] = lessThanEqual;
            tokenDict['<'] = lessThan;
            tokenDict['>='] = greaterThanEqual;
            tokenDict['>'] = greaterThan;
        }
        
        return tokens;
    }
}
