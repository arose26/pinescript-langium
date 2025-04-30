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
    FunctionDeclaration | CompoundStatement | SimpleStatement;

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
FunctionDeclaration:
    export?='export'? method?='method'? name=Name LPAR (parameters=ParameterList)? RPAR ('=>' (body=LocalBlock | returnExpr=Expression) | NEWLINE? INDENT body=Statements DEDENT);

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
    'if' condition=Expression NEWLINE? INDENT thenBlock=Statements DEDENT
    (
        ElseIfClause |
        ElseClause
    )?;

// Else-if clause
ElseIfClause:
    'else' 'if' condition=Expression NEWLINE? INDENT thenBlock=Statements DEDENT
    (
        ElseIfClause |
        ElseClause
    )?;

// Else clause
ElseClause:
    'else' NEWLINE? INDENT elseBlock=Statements DEDENT;

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
    ArrayLiteral;

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



// Name with soft keywords
Name returns string:
    NAME | 'type' | 'method' | 'const' | 'simple' | 'series' |
    // Built-in library namespaces
    'ta' | 'math' | 'color' | 'str' | 'array' | 'map' | 'barstate' | 'request' | 'input';

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
