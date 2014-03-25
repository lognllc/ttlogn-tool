var path = require('path'),
	colog = require('colog'),
	fs = require('fs'),
	_ = require('underscore'),
	prompt = require('prompt'),
	prettyjson = require('prettyjson'),
	sha1 = require('sha1'),
	dataAccess = require('../dataAccess/config_data_access.js');

var EMAIL = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]+$/;

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
		
		prompt.start();
		prompt.get({
			properties: {
				email:{
					description: 'Log(n) email '.magenta,
					required: true,
					pattern: EMAIL
				},
				ttPassword:{
					description: 'Timetracker password'.magenta,
					required: true,
					hidden: true
				},
				gitUser:{
					description: 'Git user'.magenta,
					required: true
				},
				pivotalEmail:{
					description: 'Pivotal email'.magenta,
					required: true,
					pattern: EMAIL
				},
				pivotalPassword:{
					description: 'Pivotal password'.magenta,
					required: true,
					hidden: true
				}
			}
		}, function (err, resultPrompt) {
			if(!err){
				colog.log(colog.colorBlue('Adding user'));
				colog.log(colog.colorBlue('Email: ' + resultPrompt.email));

				dataFile = getJson();
				pass = sha1('RtB8gDm'+ resultPrompt.ttPassword);
				dataFile.email = resultPrompt.email;
				dataFile.password = pass;
				dataFile.gitUser = resultPrompt.gitUser;
				dataFile.pivotalPassword = resultPrompt.pivotalPassword;

				dataFile = JSON.stringify(dataFile);
				dataAccess.saveConfig(dataFile);
			}
			else{
				colog.log(colog.colorRed('Error: ' + err));
			}
		});
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
