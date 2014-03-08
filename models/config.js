var path = require('path'),
	colog = require('colog'),
	fs = require('fs'),
	sha1 = require('sha1'),
	dataAccess = require('../dataAccess/config_data_access.js');


/* 
get the json to save the information
*/
var getJson = function(){

	var jsonData = {};

	if(config.existConfig()){
		dataFile = dataAccess.readConfig();
		jsonData = JSON.parse(dataFile);
	}
	else{
		jsonData = { email: '', password: '', gitUser: '', repositories:[] };
	}
	return jsonData;
};

var config = {

	/* 
	register a user in the configuration file
	pdata: data to save
	*/
	registerUser: function(pdata){
		var dataFile = {},
			pass = '';

		colog.log(colog.colorBlue('Adding user'));
		colog.log(colog.colorBlue('Email: ' + pdata[0] + ', Git User: ' + pdata[2]));

		dataFile = getJson();

		pass = sha1('RtB8gDm'+ pdata[1]);
	
		dataFile.email = pdata[0];
		dataFile.password = pass;
		dataFile.gitUser = pdata[2];

		dataFile = JSON.stringify(dataFile);
		dataAccess.saveConfig(dataFile);
	},

	/* 
	register a repository in the configuration file
	ppath: path of the configuration file
	*/
	registerRepo: function(pproject){
		var data = '',
			dataFile = {},
			dataRepo = {};

		dataFile = getJson();
		data = process.cwd();
		colog.log(colog.colorBlue('Adding repository: ' + data +', and project: '+ pproject.name +' to configuration file'));
		
		dataRepo = {
			path: data,
			project: {
				name: pproject.name,
				id: pproject.id
			}
		};

		dataFile.repositories.push(dataRepo);
		dataFile = JSON.stringify(dataFile);
		dataAccess.saveConfig(dataFile);
	},

	/* 
	return the repositories of the configuration
	*/
	getConfig: function(){
		var data = {};

		data = getJson();

		if(dataAccess.existConfig()){

			data = dataAccess.readConfig();
			data = JSON.parse(data);
		}
		else{
			colog.log(colog.colorRed('Error: Make a configuration file'));
		}
		return data;
	},

	/* 
	return the user of the configuration
	*/
	existConfig: function(){
		return dataAccess.existConfig();
	}

};

module.exports = config;
