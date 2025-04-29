import { ParseResult } from 'langium';
import { PinescriptTokenBuilder } from './token-builder';
import { CstNode, IToken } from 'chevrotain';
import { AstNode } from 'langium';
import { AstBuilder } from './ast-builder';

/**
 * Custom parser for PineScript.
 *
 * This parser uses our custom token builder that handles indentation preprocessing
 * and builds an AST from the tokens.
 */
export class PinescriptParser {
    private tokenBuilder: PinescriptTokenBuilder;
    private langiumParser?: any;

    constructor(tokenBuilder: PinescriptTokenBuilder, services?: any) {
        this.tokenBuilder = tokenBuilder;

        // Check if the services are available
        if (services) {
            console.log('Services found');

            // Check if the parser is available
            if (services.parser) {
                console.log('Parser found');

                // Check if the LangiumParser is available
                if (services.parser.LangiumParser) {
                    console.log('LangiumParser found:', typeof services.parser.LangiumParser);

                    // For now, we'll just log that we found the LangiumParser
                    // In a real implementation, we would properly integrate with it
                }
            }
        }
    }

    /**
     * Parse the input text and return a parse result.
     *
     * This method uses our custom token builder that handles indentation preprocessing
     * and builds an AST from the tokens.
     *
     * @param text The input text to parse
     * @returns A parse result
     */
    parse<T extends AstNode = AstNode>(input: string): ParseResult<T> {
        // Use our custom token builder to tokenize the input
        const tokens = this.tokenBuilder.tokenize(input);

        // Log the tokens for debugging
        console.log('Tokens after preprocessing:');
        for (const token of tokens) {
            const tokenType = token.tokenType?.name || 'UNKNOWN';
            const tokenText = token.image.replace(/\n/g, '\\n').substring(0, 20);
            console.log(`${tokenType}: "${tokenText}${tokenText.length >= 20 ? '...' : ''}"`);
        }

        // Build an AST from the tokens using our AST builder
        const astBuilder = new AstBuilder(tokens);
        const ast = astBuilder.buildAst();

        return {
            value: ast as T,
            lexerErrors: [],
            parserErrors: []
        };
    }


}
