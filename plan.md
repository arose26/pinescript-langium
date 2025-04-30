# PineScript ANTLR to Langium Conversion Plan

This document outlines the step-by-step plan for converting the PineScript ANTLR grammar to Langium format, along with our progress and next steps.

## 1. Project Setup ✅

1. Create a new directory structure for the Langium grammar: ✅
   ```
   pinescript-langium/
   ├── src/
   │   ├── language-server/
   │   │   ├── pinescript.langium       # Main grammar file
   │   │   ├── pinescript-module.ts     # Module configuration
   │   │   ├── token-builder.ts         # Custom token builder for indentation
   │   │   └── generated/               # Generated files will go here
   │   └── main.ts                      # Test entry point
   ├── examples/                        # Example PineScript files
   ├── langium-config.json              # Langium configuration
   └── package.json                     # Project dependencies
   ```

2. Set up the langium-config.json file with appropriate settings for the PineScript grammar. ✅

## 2. Grammar Conversion ✅

1. **Create the basic Langium grammar file (pinescript.langium)**: ✅
   - Define the grammar name and entry point
   - Convert the main parser rules from ANTLR to Langium format
   - Define type hierarchies and interfaces

2. **Convert terminal rules**: ✅
   - Convert lexer rules from ANTLR to Langium terminal rules
   - Handle special tokens like STRING, NUMBER, COLOR
   - Define hidden terminals for whitespace and comments

3. **Convert parser rules**: ✅
   - Convert statement rules (compound and simple statements)
   - Convert expression rules (arithmetic, logical, etc.)
   - Convert structure rules (if, for, while, switch)
   - Convert type-related rules

4. **Handle left recursion**: ✅
   - Rewrite left-recursive rules using Langium's infer mechanism
   - Implement proper expression precedence

## 3. Indentation Handling ✅

1. **Define indentation tokens**: ✅
   - Define INDENT, DEDENT, and NEWLINE tokens in the grammar
   - Configure them to work with the preprocessor

2. **Implement the custom token builder (token-builder.ts)**: ✅
   - Created a PinescriptTokenBuilder class that extends DefaultTokenBuilder
   - Created an IndentationPreprocessor class based on PinescriptLexerBase.py
   - Implemented a custom tokenize method that handles indentation
   - Successfully inserts INDENT and DEDENT tokens based on indentation changes

3. **Configure the module to use the custom token builder (pinescript-module.ts)**: ✅
   - Set up the module structure
   - Created the framework for integrating with the custom token builder
   - Successfully integrated with our custom AST builder

## 4. Build and Test ⚠️

1. **Generate Langium code**: ✅
   - Successfully ran the Langium generator
   - Generated TypeScript code from the grammar

2. **Build the project**: ✅
   - Successfully built the TypeScript code
   - Fixed various type errors and configuration issues

3. **Test the parser**: ✅
   - Created a test entry point (main.ts)
   - Successfully parsing example PineScript code
   - Building a structured AST from the parsed tokens
   - Successfully handling complex PineScript code with nested structures

## 5. Documentation 🔄

1. **Document the conversion process**: 🔄
   - Created conversion.md explaining the mapping between ANTLR and Langium
   - Created README.md with project overview and usage instructions

## Implementation Status

### Completed:
- ✅ Project setup and configuration
- ✅ Basic grammar structure and rule conversion
- ✅ Terminal rules and token definitions
- ✅ Parser rules with proper handling of left recursion
- ✅ Grammar generation and TypeScript compilation
- ✅ Basic documentation
- ✅ Indentation preprocessing implementation
- ✅ Parser integration (custom parser implemented with structured AST building)
- ✅ Testing (test infrastructure created, tests passing with complex code)
- ✅ AST building (structured AST implementation with proper node types)
- ✅ Support for basic language features (variables, functions, control structures)
- ✅ Array support (array literals, access, methods)
- ✅ Switch statement support

### Partially Completed:
- 🔄 Proper handling of complex expressions (operators, parentheses, etc.)
- 🔄 Full integration with the Langium parser (currently using our own AST builder)

### Pending:
- ❌ Comprehensive testing with a wider variety of PineScript code
- ❌ Library/Module System (version annotations, imports/exports, namespaces)
- ❌ Built-in Functions and Libraries (ta, math, input, color functions)
- ❌ Type System (type annotations, function documentation)
- ❌ Advanced Language Features (named parameters, default values, etc.)
- ❌ Indicator-specific Features (indicator declaration, visualization properties)
- ❌ Object-Oriented Features (custom types/classes, fields, methods)
- ❌ String Interpolation/Template Literals
- ❌ Advanced Control Structures (for loops with range-based iteration)
- ❌ Error Handling (try/catch patterns)
- ❌ Advanced Data Structures (maps/dictionaries, complex objects)

## Challenges and Solutions

### Indentation Handling

The main challenge was integrating the PineScript preprocessor (which handles indentation) with the Langium parser:

1. **Understanding**: PineScript handles indentation through a preprocessor that inserts INDENT and DEDENT tokens.
2. **Approach**: We've defined INDENT, DEDENT, and NEWLINE tokens in the grammar and created a TypeScript implementation of the PinescriptLexerBase.py class.
3. **Solution**:
   - Created an IndentationPreprocessor class that replicates the functionality of PinescriptLexerBase.py
   - Implemented a custom tokenize method in PinescriptTokenBuilder that handles indentation
   - Successfully inserts INDENT and DEDENT tokens based on indentation changes
   - Ensures that INDENT and DEDENT tokens are balanced
4. **Remaining Work**:
   - Properly integrate the custom token builder with the Langium parser
   - Improve error handling for indentation errors
   - Test with more complex PineScript examples

### Parser Integration

We've successfully built a custom parser that works with our indentation preprocessing:

1. **Current Implementation**: Created a custom parser that builds a structured AST from the preprocessed tokens.
2. **Progress**:
   - Successfully parsing complex PineScript code and building a structured AST
   - Implemented support for basic language features (variables, functions, control structures)
   - Added support for arrays (literals, access, methods)
   - Implemented switch statements
3. **Remaining Work**:
   - Full integration with the Langium parser (currently using our own AST builder)
   - Implement remaining advanced language features (see feature_list.md)
   - Improve error recovery and handling


### Left Recursion

We've successfully handled left recursion in the grammar:

1. **Solution Implemented**: Used Langium's `infers` keyword and current-based references to handle left-recursive rules.
2. **Result**: Grammar successfully compiles without left recursion errors.

## Detailed Next Steps

1. **Fix Arrow Function Handling**: Done

2. **Implement Advanced Language Features**:
   - Implement features from feature_list.md in priority order
   - Start with Library/Module System and Built-in Functions
   - Add Type System support
   - Implement Advanced Language Features (named parameters, default values)
   - Add Indicator-specific Features
   - Implement Object-Oriented Features
   - Add String Interpolation/Template Literals
   - Implement Advanced Control Structures
   - Add Error Handling patterns
   - Implement Advanced Data Structures

3. **Integrate with Langium Parser**:
   - Research Langium's document lifecycle and parser API in depth
   - Convert our tokens to Langium tokens
   - Integrate our AST builder with the Langium parser
   - Ensure compatibility with Langium's document model

4. **Implement Error Recovery**:
   - Add custom error messages for indentation errors
   - Implement recovery strategies for common syntax errors
   - Test with intentionally malformed PineScript code

5. **Comprehensive Testing**:
   - Create a test suite with various PineScript examples
   - Test different language constructs (expressions, statements, structures)
   - Test edge cases for indentation
   - Compare parsing results with the original ANTLR parser
   - Test with real-world PineScript examples from new-examples directory

6. **Complete Documentation**:
   - Document the indentation handling approach
   - Provide detailed examples of grammar usage
   - Document any limitations or differences from the ANTLR grammar
   - Create a user guide for using the Langium grammar
   - Document all implemented features

7. **Improve AST Builder**:
   - Enhance expression handling (operators, parentheses, etc.)
   - Implement proper type checking and validation
   - Ensure the AST correctly represents all language constructs

8. **Integration with IDE**:
   - Implement language server features (completion, hover, etc.)
   - Test integration with VS Code
   - Ensure proper syntax highlighting and error reporting

## Resources Needed

1. **Langium Documentation**:
   - Need more detailed documentation on parser API and document lifecycle
   - Examples of custom lexers and token builders

2. **PineScript Preprocessor**:
   - Need detailed understanding of how the preprocessor works
   - Access to the preprocessor code or output for testing

3. **Test Cases**:
   - Need more complex PineScript examples to test the grammar
   - Need examples that exercise all language features
   - Real-world PineScript examples from new-examples directory

4. **Feature Documentation**:
   - Comprehensive list of features to implement (see feature_list.md)
   - Examples of each feature in PineScript
   - Documentation on how each feature should work
