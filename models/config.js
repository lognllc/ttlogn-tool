var path = require('path'),
	colog = require('colog'),
	fs = require('fs'),
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	sha1 = require('sha1'),
	dataAccess = require('../dataAccess/config_data_access.js');

/* 
	register a repository in the configuration file
	ppath: path of the configuration file
	*/
var registerBranch = function(pproject, pbranch, pdataFile, pdata){
	var dataRepo = {},
		newProject = {},
		projectsList = {};

		colog.log(colog.colorBlue('Adding branch: ' + pbranch +', and project: '+ pproject.name +' to configuration file'));
		projectsList = _.filter(pdataFile.repositories, function(repository)
			{ return _.isArray(repository.project); });
			
		if(projectsList.length > 0){
			newProject = _.find(projectsList, function(repository)
				{ return repository.path  === pdata;});
		}
		if(typeof newProject === 'undefined' || projectsList.length === 0){
			dataRepo = {
				path: pdata,
				project: [{
					name: pproject.name,
					id: pproject.id,
					branch: pbranch
				}]
			};
			pdataFile.repositories.push(dataRepo);
		}
		else{
			newProject.project.push({
				name: pproject.name,
				id: pproject.id,
				branch: pbranch
			});
		}
	pdataFile = JSON.stringify(pdataFile);
	dataAccess.saveConfig(pdataFile);
};


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
		jsonData = {repositories:[]};
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
		dataFile.pivotalPassword = pdata[3];

		dataFile = JSON.stringify(dataFile);
		dataAccess.saveConfig(dataFile);
	},

	/* 
	register a repository in the configuration file
	ppath: path of the configuration file
	*/
	registerRepo: function(pproject, pbranch){
		var data = '',
			dataFile = {},
			dataRepo = {};

		dataFile = getJson();
		data = process.cwd();
//		data = '/mnt/hgfs/Development/repoPrueba';
		if(typeof pbranch === 'undefined'){
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
		}
		else{
			registerBranch(pproject, pbranch, dataFile, data);
		}
	},

	/* 
	return the repositories of the configuration
	*/
	getConfig: function(){
		var data = getJson();

		if(!dataAccess.existConfig()){
			colog.log(colog.colorRed('Error: Make a configuration file'));
		}
		return data;
	},

	/* 
	return the repositories of the configuration
	*/
	deleteRepo: function(prepos, prepo){
		var repos = _.reject(prepos, function(repository){ return repository.path === prepo.path; });
		return repos;

	},

	/* 
	return the repositories of the configuration
	*/
	saveRepos: function(pconfig, prepos){
		var dataFile = {};

		pconfig.repositories = prepos;
		dataFile = JSON.stringify(pconfig);
		dataAccess.saveConfig(dataFile);
	},

	/* 
	return the user of the configuration
	*/
	existConfig: function(){
		return dataAccess.existConfig();
	}

};

module.exports = config;
