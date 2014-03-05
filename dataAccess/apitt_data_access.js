var prettyjson = require('prettyjson'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	clientTT = require('node-rest-client').Client;

var HOST = 'http://10.0.1.80:3000';

var apiTTDataAccess = {

/*	pparameters: parameters for the get
	pfunction: function to execute later
	makes a get and send the info receive to pfunction*/
	get: function(pparameters, pfunction){
			var dataServer = {},
				client = new clientTT();
			//console.log(pparameters);
			client.get(HOST+pparameters, function(data, response){
			//	console.log(data);
				dataServer = JSON.parse(data);
				pfunction(dataServer);

			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request', err.request.options));
			});
	},

/*	ppost: post method
	pparameters: parameters for the post
	pfunction: function to execute later
	makes a post and send the info receive to pfunction*/
	post: function(ppost, pparameters, pfunction){
			var client = new clientTT(),
				dataServer = {},
				args = {
					data: pparameters,
					headers: {"Content-Type": "application/json"}
				};

			client.post(HOST + ppost, args, function(data,response) {
				dataServer = JSON.parse(data);
				pfunction(dataServer);

			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request', err.request.options));
			});
	},

/*	ppost: post method
	pparameters: parameters for the get
	makes a post, work with promises */
	waitPost: function(ppost, pparameters){
		var promise = new RSVP.Promise(function(resolve, reject) {
			var client = new clientTT(),
				self = this,
				dataServer = {},
				args = {
					data: pparameters,
					headers: {"Content-Type": "application/json"}
				};

			client.post(HOST + ppost, args, function(data,response) {
				resolve(self);

			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request', err.request.options));
				reject(self);
			});
		});
		return promise;
	}
};

module.exports = apiTTDataAccess;


// /users/projects.json?id=169
// /time_entries/createUpdate?created=2011-06-21T13:42:22.000Z&developer_id=169&project_id=3&description=pruebaTT2dos&time=2.0&hour_type_id=1
// /login/create?email=' + pemail + 'password=' + ppassword;
