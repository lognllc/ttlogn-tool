var git  = require('gift');

var _ = require('underscore');

//----------------
// hacer los if de error, buscar lo de promesas
//-------------

/* parray: array of commits
prints the information of the commits */
var printCommitsList = function(parray, type){
	var limitDate = new Date();
	limitDate.setDate(limitDate.getDate() - 7);

	_.each(parray,function(value,index){
		if(	value.author.name === 'dsolis5323' && value.committed_date > limitDate){
			console.log(value.author.name);
			console.log(value.message);
			console.log('-----------------------');
		}
	
	});

};

/* ppath: path of the directory
return the directory */
var getRepository = function (ppath)
{
	return git(ppath);
};

var getPrintBranchesCommits = function (ppath)
{
	var repo = getRepository(ppath);
	repo.branches(function(err, branches){
		if(err){
			console.log(err);
		}
		_.each(branches,function(value,index){
			commit.getLastCommits(ppath,value.name,2);
		});

	});
};


var commit = {

	/* ppath: path of the directory
	pnumber: the number of commits
	return the last commits of master */
	getLastCommitsMaster: function(ppath, pnumber){
		var repo = getRepository(ppath);
		repo.commits('master', pnumber, function(err, commits){
	//		printCommits(commits);
			if(err){
				console.log(err);
			}
			
		});
	},

	/* ppath: path of the directory
	pbranch: name of the branch
	pnumber: the number of commits
	return the last commits of a branch */
	getLastCommits: function(ppath, pbranch, pnumber){
		var repo = getRepository(ppath);
		repo.commits(pbranch, pnumber, function(err, commits){
			printCommitsList(commits,'');
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

//'../../ttlogn-tool'
	getCommitsBranches: function(ppath){
		getPrintBranchesCommits(ppath);
		
	}

};

module.exports = commit;


