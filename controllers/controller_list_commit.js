var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMATHOUR = /\(\d+(|\.\d+)h\)/i,
	ZONE = '-08:00',
	DATEFORMAT = 'l HH:mm'; // HH:mm

var gitName = '';


/* parray: array of commits
prints the information of the commits 
if the last commit has a high date than the limitDate
*/
var	sortCommits = function(parray){
	var projects = [];
		

	limitDate = commit.getDateLimit();

	_.each(parray, function(repository){
		var project = {
			name: '',
			commits: []
		};
		_.each(repository.branches, function(branch){
			_.each(branch.commits, function(value){
				date = moment.parseZone(value.committed_date).zone(ZONE).format(DATEFORMAT);
				limitDate = moment(limitDate).format(DATEFORMAT);
				if(value.author.name === gitName && date >= limitDate && FORMATHOUR.test(value.message)){
					project.commits.push(value);
				}
			});
		
		});
	});
	_.sortBy(projects, function(commitList){ return commitList; });

	_.each(projects, function(projectToPrint){
		_.each(projectToPrint, function(value){
			date = moment.parseZone(value.committed_date).zone(ZONE).format(DATEFORMAT);
			message = value.message.split('\n');
			message = message[0];
			colog.log(colog.colorBlue(message + ' Date: ' + date ));
			console.log('---------------------------------------- \n');
		});
	});
};


/* parray: array of commits
prints the information of the commits 
if the last commit has a high date than the limitDate
*/
var	printCommits = function(parray){
	var date = new Date(),
		message = '',
		limitDate = new Date(),
		projects = [];
		

	limitDate = commit.getDateLimit();

	_.each(parray, function(repository){
		var project = {
			name: '',
			commits: []
		};
		_.each(repository.branches, function(branch){
			_.each(branch.commits, function(value){
				date = moment.parseZone(value.committed_date).zone(ZONE).format(DATEFORMAT);
				limitDate = moment(limitDate).format(DATEFORMAT);
				if(value.author.name === gitName && date >= limitDate && FORMATHOUR.test(value.message)){
					project.commits.push(value);
				}
			});
		
		});
	});
	_.sortBy(projects, function(commitList){ return commitList; });

	_.each(projects, function(projectToPrint){
		_.each(projectToPrint, function(value){
			date = moment.parseZone(value.committed_date).zone(ZONE).format(DATEFORMAT);
			message = value.message.split('\n');
			message = message[0];
			colog.log(colog.colorBlue(message + ' Date: ' + date ));
			console.log('---------------------------------------- \n');
		});
	});
};

/* pprepos: array of the repositories and branches
get the commits
*/
var getCommits = function(prepos){
	commit.getBranchCommits(prepos, printCommits);
};

/* pconfig: array of the repositories
get the branches
*/
var getBranches = function(pconfig){
	commit.getBranches(pconfig, getCommits);
};

var controllerListCommits = {

	/* 
	list the commits the tasks realized by an user
	pdate: maximum date d/w/m
	*/
	listTasks: function(pdate){
		var repos = [],
			user = [];

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){

				commit.setDateLimit(pdate);
				
				configuration = config.getConfig();
				gitName = configuration.gitUser;
				repos = configuration.repositories;

				colog.log(colog.colorGreen('Loading...'));
				commit.getRepoName(repos, getBranches);
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
