grammar Pinescript

// Entry point - directly from ANTLR grammar
entry StartScript:
    statements=Statements? EOF;

// Statements
Statements:
    statements+=Statement+;

Statement:
    CompoundStatement | SimpleStatements;

// Compound statements
CompoundStatement:
    CompoundAssignment | FunctionDeclaration | TypeDeclaration | StructureStatement;

// Simple statements
SimpleStatements:
    statements+=SimpleStatement (',' statements+=SimpleStatement)* ','? NEWLINE;

SimpleStatement:
    SimpleAssignment | ExpressionStatement | ImportStatement | BreakStatement | ContinueStatement;

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
FunctionDeclaration:
    export?='export'? method?='method'? name=Name '(' (parameters=ParameterList)? ')' '=>' body=LocalBlock;

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
    IfStructureElif | IfStructureElse;

IfStructureElif:
    'if' condition=Expression thenBlock=LocalBlock elifBlock=ElifStructure;

IfStructureElse:
    'if' condition=Expression thenBlock=LocalBlock elseBlock=ElseBlock?;

ElifStructure:
    ElifStructureElif | ElifStructureElse;

ElifStructureElif:
    'else' 'if' condition=Expression thenBlock=LocalBlock elifBlock=ElifStructure;

ElifStructureElse:
    'else' 'if' condition=Expression thenBlock=LocalBlock elseBlock=ElseBlock?;

ElseBlock:
    'else' block=LocalBlock;

// For structure
ForStructure:
    ForStructureTo | ForStructureIn;

ForStructureTo:
    'for' iterator=ForIterator '=' start=Expression 'to' end=Expression ('by' step=Expression)? block=LocalBlock;

ForStructureIn:
    'for' iterator=ForIterator 'in' collection=Expression block=LocalBlock;

ForIterator:
    NameStore | TupleDeclaration;

// While structure
WhileStructure:
    'while' condition=Expression block=LocalBlock;

// Switch structure
SwitchStructure:
    'switch' (expression=Expression)? NEWLINE INDENT cases=SwitchCases DEDENT;

SwitchCases:
    patternCases+=SwitchPatternCase+ defaultCase=SwitchDefaultCase?;

SwitchPatternCase:
    pattern=Expression '=>' block=LocalBlock;

SwitchDefaultCase:
    '=>' block=LocalBlock;

// Local block
LocalBlock:
    IndentedLocalBlock | InlineLocalBlock;

IndentedLocalBlock:
    NEWLINE INDENT statements=Statements DEDENT;

InlineLocalBlock:
    statement=Statement;

// Simple assignments
SimpleAssignment:
    SimpleVariableInitialization | SimpleReassignment | SimpleAugAssignment;

SimpleVariableInitialization:
    SimpleNameInitialization | SimpleTupleInitialization;

SimpleNameInitialization:
    declaration=VariableDeclaration '=' expression=Expression;

SimpleTupleInitialization:
    declaration=TupleDeclaration '=' expression=Expression;

SimpleReassignment:
    target=AssignmentTarget ':=' expression=Expression;

SimpleAugAssignment:
    target=AssignmentTarget operator=AugAssignOp expression=Expression;

// Expressions
Expression:
    ConditionalExpression;

ExpressionStatement:
    expression=Expression;

// Conditional ternary expression
ConditionalExpression infers Expression:
    DisjunctionExpression ({infer ConditionalExpressionRule.condition=current} '?' thenExpr=Expression ':' elseExpr=Expression)?;

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
    LessThanEqualTrailingPair | LessThanTrailingPair | GreaterThanEqualTrailingPair | GreaterThanTrailingPair;

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
                      {infer PrimaryExpressionCall.expression=current} (templateSpec=TemplateSpecSuffix)? '(' (arguments=ArgumentList)? ')' |
                      {infer PrimaryExpressionSubscript.expression=current} '[' slice=SubscriptSlice ']')*;

ArgumentList:
    arguments+=ArgumentDefinition (',' arguments+=ArgumentDefinition)* ','?;

ArgumentDefinition:
    ((name=NameStore '=') expression=Expression) | expression=Expression;

SubscriptSlice:
    expressions+=Expression (',' expressions+=Expression)* ','?;

// Atomic expressions
AtomicExpression infers Expression:
    {infer NameReference} name=NameLoad |
    LiteralExpression |
    {infer GroupedExpression} '(' expression=Expression ')' |
    {infer TupleExpression} '[' expressions+=Expression (',' expressions+=Expression)* ','? ']';

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
    '[' names+=NameStore (',' names+=NameStore)* ','? ']';

DeclarationMode returns string:
    'varip' | 'var';

AssignmentTarget:
    AssignmentTargetSimple | AssignmentTargetGroup;

AssignmentTargetSimple:
    (AssignmentTargetName |
     {infer AssignmentTargetAttribute} expression=PrimaryExpression '.' name=NameStore |
     {infer AssignmentTargetSubscript} expression=PrimaryExpression '[' slice=SubscriptSlice ']');

AssignmentTargetName:
    {infer AssignmentTargetName} name=NameStore;

AssignmentTargetGroup:
    {infer AssignmentTargetGroup} '(' target=AssignmentTarget ')';

AugAssignOp returns string:
    '*=' | '/=' | '%=' | '+=' | '-=';

// Type specification
TypeSpecification:
    (qualifier=TypeQualifier)? name=AttributedTypeName (templateSpec=TemplateSpecSuffix)? (arrayType?='[]')?;

TypeQualifier returns string:
    'const' | 'input' | 'simple' | 'series';

AttributedTypeName:
    names+=NameLoad ('.' names+=NameLoad)*;

TemplateSpecSuffix:
    '<' (arguments=TypeArgumentList)? '>';

TypeArgumentList:
    arguments+=TypeSpecification (',' arguments+=TypeSpecification)* ','?;

// Special tokens for indentation - these are inserted by the preprocessor
// We define them with patterns that will match the tokens inserted by the preprocessor
terminal INDENT: 'INDENT';
terminal DEDENT: 'DEDENT';
terminal NEWLINE: 'NEWLINE';
terminal EOF: 'EOF';

// Common tokens
terminal NAME: /[a-zA-Z_][a-zA-Z_0-9]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?|0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+/;
terminal STRING: /"[^"]*"|'[^']*'/;
terminal COLOR: /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}/;

// Parentheses and brackets - used for indentation handling
terminal LPAR: '(';
terminal RPAR: ')';
terminal LSQB: '[';
terminal RSQB: ']';

// Name with soft keywords
Name returns string:
    NAME | 'type' | 'method' | 'const' | 'input' | 'simple' | 'series';

NameLoad returns string:
    Name;

NameStore returns string:
    Name;

// Hidden tokens - note that WS only matches spaces and tabs, not newlines
hidden terminal WS: /[ \t]+/;
hidden terminal COMMENT: /\/\/[^\n\r]*/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal NL: /\r?\n/;
