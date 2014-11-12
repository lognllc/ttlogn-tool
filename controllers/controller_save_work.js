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

var validateParameters = function(plimit1, plimit2){
	var validation = false;
	
	if((plimit1 === '-w' || plimit1 === '-m' || plimit1 === '-d' ||
		plimit1 === '-f' || _.isUndefined(plimit1)) &&
		(plimit2 === '-f' || _.isUndefined(plimit2))){

		validation = true;
	}
	return validation;
};

var getForce = function(plimit1, plimit2){
	var force = plimit2 || plimit1;
		validation = false;
	
	if(force === '-f'){
		validation = true;
	}
	return validation;
};

var validateDate = function(pdate, plastDate, pforce){
	var canPass = false;
	if(pforce){
		canPass = true;
	}
	else if (_.isUndefined(plastDate) || pdate.isAfter(plastDate)){
		canPass = true;
	}
	return canPass;
};

var	saveCommits = function(puser, prepos, phourType, pperiod, plastDate, pforce){
	var promise = new RSVP.Promise(function(resolve, reject){
		var date = '',
			today = moment().tz("PST8PDT"),
			promises = [],
			periodStart = moment(pperiod.period_start).tz("PST8PDT"),
			periodEnd = moment(pperiod.period_end).tz("PST8PDT"),
			newLastDate = plastDate,
			validation = false;

		_.each(prepos, function(projects){
			_.each(projects, function(project){
				_.each(project.commits, function(value){
					var commitToInsert = {},
						commitMessage = '',
						hour = 0,
						work = utils.getWork(value.message);

					date = value.date.tz("PST8PDT");

					commitMessage = value.message.split('\n');
					value.message = commitMessage[0];

					commitToInsert = {
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
					
					validation = validateDate(date, plastDate, pforce);

					if( date.isAfter(periodStart) &&
						periodEnd.isAfter(date) && today.isAfter(date)){
						if(validation){
							colog.log(colog.colorBlue('Saving commit: ' +  value.message));
							
							if(_.isUndefined(newLastDate) || date.isAfter(newLastDate)){
								newLastDate = moment(date.format());
							}
							commitToInsert.created = date.startOf('day').format(DATE_FORMAT);
							promises.push(timeEntry.postTimeEntry(commitToInsert, puser.token));
						} else {
							colog.log(colog.colorRed('Commit already stored: ' +  value.message));
						}
					} else {
						colog.log(colog.colorRed('Invalid date: ' +  value.message));
					}
				});
			});
		});
		RSVP.all(promises).then(function(){
			colog.log(colog.colorGreen('Saved successful'));
			resolve(newLastDate.format());
		}).catch(function(reason){
			reject(reason);
		});
	});
	return promise;
};

var controllerSaveWork = {

	/*plimit1: sets the limit date [-d|-w|-m][-f]
	plimit2: sets the limit date [-f]
	saves the commits of an user in the TT*/
	saveWork: function(plimit1, plimit2){
		var repos = [],
			userInfo = {},
			billable = 0,
			newRepos = [],
			lastDate = '',
			force = false,
			configuration = {};

		if(validateParameters(plimit1, plimit2)){

			if(config.existConfig){

				colog.log(colog.colorGreen('Loading...'));
				configuration = config.getConfig();
				commit.setDateLimit(plimit1);
				force = getForce(plimit1, plimit2);
				lastDate = (_.isUndefined(configuration.lastDate)) ? moment().subtract('months', 1) :
					moment(configuration.lastDate);
				
				user.login(configuration.email, configuration.password).then(function(puser){
					userInfo = puser.result.user;
					userInfo.token = {
						token: puser.result.token,
						email: configuration.email
					};
					return hourType.getHourType(userInfo.id, userInfo.token);

				}).then(function(phourType){
					billable = hourType.getBillable(phourType.result);
					return commit.getReposConfig(configuration.repositories, repos);

				}).then(function(){
					return commit.getBranches(repos);

				}).then(function(){
					return commit.getBranchCommits(repos);

				}).then(function(){
					return user.getPeriod(userInfo.id, userInfo.token);

				}).then(function(pperiod){
					newRepos = utils.bindCommits(repos, configuration.gitUser);
					return saveCommits(userInfo, newRepos, billable, pperiod.result, lastDate, force);

				}).then(function(lastDate){
					config.saveLastDate(configuration, lastDate);

				}).catch(function(error) {
					colog.log(colog.colorRed(error));
				});
			}
			else{
				colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
			}
		}
		else{
			colog.log(colog.colorRed('Error: ttlogn save [-d|-w|-m][-f]'));
		}
	}

};

module.exports = controllerSaveWork;
