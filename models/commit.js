var path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/commitDataAccess.js')),
	_ = require('underscore');

//----------------
// hacer los if de error, buscar lo de promesas
//-------------



var commit = {
//'../../ttlogn-tool'

	displayCommits: function(ppath, pdate, pgitName){
		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){
			dataAccess.getBranches(ppath, pdate, pgitName);
		}
		else{
			console.log('ttlogn ls [-d/-w/-m]');
		}
	},

	printBranches: function(ppath, parray, pdate, pgitName){
		_.each(parray,function(value,index){
			dataAccess.getLastCommits(ppath, value.name, 10, pdate, pgitName);
		});
	},

	/* parray: array of commits
	prints the information of the commits */
	printCommitsList: function(parray, pdate, pgitName){
	var limitDate,
		commitDate;

	limitDate = new Date();
	limitDate = new Date(limitDate.getFullYear(),limitDate.getMonth(), limitDate.getDate());

		if(pdate === '-w'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDay() + 1);
		}
		else if(pdate === '-m'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDate() + 1);
		}
	
		_.each(parray,function(value,index){

			if(	value.author.name === pgitName && value.committed_date >= limitDate){
				console.log(value.author.name);
				console.log(value.committed_date);
				console.log(limitDate);
				console.log(value.message);
				console.log('-----------------------');
			}
		});

	}

};

module.exports = commit;


