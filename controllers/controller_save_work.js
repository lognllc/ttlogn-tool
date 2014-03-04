var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	time_entry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMATHOUR = /\((\d+|\d+\.\d+)h\)/m,
	DIGITOS = /(\d+|\d+\.\d+)/m;

var userId = 0,
	userType = '',
	arrayRepositories = [];


/* pmessage: message of the commit 
return a string with the number of hours worked
*/
var getWork = function(pmessage){
	
	var test = FORMATHOUR.exec(pmessage);
	console.log('Primero: ' + test);
	test = DIGITOS.exec(test[0]);
	console.log('Segundo: ' + test[0]);
	return test[0];
};

/* prepos: array of the repositories and branches
get the commits
*/
var getBillable = function(phours){
	var BILLABlE = 'Billable';
	var billableHour = _.find(phours, function(hour){ return hour.name === BILLABlE; });
	saveCommits(billableHour);
};

/* prepos: array of the repositories and branches
get the commits
*/
var getHourType = function(prepos){
	arrayRepositories = prepos;
//	console.log('antes de commits por branches');
	hourType.getHourType(getBillable);
};

/* prepos: array of the repositories and branches
get the commits
*/
var getCommits = function(prepos){

//	console.log('antes de billable');
	commit.getBranchCommits(prepos, getHourType);
};

/* pconfig: array of the repositories
get the branches
*/
var getBranches = function(pconfig){
//	console.log('antes de commits');
	commit.getBranches(pconfig, getCommits);
};

/* pconfig: array of the repositories
get the branches
*/
var getRepos = function(puser){

//	console.log('antes de branches');
	var	configuration = config.getConfig(),
		repos = configuration.repositories;
	
	userId = puser.result.id;
	userType = puser.result.devtype;
	//console.log(puser.result);
	commit.getRepoName(repos, getBranches);
};

/* prepos: array of commits
prints the information of the commits 
if the last commit has a high date than the limitDate
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
					minute = 0;

				if(value.author.name === gitName && value.committed_date >= limitDate && FORMATHOUR.test(value.message)){
					commitMessage = value.message.split('\n');
					commitMessage = commitMessage[0];
			
					colog.log(colog.colorBlue('Saving commit: ' +  commitMessage));

					if(userType === 'non_exempt'){
						commitToInsert = {
							created:  date,
							developer_id: userId,
							project_id: repository.projectId,
							description: commitMessage,
							time: getWork(commitMessage),
							hour_type_id: phourType
						};
					}
					else{

						hour = parseFloat(getWork(commitMessage));
						minute = (parseFloat(getWork(commitMessage)) % 1) * 60;

						timeIn = moment(value.committed_date);
						timeOut = moment(value.committed_date);
						timeOut.add((hour),'hours');
						timeOut.add((minute),'minutes');

						timeIn = timeIn.format('MM-DD-YYYY hh:mm:ss');
						timeOut = timeOut.format('MM-DD-YYYY hh:mm:ss');

						console.log(timeIn + '++++' + timeOut);

						commitToInsert = {
							created:  date,
							developer_id: userId,
							project_id: repository.projectId,
							description: commitMessage,
						//	time: getWork(commitMessage),
							hour_type_id: phourType,
							time_in: timeIn,
							time_out: timeOut
						};
					}
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


var controllerSaveWork = {

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
