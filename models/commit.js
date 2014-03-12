var path = require('path'),
	colog = require('colog'),
	_ = require('underscore'),
	git  = require('gift'),
	async = require('async'),
	moment = require('moment'),
	RSVP = require('rsvp');

var NUMBER_COMMITS = 10,
	FORMATHOUR = /[^(]+\(\d+h\)/g,
	DIGITOS = /\d+/g;

var limitDate = new Date(),
	gitName = '',
	repoArray = [];

/* ppath: path of the directory
return the directory */
var getRepository = function (ppath)
{
	return git(ppath);
};

var commit = {

	// returns the limit date
	getDateLimit: function(){
		return limitDate;
	},

	/* prepos: the array of repositories
	pfunction: function to send the result array
	return an array with the config of the repos */
	getRepoName: function(prepos, pfunction){
		
		var repo = [],
			configList = [],
			objectRepo = {};

		async.each(prepos, function(item, callback){
				repo = getRepository(item.path);
				repo.config(function (err, config){
					if(err){
						colog.log(colog.colorRed(err));
					}
					else{
						objectRepo = {
							path: item.path,
							name: config.items['remote.origin.url'],
							project: item.project,
							//projectId: item.projectId,
							branches: []
						};
						configList.push(objectRepo);
					}
					callback();
				});
			},

			function(err){
				pfunction(configList);
			}
		);
	},

	/* pprepos: the array of repositories
	pfunction: function to send the result array
	get the branches of the repositories */
	getBranches: function(prepos, pfunction){

		var repo = [],
			objectBrach = {};
			
		async.each(prepos, function(item, callback){
				repo = getRepository(item.path);
				repo.branches(function (err, branches){
					_.each(branches, function(value,index){
						objectBrach = {
							name: value.name,
							repository: item.name,
							project: item.project.name,
							projectId: item.project.id,
							commits: []
						};

						item.branches.push(objectBrach);
					});
					callback();
				});
			},
			function(err){
				pfunction(prepos);
			}
		);
	},

	/* pindexRepo: the index of the repository 
	pindexBranch: the index of the branch
	get commits of a branch */
	getCommits: function(pindexRepo, pindexBranch){
		
		var promise = new RSVP.Promise(function(resolve, reject) {
			var date = new Date(),
				numberCommits = 0,
				skip = 0,
				numberArray = 0,
				self = this,
				continueWhile = true;
						
			async.doWhilst(
				function (callback) {
					repo = getRepository(repoArray[pindexRepo].path);
					branch = repoArray[pindexRepo].branches[pindexBranch].name;

					repo.commits(branch, NUMBER_COMMITS, skip, function(err, commits){
						if(err){
							colog.log(colog.colorRed(err));
						}
						else{
							repoArray[pindexRepo].branches[pindexBranch].commits = repoArray[pindexRepo].branches[pindexBranch].commits.concat(commits);
							numberArray = commits.length - 1;
							date = commits[numberArray].committed_date;
							skip += NUMBER_COMMITS;

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
					resolve(self);
				});
			});
		return promise;
	},

	/* prepos: the array of repositories
	pfunction: function to send the result array
	gets commits of a branch */
	getBranchCommits: function(prepos, pfunction){
		var promises = [];

		repoArray = prepos;

		_.each(repoArray, function(repository, indexRepo){
			_.each(repository.branches, function(branch, indexBranch){
				promises.push(commit.getCommits(indexRepo, indexBranch));
			});
		});

		RSVP.all(promises).then(function(posts) {
			pfunction(repoArray);
		}).catch(function(reason){
			colog.log(colog.colorRed(reason));
		});
	},

	/* pdate: -d/-w/-m
	prints the information of the commits */
	setDateLimit: function (pdate){

		limitDate = moment().startOf('day');

		if(pdate === '-w'){
			limitDate = moment().startOf('week');
		}
		else if(pdate === '-m'){
			limitDate = moment().startOf('month');
		}
	},

	/* pprepo: path of the repository
	pfunction: function to send the result array
	get the branches of the repositories */
	getRepoBranches: function(prepo, pfunction){

		var repo = [],
			objectBrach = {};
			
		repo = getRepository(prepo);
		repo.branches(function (err, branches){
			if(err){
				console.log('no');
				colog.log(colog.colorRed('Error: ' + err));
			}
			else{

			console.log('si');
				pfunction(branches);
			}
		});
	}
};

module.exports = commit;