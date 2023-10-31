const chrono = require('chrono-node');

// or `import chrono from 'chrono-node'` for ECMAScript

console.log(chrono.parseDate(`Sunday
Nov`))
let ii = `1130 to 1330`;
let str = ii.toString();

let i = chrono.parse(ii)
console.log(i[0])