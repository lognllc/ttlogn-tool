var prettyjson = require('prettyjson'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	clientTT = require('node-rest-client').Client;

var //HOST_DEVELOPMENT = 'http://10.0.1.80:3000',
	HOST_DEVELOPMENT = 'http://192.168.0.120:3000',
	HOST = 'http://ec2-54-226-94-0.compute-1.amazonaws.com',
	DEVELOPMENT = 'development',
	TT_ENV = 'TT_ENV',
	APP_JSON = 'application/json';

var getHost = function(){
	var tt_env = process.env[TT_ENV],
		host = '';
	if(tt_env === DEVELOPMENT){
		host = HOST_DEVELOPMENT;
	}
	else{
		host = HOST;
	}
	//console.log(host);
	return host;
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
				//token = ,
				args = {
					headers: {
						'Content-Type': APP_JSON,
						Authorization: 'Token  token="'+ ptoken.email + '@' + ptoken.token + '"'
					}
				};
			// console.log(host+pparameters);
			// console.log(args);
			client.get(host+pparameters, args, function(data, response){
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
			// console.log(host+ppost);
			// console.log(args);
			client.post(host + ppost, args, function(data,response){
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
	}

};

module.exports = apiTTDataAccess;
