# PineScript Indentation Preprocessing

This directory contains the implementation of the PineScript indentation preprocessing for the Langium grammar.

## Overview

PineScript uses Python-style indentation to define code blocks. In the original ANTLR4 implementation, this is handled by a custom lexer base class (`PinescriptLexerBase.py`) that inserts INDENT and DEDENT tokens based on indentation changes.

In our Langium implementation, we've created a similar mechanism:

1. `indentation-preprocessor.ts` - A TypeScript implementation of the PinescriptLexerBase.py class
2. `token-builder.ts` - A custom token builder that integrates with the indentation preprocessor
3. `pinescript-module.ts` - Configuration for the Langium module to use our custom token builder

## How It Works

The indentation preprocessing works as follows:

1. The input text is tokenized using a custom tokenizer
2. During tokenization, the indentation levels are tracked and INDENT/DEDENT tokens are inserted:
   - When indentation increases, an INDENT token is inserted
   - When indentation decreases, one or more DEDENT tokens are inserted
   - Special cases like newlines in parentheses, after operators, etc. are handled
3. The processed tokens are then passed to the Langium parser

## Implementation Details

### IndentationPreprocessor

The `IndentationPreprocessor` class is responsible for:

- Tracking indentation levels using a stack
- Inserting INDENT and DEDENT tokens
- Handling special cases like newlines in parentheses, after operators, etc.
- Processing multiline strings

Key features:
- Ignores newlines inside open parentheses/brackets
- Ignores newlines after operators
- Ignores consecutive newlines except the last one
- Ensures that indentation is a multiple of 4 spaces
- Handles multiline strings correctly

### PinescriptTokenBuilder

The `PinescriptTokenBuilder` class extends the Langium `DefaultTokenBuilder` and:

- Implements a custom tokenize method that handles indentation
- Creates tokens for each line of code
- Inserts INDENT and DEDENT tokens based on indentation changes
- Ensures that INDENT and DEDENT tokens are balanced

## Current Status

The implementation is now functional:

- Correctly tokenizes PineScript code with indentation
- Inserts INDENT and DEDENT tokens based on indentation changes
- Handles special cases like newlines in parentheses, after operators, etc.
- Ensures that INDENT and DEDENT tokens are balanced

## Next Steps

1. Improve error handling for indentation errors
2. Properly integrate the custom token builder with the Langium parser
3. Test with more complex PineScript examples
4. Add support for more advanced features like line continuation
