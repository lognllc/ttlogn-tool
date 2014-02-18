var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs');

var filepath;


var USER = true,
	REPOSITORY = false,
	CREATED = true,
	UNCREATED = false;


filepath = '/home/ttlognText';


/* 
add a field to a new jason file of configuration
pdata: data to introduce
ptype: user or repository
returns the string of the json
*/
var addNewFieldJson = function(pdata,ptype){

	var jsonData;

	jsonData = ptype ? { emails: [pdata[0]], password: [pdata[1]], gitUser: [pdata[2]] ,repositories:[] } :  {emails: [], password: [], gitUser: [], repositories: [pdata]};
	jsonData = JSON.stringify(jsonData);
	return jsonData;
};

/* 
add a new field to the jason field of configuration
pdata: data to introduce
pdataFile: the data in the file
ptype: user or repository
returns the string of the json
*/

var addFieldJson = function(pdata, pdataFile, ptype){

	var jsonData;
	jsonData = JSON.parse(pdataFile);
	
	if(ptype){
		jsonData.emails.push(pdata[0]);
		jsonData.password.push(pdata[1]);
		jsonData.gitUser.push(pdata[2]);
	}
	else {
		jsonData.repositories.push(pdata);
	}
	jsontext = JSON.stringify(jsonData);
	return jsontext;
};

/* 
add a new repo to the jason field of configuration
pdataFile: the data in the file
ptype: if the configuration file is CREATED or UNCREATED
returns the string of the json
*/
var addRepoJson = function(pdataFile, ptype){

	var jsonData,
		data;
	data = process.cwd();
	jsonData = ptype ? addFieldJson(data, pdataFile, REPOSITORY) : addNewFieldJson(data, REPOSITORY);
	return jsonData;
};

/* 
saves a file in an asynchronous way
ppath: path 
pdata: data to save
*/

var saveFile = function (ppath, pdata){
	fs.writeFile(ppath, pdata, 'utf8',function(err){
            if(err) {
                console.error("Error saving file", err);
                process.exit(1);
            }
            console.log('file saved!');
        });
};



var utils = {

	/* 
	register a user in the configuration file
	pdata: data to save
	*/
	registerUser: function(pdata){
		var dataFile,
			relativePath;

		relativePath = path.relative(__dirname, filepath);

		if(fs.existsSync(relativePath)){

			dataFile = fs.readFileSync(relativePath, 'utf8');
			pdata = addFieldJson(pdata, dataFile, USER);
			saveFile(relativePath, pdata);
		
		}
		else{
			pdata = addNewFieldJson(pdata, USER);
			saveFile(relativePath, pdata);
		}
	},

	/* 
	register a user in the configuration file
	*/
	registerRepo: function(){
		var data,
			dataFile,
			relativePath;

		relativePath = path.relative(__dirname, filepath);

		if(fs.existsSync(relativePath)){

			dataFile = fs.readFileSync(relativePath, 'utf8');
			data = addRepoJson(dataFile, CREATED);
			saveFile(relativePath, data);
		
		}
		else{
			data = addRepoJson('', UNCREATED);
			saveFile(relativePath, data);
		}
	}

};

module.exports = utils;
