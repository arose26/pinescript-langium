import { AstNode } from 'langium';
import { IToken } from 'chevrotain';

/**
 * AST node types for PineScript.
 */
export enum NodeType {
    // Top-level nodes
    StartScript = 'pinescript.StartScript',
    
    // Statements
    ExpressionStatement = 'pinescript.ExpressionStatement',
    VariableDeclaration = 'pinescript.VariableDeclaration',
    SimpleNameInitialization = 'pinescript.SimpleNameInitialization',
    
    // Blocks
    LocalBlock = 'pinescript.LocalBlock',
    
    // Structures
    IfStructure = 'pinescript.IfStructure',
    ForStructure = 'pinescript.ForStructure',
    SwitchStructure = 'pinescript.SwitchStructure',
    SwitchCases = 'pinescript.SwitchCases',
    SwitchCase = 'pinescript.SwitchCase',
    
    // Functions
    FunctionDeclaration = 'pinescript.FunctionDeclaration',
    FunctionCall = 'pinescript.FunctionCall',
    
    // Expressions
    NameReference = 'pinescript.NameReference',
    LiteralExpression = 'pinescript.LiteralExpression',
    BinaryExpression = 'pinescript.BinaryExpression',
    UnaryExpression = 'pinescript.UnaryExpression',
    ParenthesizedExpression = 'pinescript.ParenthesizedExpression',
    
    // Literals
    StringLiteral = 'pinescript.StringLiteral',
    NumberLiteral = 'pinescript.NumberLiteral',
    BooleanLiteral = 'pinescript.BooleanLiteral',
    ColorLiteral = 'pinescript.ColorLiteral',
}

/**
 * AST builder for PineScript.
 * 
 * This class is responsible for building an AST from the tokens produced by the lexer.
 */
export class AstBuilder {
    private tokens: IToken[];
    private currentIndex: number = 0;
    private nodeStack: any[] = [];
    private indentStack: number[] = [0];
    private currentIndent: number = 0;
    
    constructor(tokens: IToken[]) {
        this.tokens = tokens;
    }
    
    /**
     * Build an AST from the tokens.
     * 
     * @returns The root node of the AST
     */
    public buildAst(): AstNode {
        // Create a root node for the AST
        const rootNode = this.createNode(NodeType.StartScript, {
            statements: []
        });
        
        // Push the root node onto the stack
        this.nodeStack.push(rootNode);
        
        // Process tokens
        while (this.currentIndex < this.tokens.length) {
            const token = this.tokens[this.currentIndex];
            const tokenType = token.tokenType?.name || 'UNKNOWN';
            
            // Handle different token types
            switch (tokenType) {
                case 'INDENT':
                    this.handleIndent();
                    break;
                    
                case 'DEDENT':
                    this.handleDedent();
                    break;
                    
                case 'NAME':
                    this.handleName(token);
                    break;
                    
                case 'NEWLINE':
                    // Skip newlines
                    break;
                    
                case 'EOF':
                    // End of file - nothing to do
                    break;
                    
                default:
                    // Other tokens - handle based on context
                    this.handleOtherToken(token);
                    break;
            }
            
            // Move to the next token
            this.currentIndex++;
        }
        
        // Return the root node
        return rootNode;
    }
    
    /**
     * Handle an INDENT token.
     */
    private handleIndent(): void {
        // Increase the indent level
        this.currentIndent++;
        this.indentStack.push(this.currentIndent);
        
        // Get the current node
        const currentNode = this.nodeStack[this.nodeStack.length - 1];
        
        // Create a new block node if needed
        if (!currentNode.block && !currentNode.thenBlock && !currentNode.elseBlock && !currentNode.body) {
            const blockNode = this.createNode(NodeType.LocalBlock, {
                statements: []
            });
            
            // Add the block to the current node
            if (currentNode.$type === NodeType.IfStructure) {
                currentNode.thenBlock = blockNode;
                blockNode.$container = currentNode;
                blockNode.$containerProperty = 'thenBlock';
            } else if (currentNode.$type === NodeType.ForStructure) {
                currentNode.block = blockNode;
                blockNode.$container = currentNode;
                blockNode.$containerProperty = 'block';
            } else if (currentNode.$type === NodeType.FunctionDeclaration) {
                currentNode.body = blockNode;
                blockNode.$container = currentNode;
                blockNode.$containerProperty = 'body';
            } else {
                // Generic block
                currentNode.block = blockNode;
                blockNode.$container = currentNode;
                blockNode.$containerProperty = 'block';
            }
            
            // Push the block node onto the stack
            this.nodeStack.push(blockNode);
        }
    }
    
    /**
     * Handle a DEDENT token.
     */
    private handleDedent(): void {
        // Decrease the indent level
        this.currentIndent--;
        this.indentStack.pop();
        
        // Pop the current node from the stack
        if (this.nodeStack.length > 1) {
            this.nodeStack.pop();
        }
    }
    
    /**
     * Handle a NAME token.
     */
    private handleName(token: IToken): void {
        const text = token.image;
        
        // Get the current node
        const currentNode = this.nodeStack[this.nodeStack.length - 1];
        
        // Handle different types of statements
        if (text.startsWith('//')) {
            // Comment - ignore
        } else if (text === 'if') {
            this.handleIfStatement();
        } else if (text === 'else') {
            this.handleElseStatement();
        } else if (text === 'for') {
            this.handleForStatement();
        } else if (text === 'switch') {
            this.handleSwitchStatement();
        } else if (text === 'method') {
            this.handleMethodDeclaration();
        } else if (text.startsWith('var ')) {
            this.handleVariableDeclaration(text);
        } else {
            this.handleExpressionStatement(text);
        }
    }
    
    /**
     * Handle an if statement.
     */
    private handleIfStatement(): void {
        // Get the current node
        const currentNode = this.nodeStack[this.nodeStack.length - 1];
        
        // Create an if statement node
        const ifNode = this.createNode(NodeType.IfStructure, {
            condition: null,
            thenBlock: null,
            elseBlock: null
        });
        
        // Add the if statement to the current node
        if (currentNode.statements) {
            ifNode.$container = currentNode;
            ifNode.$containerProperty = 'statements';
            ifNode.$containerIndex = currentNode.statements.length;
            currentNode.statements.push(ifNode);
        }
        
        // Look ahead for the condition
        const conditionToken = this.tokens[this.currentIndex + 1];
        if (conditionToken && conditionToken.tokenType?.name === 'NAME') {
            // Create a condition expression
            const conditionExpr = this.createNode(NodeType.NameReference, {
                name: conditionToken.image
            });
            
            // Add the condition to the if statement
            ifNode.condition = conditionExpr;
            conditionExpr.$container = ifNode;
            conditionExpr.$containerProperty = 'condition';
            
            // Skip the condition token
            this.currentIndex++;
        }
        
        // Push the if statement onto the stack
        this.nodeStack.push(ifNode);
    }
    
    /**
     * Handle an else statement.
     */
    private handleElseStatement(): void {
        // Find the parent if statement
        let parentIf: any = null;
        for (let i = this.nodeStack.length - 1; i >= 0; i--) {
            if (this.nodeStack[i].$type === NodeType.IfStructure) {
                parentIf = this.nodeStack[i];
                break;
            }
        }
        
        if (parentIf) {
            // Create an else block
            const elseBlock = this.createNode(NodeType.LocalBlock, {
                statements: []
            });
            
            // Add the else block to the parent if statement
            parentIf.elseBlock = elseBlock;
            elseBlock.$container = parentIf;
            elseBlock.$containerProperty = 'elseBlock';
            
            // Pop the current node and push the else block
            this.nodeStack.pop();
            this.nodeStack.push(elseBlock);
        }
    }
    
    /**
     * Handle a for statement.
     */
    private handleForStatement(): void {
        // Get the current node
        const currentNode = this.nodeStack[this.nodeStack.length - 1];
        
        // Create a for statement node
        const forNode = this.createNode(NodeType.ForStructure, {
            iterator: null,
            start: null,
            end: null,
            block: null
        });
        
        // Add the for statement to the current node
        if (currentNode.statements) {
            forNode.$container = currentNode;
            forNode.$containerProperty = 'statements';
            forNode.$containerIndex = currentNode.statements.length;
            currentNode.statements.push(forNode);
        }
        
        // Look ahead for the iterator, start, and end
        let i = this.currentIndex + 1;
        while (i < this.tokens.length) {
            const token = this.tokens[i];
            const tokenType = token.tokenType?.name || 'UNKNOWN';
            
            if (tokenType === 'NEWLINE') {
                break;
            }
            
            if (tokenType === 'NAME') {
                if (!forNode.iterator) {
                    // Iterator
                    forNode.iterator = token.image;
                } else if (token.image === 'to' && !forNode.start) {
                    // Skip 'to'
                } else if (!forNode.start) {
                    // Start
                    const startExpr = this.createNode(NodeType.NameReference, {
                        name: token.image
                    });
                    forNode.start = startExpr;
                    startExpr.$container = forNode;
                    startExpr.$containerProperty = 'start';
                } else if (!forNode.end) {
                    // End
                    const endExpr = this.createNode(NodeType.NameReference, {
                        name: token.image
                    });
                    forNode.end = endExpr;
                    endExpr.$container = forNode;
                    endExpr.$containerProperty = 'end';
                }
            }
            
            i++;
        }
        
        // Skip to the end of the for statement
        this.currentIndex = i - 1;
        
        // Push the for statement onto the stack
        this.nodeStack.push(forNode);
    }
    
    /**
     * Handle a switch statement.
     */
    private handleSwitchStatement(): void {
        // Get the current node
        const currentNode = this.nodeStack[this.nodeStack.length - 1];
        
        // Create a switch statement node
        const switchNode = this.createNode(NodeType.SwitchStructure, {
            expression: null,
            cases: this.createNode(NodeType.SwitchCases, {
                patternCases: [],
                defaultCase: null
            })
        });
        
        // Add the switch statement to the current node
        if (currentNode.statements) {
            switchNode.$container = currentNode;
            switchNode.$containerProperty = 'statements';
            switchNode.$containerIndex = currentNode.statements.length;
            currentNode.statements.push(switchNode);
        }
        
        // Set up the cases container
        switchNode.cases.$container = switchNode;
        switchNode.cases.$containerProperty = 'cases';
        
        // Push the switch statement onto the stack
        this.nodeStack.push(switchNode);
    }
    
    /**
     * Handle a method declaration.
     */
    private handleMethodDeclaration(): void {
        // Get the current node
        const currentNode = this.nodeStack[this.nodeStack.length - 1];
        
        // Create a method declaration node
        const methodNode = this.createNode(NodeType.FunctionDeclaration, {
            method: true,
            name: null,
            parameters: null,
            body: null
        });
        
        // Add the method declaration to the current node
        if (currentNode.statements) {
            methodNode.$container = currentNode;
            methodNode.$containerProperty = 'statements';
            methodNode.$containerIndex = currentNode.statements.length;
            currentNode.statements.push(methodNode);
        }
        
        // Look ahead for the method name and parameters
        let i = this.currentIndex + 1;
        while (i < this.tokens.length) {
            const token = this.tokens[i];
            const tokenType = token.tokenType?.name || 'UNKNOWN';
            
            if (tokenType === 'NEWLINE') {
                break;
            }
            
            if (tokenType === 'NAME') {
                if (!methodNode.name) {
                    // Method name
                    const nameEndIndex = token.image.indexOf('(');
                    if (nameEndIndex > 0) {
                        methodNode.name = token.image.substring(0, nameEndIndex);
                        // Parameters would be parsed here in a real implementation
                    } else {
                        methodNode.name = token.image;
                    }
                }
            }
            
            i++;
        }
        
        // Skip to the end of the method declaration
        this.currentIndex = i - 1;
        
        // Push the method declaration onto the stack
        this.nodeStack.push(methodNode);
    }
    
    /**
     * Handle a variable declaration.
     */
    private handleVariableDeclaration(text: string): void {
        // Get the current node
        const currentNode = this.nodeStack[this.nodeStack.length - 1];
        
        // Extract the variable name
        const varName = text.substring(4);
        
        // Create a variable declaration node
        const varDeclNode = this.createNode(NodeType.SimpleNameInitialization, {
            declaration: this.createNode(NodeType.VariableDeclaration, {
                mode: 'var',
                name: varName
            }),
            expression: null
        });
        
        // Set up the container for the declaration
        varDeclNode.declaration.$container = varDeclNode;
        varDeclNode.declaration.$containerProperty = 'declaration';
        
        // Add the variable declaration to the current node
        if (currentNode.statements) {
            varDeclNode.$container = currentNode;
            varDeclNode.$containerProperty = 'statements';
            varDeclNode.$containerIndex = currentNode.statements.length;
            currentNode.statements.push(varDeclNode);
        }
        
        // Look ahead for the expression
        let i = this.currentIndex + 1;
        while (i < this.tokens.length) {
            const token = this.tokens[i];
            const tokenType = token.tokenType?.name || 'UNKNOWN';
            
            if (tokenType === 'NEWLINE') {
                break;
            }
            
            if (tokenType === 'NAME' && token.image.includes('=')) {
                // Found an assignment
                const parts = token.image.split('=');
                if (parts.length > 1) {
                    const exprText = parts[1].trim();
                    if (exprText) {
                        // Create an expression for the right-hand side
                        const exprNode = this.createNode(NodeType.NameReference, {
                            name: exprText
                        });
                        
                        // Add the expression to the variable declaration
                        varDeclNode.expression = exprNode;
                        exprNode.$container = varDeclNode;
                        exprNode.$containerProperty = 'expression';
                    }
                }
            }
            
            i++;
        }
        
        // Skip to the end of the variable declaration
        this.currentIndex = i - 1;
    }
    
    /**
     * Handle an expression statement.
     */
    private handleExpressionStatement(text: string): void {
        // Get the current node
        const currentNode = this.nodeStack[this.nodeStack.length - 1];
        
        // Create an expression statement node
        const exprStmtNode = this.createNode(NodeType.ExpressionStatement, {
            expression: this.createNode(NodeType.NameReference, {
                name: text
            })
        });
        
        // Set up the container for the expression
        exprStmtNode.expression.$container = exprStmtNode;
        exprStmtNode.expression.$containerProperty = 'expression';
        
        // Add the expression statement to the current node
        if (currentNode.statements) {
            exprStmtNode.$container = currentNode;
            exprStmtNode.$containerProperty = 'statements';
            exprStmtNode.$containerIndex = currentNode.statements.length;
            currentNode.statements.push(exprStmtNode);
        }
    }
    
    /**
     * Handle other tokens based on context.
     */
    private handleOtherToken(token: IToken): void {
        // For now, we'll just skip other tokens
        // In a real implementation, we would handle them based on context
    }
    
    /**
     * Create a new AST node.
     */
    private createNode(type: NodeType, properties: any = {}): any {
        return {
            $type: type,
            $container: undefined,
            $containerProperty: undefined,
            $containerIndex: undefined,
            $cstNode: undefined,
            ...properties
        };
    }
}
