var assert = require('assert');
var restify = require('restify');
var prettyjson = require('prettyjson');

var apiTT = restify.createJsonClient({
  url: 'http://10.0.1.80:3000',
  version: '~1.0'
});

var apiTTDataAccess = {

	//gets projects of an user
	get: function(pparameters, pfunction){
		apiTT.get(pparameters, function (err, req, res, obj) {
			assert.ifError(err);
			console.log(prettyjson.render(obj));
		});
	},

	post: function(pparameters, pfunction){
		apiTT.post(pparameters, function (err, req, res, obj) {
			assert.ifError(err);
			console.log(prettyjson.render(obj));
		});
	}
};

module.exports = apiTTDataAccess;

// /users/projects.json?id=169
// /time_entries/createUpdate?created=2011-06-21T13:42:22.000Z&developer_id=169&project_id=3&description=pruebaTT2dos&time=2.0&hour_type_id=1
// /login/create?email=' + pemail + 'password=' + ppassword;
