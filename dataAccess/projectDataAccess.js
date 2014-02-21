var assert = require('assert');
var restify = require('restify');
var prettyjson = require('prettyjson');

var apiTT = restify.createJsonClient({
  url: 'http://10.0.1.80:3000',
  version: '~1.0'
});

var projectDataAccess = {

	//gets projects of an user
	getUserProject: function(){
		apiTT.get('/users/projects.json?id=169', function (err, req, res, obj) {
			assert.ifError(err);
			console.log(prettyjson.render(obj));
		});
	}
};

module.exports = projectDataAccess;