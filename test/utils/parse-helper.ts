import { EmptyFileSystem, createDefaultSharedModule, createDefaultModule, DefaultSharedModuleContext, inject } from 'langium';
import { PineScriptGeneratedModule, PineScriptGeneratedSharedModule } from '../../src/language/generated/module';
import { StartScript } from '../../src/language/generated/ast';
import { parseDocument, DefaultDocumentFactory } from 'langium';
import { PineScriptLanguageMetaData } from '../../src/language/pine-script-module';

/**
 * Helper function for parsing text in tests
 */
export function parseHelper() {
    // Create services
    const context: DefaultSharedModuleContext = {
        fileSystemProvider: () => EmptyFileSystem
    };
    const sharedModule = inject(
        createDefaultSharedModule(context),
        PineScriptGeneratedSharedModule
    );
    const module = inject(
        createDefaultModule({ shared: sharedModule }),
        PineScriptGeneratedModule
    );

    // Get document factory
    const documentFactory = new DefaultDocumentFactory(module.workspace.LangiumDocuments, module.workspace.LangiumDocumentFactory);

    return async (text: string) => {
        const document = documentFactory.fromString(text, PineScriptLanguageMetaData.fileExtensions[0]);
        const result = await parseDocument(document);
        return {
            document,
            value: result.value as StartScript,
            parserErrors: result.parserErrors,
            lexerErrors: result.lexerErrors
        };
    };
}
