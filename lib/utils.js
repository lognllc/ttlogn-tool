var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	moment = require('moment-timezone'),
	prompt = require('prompt'),
	RSVP = require('rsvp'),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMAT_HOUR = /\(\d+(|\.\d+)h\)/i,
	INTEGER = /^\d+$/,
	TIME_IN = /^[0-2]\d\:[0-6]\d$/,
	FORMAT_TIME = /^\d+(|\.\d+)h$/i;


/* parray: array of commits
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

	printNames: function(parray){
		
		_.each(parray, function(value, index){
			index++;
			colog.log(colog.colorBlue(index + ': ' + value.name));
		});
	},

	/* prepos: array of repos
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

	/* ptask: the task to save
	save the task
	*/
	getPromptDetailHour: function(){
		var restriction = { description: "Begin of the task (HH:mm)".magenta,
			required: true,
			pattern: TIME_IN,
			message: 'Format: HH:mm. EX.: 09:05'.red
		};
		return utils.getPrompt(restriction);
	},

	/* ptask: the task to save
	save the task
	*/
	getPromptTime: function(){
		var restriction = { description: "Worked hours".magenta,
			required: true,
			pattern: FORMAT_TIME,
			message: 'Format: [float|int]h'.red
		};
		return utils.getPrompt(restriction);
	},

	/* ptask: the task to save
	save the task
	*/
	getPromptDescription: function(){
		var restriction = { description: "Description of the taks".magenta,
			required: true
		};
		return utils.getPrompt(restriction);
	},

/* ptask: the task to save
	save the task
	*/
	getPromptProject: function(){
		var restriction = { description: "Number of the project".magenta,
			required: true,
			pattern: INTEGER
		};
		return utils.getPrompt(restriction);
	},

	/* ptask: the task to save
	save the task
	*/
	getPromptTimeEntry: function(){
		var restriction = { description: "Number of the Time Entry".magenta,
			required: true,
			pattern: INTEGER
		};
		return utils.getPrompt(restriction);
	},

	/* ptask: the task to save
	save the task
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
				if(err){
					reject(self);
				}
				else{
					resolve(resultPrompt.result);
				}
			});
		});
		return promise;
	}

};

module.exports = utils;