var path = require('path'),
	colog = require('colog'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/commitDataAccess.js')),
	_ = require('underscore');

var NUMBER_COMMITS = 2,
	FORMATHOUR = /[^(]+\(\d+h\)/g,
	DIGITOS = /\d+/g;

var limitDate,
	gitName;



//----------------
// hacer los if de error, buscar lo de promesas
//-------------

	/* pdate: -d/-w/-m
	pgitName: git name of the user
	prints the information of the commits */
var setDateLimit = function (pdate){

		limitDate = new Date();
		limitDate = new Date(limitDate.getFullYear(),limitDate.getMonth(), limitDate.getDate());

		if(pdate === '-w'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDay());
		}
		else if(pdate === '-m'){
			limitDate.setDate(limitDate.getDate() - limitDate.getDate() + 1);
		}
};

	/* pmessage: message of the commit 
	return a string with the number of hours worked
	*/
var getWork = function(pmessage){
	
	var test = FORMATHOUR.exec(pmessage);
	test = DIGITOS.exec(test[0]);
	//test = parseFloat(test[0]);
	return test[0];
	
};


var commit = {

	/* ppath: repository path
	pdate: -d/-w/-m
	pgitName: git name of the user
	prints the information of the commits */
	displayCommits: function(ppath, pdate, pgitName){
		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){
			setDateLimit(pdate);
			gitName = pgitName;
			dataAccess.getBranches(ppath);
		}
		else{
			colog.log(colog.colorRed('Error: ttlogn ls [-d/-w/-m]'));
		}
	},

	/* ppath: repository path
	parray: array of branches
	prints the information of the commits */
	printBranches: function(ppath, parray){
		_.each(parray,function(value,index){
			dataAccess.getCommitsList(ppath, value.name, NUMBER_COMMITS, 0);
		});
	},

	/* ppath: repository path
	parray: array of commits
	pnumber: number of commits to begin with
	prints the information of the commits 
	if the last commit has a high date than the limitDate,
	and array has NUMBER_COMMITS - 1 elements, print the branch again */
	printCommitsList: function(ppath, parray, pnumber, pbranch){
		var date,
			numberCommits,
			numberArray;
		_.each(parray,function(value,index){

			if(	value.author.name === gitName && value.committed_date >= limitDate && FORMATHOUR.test(value.message)){
				//console.log(value.author.name);
				colog.log(colog.apply(value.repo.dot_git, ['bold', 'underline']));
				colog.log(colog.colorBlue(value.message));
				colog.log(colog.colorBlue(value.committed_date + '\n'));
			}
		});

		numberArray = parray.length - 1;
		date = parray[numberArray].committed_date;
		numberCommits = pnumber + NUMBER_COMMITS;

		if(date >= limitDate && numberArray === NUMBER_COMMITS - 1){
			dataAccess.getCommitsList(ppath, pbranch, numberCommits, pnumber);
		}
	}
};

module.exports = commit;


