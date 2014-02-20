var git  = require('gift'),
	path = require('path'),
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
	return the last commits of a branch */
	getLastCommits: function(ppath, pbranch, pnumber, pdateLimit, pgitName){
		var repo = getRepository(ppath);
		repo.commits(pbranch, pnumber, function(err, commits){
			commit.printCommitsList(commits, pdateLimit, pgitName);
			if(err){
				console.log(err);
			}
		});
	},

	/* ppath: path of the directory
	pbranch: name of the branch
	return the last 10 commits of branch */
	getCommitsBranch: function(ppath, pbranch){
		var repo = getRepository(ppath);
		repo.commits(pbranch, function(err, commits){
	//		printCommits(commits);
			if(err){
				console.log(err);
			}
		});
	},

	getBranches: function(ppath, pdateLimit, pgitName){
		var repo = getRepository(ppath);
		repo.branches(function(err, branches){
			if(err){
				console.log(err);
			}
			commit.printBranches(ppath, branches,pdateLimit, pgitName);
		});
	}

};

module.exports = commitDataAccess;


