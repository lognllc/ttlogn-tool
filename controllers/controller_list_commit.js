var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment-timezone'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var DATE_FORMAT = 'dddd, DD MMMM YYYY'; //--- HH:mm


/* prepos: array of repos
sort the commits by time
*/
var	sortProjects = function(prepos){
	_.each(prepos, function(projects){
		_.each(projects, function(project){
			var sortedProject = _.sortBy(project.commits, function(sortedCommit)
				{ return sortedCommit.date; });
			project.commits = sortedProject.reverse();
		});
	});
};

/* prepos: array of repos
sort the commits by time
*/
var	setPrintDateLimit = function(pdate){
	var limitDate = moment().startOf('day');
	limitDate.date(pdate.get('date'));
	limitDate.month(pdate.get('month'));
	limitDate.year(pdate.get('year'));
	return limitDate;
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
		sortProjects(prepos);

	_.each(prepos, function(projects){
		_.each(projects, function(project){
			if(project.commits.length !== 0){

				console.log('\n-------------------------------');
				colog.log(colog.apply(project.name, ['underline', 'bold', 'colorBlue']));
				console.log('-------------------------------\n');

				firstCommit = _.first(project.commits);
				date = firstCommit.date;
				limitDate = setPrintDateLimit(date);
				date = date.format(DATE_FORMAT);
				
				colog.log(colog.apply(date, ['bold', 'colorBlue']));

				_.each(project.commits, function(value){
					
					if(value.date <= limitDate){
						colog.log(colog.apply('Hours worked: '+ hoursPerDate + '\n', ['colorGreen']));
						hoursPerDate = 0;
						limitDate = setPrintDateLimit(value.date);

						date = value.date.format(DATE_FORMAT);
						colog.log(colog.apply(date, ['bold', 'colorBlue']));
					}
					hoursPerTask = parseFloat(utils.getWork(value.message));
					hoursPerDate += hoursPerTask;
					message = value.message.split('\n');
					value.message = message[0];
					colog.log(colog.colorBlue('\t' + value.message));
				});
				colog.log(colog.apply('Hours worked: '+ hoursPerDate, ['colorGreen']));
				hoursPerDate = 0;
			}
		});
	});
};


var controllerListCommits = {

	/* 
	list the commits the tasks realized by an user
	pdate: maximum date d/w/m
	*/
	listTasks: function(pdate){
		var reposConfig = [],
			repos = [],
			user = [],
			newRepos = [];

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){

				commit.setDateLimit(pdate);
				
				configuration = config.getConfig();
				reposConfig = configuration.repositories;
				colog.log(colog.colorGreen('Loading...'));
				
				commit.getReposConfig(reposConfig, repos).then(function(){
					return commit.getBranches(repos);

				}).then(function() {
					return commit.getBranchCommits(repos);

				}).then(function() {
					newRepos = utils.bindCommits(repos, configuration.gitUser);
					printCommits(newRepos);

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
