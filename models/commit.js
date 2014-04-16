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
					//console.log(pbranch);

					repo.commits(branch, NUMBER_COMMITS, skip, function(err, commits){
						if(err){
							colog.log(colog.colorRed(err));
						}
						else{
							//console.log(pbranch);
							pbranch.commits = pbranch.commits.concat(commits);
							numberArray = commits.length - 1;
							date = _.last(commits).committed_date;
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
					resolve();
				});
			});
		return promise;
	},

	/* prepos: the array of repositories
	gets commits of a branch */
	getBranchCommits: function(prepos){
		var promise = new RSVP.Promise(function(resolve, reject){
			var promises = [],
				self = this;

			_.each(prepos, function(repository){
				_.each(repository.branches, function(branch){
					promises.push(commit.getCommits(repository, branch));
				});
			});

			RSVP.all(promises).then(function(posts){
				resolve();
			}).catch(function(reason){
				colog.log(colog.colorRed(reason));
				reject(self);
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
			limitDate = moment().isoWeekday(MONDAY);
			//console.log(limitDate.format('l'));
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
				objectBrach = {},
				self = this;
					
			if(_.isArray(prepo.configBranches)){
				//console.log('entre branches');
				_.each(prepo.configBranches, function(value){
					objectBrach = {
						name: value.branch,
						project: value.name,
						projectId: value.id,
						commits: []
					};
					prepo.branches.push(objectBrach);
		//				console.log(item.branches);
				});
				resolve();
			}
			else{
		//		console.log('entre all');
				repo = git(prepo.path);
				repo.branches(function (err, branches){
					if(err){
						colog.log(colog.colorRed(err));
						reject(self);
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
			var promises = [],
				self = this;

			_.each(prepos, function(item){
				promises.push(commit.getBranch(item));
			});

			RSVP.all(promises).then(function(){
				resolve();
			}).catch(function(reason){
				reject(self);
			});
		});
		return promise;
	},

	/* pprepo: path of the repository
	get the branches of the repositories */
	getRepoBranches: function(prepo){
		var promise = new RSVP.Promise(function(resolve, reject){
			var repo = [],
				self = this,
				objectBrach = {};
				
			repo = git(prepo);
			repo.branches(function (err, branches){
				if(err){
					colog.log(colog.colorRed('Error: ' + err));
					reject(self);
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

			var repo = {},
				self = this,
				objectRepo = {};

			repo = git(prepo.path);
			repo.config(function (err, config){
				if(err){
					colog.log(colog.colorRed(err));
					reject(self);
				}
				else{
					objectRepo = {
						path: prepo.path,
						name: config.items['remote.origin.url'],
						configBranches: prepo.project,
						branches: []
					};
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
			var promises = [],
				self = this;

			_.each(prepos, function(item){
				promises.push(commit.getRepoConfig(item, pnewRepos));
			});

			RSVP.all(promises).then(function(repos){
				_.each(repos, function(value){
					pnewRepos.push(value);
				});
				resolve();
			}).catch(function(reason){
				reject(self);
			});
		});
		return promise;
	}
};

module.exports = commit;