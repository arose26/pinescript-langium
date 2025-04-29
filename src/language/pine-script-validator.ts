import { ValidationAcceptor, ValidationChecks } from 'langium';
import { PineScriptAstType, SimpleNameInitialization, FunctionDeclaration, NameReference } from './generated/ast.js';
import type { PineScriptServices } from './pine-script-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: PineScriptServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.PineScriptValidator;
    const checks: ValidationChecks<PineScriptAstType> = {
        SimpleNameInitialization: validator.checkVariableNaming,
        FunctionDeclaration: validator.checkFunctionNaming,
        NameReference: validator.checkNameReference
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class PineScriptValidator {

    checkVariableNaming(variable: SimpleNameInitialization, accept: ValidationAcceptor): void {
        if (variable.declaration.name.length === 0) {
            accept('error', 'Variable name must not be empty.', { node: variable.declaration, property: 'name' });
        } else if (!variable.declaration.name.match(/^[a-z][a-zA-Z0-9_]*$/)) {
            accept('warning', 'Variable name should start with a lowercase letter and contain only letters, numbers, and underscores.', { node: variable.declaration, property: 'name' });
        }
    }

    checkFunctionNaming(func: FunctionDeclaration, accept: ValidationAcceptor): void {
        if (func.name.length === 0) {
            accept('error', 'Function name must not be empty.', { node: func, property: 'name' });
        } else if (!func.name.match(/^[a-z][a-zA-Z0-9_]*$/)) {
            accept('warning', 'Function name should start with a lowercase letter and contain only letters, numbers, and underscores.', { node: func, property: 'name' });
        }
    }

    checkNameReference(ref: NameReference, accept: ValidationAcceptor): void {
        if (ref.name.length === 0) {
            accept('error', 'Reference name must not be empty.', { node: ref, property: 'name' });
        }
    }

}
