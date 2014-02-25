var path = require('path'),
	colog = require('colog'),
	_ = require('underscore'),
	git  = require('gift'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/commitDataAccess.js'));

var NUMBER_COMMITS = 10,
	FORMATHOUR = /[^(]+\(\d+h\)/g,
	DIGITOS = /\d+/g;


var limitDate,
	gitName;


//----------------
// hacer los if de error, buscar lo de promesas
//-------------

/* ppath: path of the directory
return the directory */
var getRepository = function (ppath)
{
	return git(ppath);
};

/* pdate: -d/-w/-m
pgitName: git name of the user
prints the information of the commits */
var setDateLimit = function (pdate){

		limitDate = new Date();
		limitDate = new Date(limitDate.getFullYear(),limitDate.getMonth(), limitDate.getDate());

		if(pdate === '-w'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDay());
		}
		else if(pdate === '-m'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDate() + 1);
		}
};

// returns the limit date
var getDateLimit = function(){
	return limitDate;
};

/* pmessage: message of the commit 
return a string with the number of hours worked
*/
var getWork = function(pmessage){
	
	var test = FORMATHOUR.exec(pmessage);
	test = DIGITOS.exec(test[0]);
	return test[0];
	
};


var commit = {

	/* ppath: repository path
	pdate: -d/-w/-m
	pgitName: git name of the user
	prints the information of the commits */
	getRepo: function(ppath, pdate, pgitName, cb){
		setDateLimit(pdate);
		gitName = pgitName;
		dataAccess.getBranches(ppath, cb);
	},

	/* ppath: repository path
	parray: array of branches
	prints the information of the commits */
	/*getCommits: function(ppath, parray){
		_.each(parray,function(value,index){
			dataAccess.getCommitsList(ppath, value.name, NUMBER_COMMITS, 0, commit.printCommitsList);
		});
	},*/

	/* ppath: path of the repository
	get the config of the repo*/
	getRepoConfig: function(ppath, pfunction){
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
	pbranch: name of the branch
	pnumber: the number of commits
	pskip: number of commits skips
	return commits of a branch */
	getCommits: function(ppath, pbranch, pnumber, pskip, pfunction){
		var date,
			numberCommits,
			numberArray,
			commitsList,
			repo = getRepository(ppath);


		repo.commits(pbranch, pnumber, pskip, function(err, commits){
			if(err){
				colog.log(colog.colorRed(err));
			}
			else{
				pfunction(ppath, commits, pnumber, pbranch);
			}

			numberArray = parray.length - 1;
			date = parray[numberArray].committed_date;
			numberCommits = pnumber + NUMBER_COMMITS;

			if(date >= limitDate && numberArray === NUMBER_COMMITS - 1){
				dataAccess.getCommitsList(ppath, pbranch, numberCommits, pnumber, commit.printCommitsList);
			}
			else(cb());
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
				//dataAccess.getCommitsList(ppath, value.name, NUMBER_COMMITS, 0, commit.printCommitsList);
				pfunction(branches);
			}
			
		});
	},

	/* ppath: repository path
	parray: array of commits
	pnumber: number of commits to begin with
	pbranch: the branch
	prints the information of the commits 
	if the last commit has a high date than the limitDate,
	and array has NUMBER_COMMITS - 1 elements, print the branch again */
/*	continueCommitsList: function(ppath, parray, pnumber, pbranch, pcb){
		var date,
		numberCommits,
		numberArray;

		numberArray = parray.length - 1;
		date = parray[numberArray].committed_date;
		numberCommits = pnumber + NUMBER_COMMITS;

		if(date >= limitDate && numberArray === NUMBER_COMMITS - 1){
			dataAccess.getCommitsList(ppath, pbranch, numberCommits, pnumber, commit.printCommitsList);
		}
		else(cb());
	}*/

};

module.exports = commit;