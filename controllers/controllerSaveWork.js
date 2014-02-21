var _ = require('underscore'),
	path = require('path'),
	user = require(path.resolve(__dirname,'../models/user.js'));
	commit = require(path.resolve(__dirname,'../models/commit.js'));
	project = require(path.resolve(__dirname,'../models/project.js'));
	time_entry = require(path.resolve(__dirname,'../models/time_entry.js'));

var controllerSaveWork = {

	/*
	 
	*/
	saveWork: function(){
		var userConfig;
		
		if(config.existConfig){
			
			userConfig = config.getConfigUser();
			

			_.each(repos,function(value,index){
				
			});
		}
		else{
			console.out("Configuration file doesn't exist");
		}
	}

};

module.exports = controllerSaveWork;