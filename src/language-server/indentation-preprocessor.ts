import { IToken, TokenType } from 'chevrotain';

/**
 * PineScript indentation preprocessor.
 *
 * This class is responsible for preprocessing PineScript code to handle indentation.
 * It inserts INDENT and DEDENT tokens based on indentation changes, similar to
 * how the PinescriptLexerBase.py class works in the original implementation.
 *
 * Key features:
 * - Ignore possible leading newlines
 * - Ignore excessive trailing newlines except a single newline
 * - Ensure that script ends with a newline if none
 * - Ignore consecutive newlines except the last one
 * - Ignore newlines inside open parentheses, brackets
 * - Ignore newlines after operators
 * - Ignore newlines for line wrapping (lines whose indentation width is not a multiple of four)
 * - Track indentation level, push INDENT or DEDENT token respectfully
 * - Handle multiline string literal correctly (ignore <newline + indentation for line wrapping>)
 */
export class IndentationPreprocessor {
    // Configuration
    private tabLength: number = 4;
    private indentLength: number = 4;

    // Operators that are followed by terms
    private operators: Set<string> = new Set([
        'and', 'or', 'not',
        ':', ':=', ',', '==', '=', '>', '>=', '<', '<=', '-=', '-',
        '!=', '%', '%=', '+', '+=', '?', '/', '/=', '*', '*='
    ]);

    // State tracking
    private numOpens: number = 0;
    private indentLengthStack: number[] = [0];

    // Token types (will be set from the lexer)
    private tokenTypes: Record<string, TokenType> = {};

    constructor() {
        // Initialize with empty indent stack
        this.reset();
    }

    /**
     * Reset the preprocessor state.
     */
    public reset(): void {
        this.numOpens = 0;
        this.indentLengthStack = [0];
    }

    /**
     * Set the token types from the lexer.
     */
    public setTokenTypes(tokenTypes: Record<string, TokenType>): void {
        this.tokenTypes = tokenTypes;
    }

    /**
     * Preprocess the input text and return a list of tokens.
     *
     * @param text The input text to preprocess
     * @param lexFn A function that lexes the input text and returns tokens
     * @returns A list of tokens with INDENT and DEDENT tokens inserted
     */
    public preprocess(text: string, lexFn: (text: string) => IToken[]): IToken[] {
        // Reset state
        this.reset();

        // Lex the input text
        const rawTokens = lexFn(text);

        // Process tokens and insert INDENT/DEDENT tokens
        const processedTokens: IToken[] = [];

        // Keep track of the last token type
        let lastTokenType: string | null = null;
        let lastTokenFromDefaultChannel: string | null = null;

        // Track current indentation level
        let currentIndent = 0;

        // Process each token
        let i = 0;
        while (i < rawTokens.length) {
            const token = rawTokens[i];
            const tokenType = token.tokenType?.name || '';

            // Handle start of input - skip leading newlines
            if (this.indentLengthStack.length === 1 && this.indentLengthStack[0] === 0) {
                // Skip leading newlines and comments
                if (tokenType === 'NEWLINE' || tokenType === 'NL' || tokenType === 'COMMENT') {
                    i++;
                    continue;
                }

                // Check for leading indentation (which is an error)
                if (tokenType === 'WS' && i + 1 < rawTokens.length) {
                    const nextToken = rawTokens[i + 1];
                    const nextTokenType = nextToken.tokenType?.name || '';

                    if (nextTokenType !== 'NEWLINE' && nextTokenType !== 'NL' && nextTokenType !== 'COMMENT') {
                        const indentLength = this.getIndentationLength(token.image);
                        if (indentLength > 0) {
                            console.error('First statement indented');
                        }
                    }
                }
            }

            // Handle different token types
            switch (tokenType) {
                case 'LPAR':
                case 'LSQB':
                    // Increase the number of open parentheses/brackets
                    this.numOpens++;
                    processedTokens.push(token);
                    break;

                case 'RPAR':
                case 'RSQB':
                    // Decrease the number of open parentheses/brackets
                    this.numOpens--;
                    processedTokens.push(token);
                    break;

                case 'NEWLINE':
                case 'NL':
                    // Handle newlines
                    if (this.numOpens > 0 || (lastTokenType && this.operators.has(lastTokenType))) {
                        // Ignore newlines inside parentheses/brackets or after operators
                        i++;
                        continue;
                    }

                    // Add the newline token
                    processedTokens.push(token);

                    // Check the next token for indentation
                    if (i + 1 < rawTokens.length) {
                        const nextToken = rawTokens[i + 1];
                        const nextTokenType = nextToken.tokenType?.name || '';

                        if (nextTokenType === 'NEWLINE' || nextTokenType === 'NL' || nextTokenType === 'COMMENT') {
                            // Ignore consecutive newlines or comments after newlines
                            i++;
                            continue;
                        }

                        // Check indentation of the next line
                        if (nextTokenType === 'WS') {
                            // Get indentation length
                            const indentText = nextToken.image;
                            const indentLength = this.getIndentationLength(indentText);

                            // Skip the whitespace token
                            i++;

                            // Only handle indentation if it's a multiple of indentLength
                            if (indentLength % this.indentLength === 0) {
                                // Handle indentation change
                                if (indentLength > currentIndent) {
                                    // Indentation increased - add INDENT token
                                    const indentToken = this.createToken('INDENT', 'INDENT', token);
                                    processedTokens.push(indentToken);
                                    this.indentLengthStack.push(indentLength);
                                    currentIndent = indentLength;
                                } else if (indentLength < currentIndent) {
                                    // Indentation decreased - add DEDENT tokens
                                    while (indentLength < currentIndent) {
                                        const dedentToken = this.createToken('DEDENT', 'DEDENT', token);
                                        processedTokens.push(dedentToken);
                                        this.indentLengthStack.pop();
                                        currentIndent = this.indentLengthStack[this.indentLengthStack.length - 1];
                                    }
                                }
                            }
                        } else if (nextTokenType !== 'EOF') {
                            // No whitespace, so indentation is 0
                            if (currentIndent > 0) {
                                // Add DEDENT tokens to close all open indentation levels
                                while (currentIndent > 0) {
                                    const dedentToken = this.createToken('DEDENT', 'DEDENT', token);
                                    processedTokens.push(dedentToken);
                                    this.indentLengthStack.pop();
                                    currentIndent = this.indentLengthStack[this.indentLengthStack.length - 1];
                                }
                            }
                        }
                    }
                    break;

                case 'STRING':
                    // Handle string literals
                    this.handleStringToken(token, processedTokens);
                    break;

                case 'WS':
                    // Skip whitespace tokens between other tokens
                    // We only care about whitespace at the beginning of a line
                    // which is handled in the NEWLINE case
                    break;

                case 'EOF':
                    // Handle end of file
                    if (lastTokenType !== 'NEWLINE' && lastTokenType !== 'NL') {
                        // Add a final newline if there isn't one
                        const newlineToken = this.createToken('NEWLINE', '\n', token);
                        processedTokens.push(newlineToken);
                    }

                    // Close all indentation levels
                    while (currentIndent > 0) {
                        const dedentToken = this.createToken('DEDENT', 'DEDENT', token);
                        processedTokens.push(dedentToken);
                        this.indentLengthStack.pop();
                        currentIndent = this.indentLengthStack[this.indentLengthStack.length - 1];
                    }

                    // Add the EOF token
                    processedTokens.push(token);
                    break;

                default:
                    // Add all other tokens
                    processedTokens.push(token);

                    // Update the last token type from default channel
                    // In a real implementation, we would check the channel
                    // For now, we'll assume all tokens are from the default channel
                    lastTokenFromDefaultChannel = tokenType;
                    break;
            }

            // Update the last token type
            lastTokenType = tokenType;

            // Move to the next token
            i++;
        }

        return processedTokens;
    }

    /**
     * Handle a newline token.
     */
    private handleNewlineToken(token: IToken, rawTokens: IToken[], currentIndex: number, processedTokens: IToken[]): void {
        // Ignore newlines inside open parentheses/brackets
        if (this.numOpens > 0) {
            return;
        }

        // Ignore newlines after operators
        const lastToken = processedTokens.length > 0 ? processedTokens[processedTokens.length - 1] : null;
        if (lastToken && lastToken.tokenType && this.operators.has(lastToken.tokenType.name)) {
            return;
        }

        // Check the next token
        const nextIndex = currentIndex + 1;
        if (nextIndex >= rawTokens.length) {
            // Last token is a newline - add it and close all indentation levels
            processedTokens.push(token);
            this.handleIndentationChange(0, processedTokens, token);
            return;
        }

        const nextToken = rawTokens[nextIndex];
        const nextTokenType = nextToken.tokenType?.name || '';

        // Ignore consecutive newlines or comments after newlines
        if (nextTokenType === 'NEWLINE' || nextTokenType === 'NL' || nextTokenType === 'COMMENT') {
            return;
        }

        // Add the newline token
        processedTokens.push(token);

        // Check indentation of the next line
        let indentLength = 0;

        if (nextTokenType === 'WS') {
            // Get indentation length
            indentLength = this.getIndentationLength(nextToken.image);

            // Skip the whitespace token in further processing
            // We'll handle it here
        }

        // Only handle indentation if it's a multiple of indentLength
        if (indentLength % this.indentLength === 0) {
            // Handle indentation change
            this.handleIndentationChange(indentLength, processedTokens, nextToken);
        }
    }

    /**
     * Handle a string token.
     */
    private handleStringToken(token: IToken, processedTokens: IToken[]): void {
        // Process multiline strings
        const text = token.image;
        const processedText = this.processStringLiteral(text);

        if (text === processedText) {
            // No changes needed
            processedTokens.push(token);
        } else {
            // Create a new token with the processed text
            const newToken = { ...token, image: processedText };
            processedTokens.push(newToken);
        }
    }

    /**
     * Handle an EOF token.
     */
    private handleEofToken(token: IToken, lastTokenType: string | null, processedTokens: IToken[]): void {
        // Ensure the script ends with a newline if none
        if (lastTokenType !== 'NEWLINE' && lastTokenType !== 'NL') {
            const newlineToken = this.createToken('NEWLINE', '\n', token);
            processedTokens.push(newlineToken);
        }

        // Close all indentation levels
        this.handleIndentationChange(0, processedTokens, token);

        // Add the EOF token
        processedTokens.push(token);
    }

    /**
     * Calculate the indentation length of a string.
     */
    private getIndentationLength(text: string): number {
        let length = 0;
        for (const char of text) {
            if (char === ' ') {
                length += 1;
            } else if (char === '\t') {
                length += this.tabLength;
            } else if (char === '\f') {
                length = 0;
            }
        }
        return length;
    }

    /**
     * Handle indentation changes and insert INDENT/DEDENT tokens.
     */
    private handleIndentationChange(indentLength: number, tokens: IToken[], baseToken: IToken): void {
        const prevIndentLength = this.indentLengthStack[this.indentLengthStack.length - 1];

        if (indentLength > prevIndentLength) {
            // Indentation increased - add INDENT token
            const indentToken = this.createToken('INDENT', 'INDENT', baseToken);
            tokens.push(indentToken);
            this.indentLengthStack.push(indentLength);
        } else if (indentLength < prevIndentLength) {
            // Indentation decreased - add DEDENT tokens
            while (indentLength < this.indentLengthStack[this.indentLengthStack.length - 1]) {
                this.indentLengthStack.pop();
                const dedentToken = this.createToken('DEDENT', 'DEDENT', baseToken);
                tokens.push(dedentToken);

                // Check for inconsistent dedent
                if (indentLength > this.indentLengthStack[this.indentLengthStack.length - 1]) {
                    // In a real implementation, we would report an error here
                    console.error('Inconsistent dedent');
                    break;
                }
            }
        }
    }

    /**
     * Process a string literal to handle multiline strings.
     */
    private processStringLiteral(text: string): string {
        // Replace consecutive newlines with a single newline
        let processed = text.replace(/(\r?\n)+/g, '$1');

        // Remove indentation after newlines
        processed = processed.replace(/(\r?\n)(\s)+/g, '');

        return processed;
    }

    /**
     * Create a new token.
     */
    private createToken(type: string, text: string, baseToken: IToken): IToken {
        return {
            tokenType: this.tokenTypes[type],
            image: text,
            startOffset: baseToken.startOffset,
            endOffset: baseToken.endOffset,
            startLine: baseToken.startLine,
            endLine: baseToken.endLine,
            startColumn: baseToken.startColumn,
            endColumn: baseToken.endColumn,
            tokenTypeIdx: 0 // Required by Chevrotain
        } as IToken;
    }
}
