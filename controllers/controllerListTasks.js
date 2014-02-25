var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var NUMBER_COMMITS = 10,
	FORMATHOUR = /[^(]+\(\d+h\)/g,
	DIGITOS = /\d+/g;

var results,
	successes = 0;

var callb = function(branches){
	successes++;
	results['repoName'] = branches;
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


	_.each(parray,function(value,index){

		if(	value.author.name === gitName && value.committed_date >= limitDate && FORMATHOUR.test(value.message)){
			message = value.message.split('\n');
			message = message[0];
			colog.log(colog.colorBlue(message));
			colog.log(colog.colorBlue(value.committed_date + '\n'));
			console.log('---------------------------------------- \n');
		}
	});
};



var controllerListTasks = {

	/* 
	print the tasks realized by an user
	pdate: maximum date d/w/m
	*/
	listTasks: function(pdate){
		var repos,
			user,
			successes = 0;

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){
				user = config.getConfigUser();
				repos = config.getConfigRepos();
				commit.setDateLimit(pdate);

				colog.log(colog.colorBlue('Loading...'));

				_.each(repos,function(value,index){
					commit.getRepoConfig(value);
					commit.getRepo(value, pdate, user.gitUser, callb);
				});

				while(successes < repos.length){
					//time <= (startTime+timeout_time) 
				}

				/*each(function(value,index)){
					printCommits(value, index);
				}*/

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