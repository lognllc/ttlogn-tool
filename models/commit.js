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

	/* pindexRepo: the index of the repository 
	pindexBranch: the index of the branch
	get commits of a branch */
	getCommits: function(prepo, pbranch){
		
		var promise = new RSVP.Promise(function(resolve, reject){
			var date = new Date(),
				numberCommits = 0,
				skip = 0,
				numberArray = 0,
				self = this,
				continueWhile = true;
						
			async.doWhilst(
				function (callback) {
					repo = getRepository(prepo.path);
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
				resolve(self);
			}).catch(function(reason){
				colog.log(colog.colorRed(reason));
				reject(self);
			});
		});
		return promise;
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

	/* pprepos: the array of repositories
	pfunction: function to send the result array
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
				resolve(self);
			}
			else{
		//		console.log('entre all');
				repo = getRepository(prepo.path);
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
						resolve(self);
					}
				});
			}
		});
		return promise;
	},

	/* pprepos: the array of repositories
	pfunction: function to send the result array
	get the branches of the repositories */
	getBranches: function(prepos){
		var promise = new RSVP.Promise(function(resolve, reject){
			var promises = [],
				self = this;

			_.each(prepos, function(item){
				promises.push(commit.getBranch(item));
			});

			RSVP.all(promises).then(function(){
				resolve(self);
			}).catch(function(reason){
				reject(self);
			});
		});
		return promise;
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
	},

	getRepoConfig: function(prepo){
		var promise = new RSVP.Promise(function(resolve, reject){

			var repo = {},
				self = this,
				objectRepo = {};

			repo = getRepository(prepo.path);
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
					/*if(_.isArray(prepo.project)){
						objectRepo.configBranches = prepo.project;
					}*/
					//	console.log(objectRepo);
					resolve(objectRepo);
				}
			});
		});
		return promise;
	},

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
				resolve(self);
			}).catch(function(reason){
				reject(self);
			});
		});
		return promise;
	}
};

module.exports = commit;