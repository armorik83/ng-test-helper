import * as ts from 'typescript'
import { isConstructor, isTypeReference } from './type-guards'
import { TextRangeTuple } from './main'
import { AbstractDetector } from './abstract-detector'

export class ConstructorParameterDetector extends AbstractDetector {

  private injectClassNames = [] as string[]

  constructor(
    private sourceFile: ts.SourceFile,
    private detectedRanges: TextRangeTuple[],
  ) {
    super()
    console.assert(0 < this.detectedRanges.length)
  }

  detect(): string[] {
    ts.forEachChild(this.sourceFile, _node => this.visit(_node))
    return this.injectClassNames
  }

  private visit(node: ts.Node) {
    if (isConstructor(node)) {
      const inInRange = this.detectedRanges.some(range => this.isInRange(range, [node.pos, node.end]))
      if (!inInRange) {
        return
      }

      Array.from(node.parameters).forEach(paramNode => {
        ts.forEachChild(paramNode, _node => this.visitParameters(_node))
      })
    }
    ts.forEachChild(node, _node => this.visit(_node))
  }

  private visitParameters(node: ts.Node) {
    if (isTypeReference(node)) {
      const injectClassName = (node.typeName as ts.Identifier).text
      this.injectClassNames.push(injectClassName)
    }
  }

}