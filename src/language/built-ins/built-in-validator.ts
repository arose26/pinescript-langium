import { ValidationAcceptor } from 'langium';
import { PrimaryExpressionCall, NameReference } from '../generated/ast.js';
import { findBuiltInFunction } from './built-in-functions.js';

/**
 * Validates built-in function calls
 */
export class BuiltInValidator {

    /**
     * Validates a function call to ensure it matches the built-in function signature
     */
    validateBuiltInFunctionCall(call: PrimaryExpressionCall, accept: ValidationAcceptor): void {
        // Check if this is a call to a built-in function
        const expression = call.expression;
        if (!expression || !this.isBuiltInFunctionReference(expression)) {
            return;
        }

        // Get the namespace and function name
        const nameRef = expression as NameReference;
        const qualifiedName = nameRef.name;

        if (qualifiedName.parts.length !== 2) {
            return; // Not a namespaced function call
        }

        const namespace = qualifiedName.parts[0];
        const functionName = qualifiedName.parts[1];

        // Find the built-in function
        const builtInFunction = findBuiltInFunction(namespace, functionName);
        if (!builtInFunction) {
            accept('warning', `Unknown built-in function: ${namespace}.${functionName}`, { node: call });
            return;
        }

        // Validate the number of arguments
        const args = call.arguments?.arguments || [];
        const requiredParams = builtInFunction.parameters.filter(p => !p.optional);

        if (args.length < requiredParams.length) {
            accept('error',
                `Function ${namespace}.${functionName} requires at least ${requiredParams.length} arguments, but got ${args.length}`,
                { node: call });
        } else if (args.length > builtInFunction.parameters.length) {
            accept('warning',
                `Function ${namespace}.${functionName} expects ${builtInFunction.parameters.length} arguments, but got ${args.length}`,
                { node: call });
        }

        // Validate named arguments
        for (let i = 0; i < args.length && i < builtInFunction.parameters.length; i++) {
            const arg = args[i];
            if (arg.name && arg.name !== builtInFunction.parameters[i].name) {
                // Check if the named argument exists in the function parameters
                const paramIndex = builtInFunction.parameters.findIndex(p => p.name === arg.name);
                if (paramIndex === -1) {
                    accept('error',
                        `Unknown parameter name: ${arg.name} for function ${namespace}.${functionName}`,
                        { node: arg });
                }
            }
        }
    }

    /**
     * Checks if an expression is a reference to a built-in function
     */
    private isBuiltInFunctionReference(expression: any): boolean {
        return expression.$type === 'NameReference' &&
               expression.name &&
               expression.name.$type === 'QualifiedName' &&
               expression.name.parts &&
               expression.name.parts.length === 2;
    }
}
