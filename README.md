# PineScript Langium Grammar

This project contains a Langium grammar for PineScript, converted from the original ANTLR4 grammar.

## Overview

PineScript is a domain-specific language used for creating custom indicators and strategies in TradingView. This project aims to provide a Langium-based grammar for PineScript, which can be used for:

- Syntax highlighting
- Code completion
- Error checking
- Language server protocol (LSP) integration

## Features

- Full PineScript grammar in Langium format
- Support for Python-style indentation
- Custom token handling for INDENT and DEDENT tokens
- Error recovery for indentation errors

## Project Structure

```
pinescript-langium/
├── src/
│   ├── language-server/
│   │   ├── pinescript.langium       # Main grammar file
│   │   ├── pinescript-module.ts     # Module configuration
│   │   ├── token-builder.ts         # Custom token builder for indentation
│   │   └── generated/               # Generated files
│   └── main.ts                      # Test entry point
├── examples/                        # Example PineScript files
├── langium-config.json              # Langium configuration
└── package.json                     # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Generate the Langium grammar:
   ```
   npm run langium:generate
   ```
4. Build the project:
   ```
   npm run build
   ```

### Usage

To test the grammar with an example PineScript file:

```
node out/main.js examples/simple.pine
```

## Indentation Handling

PineScript uses Python-style indentation to define code blocks. This is handled by a custom lexer implementation that:

1. Tracks indentation levels using a stack
2. Inserts INDENT and DEDENT tokens based on indentation changes
3. Handles special cases like newlines in parentheses, after operators, etc.
4. Validates that indentation is a multiple of 4 spaces

## Conversion from ANTLR4

The grammar was converted from the original ANTLR4 grammar found in the PineScript project. The conversion process involved:

1. Converting lexer rules to Langium terminal rules
2. Converting parser rules to Langium grammar rules
3. Implementing custom indentation handling
4. Adapting the grammar to Langium's syntax and semantics

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The original PineScript ANTLR4 grammar
- The Langium project for providing the grammar framework
