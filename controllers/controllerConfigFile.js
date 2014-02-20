var path = require('path'),
	config = require(path.resolve(__dirname,'../models/config.js'));


var controllerConfigFile = {

	/* 
	register a user in the configuration file
	puser: the information of the user
	*/
	registerUser: function(puser){
		config.registerUser(puser);
	},

	/* 
	register a repo in the configuration file
	*/
	registerRepo: function(){
		config.registerRepo();
	}

};

module.exports = controllerConfigFile;