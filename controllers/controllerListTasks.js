var _ = require('underscore'),
	path = require('path'),
	config = require(path.resolve(__dirname,'../models/config.js'));
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var controllerListTasks = {

	/* 
	print the tasks realized by an user
	pdate: maximum date d/w/m
	*/
	
	listTasks: function(pdate){
		var repos,
			name;

		name = config.getConfigUser();
		repos = config.getConfigRepos();
		
		_.each(repos,function(value,index){
			commit.displayCommits(value, pdate, name);
		});
	}

};

module.exports = controllerListTasks;