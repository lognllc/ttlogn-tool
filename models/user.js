var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	dataAccess = require('../dataAccess/userDataAccess.js');
	utils = require('../lib/utils.js');

var CREATED = true,
	UNCREATED = false;

var addNewConfigField = function(pdata){

	var jsonData;
		jsonData = {
			emails: [pdata[0]],
			password: [pdata[1]],
			gitUser: [pdata[2]],
			repositories: []
		};
	jsonData = JSON.stringify(jsonData);
	return jsonData;
};

var addConfigField = function(pdata, pdataJson){

	var jsonData;
	jsonData = JSON.parse(pdataJson);
	
	jsonData.emails.push(pdata[0]);
	jsonData.password.push(pdata[1]);
	jsonData.gitUser.push(pdata[2]);
	
	jsontext = JSON.stringify(jsonData);
	return jsontext;
};

var user = {

	registerUser: function(pdata){
		var dataFile,
			relativePath;

		relativePath = path.relative(__dirname, ppath);

		if(fs.existsSync(relativePath)){

			dataFile = fs.readFileSync(relativePath, 'utf8');
			pdata = addConfigField(pdata, dataFile);
			saveFile(relativePath, pdata);
		
		}
		else{
			pdata = addNewConfigField(pdata);
			saveFile(relativePath, pdata);
		}
	}

};

module.exports = user;