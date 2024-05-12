// docs for tree-sitter: https://tree-sitter.github.io/tree-sitter/using-parsers

const {findAllKeywordsInTree, findAllKeywordsInQuery, getAllNodes} = require("./python-tree-utils");
const Anonymizer = require("./anonymizer");
const Parser = require("tree-sitter");
const Python = require("tree-sitter-python");



// TODO create unit test for this
let query = `
		pd.keyword1.keyword2(sanitize1, sanitize2).keyword3.keyword4()
`;


// TODO
//     # get list of all PyPI packages
//     print('Getting list of all PyPI packages ... ', end='', flush=True)
//     html = urllib.request.urlopen('https://pypi.org/simple/').read().decode('utf-8')
//     pattern = re.compile(r'>([^<]+)</a>')
//     all_packages = [match[1] for match in re.finditer(pattern, html)]
//     print(f'Found {len(all_packages):,} packages\n')


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



// TODO create unit test for this
query = `
		pd.keyword1.keyword2(keyword6=sanitize1, keyword7 = sanitize2).keyword3.keyword4()
		sanitize3 = sanitize4(sanitize5 = sanitize6, sanitize7=sanitize8)
`;

// TODO create unit test for this
query = "pd.keyword1(keyword6=sanitize1).keyword3";

// TODO handle this source code (create a unit test)
query = `
		some_var = pd.keyword1.sum(pandas.read_csv(os.path.join('data','some folder with np.DONTGRAB in ) it' ,var1)['some column'].mean(), axis=0))
		other_var = some_var + pd.keyword2.keyword3(keyword7=sanitize1, keyword8 = sanitize9).keyword4 \
		.keyword5('hello world').keyword6(keywork9='sanitize2', keyword10='sanitize3', keyword11='sanitize4').keyword12
`;


let keyWords = ['pd', 'np', 'os', 'plt', 'deepcopy'];

const parser = new Parser();
parser.setLanguage(Python);
console.log("-----------------CREATING TREE FOR:-----------------\n")
console.log(query)
const tree = parser.parse(query);
console.log("-----------------CREATED TREE-----------------")


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


let result = findAllKeywordsInTree(tree, keyWords);
console.log("results are:::::", result);
console.log("end of results");
// console.log(allNodes);

console.log(allNodeTexts);
// Iterate over allNodeTexts and print one by one
allNodeTexts.forEach(nodeText => {
    console.log(nodeText);
});

function findNodeByText(tree, searchText) {
    let visitedChildren = false;
    let cursor = tree.walk();
    while (true) {
        if (!visitedChildren) {
            // result.push(cursor.currentNode);
            // Check if text of current node is equal to searchText
            if (cursor.currentNode.text === searchText) {
                return cursor.currentNode;
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
    return null;
}


let x = findNodeByText(tree, 'keyword11');
console.log(x.text);

