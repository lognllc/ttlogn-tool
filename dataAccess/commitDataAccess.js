var git  = require('gift'),
	path = require('path'),
	colog = require('colog'),
	_ = require('underscore');
	commit = require(path.resolve(__dirname,'../models/commit.js'));

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
	pdateLimit: -d -w -m
	pgitName: name of the user
	return commits of a branch */
	getCommitsList: function(ppath, pbranch, pnumber, pskip){
		var repo = getRepository(ppath);
		repo.commits(pbranch, pnumber, pskip, function(err, commits){
			if(err){
				colog.log(colog.colorRed(err));
			}
			else{
				commit.printCommitsList(ppath, commits, pnumber, pbranch);
			}
		});
	},

	/* ppath: path of the directory
	pdateLimit: -d -w -m
	pgitName: name of the user
	return the branches */
	getBranches: function(ppath){
		var repo = getRepository(ppath);
		repo.branches(function(err, branches){
			if(err){
				colog.log(colog.colorRed(err));
			}
			else{
				commit.printBranches(ppath, branches);
			}
			
		});
	}

};

module.exports = commitDataAccess;


