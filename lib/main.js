var path = require('path'),
	controllerConfigFile = require(path.resolve(__dirname,'../controllers/controllerConfigFile.js'));
	controllerListTasks = require(path.resolve(__dirname,'../controllers/controllerListTasks.js'));

var LOGINPARAMETER = 4;

var arg = process.argv.splice(2);

//controllerConfigFile.registerUser(arg);

//console.log(arg[0]);


if(arg[0] === 'login'){
	if(arg.length === LOGINPARAMETER){
		arg = arg.splice(1);
		controllerConfigFile.registerUser(arg);
	}
	else{
		console.log('ttlogn login email password git_name');
	}
}
else if(arg[0] === 'add' && arg[1] === 'repo'){
	controllerConfigFile.registerRepo();
}
else if(arg[0] === 'ls'){
	controllerListTasks.listTasks(arg[1]);
}
