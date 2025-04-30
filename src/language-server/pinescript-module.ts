import { createDefaultCoreModule, createDefaultSharedCoreModule, DefaultSharedCoreModuleContext, Module, inject, LangiumDocument } from 'langium';
import { IndentationAwareTokenBuilder, IndentationAwareLexer, LangiumCoreServices, LangiumSharedCoreServices, PartialLangiumCoreServices } from 'langium';
import { PinescriptGeneratedModule } from './generated/module.js';
import { parseImports, ImportStatement } from './import-parser.js';
import { StartScript } from './generated/ast.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type PinescriptAddedServices = {
    // Add your custom services here
    importParser: {
        parseImports: (document: LangiumDocument) => ImportStatement[];
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type PinescriptServices = LangiumCoreServices & PinescriptAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services.
 */
export const PinescriptModule: Module<PinescriptServices, PartialLangiumCoreServices & PinescriptAddedServices> = {
    parser: {
        TokenBuilder: () => new IndentationAwareTokenBuilder({
            // Configure the indentation-aware token builder
            indentTokenName: 'INDENT',
            dedentTokenName: 'DEDENT',
            whitespaceTokenName: 'WS',
            // Ignore indentation inside parentheses and brackets
            ignoreIndentationDelimiters: [
                ['LPAR', 'RPAR'],
                ['LSQB', 'RSQB']
            ]
        }),
        Lexer: (services) => new IndentationAwareLexer(services)
    },
    importParser: {
        parseImports: (document: LangiumDocument) => parseImports(document as LangiumDocument<StartScript>)
    }
};

/**
 * Create the full set of services required by Langium.
 */
export function createPinescriptServices(context: DefaultSharedCoreModuleContext): {
    shared: LangiumSharedCoreServices,
    Pinescript: PinescriptServices
} {
    // Create the shared services
    const sharedServices = createDefaultSharedCoreModule(context);

    // Create the Pinescript services by merging generated services with custom services
    const coreServices = createDefaultCoreModule({
        shared: sharedServices as LangiumSharedCoreServices
    });

    // Apply the generated module and custom module
    const Pinescript = inject(
        coreServices,
        PinescriptGeneratedModule,
        PinescriptModule
    ) as unknown as PinescriptServices;

    return {
        shared: sharedServices as LangiumSharedCoreServices,
        Pinescript
    };
}
