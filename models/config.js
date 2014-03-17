var path = require('path'),
	colog = require('colog'),
	fs = require('fs'),
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
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
	registerRepo: function(pproject, pbranch){
		var data = '',
			dataFile = {},
			dataRepo = {},
			newProject = {},
			projectsList = {};

		dataFile = getJson();
		data = process.cwd();
//		data = '/mnt/hgfs/Development/repoPrueba';

		if(typeof pbranch === 'undefined'){
			console.log('entre repo');
			colog.log(colog.colorBlue('Adding repository: ' + data +', and project: '+ pproject.name +' to configuration file'));
			
			dataRepo = {
				path: data,
				project: {
					name: pproject.name,
					id: pproject.id
				}
			};
			dataFile.repositories.push(dataRepo);
		}
		else{
			console.log('entre branch');
			colog.log(colog.colorBlue('Adding branch: ' + pbranch +', and project: '+ pproject.name +' to configuration file'));
				
			projectsList = _.filter(dataFile.repositories, function(repository)
				{ return _.isArray(repository.project); });
			
			if(projectsList.length > 0){
				newProject = _.find(projectsList, function(repository)
					{ return repository.path  === data;});
			}

			if(typeof newProject === 'undefined' || projectsList.length === 0){
				console.log('entre en nuevo');
				dataRepo = {
					path: data,
					project: [{
						name: pproject.name,
						id: pproject.id,
						branch: pbranch
					}]
				};
				dataFile.repositories.push(dataRepo);
			}
			else{
				newProject.project.push({
					name: pproject.name,
					id: pproject.id,
					branch: pbranch
				});
			}
		}
		dataFile = JSON.stringify(dataFile);
		dataAccess.saveConfig(dataFile);
	},

	/* 
	return the repositories of the configuration
	*/
	getConfig: function(){
		var data = {};

		data = getJson();

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
