var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs');

var CONFIGPATH = '.ttlogn';

/* 
get the user's path
*/
var configPath = function getUserHome() {
	var pathResult;
	pathResult = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
	pathResult = (path.relative(__dirname,pathResult));
	pathResult = path.join(pathResult, CONFIGPATH);
	return pathResult;
};


	/* 
	saves the a file in an asynchronous way
	ppath: path 
	pdata: data to save
	*/
var saveFile = function (pdata){
	var relativePath = configPath();
	console.log(relativePath);
	fs.writeFile(relativePath, pdata, 'utf8',function(err){
            if(err) {
                console.error("Error saving file", err);
                process.exit(1);
            }
            console.log('file saved!');
        });
};

var configDataAccess = {

	/* 
	saves the configuration file in an asynchronous way
	pdata: data to save
	*/
	saveConfig: function(pdata){
		saveFile(pdata);
	},

	/* 
	read the configuration file
	*/
	readConfig: function(){
		var relativePath = configPath();
		return fs.readFileSync(relativePath, 'utf8');
	},
	
	/* 
	returns a boolean, says if the config file exists
	*/
	existConfig: function(){
		var relativePath = configPath();
		return fs.existsSync(relativePath);
	}

};

module.exports = configDataAccess;