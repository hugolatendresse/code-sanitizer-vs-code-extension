// const Parser = require('tree-sitter');
// const Python = require('tree-sitter-python');
//
// const parser = new Parser();
// parser.setLanguage(Python);


const {Tree, Point, TreeCursor} = require("tree-sitter");



// Define a function to check, given a node, if it has 3 children, the right one is an identifer, and the middle one is a dot
function isParentOfCall(node) {
    let out = node.children.length === 3 && node.children[1].text === '.' && node.children[2].type === 'identifier'
    return out
}

const Parser = require('tree-sitter');
const Python = require('tree-sitter-python');


function findAllKeywordsInQuery(query, keyWords) {
  const parser = new Parser();
  parser.setLanguage(Python);
  const tree = parser.parse(query);
  return findAllKeywordsInTree(tree, keyWords);
}

// Check all parents that have 3 children, two are identifiers, and the middle one is a dot. If the first identier starts with a keyword, then the second identifier is a keyword
// First param is the tree
function findAllKeywordsInTree(tree, keyWords) {
    const result = [];
    let visitedChildren = false;
    let cursor = tree.walk();
    while (true) {
        if (!visitedChildren) {
            // result.push(cursor.currentNode);
            if (isParentOfCall(cursor.currentNode)) {
                const firstIdentifier = cursor.currentNode.children[0].text;
                // Check if first identifier is a keyword, that is, if it's in the following list ["pd", "np", "os", "plt", "deepcopy"]
                if (keyWords.some(keyword => firstIdentifier.startsWith(keyword))) {
                    const secondIdentifier = cursor.currentNode.children[2].text;
                    result.push(secondIdentifier);
                }
            }
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
  findAllKeywordsInQuery,
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
