// docs for tree-sitter: https://tree-sitter.github.io/tree-sitter/using-parsers
// TODO
//     # get list of all PyPI packages
//     print('Getting list of all PyPI packages ... ', end='', flush=True)
//     html = urllib.request.urlopen('https://pypi.org/simple/').read().decode('utf-8')
//     pattern = re.compile(r'>([^<]+)</a>')
//     all_packages = [match[1] for match in re.finditer(pattern, html)]
//     print(f'Found {len(all_packages):,} packages\n')

const Anonymizer = require("./anonymizer");

let a = new Anonymizer();
a.anonymize("SELECT * FROM table WHERE column = 'value'");


let sourceCode = 'x = 1; print(x);';

// TODO handle this source code
sourceCode = "some_var = pd.functoinclude1.sum(pandas.read_csv(os.path.join('data','some folder with np.DONTGRAB in ) it' ,var1)['some column'].mean(), axis=0))";

// TODO handle this source code
sourceCode = `
import pandas as pd
some_var = pd.include1(include5=sanitize1['sanitize2 sanitize3'], include6=0).sanitize4()
`;

// TODO handle this source code  (create a unit test)
sourceCode = `
import pandas as pd
sanitize0 = pd.include1(sanitize1['sanitize2'])
`;

// TODO handle this source code (create a unit test)
sourceCode = `
		some_var = pd.functoinclude1.sum(pandas.read_csv(os.path.join('data','some folder with np.DONTGRAB in ) it' ,var1)['some column'].mean(), axis=0))
		other_var = some_var + pd.functoinclude1.functounclude2.otherfunctoinclude3.shouldalsobethere4 \
		.stillincluded5('hello world').stillincluded6
`;

sourceCode = `
		pd.keyword1.keyword2(sanitize1, sanitize2).keyword3.keyword4()
`;

let keyWords = ['pd', 'np', 'os', 'plt', 'deepcopy'];

const allNodes = getAllNodes(tree);
// Create list of node[i].text for all nodes
const allNodeTexts = allNodes.map(node => sourceCode.slice(node.startIndex, node.endIndex));

// allNodes.forEach(node => {
//     console.log(node.text);
//     console.log(node.type)
// });
//
// // Print all nodes text and their index
// allNodes.forEach((value, index) => {
//     console.log(index, value.text);
// });

// allNodes[20] has 'keyword3'

// TODO still need to sanitize what comes from custom libraries. Need a full list of all pipy librairies!


let result = findAllKeywords(tree);
console.log("results are:::::", result);
console.log("end of results");
// console.log(allNodes);

// TODO Conjecture: when two identifiers are separated by a dot, one follows the other in the code

console.log(allNodeTexts);
// Iterate over allNodeTexts and print one by one
allNodeTexts.forEach(nodeText => {
    console.log(nodeText);
});

async function findNodeByText(tree, sourceCode, searchText) {

    const cursor = tree.walk();
    const matchingNodes = [];

    do {
        const node = cursor.currentNode;
        const nodeText = sourceCode.slice(node.startIndex, node.endIndex);
        if (nodeText === searchText) {
            matchingNodes.push(node);
        }
    } while (cursor.gotoNext());

    return matchingNodes;
}

// Example usage
const searchText = "read_csv";
findNodeByText(sourceCode, searchText).then(matchingNodes => {
    matchingNodes.forEach(node => {
        console.log(`Found node type: ${node.type} at [${node.startPosition.row}, ${node.startPosition.column}]`);
    });
});

async function printNodeTextsAndIdentifiers(tree, sourceCode) {

    const cursor = tree.walk();

    function traverse(cursor, depth = 0) {
        do {
            const node = cursor.currentNode;
            const nodeText = sourceCode.slice(node.startIndex, node.endIndex);
            const identifier = `${node.type}-${node.startPosition.row},${node.startPosition.column}`;

            // Print node type, text, and identifier
            console.log(`${' '.repeat(depth * 2)}Node: ${node.type}, Text: "${nodeText}", Identifier: ${identifier}`);

            if (cursor.firstChild) {
                traverse(cursor, depth + 1);
                cursor.parent();
            }
        } while (cursor.gotoNextSibling());
    }

    traverse(cursor);
}

printNodeTextsAndIdentifiers(tree, sourceCode);


// If your source code changes, you can update the syntax tree. This will take less time than the first parse.
// However, can't really use that in my case, since I won't know what changed
// let newSourceCode = 'x = 1; y=6; print(x+y);';
// tree.edit({
//   startIndex: 0,
//   oldEndIndex: 3,
//   newEndIndex: 5,
//   startPosition: {row: 0, column: 0},
//   oldEndPosition: {row: 0, column: 3},
//   newEndPosition: {row: 0, column: 5},
// });
// const newTree = parser.parse(newSourceCode, tree);
// console.log(newTree.rootNode.toString());


// Note might be useful to deal with individual lines with a callback, but can't use it be default since a python line can span multiple lines
// const sourceLines = [
//     'let x = 1;',
//     'console.log(x);'
//   ];
//   const tree = parser.parse((index, position) => {
//     let line = sourceLines[position.row];
//     if (line) {
//       return line.slice(position.column);
//     }
//   });