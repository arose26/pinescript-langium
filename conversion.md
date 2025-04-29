# PineScript ANTLR to Langium Conversion

This document explains the mapping between the original PineScript ANTLR grammar and our Langium implementation.

## Grammar Structure Mapping

| ANTLR Concept | Langium Equivalent | Notes |
|---------------|-------------------|-------|
| Grammar declaration | `grammar Pinescript` | Top-level grammar declaration |
| Parser rules | Parser rules | Similar syntax, but with type annotations |
| Lexer rules | Terminal rules | Using regex patterns instead of character ranges |
| Entry rule | `entry Script` | Marked with `entry` keyword |
| Rule alternatives | `|` operator | Same syntax |
| Rule sequences | Whitespace-separated rules | Same syntax |
| Rule repetition | `*` and `+` operators | Same syntax |
| Optional rules | `?` operator | Same syntax |
| Rule groups | Parentheses `()` | Same syntax |
| Labels | Assignments | Using `=` for single values, `+=` for arrays |
| Tokens | Keywords and terminal references | Quoted strings for keywords |

## Indentation Handling

The original PineScript grammar uses a preprocessor to handle indentation, which inserts INDENT and DEDENT tokens. In our Langium implementation:

1. We define INDENT, DEDENT, and NEWLINE tokens in the grammar
2. We expect these tokens to be inserted by the preprocessor
3. We use these tokens in the grammar to define block structures

Example from ANTLR:
```antlr
compound_statement
    : simple_statement
    | if_statement
    | for_statement
    | while_statement
    | function_declaration
    | type_declaration
    | switch_statement
    | var_declaration
    ;

if_statement
    : IF test COLON suite (ELIF test COLON suite)* (ELSE COLON suite)?
    ;

suite
    : simple_statement
    | NEWLINE INDENT statement+ DEDENT
    ;
```

Equivalent in Langium:
```langium
CompoundStatement:
    SimpleStatement | IfStatement | ForStatement | WhileStatement | 
    FunctionDeclaration | TypeDeclaration | SwitchStatement | VarDeclaration;

IfStatement:
    'if' test=Test ':' suite=Suite
    (elifClauses+=ElifClause)*
    (elseClause=ElseClause)?;

Suite:
    SimpleStatement | 
    NEWLINE INDENT statements+=Statement+ DEDENT;
```

## Left Recursion Handling

ANTLR can handle direct left recursion, but Langium requires a different approach. We've rewritten left-recursive rules using Langium's `infers` keyword and tree-rewriting actions.

Example from ANTLR:
```antlr
expr
    : expr op=('*'|'/'|'%') expr
    | expr op=('+'|'-') expr
    | atom
    ;
```

Equivalent in Langium:
```langium
Expression infers Expression:
    Term ({BinaryExpression.left=current} operator=('+'|'-') right=Term)*;

Term infers Expression:
    Factor ({BinaryExpression.left=current} operator=('*'|'/'|'%') right=Factor)*;

Factor infers Expression:
    Atom;
```

## Type System

Langium has a built-in type system that we've used to define the AST structure:

```langium
interface Expression {
    // Common properties for all expressions
}

interface BinaryExpression extends Expression {
    left: Expression;
    operator: string;
    right: Expression;
}

interface Literal extends Expression {
    value: string;
}
```

## Terminal Rules

ANTLR lexer rules have been converted to Langium terminal rules using regular expressions:

ANTLR:
```antlr
NAME
    : [a-zA-Z_][a-zA-Z_0-9]*
    ;

NUMBER
    : [0-9]+ ('.' [0-9]*)?
    | '0x' [0-9a-fA-F]+
    | '0b' [01]+
    | '0o' [0-7]+
    ;
```

Langium:
```langium
terminal NAME: /[a-zA-Z_][a-zA-Z_0-9]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?|0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+/;
```

## Special Handling

### Hidden Tokens

In ANTLR, hidden tokens are defined using the `channel(HIDDEN)` directive. In Langium, we use the `hidden` keyword:

```langium
hidden terminal WS: /[ \t]+/;
hidden terminal COMMENT: /\/\/[^\n\r]*/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
```

### Keywords vs. Identifiers

In ANTLR, keywords are defined as lexer rules. In Langium, keywords are defined inline in parser rules, and we handle keyword/identifier conflicts using the `Name` rule:

```langium
Name returns string:
    NAME | 'type' | 'method' | 'const' | 'input' | 'simple' | 'series';
```

## Challenges and Differences

1. **Indentation Handling**: The biggest challenge is integrating with the PineScript preprocessor for indentation.

2. **Parser API**: Langium's parser API is different from ANTLR's, requiring adaptation in how we parse documents.

3. **Error Recovery**: Langium has different error recovery mechanisms than ANTLR.

4. **Left Recursion**: Langium requires explicit handling of left recursion using tree-rewriting actions.

## Next Steps

1. Complete the integration with the PineScript preprocessor
2. Implement proper error recovery
3. Test with more complex PineScript examples
4. Compare parsing results with the original ANTLR parser
