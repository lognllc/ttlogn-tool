var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	timeEntry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMATHOUR = /\(\d+(|\.\d+)h\)/i,
	DIGITS = /[^\(\)h]+/i;

var userId = 0,
	userType = '',
	arrayRepositories = [];


/* pmessage: message of the commit 
return a string with the number of hours worked
*/
var getWork = function(pmessage){
	var test = FORMATHOUR.exec(pmessage);
	test = DIGITS.exec(test[0]);
	return test[0];
};

/* phourType: hour type
saves the commits in the TT
*/
var	saveCommits = function(phourType){

	var date = moment().format('YYYY-MM-DD hh:mm:ss'),
	commitMessage = '',
	limitDate = '',
	configuration = config.getConfig(),
	gitName = configuration.gitUser;
	promises = [];
	
	limitDate = commit.getDateLimit();

	_.each(arrayRepositories, function(repository){
		_.each(repository.branches, function(branch){
			_.each(branch.commits, function(value){
				var commitToInsert = {},
					timeIn = '',
					timeOut = '',
					hour = 0,
					work = 0;

				if(value.author.name === gitName && value.committed_date >= limitDate && FORMATHOUR.test(value.message)){
					commitMessage = value.message.split('\n');
					commitMessage = commitMessage[0];
					work = getWork(commitMessage);
					colog.log(colog.colorBlue('Saving commit: ' +  commitMessage));

					commitToInsert = {
							created:  date,
							developer_id: userId,
							project_id: repository.projectId,
							description: commitMessage,
							time: work,
							hour_type_id: phourType.id
						};

					if(userType === 'non_exempt'){
						
						timeIn = moment(value.committed_date);
						timeOut = moment(value.committed_date);
						timeOut.add((hour),'hours');

						timeIn = timeIn.format('HH.mm');
						timeOut = timeOut.format('HH.mm');
						
						commitToInsert.time_in = timeIn;
						commitToInsert.time_out = timeOut;
					}
					promises.push(timeEntry.postTimeEntry(commitToInsert));
				}
			});
		});
	});
	RSVP.all(promises).then(function(posts) {
			colog.log(colog.colorGreen('Saved successful'));
		}).catch(function(reason){
			colog.log(colog.colorRed(reason));
		});
};

/* phours: array of type of hours
get billable type, 
*/
var getBillable = function(phours){
	var BILLABlE = 'Billable';
	var billableHour = _.find(phours, function(hour){ return hour.name === BILLABlE; });
	saveCommits(billableHour);
};

/* prepos: array of the repositories, branches and commits
get hour types
*/
var getHourType = function(prepos){
	arrayRepositories = prepos;
	hourType.getHourType(getBillable);
};

/* prepos: array of the repositories and branches
get the commits
*/
var getCommits = function(prepos){
	commit.getBranchCommits(prepos, getHourType);
};

/* pconfig: array of the repositories
get the branches
*/
var getBranches = function(pconfig){
	commit.getBranches(pconfig, getCommits);
};

/* pconfig: array of the repositories
get the branches
*/
var getRepos = function(puser){
	var	configuration = config.getConfig(),
		repos = configuration.repositories;
	
	userId = puser.result.id;
	userType = puser.result.devtype;
	commit.getRepoName(repos, getBranches);
};

var controllerSaveWork = {

	/*pdate: sets the limit date [-d|-w|-m]
	saves the commits of an user in the TT*/
	saveWork: function(pdate){
		var repos = [],
			configuration = config.getConfig();

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){
				commit.setDateLimit(pdate);
				colog.log(colog.colorGreen('Loading...'));
				user.login(configuration.email, configuration.password, getRepos);
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

module.exports = controllerSaveWork;
