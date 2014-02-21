var assert = require('assert');
var restify = require('restify');
var prettyjson = require('prettyjson');

var apiTT = restify.createJsonClient({
  url: 'http://10.0.1.80:3000',
  version: '~1.0'
});

var userDataAccess = {

	//gets all the users
	getUser: function(pemail, ppassword){
		postUrl = 'http://10.0.1.80:3000/login/create?email=' + pemail + 'password=' + ppassword;
		apiTT.post(postUrl, function (err, req, res, obj) {
			assert.ifError(err);
			console.log(prettyjson.render(obj));
		});
	}
};

module.exports = userDataAccess;

//'http://10.0.1.80:3000/login/create?email=iostest2@yopmail.com&password=4569e3bee4a3654fc9924f2cb30a8a19600ef6fa'