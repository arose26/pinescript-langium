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
                ['LSQB', 'RSQB'],
                ['LBRACE', 'RBRACE']
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

        // Define function arrow token with highest priority for function declarations
        const funcArrow = createToken({
            name: 'FUNC_ARROW',
            pattern: /=>/,
            line_breaks: false,
            start_chars_hint: ['='],
            group: 'function_operator',
            categories: [{ name: 'operator' }]
            // Priority is set later in the token dictionary
        });

        // Define regular arrow token for other uses
        const arrow = createToken({
            name: 'ARROW',
            pattern: /=>/,
            line_breaks: false,
            start_chars_hint: ['='],
            group: 'operator',
            categories: [{ name: 'operator' }]
            // Priority is set later in the token dictionary
        });

        // Define right arrow token for switch cases
        const rarrow = createToken({
            name: 'RARROW',
            pattern: /->/,
            line_breaks: false,
            start_chars_hint: ['-'],
            group: 'operator',
            categories: [{ name: 'operator' }]
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
            return [...tokens, funcArrow, arrow, rarrow, lessThanEqual, greaterThanEqual, lessThan, greaterThan];
        } else if (tokens && typeof tokens === 'object') {
            const tokenDict = tokens as Record<string, any>;
            // Order matters! Add longer patterns first

            // Add both arrow tokens with the same pattern but different names
            // The function arrow has higher priority
            tokenDict['=>'] = funcArrow;
            tokenDict['->'] = rarrow;
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
            tokenDict['->'].PATTERN = /->/;

            // Ensure the function arrow token has the highest priority
            if (tokenDict['=>']) {
                // Set the highest possible priority for the function arrow token
                tokenDict['=>'].PRIORITY = 10;
                // Make sure the function arrow token is matched correctly
                tokenDict['=>'].START_CHARS_HINT = ['='];
                tokenDict['=>'].GROUP = 'function_operator';
                // Override the token type
                tokenDict['FUNC_ARROW'] = tokenDict['=>'];

                // Create a separate ARROW token with lower priority
                tokenDict['ARROW'] = arrow;
                tokenDict['ARROW'].PRIORITY = 2;
                tokenDict['ARROW'].START_CHARS_HINT = ['='];
                tokenDict['ARROW'].GROUP = 'operator';

                // Add debug output
                console.log('Token dictionary keys:', Object.keys(tokenDict));
                console.log('Function Arrow token:', tokenDict['FUNC_ARROW']);
                console.log('Arrow token:', tokenDict['ARROW']);
            }

            // Ensure the right arrow token has high priority
            if (tokenDict['->']) {
                // Set high priority for the right arrow token
                tokenDict['->'].PRIORITY = 2;
                // Make sure the right arrow token is matched correctly
                tokenDict['->'].START_CHARS_HINT = ['-'];
                tokenDict['->'].GROUP = 'operator';
                // Override the token type
                tokenDict['RARROW'] = tokenDict['->'];

                // Add debug output
                console.log('RARROW token:', tokenDict['RARROW']);
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
