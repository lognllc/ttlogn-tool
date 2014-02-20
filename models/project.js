var //_ = require('underscore'),
	dataAccess = require('../dataAccess/projectDataAccess.js');
	config = require('./config.js');

var project = {

	/* 
	return the repos in the config file
	*/
	getConfigRepos: function(ppath){
		var data,
			relativePath;

		relativePath = path.relative(__dirname, ppath);

		if(fs.existsSync(relativePath)){

			data = fs.readFileSync(relativePath, 'utf8');
			data = JSON.parse(data);
			data = data.repositories;
			return data;
		
		}
		else{
			return [];
		}
	},

	registerRepo: function(ppath){
		var data,
			dataFile,
			relativePath;

		relativePath = path.relative(__dirname, ppath);

		if(fs.existsSync(relativePath)){

			dataFile = fs.readFileSync(relativePath, 'utf8');
			data = addRepoJson(dataFile, CREATED);
			utils.saveFile(relativePath, data);
		
		}
		else{
			data = addRepoJson('', UNCREATED);
			utils.saveFile(relativePath, data);
		}
	}

};

module.exports = project;