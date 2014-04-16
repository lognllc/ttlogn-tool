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

var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var	saveCommits = function(puser, prepos, phourType, pperiod){

	var date = '',
		today = moment().tz("PST8PDT").format(DATE_FORMAT),
		promises = [],
		periodStart = moment(pperiod.period_start).format(DATE_FORMAT),
		periodEnd = moment(pperiod.period_end).format(DATE_FORMAT);

		/*console.log(periodStart);
		console.log(periodEnd);
		console.log(today);*/

	_.each(prepos, function(projects){
		_.each(projects, function(project){
			_.each(project.commits, function(value){
				var commitToInsert = {},
					timeIn = '',
					timeOut = '',
					commitMessage = '',
					hour = 0,
					work = utils.getWork(value.message);

				date = value.date.tz("PST8PDT").format(DATE_FORMAT);
				//console.log(date);
				commitMessage = value.message.split('\n');
				value.message = commitMessage[0];

				commitToInsert = {
						//created:  date,
						developer_id: puser.id,
						project_id: project.id,
						description: value.message,
						time: work,
						hour_type_id: phourType.id
					};

				if(puser.devtype === 'non_exempt'){
					hour = parseFloat(work);
					detailTime.setDetailTimeOut(commitToInsert, hour, value.date);
				}
				//console.log(commitToInsert);
				if(periodStart <= date &&
					date <= periodEnd && date <= today){
					colog.log(colog.colorBlue('Saving commit: ' +  value.message));
					commitToInsert.created = value.date.tz("PST8PDT").startOf('day').format(DATE_FORMAT);
					//console.log(commitToInsert.created);
					promises.push(timeEntry.postTimeEntry(commitToInsert));
				}
				else {
					colog.log(colog.colorRed('Invalid date: ' +  value.message));
				}
			});
		});
	});
	RSVP.all(promises).then(function() {
			utils.printTTError(promises);
			colog.log(colog.colorGreen('Saved successful'));
		}).catch(function(reason){
			colog.log(colog.colorRed(reason));
		});
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
					return user.getPeriod(userInfo.id);

				}).then(function(pperiod){
					//console.log(pperiod);
					newRepos = utils.bindCommits(repos, configuration.gitUser);
					saveCommits(userInfo, newRepos, billable, pperiod.result);

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
