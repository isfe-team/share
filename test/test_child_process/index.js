/*!
 * test child process
 * bq-hentai | 07/04/2017
 */

'use strict';

var cp = require('child_process');

var raw = { count: 10 };

var child = cp.fork('./cp.js', [ JSON.stringify(raw) ]);

child.on('message', function(msg) {
  if (msg.type === 'child_msg_gened_data') {
    console.log(msg.value);
  }
});
