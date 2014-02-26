var path = require('path'),
	colog = require('colog'),
	_ = require('underscore'),
	git  = require('gift'),
	async = require('async'),
	RSVP = require('rsvp'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/commit_data_access.js'));


var NUMBER_COMMITS = 10,
	FORMATHOUR = /[^(]+\(\d+h\)/g,
	DIGITOS = /\d+/g,
	PATH = 0,
	BRANCH_NAME= 0,
	BRANCH_COMMITS= 1,
	REPO_NAME = 1,
	BRANCHES = 2,
	COMMITS = 3;


var limitDate,
	gitName,
	repoArray,
	success;

/* ppath: path of the directory
return the directory */
var getRepository = function (ppath)
{
	return git(ppath);
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

	// returns the limit date
	getDateLimit: function(){
		return limitDate;
	},

	/* ppath: path of the repository
	get the config of the repo*/
	getRepoName: function(parray, pfunction){
		
		var repo,
			configList = [];

		async.each(parray, function(item, callback){
				repo = getRepository(item);
				repo.config(function (err, config){
					if(err){
						colog.log(colog.colorRed(err));
					}
					else{
						configList.push([item, config.items['remote.origin.url']]);
					}
					callback();
				});
			},

			function(err){
				//return configList;
				pfunction(configList);
			}
		);
	},

	/* ppath: path of the directory
	return the branches */
	getBranches: function(parray, pfunction){

		var repo,
			branchesList;
			
		async.each(parray, function(item, callback){
				repo = getRepository(item[PATH]);
				repo.branches(function (err, branches){
					branchesList = [];
					_.each(branches, function(value,index){
						branchesList.push([value.name,[]]);
					});
					item.push(branchesList);
					callback();
				});
			},
			function(err){
				// All tasks are done now
				pfunction(parray);
			}
		);

	},

	/* ppath: path of the directory
	pbranch: name of the branch
	pnumber: the number of commits
	pskip: number of commits skips
	return commits of a branch */

	getCommits: function(prepo, pindexBranch){
	//function(ppath, pbranch, pnumber, pskip, pfunction){
		var date,
			numberCommits,
			skip,
			numberArray,
			commitsList,
			hasCommits;


			repo = getRepository(prepo[PATH]);
			branch = prepo[BRANCHES][BRANCH_NAME];
			skip = 0;
			numberCommits = NUMBER_COMMITS;

			async.doWhilst(
				function (callback) {
					repo.commits(branch, numberCommits, skip, function(err, commits){
						if(err){
							colog.log(colog.colorRed(err));
						}
						else{

							repoIndex = _.indexOf(repoArray, prepo);
							repoArray[repoIndex][BRANCHES][pindexBranch][BRANCH_COMMITS].concat(commits);
							console.log(commits);
							console.log(repoArray[repoIndex][BRANCHES][pindexBranch][BRANCH_COMMITS]);//[BRANCH_COMMITS].push(commits);
							numberArray = commits.length - 1;
							date = commits[numberArray].committed_date;
							skip = numberCommits;
							numberCommits = numberCommits + NUMBER_COMMITS;
						}
					});
				},
				function () { return date >= limitDate && numberArray === NUMBER_COMMITS - 1; },
				function (err) {
					// 5 seconds have passed
				}
			);



			/*do {
				hasCommits = false;
				repo.commits(branch, numberCommits, skip, function(err, commits){
					if(err){
						colog.log(colog.colorRed(err));
					}
					else{
						console.log(repoArray[BRANCHES]);//[BRANCH_COMMITS].push(commits);
						numberArray = commits.length - 1;
						date = commits[numberArray].committed_date;
						skip = numberCommits;
						numberCommits = numberCommits + NUMBER_COMMITS;

						if(date >= limitDate && numberArray === NUMBER_COMMITS - 1){
							hasCommits = true;	
						}
					}
				});
			}
			while (hasCommits);
*/

		/*repo.commits(pbranch, pnumber, pskip, function(err, commits){
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
			else(pfunction());
		});*/
	},

	/* ppath: path of the directory
	pbranch: name of the branch
	pnumber: the number of commits
	pskip: number of commits skips
	return commits of a branch */
	getBranchCommits: function(parray, pfunction){
		repoArray = parray;
		success = 0;

		async.each(parray, function(repository, callback){
				_.each(repository[BRANCHES], function(branch, indexBranch){
					commit.getCommits(repository, indexBranch);
				});
			},
			function(err){
				// All tasks are done now

				console.log('termine');
				pfunction(parray);
			}
		);
/*
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
			else(pfunction());
		});
*/	},

	/* pdate: -d/-w/-m
	prints the information of the commits */
	setDateLimit: function (pdate){

		limitDate = new Date();
		limitDate = new Date(limitDate.getFullYear(),limitDate.getMonth(), limitDate.getDate());

		if(pdate === '-w'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDay());
		}
		else if(pdate === '-m'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDate() + 1);
		}
	}

};

module.exports = commit;

/*var promise = new RSVP.Promise(function(resolve, reject){

			_.each(parray, function(item){
					repo = getRepository(item);
					repo.config(function (err, config){
						if(err){
							colog.log(colog.colorRed(err));
							reject(error);
						}
						else{
							configList.push([item, config.items['remote.origin.url']]);
							resolve(value);
						}
					});
				}
			);
			return promise;
		}*/


		/*var repo,
			configList = [];

		_.each(parray, function(value, index){
			repo = getRepository(value);

			repo.config(function (err, config){
				if(err){
					colog.log(colog.colorRed(err));
				}
				else{
					configList.push([value, config.items['remote.origin.url']]);
				}

				if (index === parray.length - 1){
					callback(configList);
				}
			});
		});*/
	

//--------------------------

/*var repo,
			configList = [];

		async.each(parray, function(item, callback){
				repo = getRepository(item);
				repo.config(function (err, config){
					if(err){
						colog.log(colog.colorRed(err));
					}
					else{
						configList.push([item, config.items['remote.origin.url']]);
					}
					callback();
				});
			},

			function(err){
				pfunction(configList);
			}
		);*/

// ----------------

/*printRepoName: function(pconfig){
		colog.log(pconfig.items['remote.origin.url']);
	}
*/


/*var repo = getRepository(ppath);

		repo.branches(function(err, branches){
			console.log('algo');
			if(err){
				colog.log(colog.colorRed(err));
			}
			else{
				console.log(branches);
				pfunction();
			}
			
		});*/


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

	/* ppath: repository path
	parray: array of branches
	prints the information of the commits */
	/*getCommits: function(ppath, parray){
		_.each(parray,function(value,index){
			dataAccess.getCommitsList(ppath, value.name, NUMBER_COMMITS, 0, commit.printCommitsList);
		});
	},*/