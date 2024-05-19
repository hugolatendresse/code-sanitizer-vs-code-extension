const assert = require('assert');


function printDebugInfo(someName, someVar) {
    console.log("\n\!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("This is the ", someName, ":");
    console.log(someVar);
    console.log("#######################################\n");
}

function assertAllTokensDifferent(text1, text2) {
	assert.notStrictEqual(text1, text2);
	const tokens1 = text1.match(/\b\w+\b/g);
	const tokens2 = text2.match(/\b\w+\b/g);
		tokens1.forEach(token => {
			assert.strictEqual(tokens2.includes(token), false);
		});
}

// The following function returns the tokens that are the same in the two texts, and asserts all other tokens are different
function assertSomeTokensSame(text1, text2, sameExpectedTokens) {
	assert.notStrictEqual(text1, text2);
	const tokens1 = text1.match(/\b\w+\b/g);
	const tokens2 = text2.match(/\b\w+\b/g);
	const sameTokens = [];
	tokens1.forEach(token => {
		if (tokens2.includes(token)) {
			sameTokens.push(token);
		} else {
			assert.strictEqual(tokens2.includes(token), false);
		}
	});
	// Check that the common tokens are as expected, ignoring the order
    const actual_array = Array.from(new Set(sameTokens)).sort()
    const expected_array = Array.from(new Set(sameExpectedTokens)).sort()

    console.log("left:")
    console.log(actual_array)
    console.log("right:")
    console.log(expected_array)
	assert.deepStrictEqual(actual_array, expected_array);
}

function assertSetsEqual(set1, set2, message = '') {
    try {
        assert.deepStrictEqual(Array.from(new Set(set1)).sort(), Array.from(new Set(set2)).sort());
    } catch (error) {
        console.log(`Set 1: ${set1}`);
        console.log(`Set 2: ${set2}`);
        const difference1 = set1.filter(x => !set2.includes(x));
        const difference2 = set2.filter(x => !set1.includes(x));
        console.log(`Difference: ${difference1.concat(difference2)}`);
        throw new Error(message);
    }
}

module.exports = {
    printDebugInfo,
    assertAllTokensDifferent,
    assertSomeTokensSame,
    assertSetsEqual
}