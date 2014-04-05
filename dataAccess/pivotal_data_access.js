var prettyjson = require('prettyjson'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	clientTT = require('node-rest-client').Client;

var HOST = 'https://www.pivotaltracker.com/services/v5/';

var apiPivotalDataAccess = {

/*	ptoken: token of the user
	ppost: post method
	pparameters: parameters for the post
	makes a post and send the info receive to pfunction*/
	post: function(ptoken, ppost, pparameters){
		var promise = new RSVP.Promise(function(resolve, reject){
			var client = new clientTT(),
				dataServer = {},
				self = this,
				args = {
					data: pparameters,
					headers: {
						'Content-Type': 'application/json',
						'X-TrackerToken': ptoken
					}
				};
			//console.log(HOST + ppost);
			//console.log(pparameters);
			client.post(HOST + ppost, args, function(data,response){
			//	console.log(data);
			//	dataServer = JSON.parse(data);
				resolve();
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request', err.request.options));
				reject(self);
			});
		});
		return promise;
	},

	/*	ptoken: token of the user
	pput: put method
	pparameters: parameters for the post
	makes a post and send the info receive to pfunction*/
	put: function(ptoken, pput, pparameters){
		var promise = new RSVP.Promise(function(resolve, reject){
			var client = new clientTT(),
				dataServer = {},
				self = this,
				args = {
					data: pparameters,
					headers: {
						'Content-Type': 'application/json',
						'X-TrackerToken': ptoken
					}
				};
			//console.log(HOST + ppost);
			//console.log(pparameters);
			client.put(HOST + pput, args, function(data,response){
			//	console.log(data);
				resolve();
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request', err.request.options));
				reject(self);
			});
		});
		return promise;
	}
};

module.exports = apiPivotalDataAccess;

/*
{"requested_by":"Daniel Solis"
 "description":"test v5",
 "name": "test version",
 "story_type":"feature"}*/
