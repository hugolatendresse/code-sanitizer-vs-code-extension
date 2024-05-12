const {Tree, Point, TreeCursor} = require("tree-sitter");
const Parser = require('tree-sitter');
const Python = require('tree-sitter-python');


/*
Looking for `caller.callee` pattern
Check if nodes has 3 children, the right one is an identifer, and the middle one is a dot
*/
function isParentOfCall(node, keyWords) {
    try {
        let callCondition = node.children.length === 3 && node.children[1].text === '.' && node.children[2].type === 'identifier';
        const firstIdentifier = node.children[0].text;
        let libraryCond = keyWords.some(keyword => firstIdentifier.startsWith(keyword));
        return callCondition && libraryCond;
    } catch (error) {
        return false;
    }
}

/*
Looking for `library...method(..., keyword1=sanitize1, ...)` pattern
This function allowing finding keywords in methods that belong to a library
nodes of type 'keyword_argument' have text such as 'keyword6=sanitize1'. call it y
the child of y contianing "keyword6" will have type identifier, call it x
y.parent is just an argument_list (can't conclude anything from the other arguments)
z=y.parent.parent is of type call and the left part can be checked for being a keyword!
Will the left part of z ALWAYS be a library name? Yes! I checked
*/
function isKeywordArgumentOfMethodFromLibrary(node, keyWords) {
    try {
        let libraryCond = keyWords.some(keyword => node.parent.parent.text.startsWith(keyword));
        let keywordCond = node.type === 'keyword_argument' && node.children[0].type === 'identifier' && node.parent.parent.type === 'call';
        return libraryCond && keywordCond;
    } catch (error) {
        return false;
    }
}



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

            // Add different types of keywords
            if (isParentOfCall(cursor.currentNode, keyWords)) {
                // Add method calls following a '.'
                const secondIdentifier = cursor.currentNode.children[2].text;
                result.push(secondIdentifier);
            } else if (isKeywordArgumentOfMethodFromLibrary(cursor.currentNode, keyWords)) {
                // Add keywords of arguments in function calls
                const keyword = cursor.currentNode.children[0].text;
                result.push(keyword);
            }

            // Continue walking the tree
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
  findAllKeywordsInTree,
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
