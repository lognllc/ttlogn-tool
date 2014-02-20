var path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/commitDataAccess.js')),
	_ = require('underscore');

//----------------
// hacer los if de error, buscar lo de promesas
//-------------



var commit = {
//'../../ttlogn-tool'

	displayCommits: function(ppath, pdateLimit, pgitName){
		var self = this;
		dataAccess.getBranches(ppath, pdateLimit, pgitName);
	},

	printBranches: function(ppath, parray, pdateLimit, pgitName){
		_.each(parray,function(value,index){
			dataAccess.getLastCommits(ppath, value.name, 2, pdateLimit, pgitName);
		});
	},

	/* parray: array of commits
	prints the information of the commits */
	printCommitsList: function(parray, pdate, pgitName){
		var limitDate = new Date();

		if(pdate === '-d' || typeof pdate === 'undefined'){
			limitDate.setHours(limitDate.getHours() - limitDate.getHours());
			console.log(limitDate.getDate());
		}
		else if(pdate === '-w'){
			console.log(limitDate.getDay());
			limitDate.setDate(limitDate.getDay() - limitDate.getDay() + 1);
			console.log(limitDate.getDate());
		}
		else if(pdate === '-m'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDate() + 1);
			console.log(limitDate.getDate());
		}
		_.each(parray,function(value,index){
			if(	value.author.name === pgitName && Date(value.committed_date) >= limitDate){
				console.log(value.author.name);
				console.log(Date(value.committed_date.getDate()));
				console.log(limitDate);
				console.log(value.message);
				console.log('-----------------------');
			}
		
		});

	}

};

module.exports = commit;


