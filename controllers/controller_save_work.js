var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	timeEntry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js')),
	//emitter = require('events').EventEmitter,
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMAT_HOUR = /\(\d+(|\.\d+)h\)/i,
	ZONE = '-08:00',
	DIGITS = /[^\(\)h]+/i;

/* pmessage: message of the commit 
return a string with the number of hours worked
*/
var getWork = function(pmessage){
	var test = FORMAT_HOUR.exec(pmessage);
	test = DIGITS.exec(test[0]);
	return test[0];
};

/* phourType: hour type
saves the commits in the TT
*/
var	saveCommits = function(puser, prepos, phourType){

	var date = moment().format('YYYY-MM-DD hh:mm:ss'),
	promises = [];

	_.each(prepos, function(projects){
		_.each(projects, function(project){
			//_.setMaxListeners(0);
			_.each(project.commits, function(value){
				var commitToInsert = {},
					timeIn = '',
					timeOut = '',
					commitMessage = '',
					hour = 0,
					work = 0;

				date = moment(value.date).format('YYYY-MM-DD hh:mm:ss');
				commitMessage = value.message.split('\n');
				commitMessage = commitMessage[0];
				work = getWork(commitMessage);
				colog.log(colog.colorBlue('Saving commit: ' +  commitMessage));

				commitToInsert = {
						created:  date,
						developer_id: puser.id,
						project_id: project.id,
						description: commitMessage,
						time: work,
						hour_type_id: phourType.id
					};

				if(puser.devtype === 'non_exempt'){
					
					hour = parseFloat(work);
					timeIn = moment(value.date);
					timeOut = moment(value.date);
					timeOut.add((hour),'hours');

					timeIn = timeIn.format('HH.mm');
					timeOut = timeOut.format('HH.mm');
						
					commitToInsert.time_in = timeIn;
					commitToInsert.time_out = timeOut;
				}
				//console.log(commitToInsert);
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
	//return repos;
};


/* prepos: array of repos
merges the branches with the same project
*/
var	bindCommits = function(puser, prepos, pbillable, pgitName){
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
	saveCommits(puser, repos, pbillable);
};


/* phours: array of type of hours
get billable type, 
*/
var getBillable = function(phours){
	var BILLABlE = 'Billable';
	var billableHour = _.find(phours, function(hour){ return hour.name === BILLABlE; });
	return billableHour;
};

var controllerSaveWork = {

	/*pdate: sets the limit date [-d|-w|-m]
	saves the commits of an user in the TT*/
	saveWork: function(pdate){
		var repos = [],
			reposConfig = [],
			userInfo = {},
			billable = 0,
			configuration = config.getConfig();

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){

				//timeEntry.setMaxListeners(0);

				colog.log(colog.colorGreen('Loading...'));
				commit.setDateLimit(pdate);
				reposConfig = configuration.repositories;

				user.login(configuration.email, configuration.password).then(function(puser){
					//console.log(puser.result);
					userInfo = puser.result;
					return hourType.getHourType(userInfo.id);

				}).then(function(phourType){
					//console.log(phourType);
					billable = getBillable(phourType.result);
					return commit.getReposConfig(reposConfig, repos);
					//console.log(repos);
				}).then(function(){
					return commit.getBranches(repos);

				}).then(function(){
					//console.log(repos[0].branches);
					return commit.getBranchCommits(repos);

				}).then(function(){
					//console.log(repos[0].branches[0].commits);
					bindCommits(userInfo, repos, billable, configuration.gitUser);

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
