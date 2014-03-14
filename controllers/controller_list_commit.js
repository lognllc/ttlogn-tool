var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMAT_HOUR = /\(\d+(|\.\d+)h\)/i,
	DIGITS = /[^\(\)h]+/i,
	ZONE = '-08:00',
	DATE_FORMAT = 'dddd, DD MMMM YYYY'; // HH:mm

/* pmessage: message of the commit 
return a string with the number of hours worked
*/
var getWork = function(pmessage){
	var test = FORMAT_HOUR.exec(pmessage);
	test = DIGITS.exec(test[0]);
	return test[0];
};

/* prepos: array of repos
sort the commits by time
*/
var	sortProjects = function(prepos){

	_.each(prepos, function(projects){
		_.each(projects, function(project){
			var sortedProject = _.sortBy(project.commits, function(sortedCommit)
				{ return sortedCommit.date; });
			//console.log(project.commits[0].date);
			project.commits = sortedProject;
			_.each(project.commits, function(comm){
				// console.log(comm);
				console.log(comm.date.format(DATE_FORMAT));
			});
		});
	});
};

/* prepos: array of repos with commits
prints the information of the commits 
*/
var	printCommits = function(prepos){
	var date = moment(),
		message = '',
		limitDate = moment(),
		hoursPerDate = 0,
		hoursPerTask = 0,
		firstCommit = {};

		limitDate = moment().startOf('day');
		//sortProjects(prepos);

	_.each(prepos, function(projects){
		_.each(projects, function(project){
			if(project.commits.length !== 0){
				//console.log(project.commits.length);
				console.log('\n-------------------------------');
				colog.log(colog.apply(project.name, ['underline', 'bold', 'colorBlue']));
				console.log('-------------------------------\n');


				firstCommit = _.first(project.commits);
				date = firstCommit.date;
				limitDate.date(date.get('date'));
				limitDate.month(date.get('month'));
				limitDate.year(date.get('year'));
				date = date.format(DATE_FORMAT);
				colog.log(colog.apply(date, ['bold', 'colorBlue']));

				_.each(project.commits, function(value){
					
					if(value.date <= limitDate){
						colog.log(colog.apply('Hours worked: '+ hoursPerDate + '\n', ['colorGreen']));
						hoursPerDate = 0;
						limitDate.date(value.date.get('date'));
						limitDate.month(value.date.get('month'));
						limitDate.year(value.date.get('year'));

						date = value.date.format(DATE_FORMAT);
						colog.log(colog.apply(date, ['bold', 'colorBlue']));
					}
					
					hoursPerTask = parseFloat(getWork(value.message));
					hoursPerDate += hoursPerTask;
					//date = value.date.format(DATE_FORMAT);
					colog.log(colog.colorBlue('\t' + value.message + ' ' + date));
					
				});
				colog.log(colog.apply('Hours worked: '+ hoursPerDate, ['colorGreen']));
				hoursPerDate = 0;
			}
		});
	});
};


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
	//return repos;
};


/* prepos: array of repos
merges the branches with the same project
*/
var	bindCommits = function(prepos, pgitName){
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
							};

						date = moment.parseZone(value.committed_date).zone(ZONE);
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
	printCommits(repos);
};


var controllerListCommits = {

	/* 
	list the commits the tasks realized by an user
	pdate: maximum date d/w/m
	*/
	listTasks: function(pdate){
		var reposConfig = [],
			repos = [],
			user = [];

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){

				commit.setDateLimit(pdate);
				
				configuration = config.getConfig();
				//gitName = configuration.gitUser;
				reposConfig = configuration.repositories;
				colog.log(colog.colorGreen('Loading...'));
				
				commit.getReposConfig(reposConfig, repos).then(function(){
					//console.log(repos);
					return commit.getBranches(repos);

				}).then(function() {
					//console.log(repos[0].branches);
					return commit.getBranchCommits(repos);

				}).then(function() {
					//console.log(repos[0].branches[0].commits);
					bindCommits(repos, configuration.gitUser);

				}).catch(function(error) {
					colog.log(colog.colorRed(error));
				});
			}
			else{
				colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
			}
		}
		else{
			colog.log(colog.colorRed('Error: ttlogn ls [-d/-w/-m]'));
		}
	}

};

module.exports = controllerListCommits;
