var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment-timezone'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	timeEntry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js')),
	detailTime = require(path.resolve(__dirname,'../models/detail_time.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

/* pmessage: message of the commit 
return a string with the number of hours worked
*/
var setDetailTime = function(pentry, phour, pdate){
	var timeOut = pdate;

	timeOut.add((phour),'hours');

	pentry.time_in = pdate.format('HH.mm');
	pentry.time_out  = timeOut.format('HH.mm');
};

/* phourType: hour type
saves the commits in the TT
*/
var	saveCommits = function(puser, prepos, phourType){

	var date = moment().format('YYYY-MM-DD HH:mm:ss'),
	promises = [];

	_.each(prepos, function(projects){
		_.each(projects, function(project){

			_.each(project.commits, function(value){
				var commitToInsert = {},
					timeIn = '',
					timeOut = '',
					commitMessage = '',
					hour = 0,
					work = 0;

				date = value.date.format('YYYY-MM-DD HH:mm:ss');
				work = utils.getWork(value.message);
				commitMessage = value.message.split('\n');
				value.message = commitMessage[0];
				colog.log(colog.colorBlue('Saving commit: ' +  value.message));

				commitToInsert = {
						created:  date,
						developer_id: puser.id,
						project_id: project.id,
						description: value.message,
						time: work,
						hour_type_id: phourType.id
					};

				if(puser.devtype === 'non_exempt'){
					hour = parseFloat(work);
					detailTime.setDetailTime(commitToInsert, hour, value.date);
				}
				console.log(commitToInsert);
				promises.push(timeEntry.postTimeEntry(commitToInsert));
			});
		});
	});
	RSVP.all(promises).then(function(posts) {
			colog.log(colog.colorGreen('Saved successful'));
		}).catch(function(reason){
			colog.log(colog.colorRed(reason));
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
};


var controllerSaveWork = {

	/*pdate: sets the limit date [-d|-w|-m]
	saves the commits of an user in the TT*/
	saveWork: function(pdate){
		var repos = [],
			reposConfig = [],
			userInfo = {},
			billable = 0,
			newRepos = [],
			configuration = config.getConfig();

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){

				colog.log(colog.colorGreen('Loading...'));
				commit.setDateLimit(pdate);
				reposConfig = configuration.repositories;

				user.login(configuration.email, configuration.password).then(function(puser){
					userInfo = puser.result;
					return hourType.getHourType(userInfo.id);

				}).then(function(phourType){
					billable = hourType.getBillable(phourType.result);
					return commit.getReposConfig(reposConfig, repos);

				}).then(function(){
					return commit.getBranches(repos);

				}).then(function(){
					return commit.getBranchCommits(repos);

				}).then(function(){
					newRepos = utils.bindCommits(repos, configuration.gitUser);
					saveCommits(userInfo, newRepos, billable);
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

module.exports = controllerSaveWork;
