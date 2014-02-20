var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs');

var CONFIGPATH = '/home/ttlognText';


	/* 
	saves the a file in an asynchronous way
	ppath: path 
	pdata: data to save
	*/

var saveFile = function (ppath, pdata){
	var relativePath = path.relative(__dirname, ppath);
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
		saveFile(CONFIGPATH, pdata);
	},

	/* 
	read the configuration file
	*/
	readConfig: function(){
		relativePath = path.relative(__dirname, CONFIGPATH);
		return fs.readFileSync(relativePath, 'utf8');
	},
	
	/* 
	returns a boolean, says if the config file exists
	*/
	existConfig: function(){

		relativePath = path.relative(__dirname, CONFIGPATH);
		return fs.existsSync(relativePath);
	}

};

module.exports = configDataAccess;