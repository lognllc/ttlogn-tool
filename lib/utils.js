var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs');

var filepath = '/~/ttlognText';

var utils = {
	registerUser: function(){
		console.log(path.relative(__dirname, filepath));
		console.log(__dirname);
		console.log(filepath);

/*		fs.open(path.relative(__dirname, filepath), 'w+', function (err, data){
			console.log(path.relative(__dirname, filepath));
			if (err) {
				return console.log(err);
			}
		});
*/	},
	hola: function(){
		return "mundo";
	},
	adios: function(pmundo){
		return pmundo;
	}
};

module.exports = utils;
