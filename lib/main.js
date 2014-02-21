var path = require('path'),
	colog = require('colog'),
	controllerConfigFile = require(path.resolve(__dirname,'../controllers/controllerConfigFile.js'));
	controllerListTasks = require(path.resolve(__dirname,'../controllers/controllerListTasks.js'));
	userDataAccess = require(path.resolve(__dirname,'../dataAccess/userDataAccess.js'));

var LOGINPARAMETER = 4;

var arg = process.argv.splice(2);

//userDataAccess.getUser();



if(arg[0] === 'login'){
	if(arg.length === LOGINPARAMETER){
		arg = arg.splice(1);
		controllerConfigFile.registerUser(arg);
	}
	else{
		colog.log(colog.colorRed('Error: ttlogn login email password git_name'));
	}
}
else if(arg[0] === 'add' && arg[1] === 'repo'){
	controllerConfigFile.registerRepo();
}
else if(arg[0] === 'add'){
	colog.log(colog.colorRed('Error: add repo'));
}
else if(arg[0] === 'ls'){
	controllerListTasks.listTasks(arg[1]);
}
else {
	colog.log(colog.colorRed('Error: bad command'));
}
