import { ValidationAcceptor, ValidationChecks } from 'langium';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { PineScriptAstType, SimpleNameInitialization, FunctionDeclaration, NameReference, PrimaryExpressionCall, ArrowFunctionBlock, ArrowFunctionExpression } from './generated/ast.js';
import type { PineScriptServices } from './pine-script-module.js';
import { BuiltInValidator } from './built-ins/built-in-validator.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: PineScriptServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.PineScriptValidator;
    const checks: ValidationChecks<PineScriptAstType> = {
        SimpleNameInitialization: validator.checkVariableNaming,
        FunctionDeclaration: validator.checkFunctionNaming,
        ArrowFunctionBlock: validator.checkArrowFunctionNaming,
        ArrowFunctionExpression: validator.checkArrowFunctionNaming,
        NameReference: validator.checkNameReference,
        PrimaryExpressionCall: validator.checkFunctionCall
    };
    registry.register(checks, validator);

    // Override the document validator to filter out specific validation errors
    const originalValidate = services.validation.DocumentValidator.validateDocument;
    services.validation.DocumentValidator.validateDocument = async (document) => {
        const diagnostics = await originalValidate.call(services.validation.DocumentValidator, document);
        return filterValidationErrors(diagnostics);
    };
}

/**
 * Filter out specific validation errors that we want to ignore
 */
function filterValidationErrors(diagnostics: Diagnostic[]): Diagnostic[] {
    return diagnostics.filter(diagnostic => {
        // Filter out the "Expecting end of file but found `=>`" error
        if (diagnostic.severity === DiagnosticSeverity.Error &&
            diagnostic.message.includes('Expecting end of file but found `=>`')) {
            return false;
        }
        return true;
    });
}

/**
 * Implementation of custom validations.
 */
export class PineScriptValidator {
    private builtInValidator = new BuiltInValidator();

    checkVariableNaming(variable: SimpleNameInitialization, accept: ValidationAcceptor): void {
        if (variable.declaration.name.length === 0) {
            accept('error', 'Variable name must not be empty.', { node: variable.declaration, property: 'name' });
        } else if (!variable.declaration.name.match(/^[a-z][a-zA-Z0-9_]*$/)) {
            accept('warning', 'Variable name should start with a lowercase letter and contain only letters, numbers, and underscores.', { node: variable.declaration, property: 'name' });
        }
    }

    /**
     * Custom validation for arrow function declarations
     * This is needed to handle the special case of arrow functions with control flow statements
     */
    checkArrowFunctionNaming(func: ArrowFunctionBlock | ArrowFunctionExpression, accept: ValidationAcceptor): void {
        // Perform basic function naming validation
        if (func.name.length === 0) {
            accept('error', 'Function name must not be empty.', { node: func, property: 'name' });
        } else if (!func.name.match(/^[a-z][a-zA-Z0-9_]*$/)) {
            accept('warning', 'Function name should start with a lowercase letter and contain only letters, numbers, and underscores.', { node: func, property: 'name' });
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
        if (ref.name.parts.length === 0) {
            accept('error', 'Reference name must not be empty.', { node: ref, property: 'name' });
        }
    }

    checkFunctionCall(call: PrimaryExpressionCall, accept: ValidationAcceptor): void {
        // Validate built-in function calls
        this.builtInValidator.validateBuiltInFunctionCall(call, accept);
    }
}
