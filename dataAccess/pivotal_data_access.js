var prettyjson = require('prettyjson'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	clientTT = require('node-rest-client').Client;

var HOST = 'https://www.pivotaltracker.com/services/v5/';

var apiPivotalDataAccess = {

/*	pparameters: parameters for the get
	makes a get and send the info receive to pfunction*/
	login: function(puser, pget){
		var promise = new RSVP.Promise(function(resolve, reject){
			var dataServer = {},
				options_auth={
					user:puser.pivotalEmail,
					password:puser.pivotalPassword
				},
				client = new clientTT(options_auth),
				args = {
					headers: {
						'Content-Type': 'application/json'
					}
				};
			client.get(HOST+pget, args,function(data, response){
				dataServer = JSON.parse(data);
				if(!dataServer.error){
					resolve(dataServer);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request'));
					//colog.log(colog.colorRed(dataServer.error));
					reject(dataServer.error);
				}
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				reject(err.stack);
			});
		});
		return promise;
	},

/*	pparameters: parameters for the get
	makes a get and send the info receive to pfunction*/
	get: function(ptoken, pget){
		var promise = new RSVP.Promise(function(resolve, reject){
			var dataServer = {},
				client = new clientTT(),
				args = {
					headers: {
						'Content-Type': 'application/json',
						'X-TrackerToken': ptoken
					}
				};
			//console.log(HOST + pget);
			client.get(HOST+pget, args,function(data, response){
			//	console.log(data);
				dataServer = JSON.parse(data);
				if(!dataServer.error){
					resolve(dataServer);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request'));
				//	colog.log(colog.colorRed(dataServer.error));
					reject(dataServer.error);
				}
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				reject(err.stack);
			});
		});
		return promise;
	},

/*	ptoken: token of the user
	ppost: post method
	pparameters: parameters for the post
	makes a post and send the info receive to pfunction*/
	post: function(ptoken, ppost, pparameters){
		var promise = new RSVP.Promise(function(resolve, reject){
			var client = new clientTT(),
				dataServer = {},
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
				dataServer = JSON.parse(data);
				if(!dataServer.error){
					resolve(dataServer);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request'));
				//	colog.log(colog.colorRed(dataServer.error));
					reject(dataServer.error);
				}
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				reject(err.stack);
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
				args = {
					data: pparameters,
					headers: {
						'Content-Type': 'application/json',
						'X-TrackerToken': ptoken
					}
				};
			//console.log(ptoken);
			//console.log(HOST + pput);
			//console.log(pparameters);
			client.put(HOST + pput, args, function(data,response){
			//	console.log(data);
				dataServer = JSON.parse(data);
				if(!dataServer.error){
					resolve(dataServer);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request'));
				//	colog.log(colog.colorRed(dataServer.error));
					reject(dataServer.error);
				}
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				reject(err.stack);
			});
		});
		return promise;
	},

	/*	ptoken: token of the user
	pput: put method
	pparameters: parameters for the post
	makes a post and send the info receive to pfunction*/
	delete: function(ptoken, pdelete){
		var promise = new RSVP.Promise(function(resolve, reject){
			var client = new clientTT(),
				dataServer = {},
				args = {
					headers: {
						'Content-Type': 'application/json',
						'X-TrackerToken': ptoken
					}
				};
			//console.log(client.delete.toString());
			//console.log(HOST + pdelete);
			//console.log(pparameters);
			client.delete(HOST + pdelete, args, function(data,response){
				if(_.isEmpty(data)){
					resolve(data);
				}
				else{
					dataServer = JSON.parse(data);
					reject(dataServer.error);
				}
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				reject(err.stack);
			});
		});
		return promise;
	},
};

module.exports = apiPivotalDataAccess;
