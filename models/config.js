var path = require('path'),
	colog = require('colog'),
	fs = require('fs'),
	dataAccess = require('../dataAccess/config_data_access.js');

var USER = 1,
	REPOSITORY = 0,
	CREATED = true,
	UNCREATED = false;

/* 
add a field to a new jason file of configuration
pdata: data to introduce
ptype: user or repository
returns the string of the json
*/
var addNewConfigField = function(pdata, ptype){

	var jsonData;

	jsonData = ptype ? { emails: pdata[0], password: pdata[1], gitUser: pdata[2] ,repositories:[] } :  {emails: '', password: '', gitUser: '', repositories: [pdata]};
	jsonData = JSON.stringify(jsonData);
	return jsonData;
};

/* 
add a new field to the jason field of configuration
pdata: data to introduce
pdataFile: the data in the file
ptype: user or repository
returns the string of the json
*/

var addConfigField = function(pdata, pdataFile, ptype){

	var jsonData;
	jsonData = JSON.parse(pdataFile);
	
	if(ptype){
		jsonData.emails = pdata[0];
		jsonData.password = pdata[1];
		jsonData.gitUser = pdata[2];
	}
	else {
		jsonData.repositories.push(pdata);
	}
	jsontext = JSON.stringify(jsonData);
	return jsontext;
};

/* 
add a new repo to the jason field of configuration
pdataFile: the data in the file
ptype: if the configuration file is CREATED or UNCREATED
returns the string of the json
*/
var addRepoJson = function(pdataFile, ptype){

	var jsonData,
		data;
	data = process.cwd();
	colog.log(colog.colorBlue('Adding repository ' + data +' to configuration file'));
	jsonData = ptype ? addConfigField(data, pdataFile, REPOSITORY) : addNewConfigField(data, REPOSITORY);
	return jsonData;
};

var config = {

	/* 
	register a user in the configuration file
	pdata: data to save
	*/
	registerUser: function(pdata){
		var dataFile;

		colog.log(colog.colorBlue('Adding user'));
		colog.log(colog.colorBlue('Email: ' + pdata[0] + ' git User: ' + pdata[1]));

		if(dataAccess.existConfig()){
			dataFile = dataAccess.readConfig();
			pdata = addConfigField(pdata, dataFile, USER);
			dataAccess.saveConfig(pdata);
		}
		else{
			pdata = addNewConfigField(pdata, USER);
			dataAccess.saveConfig(pdata);
		}
	},

	/* 
	register a repository in the configuration file
	ppath: path of the configuration file
	*/
	registerRepo: function(){
		var data,
			dataFile;

		if(dataAccess.existConfig()){

			dataFile = dataAccess.readConfig();
			data = addRepoJson(dataFile, CREATED);
			dataAccess.saveConfig(data);
		
		}
		else{
			data = addRepoJson('', UNCREATED);
			dataAccess.saveConfig(data);
		}
	},

	/* 
	return the repositories of the configuration
	*/
	getConfigRepos: function(){
		var data;

		if(dataAccess.existConfig()){

			data = dataAccess.readConfig();
			data = JSON.parse(data);
			data = data.repositories;
			return data;
		}
		else{
			colog.log(colog.colorRed('Add a repository'));
			return [];
		}
	},

	/* 
	return the user of the configuration
	*/
	getConfigUser: function(){
		var data;

		if(dataAccess.existConfig()){

			data = dataAccess.readConfig();
			data = JSON.parse(data);
			return data;
		
		}
		else{
			colog.log(colog.colorRed('Add a user'));
			return [];
		}
	},

	/* 
	return the user of the configuration
	*/
	existConfig: function(){
		return dataAccess.existConfig();
	}

};

module.exports = config;
