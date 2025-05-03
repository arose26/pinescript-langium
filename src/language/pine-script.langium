grammar PineScript

// Entry point
entry StartScript:
    (NEWLINE | COMMENT)* (version=VERSION_ANNOTATION (NEWLINE | COMMENT)*)?
    statements=Statements?;

// Version annotation is handled at the beginning of the script

// Statements
Statements:
    statements+=Statement ((NEWLINE | COMMENT)+ statements+=Statement)* (NEWLINE | COMMENT)*;

Statement:
    FunctionDeclaration | ArrowFunctionDeclaration | PCAStyleFunctionDeclaration | CompoundStatement | SimpleStatement;

// Compound statements
CompoundStatement:
    CompoundAssignment | TypeDeclaration | StructureStatement;

// Simple statements
SimpleStatement:
    (SimpleAssignment | ExpressionStatement | BreakStatement | ContinueStatement | ImportStatement);

// Compound assignments
CompoundAssignment:
    CompoundVariableInitialization | CompoundReassignment | CompoundAugAssignment;

CompoundVariableInitialization:
    CompoundNameInitialization | CompoundTupleInitialization;

CompoundNameInitialization:
    declaration=VariableDeclaration '=' expression=StructureExpression;

CompoundTupleInitialization:
    declaration=TupleDeclaration '=' expression=StructureExpression;

CompoundReassignment:
    target=AssignmentTarget ':=' expression=StructureExpression;

CompoundAugAssignment:
    target=AssignmentTarget operator=AugAssignOp expression=StructureExpression;

// Function declaration
// We also handle the case where the function body contains control flow statements
FunctionDeclaration:
    export?='export'? method?='method'? name=Name LPAR (parameters=ParameterList)? RPAR (
        {infer ArrowFunctionExpression} FUNC_ARROW returnExpr=Expression |
        {infer ArrowFunctionBlock} FUNC_ARROW NEWLINE INDENT body=ArrowFunctionBody DEDENT |
        {infer RegularFunction} NEWLINE INDENT body=Statements DEDENT
    );

// Arrow function declaration - standalone function with arrow syntax
// We also handle the case where the function body contains control flow statements
ArrowFunctionDeclaration:
    name=Name LPAR (parameters=ParameterList)? RPAR FUNC_ARROW (
        {infer ArrowFunctionExpressionDecl} returnExpr=Expression |
        {infer ArrowFunctionBlockDecl} NEWLINE INDENT body=ArrowFunctionBody DEDENT
    );

// PCA-style function declaration with named parameters and default values
// This handles functions like MaxMinNz(value,max=100,min=0,def=50) =>
// We use a separate rule for the arrow token to avoid conflicts with other arrow tokens
// We also handle the case where the function body contains control flow statements
PCAStyleFunctionDeclaration:
    name=Name LPAR (parameters=PCAStyleParameterList)? RPAR FUNC_ARROW (
        {infer PCAStyleArrowFunctionExpressionDecl} returnExpr=Expression |
        {infer PCAStyleArrowFunctionBlockDecl} NEWLINE INDENT body=PCAStyleFunctionBody DEDENT
    );

// Special body rule for PCA-style functions to handle control flow statements
PCAStyleFunctionBody:
    statements+=Statement ((NEWLINE | COMMENT)+ statements+=Statement)* (NEWLINE | COMMENT)*;

// Parameter list for PCA-style function declarations
PCAStyleParameterList:
    parameters+=PCAStyleParameterDefinition (',' parameters+=PCAStyleParameterDefinition)* ','?;

// Parameter definition for PCA-style function declarations
PCAStyleParameterDefinition:
    name=Name ('=' defaultValue=Expression)?;



// Arrow function expression - used in assignments and other expressions
// We use a separate rule for the arrow token to avoid conflicts with other arrow tokens
// We also handle the case where the function body contains control flow statements
ArrowFunctionExpr:
    LPAR (parameters=ParameterList)? RPAR FUNC_ARROW (
        {infer ArrowFunctionExprBody} returnExpr=Expression |
        {infer ArrowFunctionBlockBody} NEWLINE INDENT body=ArrowFunctionBody DEDENT
    );

// Special body rule for arrow functions to handle control flow statements
ArrowFunctionBody:
    statements=Statements;


ParameterList:
    parameters+=ParameterDefinition (',' parameters+=ParameterDefinition)* ','?;

ParameterDefinition:
    (type=TypeSpecification)? name=NameStore ('=' defaultValue=Expression)?;

// Type declaration
TypeDeclaration:
    export?='export'? 'type' name=Name NEWLINE INDENT fields=FieldDefinitions DEDENT;

FieldDefinitions:
    fields+=FieldDefinition+;

FieldDefinition:
    type=TypeSpecification name=NameStore ('=' defaultValue=Expression)? NEWLINE;

// Structures
Structure:
    IfStructure | ForStructure | WhileStructure | SwitchStructure;

StructureStatement:
    structure=Structure;

StructureExpression:
    structure=Structure;

// If structure
IfStructure:
    'if' condition=Expression (
        (NEWLINE? INDENT thenBlock=Statements DEDENT) |
        (LBRACE thenBlock=Statements RBRACE)
    )
    (
        ElseIfClause |
        ElseClause
    )?;

// Else-if clause
ElseIfClause:
    'else' 'if' condition=Expression (
        (NEWLINE? INDENT thenBlock=Statements DEDENT) |
        (LBRACE thenBlock=Statements RBRACE)
    )
    (
        ElseIfClause |
        ElseClause
    )?;

// Else clause
ElseClause:
    'else' (
        (NEWLINE? INDENT elseBlock=Statements DEDENT) |
        (LBRACE elseBlock=Statements RBRACE)
    );

// For structure
ForStructure:
    ForStructureTo | ForStructureIn;

ForStructureTo:
    'for' iterator=ForIterator '=' start=Expression 'to' end=Expression ('by' step=Expression)? NEWLINE? INDENT block=Statements DEDENT;

ForStructureIn:
    'for' iterator=ForIterator 'in' collection=Expression NEWLINE? INDENT block=Statements DEDENT;

ForIterator:
    NameStore | TupleDeclaration;

// While structure
WhileStructure:
    'while' condition=Expression NEWLINE? INDENT block=Statements DEDENT;

// Switch structure - explicitly uses RARROW token to avoid conflicts with function arrows
SwitchStructure:
    'switch' (expression=Expression)? NEWLINE INDENT cases=SwitchCases DEDENT;

SwitchCases:
    patternCases+=SwitchPatternCase+ defaultCase=SwitchDefaultCase?;

// Switch pattern case - explicitly uses RARROW token to avoid conflicts with function arrows
SwitchPatternCase:
    pattern=Expression RARROW block=LocalBlock;

// Switch default case - explicitly uses RARROW token to avoid conflicts with function arrows
SwitchDefaultCase:
    RARROW block=LocalBlock;

// Local block
LocalBlock:
    IndentedLocalBlock | InlineLocalBlock;

IndentedLocalBlock:
    NEWLINE INDENT statements=Statements DEDENT;

InlineLocalBlock:
    statement=Statement;

// Simple assignments
SimpleAssignment:
    ArrayDestructuring | SimpleVariableInitialization | SimpleReassignment | SimpleAugAssignment;

SimpleVariableInitialization:
    SimpleNameInitialization | SimpleTupleInitialization;

SimpleNameInitialization:
    declaration=VariableDeclaration '=' expression=Expression;

SimpleTupleInitialization:
    declaration=TupleDeclaration '=' expression=Expression;

// Array destructuring assignment - prioritized to resolve ambiguity
ArrayDestructuring:
    declaration=ArrayDestructuringDeclaration '=' expression=Expression;

ArrayDestructuringDeclaration:
    LSQB elements+=NameStore (',' elements+=NameStore)* ','? RSQB;



SimpleReassignment:
    target=AssignmentTarget ':=' expression=Expression;

SimpleAugAssignment:
    target=AssignmentTarget operator=AugAssignOp expression=Expression;

// Expressions
Expression:
    ConditionalExpression;

// Conditional ternary expression
ConditionalExpression infers Expression:
    DisjunctionExpression ({infer ConditionalExpressionRule.condition=current} '?' thenExpr=Expression ':' elseExpr=Expression)?;

ExpressionStatement:
    expression=Expression;

// Logical expressions
DisjunctionExpression infers Expression:
    ConjunctionExpression ({infer DisjunctionExpressionRule.left=current} 'or' right+=ConjunctionExpression)*;

ConjunctionExpression infers Expression:
    EqualityExpression ({infer ConjunctionExpressionRule.left=current} 'and' right+=EqualityExpression)*;

// Comparison expressions
EqualityExpression infers Expression:
    InequalityExpression ({infer EqualityExpressionRule.left=current} pairs+=EqualityTrailingPair)*;

EqualityTrailingPair:
    EqualTrailingPair | NotEqualTrailingPair;

EqualTrailingPair:
    '==' right=InequalityExpression;

NotEqualTrailingPair:
    '!=' right=InequalityExpression;

InequalityExpression infers Expression:
    AdditiveExpression ({infer InequalityExpressionRule.left=current} pairs+=InequalityTrailingPair)*;

InequalityTrailingPair:
    LessThanTrailingPair | LessThanEqualTrailingPair | GreaterThanTrailingPair | GreaterThanEqualTrailingPair;

LessThanEqualTrailingPair:
    '<=' right=AdditiveExpression;

LessThanTrailingPair:
    '<' right=AdditiveExpression;

GreaterThanEqualTrailingPair:
    '>=' right=AdditiveExpression;

GreaterThanTrailingPair:
    '>' right=AdditiveExpression;

// Arithmetic expressions
AdditiveExpression infers Expression:
    MultiplicativeExpression ({infer BinaryExpression.left=current} operator=('+' | '-') right=MultiplicativeExpression)*;

MultiplicativeExpression infers Expression:
    UnaryExpression ({infer BinaryExpression.left=current} operator=('*' | '/' | '%') right=UnaryExpression)*;

UnaryExpression infers Expression:
    {infer UnaryExpression} operator=('not' | '+' | '-') operand=UnaryExpression | PrimaryExpression;

// Primary expressions
PrimaryExpression infers Expression:
    AtomicExpression ({infer PrimaryExpressionAttribute.expression=current} '.' attribute=NameLoad |
                      {infer PrimaryExpressionCall.expression=current} (templateSpec=TemplateSpecSuffix)? LPAR (arguments=ArgumentList)? RPAR |
                      {infer PrimaryExpressionMethodCall.expression=current} '.' method=NameLoad LPAR (arguments=ArgumentList)? RPAR |
                      {infer PrimaryExpressionSubscript.expression=current} LSQB slice=SubscriptSlice RSQB)*;



ArgumentList:
    arguments+=ArgumentDefinition (',' arguments+=ArgumentDefinition)* ','?;

ArgumentDefinition:
    ((name=NameStore '=') expression=Expression) | expression=Expression;

SubscriptSlice:
    expressions+=Expression (',' expressions+=Expression)* ','?;

// Atomic expressions
AtomicExpression infers Expression:
    {infer NameReference} name=QualifiedName |
    LiteralExpression |
    {infer GroupedExpression} LPAR expression=Expression RPAR |
    ArrayLiteral |
    {infer ArrowFunctionExpression} function=ArrowFunctionExpr;

// Qualified name for namespace support
QualifiedName:
    parts+=NameLoad ('.' parts+=NameLoad)*;

// Array literal
ArrayLiteral:
    {infer ArrayExpression} LSQB (elements+=Expression (',' elements+=Expression)* ','?)? RSQB;

LiteralExpression infers Expression:
    {infer LiteralNumber} value=NUMBER |
    {infer LiteralString} value=STRING |
    {infer LiteralBool} (value?='true' | 'false') |
    {infer LiteralColor} value=COLOR;

// Import
ImportStatement:
    'import' namespace=Name '/' name=Name '/' version=NUMBER ('as' alias=Name)?;

// Loop controls
BreakStatement:
    {infer BreakStatement} 'break';

ContinueStatement:
    {infer ContinueStatement} 'continue';

// Variable declaration and assignment related segments
VariableDeclaration:
    (mode=DeclarationMode)? (type=TypeSpecification)? name=NameStore;

TupleDeclaration:
    LSQB names+=NameStore (',' names+=NameStore)* ','? RSQB;

DeclarationMode returns string:
    'varip' | 'var';

AssignmentTarget:
    AssignmentTargetSimple | AssignmentTargetGroup;

AssignmentTargetSimple:
    (AssignmentTargetName |
     {infer AssignmentTargetAttribute} expression=PrimaryExpression '.' name=NameStore |
     {infer AssignmentTargetSubscript} expression=PrimaryExpression LSQB slice=SubscriptSlice RSQB);

AssignmentTargetName:
    {infer AssignmentTargetName} name=NameStore;

AssignmentTargetGroup:
    {infer AssignmentTargetGroup} LPAR target=AssignmentTarget RPAR;

AugAssignOp returns string:
    '*=' | '/=' | '%=' | '+=' | '-=';

// Type specification
TypeSpecification:
    (qualifier=TypeQualifier)? name=AttributedTypeName (templateSpec=TemplateSpecSuffix)? (arrayType?='[]')?;

TypeQualifier returns string:
    'const' | 'input' | 'simple' | 'series';

AttributedTypeName:
    name=QualifiedName;

// Use a different rule for template specifications to avoid conflicts with comparison operators
TemplateSpecSuffix:
    'template_start' (arguments=TypeArgumentList)? 'template_end';

TypeArgumentList:
    arguments+=TypeSpecification (',' arguments+=TypeSpecification)* ','?;

// Special tokens for indentation - these are handled by the IndentationAwareTokenBuilder
// The patterns don't matter as they will be overridden by the token builder
terminal INDENT: 'synthetic:indent';
terminal DEDENT: 'synthetic:dedent';
terminal NEWLINE: /\r?\n/;



// Common tokens
terminal NAME: /[a-zA-Z_][a-zA-Z_0-9]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?|0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+/;
terminal STRING: /"[^"]*"|'[^']*'/;
terminal COLOR: /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}/;

// Parentheses and brackets - used for indentation handling
// These are referenced in the IndentationAwareTokenBuilder configuration
terminal LPAR: '(';
terminal RPAR: ')';
terminal LSQB: '[';
terminal RSQB: ']';
terminal LBRACE: '{';
terminal RBRACE: '}';

// Function arrow token for function declarations
// This token has higher priority than ARROW and is used specifically for function declarations
terminal FUNC_ARROW: '=>';

// Arrow token for other uses
// This token has lower priority than FUNC_ARROW and is used for other contexts
terminal ARROW: '=>';

// Right arrow token for switch cases
// This token is used specifically for switch cases and has a different pattern to avoid conflicts
terminal RARROW: '->';



// Name with soft keywords
Name returns string:
    NAME | 'type' | 'method' | 'const' | 'simple' | 'series' |
    // Built-in library namespaces
    'ta' | 'math' | 'color' | 'str' | 'array' | 'matrix' | 'map' | 'barstate' | 'request' | 'input' | 'ticker' | 'syminfo' |
    // Matrix operation keywords
    'rows' | 'cols' | 'transpose' | 'multiply' | 'covariance' | 'eigen' | 'pca' |
    // Array operation keywords
    'new' | 'new_float' | 'new_int' | 'new_bool' | 'new_string' | 'push' | 'pop' | 'get' | 'set' | 'size' | 'insert' | 'remove' | 'clear' | 'copy' | 'slice' | 'fill' | 'join' | 'sort' | 'reverse' | 'indexOf' | 'includes';

NameLoad returns string:
    Name;

NameStore returns string:
    Name;

// Hidden tokens - note that WS only matches spaces and tabs, not newlines
hidden terminal WS: /[ \t]+/;
terminal COMMENT: /\/\/[^\n\r]*/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;

// Version annotation - matches //@version=X
terminal VERSION_ANNOTATION: /\/\/@version=[0-9]+/;
