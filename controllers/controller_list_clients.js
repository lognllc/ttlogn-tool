var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	user = require(path.resolve(__dirname,'../models/user.js'));

var PROJECT = /^\d+$/,
	NAME = 'name';


var controllerListClients = {

	/*
	list clients of an user
	*/
	listClients: function(){
		var configuration = config.getConfig(),
			token = {};
	
		if(config.existConfig){
			user.login(configuration.email, configuration.password).then(function(puser){
				token.token = puser.result.token;
				token.email = configuration.email;
				return user.getClients(puser.result.user.id, token);
			
			}).then(function(pclients) {
				utils.printArray(pclients.result, NAME);
			
			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerListClients;
