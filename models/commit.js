var path = require('path'),
	colog = require('colog'),
	_ = require('underscore'),
	git  = require('gift'),
	async = require('async'),
	RSVP = require('rsvp'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/commit_data_access.js'));


var NUMBER_COMMITS = 3,
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
	success,
	promises = [];

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
			configList = [],
			objectRepo;

		async.each(parray, function(item, callback){
				repo = getRepository(item);
				repo.config(function (err, config){
					if(err){
						colog.log(colog.colorRed(err));
					}
					else{
						objectRepo = {
							path: item,
							name: config.items['remote.origin.url'],
							branches: []
						};
						//configList.push([item, config.items['remote.origin.url']]);
						configList.push(objectRepo);
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
			//branchesList,
			objectBrach;
			
		async.each(parray, function(item, callback){
				repo = getRepository(item.path);
				repo.branches(function (err, branches){
					//branchesList = [];
					_.each(branches, function(value,index){
						objectBrach = {
							name: value.name,
							repository: item.name,
							commits: []
						};
						item.branches.push(objectBrach);
					});
					callback();
				});
			},
			function(err){
				// All tasks are done now
				pfunction(parray);
				//console.log(parray);
				//console.log(parray[0].branches[0].name);
				//console.log(parray[1].branches[0].name);
			}
		);

	},

	/* ppath: path of the directory
	pbranch: name of the branch
	pnumber: the number of commits
	pskip: number of commits skips
	return commits of a branch */

	getCommits: function(pindexRepo, pindexBranch){
		
		var promise = new RSVP.Promise(function(resolve, reject) {
			var date,
				numberCommits,
				skip = 0,
				count,
				numberArray;

			var self = this,
				continueWhile = true;

				repo = getRepository(repoArray[pindexRepo].path);
				branch = repoArray[pindexRepo].branches[pindexBranch].name;

				async.doWhilst(
					function (callback) {
						//console.log('antes de branch');
						//console.log(repo);

						repo.commits(branch, NUMBER_COMMITS, skip, function(err, commits){
							if(err){
								colog.log(colog.colorRed(err));
							}
							else{
								repoArray[pindexRepo].branches[pindexBranch].commits = repoArray[pindexRepo].branches[pindexBranch].commits.concat(commits);
								numberArray = commits.length - 1;
								date = commits[numberArray].committed_date;
								skip += NUMBER_COMMITS;
								
								console.log('iteracion');
								//console.log(repoArray[pindexRepo].branches[pindexBranch]);

								if(date < limitDate || numberArray !== (NUMBER_COMMITS - 1)) continueWhile = false;
							}
							callback(err);
						});
					},
					function () {
						var ret = true;
						if(!continueWhile){
							ret = false;
						}
						return ret; },
					function (err) {
						if(err){
							reject(self);
							return false;
						}
						//console.log('llamando a promesa');
						resolve(self);
					}
				);
			});
		return promise;
	},

	/* ppath: path of the directory
	pbranch: name of the branch
	pnumber: the number of commits
	pskip: number of commits skips
	return commits of a branch */
	getBranchCommits: function(parray, pfunction){
		repoArray = parray;
		success = 0;

		_.each(repoArray, function(repository, indexRepo){
			_.each(repository.branches, function(branch, indexBranch){
				promises.push(commit.getCommits(indexRepo, indexBranch));
				//console.log('aqui');
			});
		});

		//console.log(promises);
		RSVP.all(promises).then(function(posts) {
			//console.log('aqui2');
			pfunction(repoArray);
		}).catch(function(reason){
			colog.log(colog.colorRed(reason));
		});
	},

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