var git  = require('gift'),
	path = require('path'),
	colog = require('colog'),
	prettyjson = require('prettyjson'),
	_ = require('underscore');

/* ppath: path of the directory
return the directory */
var getRepository = function (ppath)
{
	return git(ppath);
};

var commitDataAccess = {

	/* ppath: path of the directory
	pbranch: name of the branch
	pnumber: the number of commits
	pskip: number of commits skips
	return commits of a branch */
	getCommitsList: function(ppath, pbranch, pnumber, pskip, pfunction){
		var repo = getRepository(ppath);
		repo.commits(pbranch, pnumber, pskip, function(err, commits){
			if(err){
				colog.log(colog.colorRed(err));
			}
			else{
				pfunction(ppath, commits, pnumber, pbranch);
			}
		});
	},

	/* ppath: path of the directory
	print the name of the repo*/
	getRepo: function(ppath, pfunction){
		var repo = getRepository(ppath);
		var jsonData;

		repo.config(function(err, config){
			if(err){
				colog.log(colog.colorRed(err));
			}
			else{
				pfunction(config);
			}
		});
	},

	/* ppath: path of the directory
	return the branches */
	getBranches: function(ppath, pfunction){
		var repo = getRepository(ppath);
		repo.branches(function(err, branches){
			if(err){
				colog.log(colog.colorRed(err));
			}
			else{
				pfunction(branches);
			}
			
		});
	}

};

module.exports = commitDataAccess;


