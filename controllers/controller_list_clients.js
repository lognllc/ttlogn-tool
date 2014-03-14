var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	user = require(path.resolve(__dirname,'../models/user.js'));

var PROJECT = /^\d+$/;

/*pclients: clients to display
prints the clients */
var printClients = function(pclients){
	_.each(pclients, function(value){
		colog.log(colog.colorBlue(value.name));
	});
};

var controllerListClients = {

	/*saves a task of an user in the TT*/
	listClients: function(){
		var configuration = config.getConfig();
	
		if(config.existConfig){
				user.login(configuration.email, configuration.password).then(function(puser){

					return user.getClients(puser.result.id);
			
			}).then(function(pclients) {
				printClients(pclients.result);
			
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
