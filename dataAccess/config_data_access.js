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

var configDataAccess = {

	/* 
	saves the configuration file in an asynchronous way
	pdata: data to save
	*/
	saveConfig: function(pdata, psimpleSave){
		var dataFile = JSON.stringify(pdata, null, 4),
			relativePath = configPath();
		
		fs.writeFile(relativePath, dataFile, 'utf8', '0777',function(err){
            if(err) {
				colog.log(colog.colorRed('Error: saving file.'));
                colog.log(colog.colorRed(err));
                process.exit(1);
            }
            else{
				if(psimpleSave){
					colog.log(colog.colorGreen('Success: configuration file saved'));
				}
			}
        });
	},

	/* 
	deletes the configuration file
	*/
	deleteConfig: function(){
		var relativePath = configPath();
		try {
			fs.unlinkSync(relativePath);
		} catch(err){
			colog.log(colog.colorRed('Error: deleting file. '));
			colog.log(colog.colorRed(err));
		}
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