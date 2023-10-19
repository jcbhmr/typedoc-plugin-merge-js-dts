import { Application, Converter, Context, DeclarationReflection, Reflection } from 'typedoc';

/**
 * @param {Application} app
 */
export function load(app) {
    /** @type {string[]} */
    const dts = []
    /**
     * @param {Context} context 
     * @param {DeclarationReflection} reflection
     */
    function handleCreateDeclaration(context, reflection) {
        if (!reflection.sources?.length) {
            return
        }
        const { fileName } = reflection.sources[0]
        if (/\.d\.(m|c)?ts$/.test(fileName)) {
            dts.push(fileName)
        }
    }
    /**
     * @param {Context} context 
     */
    function handleEnd(context) {
        context.project.children = context.project.children.filter(child => {
            if (child.sources) {
                // Keep ONLY IF all the source files DON'T have a '.d.ts' counterpart.
                return child.sources.every(source => {
                    if (/\.(m|c)?js$/.test(source.fileName)) {
                        const dtsName = source.fileName.replace(/\.(m|c)?js$/, ".d.$1ts")
                        return dts.includes(dtsName)
                    } else {
                        return true
                    }
                })
            } else {
                return true
            }
        });
    }
  app.converter.on(Converter.EVENT_CREATE_DECLARATION, handleCreateDeclaration);
  app.converter.on(Converter.EVENT_END, handleEnd);
}
