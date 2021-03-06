var path = require('path'),
	colog = require('colog'),
	fs = require('fs'),
	_ = require('underscore'),
	prompt = require('prompt'),
	prettyjson = require('prettyjson'),
	sha1 = require('sha1'),
	dataAccess = require('../dataAccess/config_data_access.js');

var EMAIL = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]+$/i,
	SIMPLE_SAVE = true,
	UPDATE_DATE = false;

/* 
register a branch in the configuration file
pproject: project to bind
pbranch: branch to bind
pdataFile: data of the file
pdata: path of the project
*/
var registerBranch = function(pproject, pbranch, pdataFile, pdata, prepoName){
	var dataRepo = {},
		newProject = {},
		projectsList = {};

		colog.log(colog.colorMagenta('Adding branch: ' + pbranch +', and project: '+ pproject.name +' to configuration file'));
		projectsList = _.filter(pdataFile.repositories, function(repository)
			{ return _.isArray(repository.project); });
			
		if(projectsList.length > 0){
			newProject = _.find(projectsList, function(repository)
				{ return repository.path  === pdata;});
		}
		if(typeof newProject === 'undefined' || projectsList.length === 0){
			dataRepo = {
				path: pdata,
				name: prepoName,
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
	dataAccess.saveConfig(pdataFile, SIMPLE_SAVE);
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
					description: 'Commit Author'.magenta,
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
				colog.log(colog.colorMagenta('Adding user:'));
				colog.log(colog.colorMagenta(resultPrompt.email + ', ' + resultPrompt.pivotalEmail+ ', ' +resultPrompt.gitUser));

				dataFile = getJson();
				pass = sha1('RtB8gDm'+ resultPrompt.ttPassword);
				dataFile.email = resultPrompt.email;
				dataFile.password = pass;
				dataFile.gitUser = resultPrompt.gitUser;
				dataFile.pivotalEmail = resultPrompt.pivotalEmail;
				dataFile.pivotalPassword = resultPrompt.pivotalPassword;

				dataAccess.saveConfig(dataFile, SIMPLE_SAVE);
			}
			else{
				colog.log(colog.colorRed('Error: ' + err));
			}
		});
	},

	/* 
	pproject: project to bind
	pbranch: name of the branch 
	saves a project bind to a project or to a branch
	*/
	registerRepo: function(pproject, pbranch, prepoName){
		var data = '',
			dataFile = {},
			dataRepo = {};

		dataFile = getJson();
		data = process.cwd();
		if(typeof pbranch === 'undefined'){
			colog.log(colog.colorMagenta('Adding repository: ' + data +', and project: '+ pproject.name +' to configuration file'));
			dataRepo = {
				path: data,
				name: prepoName,
				project: {
					name: pproject.name,
					id: pproject.id
				}
			};
			dataFile.repositories.push(dataRepo);
			dataAccess.saveConfig(dataFile, SIMPLE_SAVE);
		}
		else{
			registerBranch(pproject, pbranch, dataFile, data, prepoName);
		}
	},

	/* 
	return the information of the configuration
	*/
	getConfig: function(){
		var data = getJson();

		if(!dataAccess.existConfig()){
			colog.log(colog.colorRed('Error: Make a configuration file'));
		}
		return data;
	},

	/* 
	pconfig: configuration
	pdate: new repos to insert
	saves the repositories in the configuration file
	*/
	saveLastDate: function(pconfig, pdate){
		pconfig.lastDate = pdate;
		dataAccess.saveConfig(pconfig, UPDATE_DATE);
	},

	/* 
	prepos: array of repositories in the configuration file
	prepo: repository to be deleted
	returns the array of repos without the deleted repo.
	*/
	deleteRepo: function(prepos, prepo){
		var repos = _.reject(prepos, function(repository){ return repository.name === prepo.name;});
		return repos;
	},

	/* 
	delete the configuration file
	*/
	deleteConfig: function(){
		dataAccess.deleteConfig();
	},

	/* 
	pconfig: configuration
	prepos: new repos to insert
	saves the repositories in the configuration file
	*/
	saveRepos: function(pconfig, prepos){
		pconfig.repositories = prepos;
		dataAccess.saveConfig(pconfig, SIMPLE_SAVE);
	},


	/* 
	returns a boolean with saying if the config file exists 
	*/
	existConfig: function(){
		return dataAccess.existConfig();
	}

};

module.exports = config;
