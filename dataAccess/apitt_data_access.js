var prettyjson = require('prettyjson'),
	colog = require('colog'),
	clientTT = require('node-rest-client').Client;

var HOST = 'http://10.0.1.80:3000';

var apiTTDataAccess = {

	get: function(pparameters, pfunction){
		var dataServer = {},
			client = new clientTT();
		
		client.get(HOST+pparameters, function(data, response){
			dataServer = JSON.parse(data);
			pfunction(dataServer);

		}).on('error',function(err){
            colog.log(colog.colorRed('Error: Something went wrong on the request', err.request.options));
        });
	},

	post: function(pparameters, pfunction){
		var client = new clientTT(),
			dataServer = {},
			args = {
				data: {},
				headers: {"Content-Type": "application/json"}
			};

		client.post(HOST+pparameters, args, function(data,response) {
			dataServer = JSON.parse(data);
			pfunction(dataServer);

		}).on('error',function(err){
            colog.log(colog.colorRed('Error: Something went wrong on the request', err.request.options));
        });
	}
};

module.exports = apiTTDataAccess;






// /users/projects.json?id=169
// /time_entries/createUpdate?created=2011-06-21T13:42:22.000Z&developer_id=169&project_id=3&description=pruebaTT2dos&time=2.0&hour_type_id=1
// /login/create?email=' + pemail + 'password=' + ppassword;
