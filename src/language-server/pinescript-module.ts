import { createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext } from 'langium/lib/default-module';
import { PinescriptTokenBuilder } from './token-builder';
import { LangiumServices, LangiumSharedServices } from 'langium';

/**
 * Create the full set of services required by Langium.
 */
export function createPinescriptServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Pinescript: LangiumServices
} {
    // Create the shared services
    const shared = createDefaultSharedModule(context) as LangiumSharedServices;

    // Create the Pinescript services
    const Pinescript = createDefaultModule({
        shared: shared as any
    }) as LangiumServices;

    return { shared, Pinescript };
}
