var path = require('path'),
	utils = require(path.resolve(__dirname,'utils.js'));


var arg = process.argv.splice(2);
utils.registerUser();

//console.log(__dirname);
//console.log(process.cwd());
//console.log(__filename);

//var arg = process.argv.splice(2);
