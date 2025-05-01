import { IndentationAwareTokenBuilder } from 'langium';
import { createToken } from 'chevrotain';

/**
 * Custom token builder for PineScript that handles the less than operator correctly
 * and supports mixed indentation (spaces and tabs).
 */
export class PineScriptTokenBuilder extends IndentationAwareTokenBuilder {
    constructor() {
        super({
            // Configure the indentation-aware token builder
            indentTokenName: 'INDENT',
            dedentTokenName: 'DEDENT',
            whitespaceTokenName: 'WS',
            // Ignore indentation inside parentheses and brackets
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

        // Define custom tokens for comparison operators and arrow
        // Order matters! Define longer patterns first to avoid conflicts
        // Define arrow token first to give it higher priority
        const arrow = createToken({
            name: 'ARROW',
            pattern: /=>/,
            line_breaks: false,
            start_chars_hint: ['='],
            group: 'operator',
            categories: [{ name: 'operator' }],
            // Set a higher priority for the arrow token
        });

        const lessThanEqual = createToken({
            name: 'LessThanEqual',
            pattern: /<=/,
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

        const lessThan = createToken({
            name: 'LessThan',
            pattern: /</,
            line_breaks: false,
            start_chars_hint: ['<'],
            group: 'comparison',
            // Add longer_alt to ensure it's matched correctly
            longer_alt: lessThanEqual
        });

        const greaterThan = createToken({
            name: 'GreaterThan',
            pattern: />/,
            line_breaks: false,
            start_chars_hint: ['>'],
            group: 'comparison',
            // Add longer_alt to ensure it's matched correctly
            longer_alt: greaterThanEqual
        });

        // Add custom tokens to the token dictionary
        if (Array.isArray(tokens)) {
            // Order matters! Add longer patterns first
            return [...tokens, arrow, lessThanEqual, greaterThanEqual, lessThan, greaterThan];
        } else if (tokens && typeof tokens === 'object') {
            const tokenDict = tokens as Record<string, any>;
            // Order matters! Add longer patterns first
            tokenDict['=>'] = arrow;
            tokenDict['<='] = lessThanEqual;
            tokenDict['>='] = greaterThanEqual;
            tokenDict['<'] = lessThan;
            tokenDict['>'] = greaterThan;

            // Make sure the tokens are properly configured
            tokenDict['<'].PATTERN = /</;
            tokenDict['>'].PATTERN = />/;
            tokenDict['<='].PATTERN = /<=/;
            tokenDict['>='].PATTERN = />=/;
            tokenDict['=>'].PATTERN = /=>/;

            // Ensure the arrow token has higher priority
            if (tokenDict['=>']) {
                tokenDict['=>'].CATEGORIES = ['operator'];
                tokenDict['=>'].categoryMatches = ['operator'];
                tokenDict['=>'].categoryMatchesMap = { operator: true };
                // Set a much higher priority for the arrow token
                tokenDict['=>'].PRIORITY = 10;
            }

            // Prioritize comparison operators over template specifications
            // This is crucial for resolving conflicts between comparison operators and template specifications
            if (tokenDict['<']) {
                tokenDict['<'].CATEGORIES = ['comparison'];
                tokenDict['<'].categoryMatches = ['comparison'];
                tokenDict['<'].categoryMatchesMap = { comparison: true };
            }
            if (tokenDict['>']) {
                tokenDict['>'].CATEGORIES = ['comparison'];
                tokenDict['>'].categoryMatches = ['comparison'];
                tokenDict['>'].categoryMatchesMap = { comparison: true };
            }

            // Debug the token dictionary
            console.log('Token dictionary keys:', Object.keys(tokenDict));
            console.log('LessThan token:', tokenDict['<']);
        }

        return tokens;
    }

    /**
     * Override the calculateIndentationLevel method to handle mixed indentation (spaces and tabs).
     */
    protected calculateIndentationLevel(text: string): number {
        // Count spaces and tabs, where a tab is equivalent to 4 spaces
        let indentLevel = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                indentLevel += 1;
            } else if (text[i] === '\t') {
                // A tab is equivalent to 4 spaces
                indentLevel += 4;
            } else {
                break;
            }
        }
        return indentLevel;
    }
}
