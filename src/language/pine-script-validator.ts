import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { PineScriptAstType, FunctionDeclaration, VariableDeclaration } from './generated/ast.js';
import type { PineScriptServices } from './pine-script-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: PineScriptServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.PineScriptValidator;
    const checks: ValidationChecks<PineScriptAstType> = {
        FunctionDeclaration: validator.checkFunctionDeclaration,
        VariableDeclaration: validator.checkVariableDeclaration
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class PineScriptValidator {

    checkFunctionDeclaration(func: FunctionDeclaration, accept: ValidationAcceptor): void {
        if (func.name) {
            const firstChar = func.name.substring(0, 1);
            if (firstChar.toLowerCase() !== firstChar) {
                accept('warning', 'Function names should start with a lowercase letter.', { node: func, property: 'name' });
            }
        }
    }

    checkVariableDeclaration(variable: VariableDeclaration, accept: ValidationAcceptor): void {
        if (variable.name) {
            const firstChar = variable.name.substring(0, 1);
            if (firstChar.toLowerCase() !== firstChar) {
                accept('warning', 'Variable names should start with a lowercase letter.', { node: variable, property: 'name' });
            }
        }
    }

}
