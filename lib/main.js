var path = require('path'),
	utils = require(path.resolve(__dirname,'utils.js')),
	commit = require(path.resolve(__dirname,'commit.js'));


var arg = process.argv.splice(2);

//utils.registerUser(arg);
//utils.registerRepo();

commit.getCommitsBranches(arg[0]);


//console.log(__dirname);
//console.log(process.cwd());
//console.log(__filename);

//var arg = process.argv.splice(2);
