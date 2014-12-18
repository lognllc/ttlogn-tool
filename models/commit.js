var path = require('path'),
	colog = require('colog'),
	_ = require('underscore'),
	git  = require('gift'),
	async = require('async'),
	moment = require('moment-timezone'),
	RSVP = require('rsvp');

var NUMBER_COMMITS = 10;

var limitDate = new Date();

var commit = {

	// returns the limit date
	getDateLimit: function(){
		return limitDate;
	},

	/* prepo: repository 
	pbranch: branch of a repo
	get commits of a branch */
	getCommits: function(prepo, pbranch){
		var promise = new RSVP.Promise(function(resolve, reject){
			var date = moment(),
				numberCommits = 0,
				skip = 0,
				numberArray = 0,
				self = this,
				continueWhile = true;
						
			async.doWhilst(
				function (callback) {
					repo = git(prepo.path);
					branch = pbranch.name;
					
					repo.commits(branch, NUMBER_COMMITS, skip, function(err, commits){
						if(!err){
							pbranch.commits = pbranch.commits.concat(commits);
							numberArray = commits.length - 1;
							date = _.last(commits).committed_date;
							skip += NUMBER_COMMITS;
		
							if(moment(limitDate).isAfter(date) || numberArray !== (NUMBER_COMMITS - 1)) continueWhile = false;
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
						colog.log(colog.colorRed(err));
						resolve();
						return false;
					}
					resolve();
				});
			});
		return promise;
	},

	/* prepos: the array of repositories
	gets commits of a branch */
	getBranchCommits: function(prepos){
		var promise = new RSVP.Promise(function(resolve, reject){
			var promises = [];

			_.each(prepos, function(repository){
				_.each(repository.branches, function(branch){
					promises.push(commit.getCommits(repository, branch));
				});
			});

			RSVP.all(promises).then(function(){
				resolve();
			}).catch(function(reason){
				console.log('entre!!');
				colog.log(colog.colorRed(reason));
				reject(reason);
			});
		});
		return promise;
	},

	/* pdate: -d/-w/-m
	set the limit date of the commits of the commits */
	setDateLimit: function (pdate){
		var MONDAY = 1;

		limitDate = moment().startOf('day');

		if(pdate === '-w'){
			limitDate = moment().isoWeekday(MONDAY).startOf('day');
		}
		else if(pdate === '-m'){
			limitDate = moment().startOf('month');
		}
	},

	/* pprepos: the array of repositories
	get the branches of the repositories */
	getBranch: function(prepo){
		var promise = new RSVP.Promise(function(resolve, reject){
			var repo = [],
				objectBrach = {};
					
			if(_.isArray(prepo.configBranches)){
				_.each(prepo.configBranches, function(value){
					objectBrach = {
						name: value.branch,
						project: value.name,
						projectId: value.id,
						commits: []
					};
					prepo.branches.push(objectBrach);
				});
				resolve();
			}
			else{
				repo = git(prepo.path);
				repo.branches(function (err, branches){
					if(err){
						colog.log(colog.colorRed(err));
						reject(err);
					}
					else{
						_.each(branches, function(value){
							objectBrach = {
								name: value.name,
								project: prepo.configBranches.name,
								projectId: prepo.configBranches.id,
								commits: []
							};

							prepo.branches.push(objectBrach);
						});
						resolve();
					}
				});
			}
		});
		return promise;
	},

	/* pprepos: the array of repositories
	get the branches of the repositories */
	getBranches: function(prepos){
		var promise = new RSVP.Promise(function(resolve, reject){
			var promises = [];

			_.each(prepos, function(item){
				promises.push(commit.getBranch(item));
			});

			RSVP.all(promises).then(function(){
				resolve();
			}).catch(function(reason){
				reject(reason);
			});
		});
		return promise;
	},

	/* pprepo: path of the repository
	get the branches of the repositories */
	getRepoBranches: function(prepo){
		var promise = new RSVP.Promise(function(resolve, reject){
			var repo = [],
				objectBrach = {};
				
			repo = git(prepo);
			repo.branches(function (err, branches){
				if(err){
					colog.log(colog.colorRed('Error: ' + err));
					reject(err);
				}
				else{
					resolve(branches);
				}
			});
		});
		return promise;
	},

	/*
	prepo: repo of the config file
	get the information of repository 
	*/
	getRepoConfig: function(prepo){
		var promise = new RSVP.Promise(function(resolve, reject){
			var EXTENSION = '.git';

			var repo = {},
				repoName = '',
				repoPath = '',
				objectRepo = {};

			repo = git(prepo.path);
			repo.config(function (err, config){
				if(err){
					colog.log(colog.colorRed(err));
					reject(err);
				}
				else{
					objectRepo = {
						path: prepo.path,
						configBranches: prepo.project,
						branches: []
					};
					repoName = path.basename(config.items['remote.origin.url'], EXTENSION);
					repoPath = path.basename(path.dirname(config.items['remote.origin.url']));
					objectRepo.name = repoPath + '/' +repoName;
					resolve(objectRepo);
				}
			});
		});
		return promise;
	},

	/*
	prepos: array of repositories
	pnewRepos: structure where the information of the repositories will be store
	get the information of an array repositories
	*/
	getReposConfig: function(prepos, pnewRepos){
		var promise = new RSVP.Promise(function(resolve, reject){
			var promises = [];

			_.each(prepos, function(item){
				promises.push(commit.getRepoConfig(item, pnewRepos));
			});

			RSVP.all(promises).then(function(repos){
				_.each(repos, function(value){
					pnewRepos.push(value);
				});
				resolve();
			}).catch(function(reason){
				reject(reason);
			});
		});
		return promise;
	}
};

module.exports = commit;