var //_ = require('underscore'),
	path = require('path'),
	pivotal = require('pivotal'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	colog = require('colog'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var PROJECT = '/users/projects.json?id=';

var project = {

	/* puserId: id of the user
	pfunction: funtion to send the projects
	get the projects of an user
	*/
	getProjects: function(puserId){
		var message	=  PROJECT + puserId;
		return dataAccess.get(message);
	},

	getPivotalProjects: function(puser){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
			projects = [];
			
			pivotal.useToken(puser);
			pivotal.getProjects(function(err, ret){
				if(!err){
					if(_.isArray(ret.project)){
						projects = ret.project;
					}
					else{
						if(typeof ret.story !== 'undefined'){
							projects.push(ret.project);
						}
					}
					resolve(projects);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: ' + err.desc));
					reject(self);
				}
			});
		});
		return promise;
	},

	getMemberships: function(puser, pprojects){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
			firstProject = _.first(pprojects),
			memberships = [];

			pivotal.useToken(puser);
			pivotal.getMemberships(firstProject.id, function(err, ret){
				if(!err){
					if(_.isArray(ret.membership)){
						memberships = ret.membership;
					}
					else{
						memberships.push(ret.membership);
					}
					resolve(memberships);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: ' + err.desc));
					reject(self);
				}
			});
		});
		return promise;
	}
};

module.exports = project;