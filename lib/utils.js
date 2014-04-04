var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	moment = require('moment-timezone'),
	prompt = require('prompt'),
	RSVP = require('rsvp'),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMAT_HOUR = /\(\d+(|\.\d+)h\)/i,
	INTEGER = /^\d+$/,
	DIGITS = /[^\(\)h]+/i,
	YES_OR_NO = /^(y|n)$/,
	TIME_IN = /^[0-2]\d\:[0-6]\d$/,
	FORMAT_TIME = /^\d+(|\.\d+)h$/i;


/* prepo: array of commits
sort the repo "tree"
*/
var	sortRepos = function(prepos){
	var repos =[],
		branches;

	repos = _.sortBy(prepos, function(repository){ return repository.name; });

	_.each(repos, function(repository){
		branches = _.sortBy(repository.branches, function(branch){ return branch.projectId; });
		repository.branches = branches;
	});
	prepos = repos;
};


var utils = {

	/* parray: array of items
	print the description of the items
	*/
	printArray: function(parray, patribute){
		_.each(parray, function(value, index){
			index++;
			colog.log(colog.colorBlue(index + ': ' + value[patribute]));
		});
	},

	/* prepos: array of repos
	pgitName: git name of the user
	merges the branches with the same project
	*/
	bindCommits: function(prepos, pgitName){
		var repos = [],
			validCommits = {
				commits: []
			},
			existCommit = '',
			projectId = -1;

		limitDate = commit.getDateLimit();
		sortRepos(prepos);

		_.each(prepos, function(repository){
			var projects = [];
			_.each(repository.branches, function(branch){
				var	project = {
						id: -1,
						name: '',
						commits: []
					},
					projectRepo = _.filter(repository.branches, function(projectBranch){
						return projectBranch.projectId === branch.projectId; });
				
				if(projectId !== branch.projectId){
					projectId = branch.projectId;
					project.id = branch.projectId;
					project.name = branch.project;
					
					_.each(projectRepo, function(projectBranch){
						_.each(projectBranch.commits, function(value){
							var validCommit = {
									id: -1,
									date: moment(),
									message: ''
								},
								date = moment.parseZone(value.committed_date);

							if(value.author.name === pgitName && date >= limitDate && FORMAT_HOUR.test(value.message)){
								existCommit = _.findWhere(project.commits, {id: value.id});
								if(typeof existCommit === 'undefined'){
									validCommit.id = value.id;
									validCommit.date = date;
									validCommit.message = value.message;
									project.commits.push(validCommit);
								}
							}
						});
					});
					projects.push(project);
				}
			});
			repos.push(projects);
		});
		return repos;
	},

		/*
	prestriction: restriction of the 
	returns the prompt of a restriction
	*/
	getPrompt: function(prestriction){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this;
			prompt.start();
			prompt.get({
				properties: {
					result: prestriction
				}
			}, function (err, resultPrompt) {
				if(!err){
					resolve(resultPrompt.result);
				}
				else{
					reject(self);
				}
			});
		});
		return promise;
	},

	/*
	pname: name to print 
	returns the confirmation
	*/
	getConfirmation: function(pname){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this;
			
			colog.log(colog.colorBlue('Do you want to delete: ' + pname));

			prompt.start();
			prompt.get({
				properties: {
					result: {
						description: '(y or n)'.magenta,
						required: true,
						pattern: YES_OR_NO
					}
				}
			}, function (err, resultPrompt) {
				if(!err){
					if(resultPrompt.result === 'y'){
						resolve();
					}
					else{
						colog.log(colog.colorRed('Canceled'));
						process.exit(0);
					}
				}
				else{
					reject(self);
				}
			});
		});
		return promise;
	},

	/*
	prestriction: restriction of the 
	parray: array of items to select
	returns the prompt of a restriction
	*/
	getNumberPrompt: function(prestriction, parray){
		var promise = new RSVP.Promise(function(resolve, reject){
			var cancel = parray.length,
				self = this;
			
			cancel++;
			colog.log(colog.colorBlue(cancel + ': Cancel'));
			
			prompt.start();
			prompt.get({
				properties: {
					result: prestriction
				}
			}, function (err, resultPrompt) {
				if(!err){
					if(resultPrompt.result < cancel){
						resolve(parray[resultPrompt.result - 1]);
					}
					else{
						colog.log(colog.colorRed('Canceled'));
						process.exit(0);
					}
				}
				else{
					reject(self);
				}
			});
		});
		return promise;
	},

	/* pmessage: message of the commit 
	return a string with the number of hours worked
	*/
	getWork: function(pmessage){
		var test = FORMAT_HOUR.exec(pmessage);
		test = DIGITS.exec(test[0]);
		return test[0];
	},

	/* pmessage: message of the work
	return a string with the number of hours worked
	*/
	getWorkedHours: function(pmessage){
		var test = DIGITS.exec(pmessage);
		return test[0];
	},

	/*
	returns the prompt of a name
	*/
	getPromptText: function(ptext){
		var restriction = { description: ptext.magenta,
			required: true
		};
		return utils.getPrompt(restriction);
	},

	/*
	pprojects: array of projects
	returns the prompt of a selected project
	*/
	getPromptNumber: function(ptext, parray){
		var restriction = { description: ptext.magenta,
			required: true,
			pattern: INTEGER
		};
		return utils.getNumberPrompt(restriction, parray);
	},

	/*
	returns the prompt of a detail hour
	*/
	getPromptDetailHour: function(){
		var restriction = { description: 'Begin of the task (HH:mm)'.magenta,
			required: true,
			pattern: TIME_IN,
			message: 'Format: HH:mm. EX.: 09:05'.red
		};
		return utils.getPrompt(restriction);
	},

	/*
	returns the prompt of an hour time
	*/
	getPromptTime: function(){
		var restriction = { description: 'Worked hours'.magenta,
			required: true,
			pattern: FORMAT_TIME,
			message: 'Format: [float|int]h'.red
		};
		return utils.getPrompt(restriction);
	}

};

module.exports = utils;