var prettyjson = require('prettyjson'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	clientTT = require('node-rest-client').Client;

var HOST_DEVELOPMENT = 'http://ec2-54-226-94-0.compute-1.amazonaws.com',
	HOST = 'http://ec2-54-90-229-12.compute-1.amazonaws.com',
	// HOST = 'http://10.0.1.80:3000',
	DEVELOPMENT = 'development',
	TT_ENV = 'TT_ENV',
	APP_JSON = 'application/json';

var getHost = function(){
	return process.env[TT_ENV] === DEVELOPMENT ? HOST_DEVELOPMENT : HOST;
};

var apiTTDataAccess = {

/*	pparameters: parameters for the get
	ptoken: token for the api validation
	makes a get and send the info receive to pfunction*/
	get: function(pparameters, ptoken){
		var promise = new RSVP.Promise(function(resolve, reject){
			var dataServer = {},
				client = new clientTT(),
				host = getHost(),
				args = {
					headers: {
						'Content-Type': APP_JSON,
						Authorization: 'Token  token="'+ ptoken.email + '@' + ptoken.token + '"'
					}
				};
			client.get(host+pparameters, args, function(data, response){
				// console.log(data);
				try {
					dataServer = JSON.parse(data);
					resolve(dataServer);
				}
				catch(err) {
					colog.log(colog.colorRed('Error: Something went wrong on the request'));
				}
				
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				reject(err.stack);
			});
		});
		return promise;
	},

/*	ppost: post method
	pparameters: parameters for the post
	ptoken: token for the api validation
	makes a post and send the info receive to pfunction*/
	post: function(ppost, pparameters, ptoken){
		var promise = new RSVP.Promise(function(resolve, reject){
			var client = new clientTT(),
				dataServer = {},
				host = getHost(),
				args = {
					data: pparameters,
					headers: {
						'Content-Type': APP_JSON
					}
				};

			if (!_.isUndefined(ptoken)) {
				args.headers.Authorization = 'Token  token="'+ ptoken.email + '@' + ptoken.token + '"';
			}
			client.post(host + ppost, args, function(data,response){
				try {
					dataServer = JSON.parse(data);
					resolve(dataServer);
				}
				catch(err) {
					colog.log(colog.colorRed('Error: Something went wrong on the request'));
				}
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				reject(err.stack);
			});
		});
		return promise;
	}

};

module.exports = apiTTDataAccess;
