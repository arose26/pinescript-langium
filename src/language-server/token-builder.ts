import { DefaultTokenBuilder } from 'langium';
import { IToken, TokenType, TokenVocabulary, Lexer } from 'chevrotain';
import { IndentationPreprocessor } from './indentation-preprocessor';

/**
 * Custom token builder for PineScript.
 *
 * This token builder integrates with the IndentationPreprocessor to handle
 * Python-style indentation in PineScript code. It inserts INDENT and DEDENT
 * tokens based on indentation changes.
 */
export class PinescriptTokenBuilder extends DefaultTokenBuilder {
    private indentationPreprocessor: IndentationPreprocessor;

    constructor() {
        super();
        this.indentationPreprocessor = new IndentationPreprocessor();
    }

    /**
     * Override the buildTokens method to set up the token types in the indentation preprocessor.
     */
    override buildTokens(grammar: any, options: any): TokenVocabulary {
        const tokens = super.buildTokens(grammar, options);

        // Create a map of token types by name for the preprocessor
        const tokenTypeMap: Record<string, TokenType> = {};

        // Convert tokens to a map
        if (Array.isArray(tokens)) {
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (token && token.name) {
                    tokenTypeMap[token.name] = token;
                }
            }
        } else {
            // It's a dictionary
            Object.keys(tokens).forEach(key => {
                const token = tokens[key];
                if (token && token.name) {
                    tokenTypeMap[token.name] = token;
                }
            });
        }

        // Set the token types in the preprocessor
        this.indentationPreprocessor.setTokenTypes(tokenTypeMap);

        return tokens;
    }

    /**
     * Custom tokenize method to preprocess the input text.
     * This doesn't override any method from DefaultTokenBuilder.
     */
    tokenize(text: string): IToken[] {
        // Set the token types in the indentation preprocessor
        this.indentationPreprocessor.setTokenTypes(this.tokenTypes);

        // Create a simple tokenizer that handles indentation
        const tokens: IToken[] = [];
        const lines = text.split(/\r?\n/);

        let offset = 0;
        let lineNumber = 1;
        let currentIndent = 0;
        let indentStack = [0];

        for (const line of lines) {
            // Skip empty lines
            if (line.trim() === '') {
                offset += line.length + 1; // +1 for the newline
                lineNumber++;
                continue;
            }

            // Check for indentation
            const indentMatch = line.match(/^(\s+)/);
            const indentLength = indentMatch ? indentMatch[1].length : 0;

            // Handle indentation changes
            if (indentLength > currentIndent) {
                // Indentation increased - add INDENT token
                const indentToken: IToken = {
                    tokenType: this.tokenTypes['INDENT'],
                    image: 'INDENT',
                    startOffset: offset,
                    endOffset: offset,
                    startLine: lineNumber,
                    endLine: lineNumber,
                    startColumn: 1,
                    endColumn: 1,
                    tokenTypeIdx: 0 // Required by Chevrotain
                };
                tokens.push(indentToken);
                indentStack.push(indentLength);
                currentIndent = indentLength;
            } else if (indentLength < currentIndent) {
                // Indentation decreased - add DEDENT tokens
                while (indentLength < currentIndent) {
                    const dedentToken: IToken = {
                        tokenType: this.tokenTypes['DEDENT'],
                        image: 'DEDENT',
                        startOffset: offset,
                        endOffset: offset,
                        startLine: lineNumber,
                        endLine: lineNumber,
                        startColumn: 1,
                        endColumn: 1,
                        tokenTypeIdx: 0 // Required by Chevrotain
                    };
                    tokens.push(dedentToken);
                    indentStack.pop();
                    currentIndent = indentStack[indentStack.length - 1];
                }
            }

            // Create a token for the rest of the line
            const lineContent = line.trim();
            if (lineContent.length > 0) {
                const lineToken: IToken = {
                    tokenType: this.tokenTypes['NAME'], // Just use NAME as a placeholder
                    image: lineContent,
                    startOffset: offset + indentLength,
                    endOffset: offset + line.length - 1,
                    startLine: lineNumber,
                    endLine: lineNumber,
                    startColumn: indentLength + 1,
                    endColumn: line.length,
                    tokenTypeIdx: 0 // Required by Chevrotain
                };
                tokens.push(lineToken);
            }

            // Create a token for the newline
            const newlineToken: IToken = {
                tokenType: this.tokenTypes['NEWLINE'],
                image: '\n',
                startOffset: offset + line.length,
                endOffset: offset + line.length,
                startLine: lineNumber,
                endLine: lineNumber,
                startColumn: line.length + 1,
                endColumn: line.length + 1,
                tokenTypeIdx: 0 // Required by Chevrotain
            };
            tokens.push(newlineToken);

            // Update offset and line number
            offset += line.length + 1; // +1 for the newline
            lineNumber++;
        }

        // Close all indentation levels at the end of the file
        while (currentIndent > 0) {
            const dedentToken: IToken = {
                tokenType: this.tokenTypes['DEDENT'],
                image: 'DEDENT',
                startOffset: offset,
                endOffset: offset,
                startLine: lineNumber,
                endLine: lineNumber,
                startColumn: 1,
                endColumn: 1,
                tokenTypeIdx: 0 // Required by Chevrotain
            };
            tokens.push(dedentToken);
            indentStack.pop();
            currentIndent = indentStack[indentStack.length - 1];
        }

        // Add an EOF token
        const eofToken: IToken = {
            tokenType: this.tokenTypes['EOF'],
            image: '',
            startOffset: offset,
            endOffset: offset,
            startLine: lineNumber,
            endLine: lineNumber,
            startColumn: 1,
            endColumn: 1,
            tokenTypeIdx: 0 // Required by Chevrotain
        };
        tokens.push(eofToken);

        return tokens;
    }

    /**
     * Get the token types from the token builder.
     * This is used by the tokenize method to create a Chevrotain lexer.
     */
    private get tokenTypes(): Record<string, TokenType> {
        // Get the token types from the grammar
        const tokenTypeMap: Record<string, TokenType> = {};

        // In a real implementation, we would get the token types from the grammar
        // For now, we'll create some basic token types for testing

        // Create token types for basic tokens
        const createTokenType = (name: string, pattern: RegExp | string): TokenType => {
            return {
                name,
                pattern,
                // Add other required properties
                GROUP: undefined,
                PUSH_MODE: undefined,
                POP_MODE: undefined,
                LONGER_ALT: undefined,
                LABEL: undefined,
                tokenTypeIdx: 0,
                categoryMatches: [],
                categoryMatchesMap: {},
                isParent: false
            } as TokenType;
        };

        // Add basic token types
        tokenTypeMap['WS'] = createTokenType('WS', /[ \t]+/);
        tokenTypeMap['NEWLINE'] = createTokenType('NEWLINE', /\r?\n/);
        tokenTypeMap['INDENT'] = createTokenType('INDENT', 'INDENT');
        tokenTypeMap['DEDENT'] = createTokenType('DEDENT', 'DEDENT');
        tokenTypeMap['NAME'] = createTokenType('NAME', /[a-zA-Z_][a-zA-Z_0-9]*/);
        tokenTypeMap['NUMBER'] = createTokenType('NUMBER', /[0-9]+(\.[0-9]*)?|0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+/);
        tokenTypeMap['STRING'] = createTokenType('STRING', /"[^"]*"|'[^']*'/);
        tokenTypeMap['LPAR'] = createTokenType('LPAR', '(');
        tokenTypeMap['RPAR'] = createTokenType('RPAR', ')');
        tokenTypeMap['LSQB'] = createTokenType('LSQB', '[');
        tokenTypeMap['RSQB'] = createTokenType('RSQB', ']');
        tokenTypeMap['COLON'] = createTokenType('COLON', ':');
        tokenTypeMap['COMMA'] = createTokenType('COMMA', ',');
        tokenTypeMap['EQUAL'] = createTokenType('EQUAL', '=');
        tokenTypeMap['PLUS'] = createTokenType('PLUS', '+');
        tokenTypeMap['MINUS'] = createTokenType('MINUS', '-');
        tokenTypeMap['STAR'] = createTokenType('STAR', '*');
        tokenTypeMap['SLASH'] = createTokenType('SLASH', '/');
        tokenTypeMap['PERCENT'] = createTokenType('PERCENT', '%');
        tokenTypeMap['EQEQUAL'] = createTokenType('EQEQUAL', '==');
        tokenTypeMap['NOTEQUAL'] = createTokenType('NOTEQUAL', '!=');
        tokenTypeMap['LESS'] = createTokenType('LESS', '<');
        tokenTypeMap['GREATER'] = createTokenType('GREATER', '>');
        tokenTypeMap['LESSEQUAL'] = createTokenType('LESSEQUAL', '<=');
        tokenTypeMap['GREATEREQUAL'] = createTokenType('GREATEREQUAL', '>=');
        tokenTypeMap['COLONEQUAL'] = createTokenType('COLONEQUAL', ':=');
        tokenTypeMap['EOF'] = createTokenType('EOF', /$/);

        return tokenTypeMap;
    }
}
