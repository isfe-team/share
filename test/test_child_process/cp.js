/*!
 * test child process
 * child
 * bq-hentai | 07/04/2017
 */

'use strict';

console.log('args', process.argv);

// actual
var actualArgs = Array.prototype.slice.call(process.argv, 2);

console.log('actual args', actualArgs);

var data = null;

try {
	data = JSON.parse(actualArgs[0]);
} catch(ex) {
	throw ex;
}

var count = data.count || 10;
var genedData = [ ];

while(count-- >= 0) {
	genedData.push({
		random: Math.random() * count,
		actual: count + 1
	})
}

process.send({
	type: 'child_msg_gened_data',
	value: genedData
});
