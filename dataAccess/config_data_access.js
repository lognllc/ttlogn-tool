var path = require('path'),
	colog = require('colog'),
	fs = require('fs');

var CONFIGPATH = '.ttlogn';

/* 
	get the user's home path
*/
var configPath = function () {
	var pathResult;
	pathResult = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
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
	fs.writeFile(relativePath, pdata, 'utf8', '0777',function(err){
            if(err) {
				colog.log(colog.colorRed('Error: saving file.'));
                colog.log(colog.colorRed(err));
                process.exit(1);
            }
            else{
				colog.log(colog.colorGreen('Success: configuration file saved'));
			}

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