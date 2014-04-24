var prettyjson = require('prettyjson'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	clientTT = require('node-rest-client').Client;

var HOST_DEVELOPMENT = 'http://10.0.1.80:3000',
	//HOST_DEVELOPMENT = 'http://192.168.0.120:3000',
	HOST = 'http://ec2-54-226-94-0.compute-1.amazonaws.com',
	DEVELOPMENT = 'development',
	TT_ENV = 'TT_ENV';

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
	makes a get and send the info receive to pfunction*/
	get: function(pparameters){
		var promise = new RSVP.Promise(function(resolve, reject){
			var dataServer = {},
				client = new clientTT(),
				host = getHost();
			//console.log(host+pparameters);
			client.get(host+pparameters, function(data, response){
			//	console.log(data);
				dataServer = JSON.parse(data);
				resolve(dataServer);

			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				reject(err.stack);
			});
		});
		return promise;
	},

/*	ppost: post method
	pparameters: parameters for the post
	makes a post and send the info receive to pfunction*/
	post: function(ppost, pparameters){
		var promise = new RSVP.Promise(function(resolve, reject){
			var client = new clientTT(),
				dataServer = {},
				host = getHost(),
				args = {
					data: pparameters,
					headers: {'Content-Type': 'application/json'}
				};
			//console.log(host+ppost);
			//console.log(pparameters);
			client.post(host + ppost, args, function(data,response){
			//	console.log(data);
				dataServer = JSON.parse(data);
				resolve(dataServer);
			}).on('error',function(err){
				colog.log(colog.colorRed('Error: Something went wrong on the request'));
				//reject(err.errno);
				reject(err.stack);
			});
		});
		return promise;
	}

};

module.exports = apiTTDataAccess;
