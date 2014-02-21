var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	config = require(path.resolve(__dirname,'../models/config.js'));
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var controllerListTasks = {

	/* 
	print the tasks realized by an user
	pdate: maximum date d/w/m
	*/
	
	listTasks: function(pdate){
		var repos,
			user;
		if(config.existConfig){
			user = config.getConfigUser();
			repos = config.getConfigRepos();
			
			_.each(repos,function(value,index){
				commit.displayCommits(value, pdate, user.gitUser);
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
		
	}

};

module.exports = controllerListTasks;