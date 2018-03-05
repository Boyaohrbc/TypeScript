/* @internal */
namespace ts {
    export function computeSuggestionDiagnostics(sourceFile: SourceFile, program: Program): Diagnostic[] {
        program.getSemanticDiagnostics(sourceFile);
        const checker = program.getDiagnosticsProducingTypeChecker();
        const diags: Diagnostic[] = [];

        if (sourceFile.commonJsModuleIndicator) {
            diags.push(createDiagnosticForNode(sourceFile.commonJsModuleIndicator, Diagnostics.File_is_a_CommonJS_module_it_may_be_converted_to_an_ES6_module));
        }

        function check(node: Node) {
            switch (node.kind) {
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                    if (isInJavaScriptFile(node)) {
                        const symbol = node.symbol;
                        if (symbol.members && (symbol.members.size > 0)) {
                            diags.push(createDiagnosticForNode(isVariableDeclaration(node.parent) ? node.parent.name : node, Diagnostics.This_constructor_function_may_be_converted_to_a_class_declaration));
                        }
                    }
                    break;
            }

            if (!isInJavaScriptFile(node) && codefix.parameterShouldGetTypeFromJSDoc(node)) {
                diags.push(createDiagnosticForNode(node.name || node, Diagnostics.JSDoc_types_may_be_moved_to_TypeScript_types));
            }

            node.forEachChild(check);
        }
        check(sourceFile);

        return diags.concat(checker.getSuggestionDiagnostics(sourceFile));
    }
}
