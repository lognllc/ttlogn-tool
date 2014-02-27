var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var NUMBER_COMMITS = 3,
	FORMATHOUR = /[^(]+\(\d+h\)/g,
	DIGITOS = /\d+/g,
	PATH = 0,
	BRANCH_NAME= 0,
	BRANCH_COMMITS= 1,
	REPO_NAME = 1,
	BRANCHES = 2,
	COMMITS = 3;

var gitName = '';

var getCommits = function(pparameter){
	commit.getBranchCommits(pparameter, printCommits);
};

var getBranches = function(pparameter){
	commit.getBranches(pparameter, getCommits);
};


/* ppath: repository path
parray: array of commits
pnumber: number of commits to begin with
pbranch: the branch
prints the information of the commits 
if the last commit has a high date than the limitDate,
and array has NUMBER_COMMITS - 1 elements, print the branch again */

var	printCommits = function(parray){
	var date,
	numberCommits,
	numberArray,
	message,
	limitDate;

	limitDate = commit.getDateLimit();

	// console.log(parray);

	_.each(parray, function(repository){
		console.log(repository.name);
		_.each(repository.branches, function(branch){
			console.log(branch.name);
			//console.log(branch);
			_.each(branch.commits, function(value){
				console.log('---------------------------------------- \n');
				//if(value.author.name === gitName && value.committed_date >= limitDate && FORMATHOUR.test(value.message)){
					colog.log(colog.colorBlue(FORMATHOUR.test(value.message)));
					colog.log(colog.colorBlue(value.message));
					message = value.message.split('\n');
					message = message[0];
					colog.log(colog.colorBlue(value.author.name + 'git '+  gitName));
					colog.log(colog.colorBlue(value.committed_date + 'fecha '+  limitDate));
					colog.log(colog.colorBlue(message));
					colog.log(colog.colorBlue(value.committed_date + '\n'));
				//}
			});
		});
	});


	/*_.each(parray,function(value,index){

		if(	value.author.name === gitName && value.committed_date >= limitDate && FORMATHOUR.test(value.message)){
			message = value.message.split('\n');
			message = message[0];
			colog.log(colog.colorBlue(message));
			colog.log(colog.colorBlue(value.committed_date + '\n'));
			console.log('---------------------------------------- \n');
		}
	});*/
};


var controllerListTasks = {

	/* 
	print the tasks realized by an user
	pdate: maximum date d/w/m
	*/

	listTasks: function(pdate){
		var repos,
			user,
			reposArray;
			//successes = 0;

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){

				commit.setDateLimit(pdate);
				
				user = config.getConfigUser();
				gitName = user.gitUser;
				repos = config.getConfigRepos();

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

module.exports = controllerListTasks;


/*_.each(repos,function(value,index){
				//	commit.getRepoConfig(value);
					console.log('llamar getBranches ' + value);
					commit.getBranches(value, callb);
				});*/
				
				//commit.getBranches(repos, callb);
				

			/*	while(successes < repos.length){
					//console.log('while loop:' + successes);
					//console.log(successes + 'largo' + repos.length);
					//time <= (startTime+timeout_time) 
				}
*/
				/*_.each(results, function(value,index){
					console.log(value + index );
				});*/