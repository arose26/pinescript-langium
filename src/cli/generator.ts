import type { StartScript } from '../language/generated/ast.js';
import { extractDestinationAndName } from './cli-util.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function generateJavaScript(script: StartScript, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    // Read the runtime library files
    const runtimeDir = path.join(path.dirname(path.dirname(__dirname)), 'src', 'runtime');
    const arrayFunctionsPath = path.join(runtimeDir, 'array-functions.js');

    // Create the runtime library content
    const runtimeContent = `
        // This file was generated from ${data.name}${path.extname(filePath)}

        // PineScript runtime library

        // Array namespace and functions
        const array = {
            // Array creation functions
            new_float: function(size = 0, initialValue = 0.0) {
                return new Array(size).fill(initialValue);
            },
            new_int: function(size = 0, initialValue = 0) {
                return new Array(size).fill(initialValue);
            },
            new_bool: function(size = 0, initialValue = false) {
                return new Array(size).fill(initialValue);
            },
            new_string: function(size = 0, initialValue = '') {
                return new Array(size).fill(initialValue);
            },

            // Array manipulation functions
            push: function(arr, value) {
                arr.push(value);
                return arr;
            },
            pop: function(arr) {
                if (arr.length === 0) {
                    return null;
                }
                return arr.pop();
            },
            get: function(arr, index) {
                if (index < 0 || index >= arr.length) {
                    return null;
                }
                return arr[index];
            },
            set: function(arr, index, value) {
                if (index < 0 || index >= arr.length) {
                    return arr;
                }
                arr[index] = value;
                return arr;
            },
            size: function(arr) {
                return arr.length;
            },
            insert: function(arr, index, value) {
                if (index < 0 || index > arr.length) {
                    return arr;
                }
                arr.splice(index, 0, value);
                return arr;
            },
            remove: function(arr, index) {
                if (index < 0 || index >= arr.length) {
                    return arr;
                }
                arr.splice(index, 1);
                return arr;
            },
            clear: function(arr) {
                arr.length = 0;
                return arr;
            },
            copy: function(arr) {
                return [...arr];
            },
            slice: function(arr, start, end) {
                return arr.slice(start, end);
            },
            fill: function(arr, value, size) {
                arr.length = 0;
                for (let i = 0; i < size; i++) {
                    arr.push(value);
                }
                return arr;
            }
        };

        // Array methods for convenience
        Array.prototype.size = function() { return this.length; };
        Array.prototype.push_back = function(value) { this.push(value); return this; };
        Array.prototype.pop_back = function() { return this.pop(); };
        Array.prototype.insert = function(index, value) { this.splice(index, 0, value); return this; };
        Array.prototype.remove = function(index) { this.splice(index, 1); return this; };
        Array.prototype.clear = function() { this.length = 0; return this; };
        Array.prototype.fill = function(value, size) {
            this.length = 0;
            for (let i = 0; i < size; i++) {
                this.push(value);
            }
            return this;
        };
        Array.prototype.copy = function() { return [...this]; };
        Array.prototype.slice = function(start, end) { return Array.prototype.slice.call(this, start, end); };
        Array.prototype.sort = function() { return Array.prototype.sort.call(this); };
        Array.prototype.reverse = function() { return Array.prototype.reverse.call(this); };
        Array.prototype.join = function(separator) { return Array.prototype.join.call(this, separator); };
        Array.prototype.indexOf = function(value) { return Array.prototype.indexOf.call(this, value); };
        Array.prototype.includes = function(value) { return Array.prototype.includes.call(this, value); };
        Array.prototype.forEach = function(callback) { return Array.prototype.forEach.call(this, callback); };
        Array.prototype.map = function(callback) { return Array.prototype.map.call(this, callback); };
        Array.prototype.filter = function(callback) { return Array.prototype.filter.call(this, callback); };
        Array.prototype.reduce = function(callback, initialValue) { return Array.prototype.reduce.call(this, callback, initialValue); };
        Array.prototype.some = function(callback) { return Array.prototype.some.call(this, callback); };
        Array.prototype.every = function(callback) { return Array.prototype.every.call(this, callback); };
        Array.prototype.find = function(callback) { return Array.prototype.find.call(this, callback); };
        Array.prototype.findIndex = function(callback) { return Array.prototype.findIndex.call(this, callback); };

        // Math namespace
        const math = {
            max: Math.max,
            min: Math.min,
            abs: Math.abs,
            sqrt: Math.sqrt,
            pow: Math.pow,
            round: Math.round,
            floor: Math.floor,
            ceil: Math.ceil,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            log: Math.log,
            exp: Math.exp,
            random: Math.random,
            sum: function(arr) {
                return arr.reduce((a, b) => a + b, 0);
            }
        };

        // Matrix namespace for PCA calculations
        const matrix = {
            // Create a matrix (2D array)
            new: function(rows, cols, initialValue = 0) {
                return Array(rows).fill().map(() => Array(cols).fill(initialValue));
            },

            // Get the number of rows in a matrix
            rows: function(matrix) {
                return matrix.length;
            },

            // Get the number of columns in a matrix
            cols: function(matrix) {
                if (matrix.length === 0) return 0;
                return matrix[0].length;
            },

            // Get a value from a matrix
            get: function(matrix, row, col) {
                if (row < 0 || row >= matrix.length || col < 0 || col >= matrix[0].length) {
                    return null;
                }
                return matrix[row][col];
            },

            // Set a value in a matrix
            set: function(matrix, row, col, value) {
                if (row < 0 || row >= matrix.length || col < 0 || col >= matrix[0].length) {
                    return matrix;
                }
                matrix[row][col] = value;
                return matrix;
            },

            // Matrix transpose
            transpose: function(matrix) {
                if (matrix.length === 0) return [];

                const rows = matrix.length;
                const cols = matrix[0].length;
                const result = Array(cols).fill().map(() => Array(rows).fill(0));

                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        result[j][i] = matrix[i][j];
                    }
                }

                return result;
            },

            // Matrix multiplication
            multiply: function(matrixA, matrixB) {
                if (matrixA.length === 0 || matrixB.length === 0) return [];

                const rowsA = matrixA.length;
                const colsA = matrixA[0].length;
                const rowsB = matrixB.length;
                const colsB = matrixB[0].length;

                if (colsA !== rowsB) {
                    throw new Error('Matrix dimensions do not match for multiplication');
                }

                const result = Array(rowsA).fill().map(() => Array(colsB).fill(0));

                for (let i = 0; i < rowsA; i++) {
                    for (let j = 0; j < colsB; j++) {
                        let sum = 0;
                        for (let k = 0; k < colsA; k++) {
                            sum += matrixA[i][k] * matrixB[k][j];
                        }
                        result[i][j] = sum;
                    }
                }

                return result;
            },

            // Principal Component Analysis (PCA)
            pca: function(data, components = null) {
                // Implementation of PCA algorithm
                // This is a simplified version for demonstration
                // For a real implementation, use a proper linear algebra library

                if (data.length === 0) return { transformed: [], components: [], explained_variance: [] };

                const rows = data.length;
                const cols = data[0].length;

                // Center the data (subtract mean from each column)
                const means = Array(cols).fill(0);
                for (let j = 0; j < cols; j++) {
                    for (let i = 0; i < rows; i++) {
                        means[j] += data[i][j];
                    }
                    means[j] /= rows;
                }

                const centered = Array(rows).fill().map(() => Array(cols).fill(0));
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        centered[i][j] = data[i][j] - means[j];
                    }
                }

                // For a real implementation, calculate covariance matrix,
                // eigenvalues, eigenvectors, and project data

                // Return a placeholder result
                return {
                    transformed: centered,
                    components: Array(cols).fill().map(() => Array(cols).fill(0)),
                    explained_variance: Array(cols).fill(1/cols)
                };
            }
        };

        // User code
        ${generateStatements(script)}
    `;

    fs.mkdirSync(data.destination, { recursive: true });
    fs.writeFileSync(generatedFilePath, runtimeContent);
    return generatedFilePath;
}

function generateStatements(script: StartScript): string {
    if (!script.statements) {
        return '';
    }

    return script.statements.statements.map(statement => {
        if (statement.$type === 'FunctionDeclaration') {
            const params = statement.parameters?.parameters.map((p: any) => p.name).join(', ') || '';
            let body = '';
            // Handle different function types based on the AST node type
            const nodeType = (statement as any).$type;
            if (nodeType === 'ArrowFunctionExpression') {
                // Arrow function with simple expression
                body = `return ${generateExpression((statement as any).returnExpr)};`;
            }
            else if (nodeType === 'ArrowFunctionBlock' || nodeType === 'RegularFunction') {
                // Arrow function with block or regular function
                const bodyObj = (statement as any).body;
                if (bodyObj) {
                    if (bodyObj.$type === 'IndentedLocalBlock' && bodyObj.statements) {
                        body = generateStatements({ $type: 'StartScript', statements: bodyObj.statements } as StartScript);
                    } else if (bodyObj.$type === 'InlineLocalBlock' && bodyObj.statement) {
                        body = generateStatement(bodyObj.statement);
                    } else if (bodyObj.statements) {
                        // It's a Statements object
                        body = generateStatements({ $type: 'StartScript', statements: bodyObj } as StartScript);
                    }
                }
            }
            else {
                // Handle legacy function types (for backward compatibility)
                if ((statement as any).returnExpr) {
                    body = `return ${generateExpression((statement as any).returnExpr)};`;
                } else if ((statement as any).body) {
                    const legacyBody = (statement as any).body;
                    if (legacyBody.$type === 'IndentedLocalBlock' && legacyBody.statements) {
                        body = generateStatements({ $type: 'StartScript', statements: legacyBody.statements } as StartScript);
                    } else if (legacyBody.$type === 'InlineLocalBlock' && legacyBody.statement) {
                        body = generateStatement(legacyBody.statement);
                    } else if (legacyBody.statements) {
                        // It's a Statements object
                        body = generateStatements({ $type: 'StartScript', statements: legacyBody } as StartScript);
                    }
                }
            }
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
        } else if (typedStructure.$type === 'ForStructureIn') {
            const forStruct = structure as {
                iterator: unknown,
                collection: unknown,
                block: { statements: unknown[] }
            };
            const iterator = generateForIterator(forStruct.iterator);
            const block = forStruct.block.statements.map((s: any) => generateStatement(s)).join('\n');
            return `for (const ${iterator} of ${generateExpression(forStruct.collection)}) {
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
        } else if (typedExpr.$type === 'PrimaryExpressionAttribute') {
            const attrExpr = expression as { expression: unknown, attribute: string };
            // Handle array methods and properties
            const expr = generateExpression(attrExpr.expression);
            const attr = attrExpr.attribute;

            // Map PineScript array methods to JavaScript
            if (attr === 'size') {
                return `${expr}.size()`;
            } else if (attr === 'push_back') {
                return `${expr}.push_back`;
            } else if (attr === 'pop_back') {
                return `${expr}.pop_back`;
            } else if (attr === 'insert') {
                return `${expr}.insert`;
            } else if (attr === 'remove') {
                return `${expr}.remove`;
            } else if (attr === 'clear') {
                return `${expr}.clear`;
            } else if (attr === 'fill') {
                return `${expr}.fill`;
            } else if (attr === 'copy') {
                return `${expr}.copy`;
            } else if (attr === 'slice') {
                return `${expr}.slice`;
            } else if (attr === 'sort') {
                return `${expr}.sort`;
            } else if (attr === 'reverse') {
                return `${expr}.reverse`;
            } else if (attr === 'join') {
                return `${expr}.join`;
            } else if (attr === 'indexOf') {
                return `${expr}.indexOf`;
            } else if (attr === 'includes') {
                return `${expr}.includes`;
            } else if (attr === 'forEach') {
                return `${expr}.forEach`;
            } else if (attr === 'map') {
                return `${expr}.map`;
            } else if (attr === 'filter') {
                return `${expr}.filter`;
            } else if (attr === 'reduce') {
                return `${expr}.reduce`;
            } else if (attr === 'some') {
                return `${expr}.some`;
            } else if (attr === 'every') {
                return `${expr}.every`;
            } else if (attr === 'find') {
                return `${expr}.find`;
            } else if (attr === 'findIndex') {
                return `${expr}.findIndex`;
            } else {
                return `${expr}.${attr}`;
            }
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
