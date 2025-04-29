import type { StartScript } from '../language/generated/ast.js';
import { extractDestinationAndName } from './cli-util.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function generateJavaScript(script: StartScript, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileContent = `
        // This file was generated from ${data.name}${path.extname(filePath)}
        
        ${generateStatements(script)}
    `;

    fs.mkdirSync(data.destination, { recursive: true });
    fs.writeFileSync(generatedFilePath, fileContent);
    return generatedFilePath;
}

function generateStatements(script: StartScript): string {
    if (!script.statements) {
        return '';
    }
    
    return script.statements.statements.map(statement => {
        if (statement.$type === 'FunctionDeclaration') {
            const params = statement.parameters?.parameters.map((p: any) => p.name).join(', ') || '';
            const body = statement.body.$type === 'IndentedLocalBlock' 
                ? generateStatements({ $type: 'StartScript', statements: statement.body.statements } as StartScript)
                : generateStatement(statement.body.statement);
            return `function ${statement.name}(${params}) {
                ${body}
            }`;
        } else if (statement.$type === 'SimpleNameInitialization') {
            return `let ${statement.declaration.name} = ${generateExpression(statement.expression)};`;
        } else if (statement.$type === 'SimpleReassignment') {
            return `${generateAssignmentTarget(statement.target)} = ${generateExpression(statement.expression)};`;
        } else if (statement.$type === 'StructureStatement') {
            return generateStructure(statement.structure);
        } else if (statement.$type === 'ExpressionStatement') {
            return `${generateExpression(statement.expression)};`;
        }
        return `// Unsupported statement type: ${statement.$type}`;
    }).join('\n');
}

function generateStatement(statement: unknown): string {
    if (typeof statement === 'object' && statement !== null) {
        const typedStatement = statement as { $type: string };
        if (typedStatement.$type === 'SimpleNameInitialization') {
            const init = statement as { declaration: { name: string }, expression: unknown };
            return `let ${init.declaration.name} = ${generateExpression(init.expression)};`;
        } else if (typedStatement.$type === 'SimpleReassignment') {
            const reassign = statement as { target: unknown, expression: unknown };
            return `${generateAssignmentTarget(reassign.target)} = ${generateExpression(reassign.expression)};`;
        } else if (typedStatement.$type === 'StructureStatement') {
            const struct = statement as { structure: unknown };
            return generateStructure(struct.structure);
        } else if (typedStatement.$type === 'ExpressionStatement') {
            const expr = statement as { expression: unknown };
            return `${generateExpression(expr.expression)};`;
        }
    }
    return `// Unsupported statement type: ${typeof statement === 'object' ? (statement as any)?.$type : typeof statement}`;
}

function generateStructure(structure: unknown): string {
    if (typeof structure === 'object' && structure !== null) {
        const typedStructure = structure as { $type: string };
        if (typedStructure.$type === 'IfStructureElse') {
            const ifStruct = structure as { 
                condition: unknown, 
                thenBlock: { statements: unknown[] }, 
                elseBlock?: { block: { statements: unknown[] } } 
            };
            const thenBlock = ifStruct.thenBlock.statements.map((s: any) => generateStatement(s)).join('\n');
            const elseBlock = ifStruct.elseBlock 
                ? ifStruct.elseBlock.block.statements.map((s: any) => generateStatement(s)).join('\n')
                : '';
            return `if (${generateExpression(ifStruct.condition)}) {
                ${thenBlock}
            }${elseBlock ? ` else {
                ${elseBlock}
            }` : ''}`;
        } else if (typedStructure.$type === 'ForStructureTo') {
            const forStruct = structure as {
                iterator: unknown,
                start: unknown,
                end: unknown,
                step?: unknown,
                block: { statements: unknown[] }
            };
            const iterator = generateForIterator(forStruct.iterator);
            const block = forStruct.block.statements.map((s: any) => generateStatement(s)).join('\n');
            return `for (let ${iterator} = ${generateExpression(forStruct.start)}; ${iterator} <= ${generateExpression(forStruct.end)}; ${iterator} += ${forStruct.step ? generateExpression(forStruct.step) : '1'}) {
                ${block}
            }`;
        } else if (typedStructure.$type === 'WhileStructure') {
            const whileStruct = structure as {
                condition: unknown,
                block: { statements: unknown[] }
            };
            const block = whileStruct.block.statements.map((s: any) => generateStatement(s)).join('\n');
            return `while (${generateExpression(whileStruct.condition)}) {
                ${block}
            }`;
        }
    }
    return `// Unsupported structure type: ${typeof structure === 'object' ? (structure as any)?.$type : typeof structure}`;
}

function generateForIterator(iterator: unknown): string {
    if (typeof iterator === 'object' && iterator !== null) {
        const typedIterator = iterator as { $type?: string, name?: string };
        if (typedIterator.name) {
            return typedIterator.name;
        }
    }
    return 'i';
}

function generateAssignmentTarget(target: unknown): string {
    if (typeof target === 'object' && target !== null) {
        const typedTarget = target as { $type: string };
        if (typedTarget.$type === 'AssignmentTargetName') {
            return (target as { name: string }).name;
        } else if (typedTarget.$type === 'AssignmentTargetAttribute') {
            const attrTarget = target as { expression: unknown, name: string };
            return `${generateExpression(attrTarget.expression)}.${attrTarget.name}`;
        } else if (typedTarget.$type === 'AssignmentTargetSubscript') {
            const subTarget = target as { expression: unknown, slice: { expressions: unknown[] } };
            return `${generateExpression(subTarget.expression)}[${subTarget.slice.expressions.map(generateExpression).join(', ')}]`;
        } else if (typedTarget.$type === 'AssignmentTargetGroup') {
            const groupTarget = target as { target: unknown };
            return generateAssignmentTarget(groupTarget.target);
        }
    }
    return 'undefined';
}

function generateExpression(expression: unknown): string {
    if (typeof expression === 'object' && expression !== null) {
        const typedExpr = expression as { $type: string };
        if (typedExpr.$type === 'LiteralNumber') {
            return (expression as { value: number }).value.toString();
        } else if (typedExpr.$type === 'LiteralString') {
            return (expression as { value: string }).value;
        } else if (typedExpr.$type === 'LiteralBool') {
            return (expression as { value: boolean }).value ? 'true' : 'false';
        } else if (typedExpr.$type === 'LiteralColor') {
            return `"${(expression as { value: string }).value}"`;
        } else if (typedExpr.$type === 'NameReference') {
            return (expression as { name: string }).name;
        } else if (typedExpr.$type === 'BinaryExpression') {
            const binExpr = expression as { left: unknown, operator: string, right: unknown };
            return `${generateExpression(binExpr.left)} ${binExpr.operator} ${generateExpression(binExpr.right)}`;
        } else if (typedExpr.$type === 'UnaryExpression') {
            const unaryExpr = expression as { operator: string, operand: unknown };
            return `${unaryExpr.operator}${generateExpression(unaryExpr.operand)}`;
        } else if (typedExpr.$type === 'GroupedExpression') {
            const groupExpr = expression as { expression: unknown };
            return `(${generateExpression(groupExpr.expression)})`;
        } else if (typedExpr.$type === 'ArrayExpression') {
            const arrayExpr = expression as { elements?: unknown[] };
            if (!arrayExpr.elements || arrayExpr.elements.length === 0) {
                return '[]';
            }
            const elements = arrayExpr.elements.map(element => generateExpression(element)).join(', ');
            return `[${elements}]`;
        } else if (typedExpr.$type === 'PrimaryExpressionCall') {
            const callExpr = expression as { expression: unknown, arguments?: { arguments: unknown[] } };
            const args = callExpr.arguments?.arguments.map(arg => {
                const argDef = arg as { expression: unknown };
                return generateExpression(argDef.expression);
            }).join(', ') || '';
            return `${generateExpression(callExpr.expression)}(${args})`;
        } else if (typedExpr.$type === 'PrimaryExpressionSubscript') {
            const subscriptExpr = expression as { expression: unknown, slice: { expressions: unknown[] } };
            const index = subscriptExpr.slice.expressions.map(expr => generateExpression(expr)).join(', ');
            return `${generateExpression(subscriptExpr.expression)}[${index}]`;
        } else if (typedExpr.$type === 'InequalityExpressionRule') {
            const ineqExpr = expression as { left: unknown, pairs: { $type: string, right: unknown }[] };
            if (ineqExpr.pairs.length === 1) {
                const pair = ineqExpr.pairs[0];
                let operator = '';
                if (pair.$type === 'LessThanTrailingPair') {
                    operator = '<';
                } else if (pair.$type === 'LessThanEqualTrailingPair') {
                    operator = '<=';
                } else if (pair.$type === 'GreaterThanTrailingPair') {
                    operator = '>';
                } else if (pair.$type === 'GreaterThanEqualTrailingPair') {
                    operator = '>=';
                }
                return `${generateExpression(ineqExpr.left)} ${operator} ${generateExpression(pair.right)}`;
            }
        } else if (typedExpr.$type === 'EqualityExpressionRule') {
            const eqExpr = expression as { left: unknown, pairs: { $type: string, right: unknown }[] };
            if (eqExpr.pairs.length === 1) {
                const pair = eqExpr.pairs[0];
                let operator = '';
                if (pair.$type === 'EqualTrailingPair') {
                    operator = '===';
                } else if (pair.$type === 'NotEqualTrailingPair') {
                    operator = '!==';
                }
                return `${generateExpression(eqExpr.left)} ${operator} ${generateExpression(pair.right)}`;
            }
        }
    }
    return 'undefined';
}
