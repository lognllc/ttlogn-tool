var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	user = require(path.resolve(__dirname,'../models/user.js'));

var PROJECT = /^\d+$/;


var controllerListClients = {

	/*saves a task of an user in the TT*/
	listClients: function(){
		var configuration = config.getConfig();
	
		if(config.existConfig){
				user.login(configuration.email, configuration.password).then(function(puser){
					return user.getClients(puser.result.id);
			
			}).then(function(pclients) {
				utils.printNames(pclients.result);
			
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
