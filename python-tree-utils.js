// const Parser = require('tree-sitter');
// const Python = require('tree-sitter-python');
//
// const parser = new Parser();
// parser.setLanguage(Python);


const {Tree, Point, TreeCursor} = require("tree-sitter");

function getAllNodes(tree) {
  const result = [];
  let visitedChildren = false;
  let cursor = tree.walk();
  while (true) {
    if (!visitedChildren) {
      result.push(cursor.currentNode);
      if (!cursor.gotoFirstChild()) {
        visitedChildren = true;
      }
    } else if (cursor.gotoNextSibling()) {
      visitedChildren = false;
    } else if (!cursor.gotoParent()) {
      break;
    }
  }
  return result;
}

module.exports = {
  getAllNodes
}



// Interface of SyntaxNode:
//     export interface SyntaxNode {
//       tree: Tree;
//       id: number;
//       typeId: number;
//       grammarId: number;
//       type: string;
//       grammarType: string;
//       isNamed: boolean;
//       isMissing: boolean;
//       isExtra: boolean;
//       hasChanges: boolean;
//       hasError: boolean;
//       isError: boolean;
//       text: string;
//       parseState: number;
//       nextParseState: number;
//       startPosition: Point;
//       endPosition: Point;
//       startIndex: number;
//       endIndex: number;
//       parent: SyntaxNode | null;
//       children: Array<SyntaxNode>;
//       namedChildren: Array<SyntaxNode>;
//       childCount: number;
//       namedChildCount: number;
//       firstChild: SyntaxNode | null;
//       firstNamedChild: SyntaxNode | null;
//       lastChild: SyntaxNode | null;
//       lastNamedChild: SyntaxNode | null;
//       nextSibling: SyntaxNode | null;
//       nextNamedSibling: SyntaxNode | null;
//       previousSibling: SyntaxNode | null;
//       previousNamedSibling: SyntaxNode | null;
//       descendantCount: number;
//
//       toString(): string;
//       child(index: number): SyntaxNode | null;
//       namedChild(index: number): SyntaxNode | null;
//       childForFieldName(fieldName: string): SyntaxNode | null;
//       childForFieldId(fieldId: number): SyntaxNode | null;
//       fieldNameForChild(childIndex: number): string | null;
//       childrenForFieldName(fieldName: string): Array<SyntaxNode>;
//       childrenForFieldId(fieldId: number): Array<SyntaxNode>;
//       firstChildForIndex(index: number): SyntaxNode | null;
//       firstNamedChildForIndex(index: number): SyntaxNode | null;
//
//       descendantForIndex(index: number): SyntaxNode;
//       descendantForIndex(startIndex: number, endIndex: number): SyntaxNode;
//       namedDescendantForIndex(index: number): SyntaxNode;
//       namedDescendantForIndex(startIndex: number, endIndex: number): SyntaxNode;
//       descendantForPosition(position: Point): SyntaxNode;
//       descendantForPosition(startPosition: Point, endPosition: Point): SyntaxNode;
//       namedDescendantForPosition(position: Point): SyntaxNode;
//       namedDescendantForPosition(startPosition: Point, endPosition: Point): SyntaxNode;
//       descendantsOfType(types: String | Array<String>, startPosition?: Point, endPosition?: Point): Array<SyntaxNode>;
//
//       closest(types: String | Array<String>): SyntaxNode | null;
//       walk(): TreeCursor;
//     }
