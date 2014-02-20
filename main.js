var path = require('path'),
	controllerConfigFile = require(path.resolve(__dirname,'./controllers/controllerConfigFile.js'));
	controllerListTasks = require(path.resolve(__dirname,'./controllers/ControllerListTasks'));


var arg = process.argv.splice(2);

//controllerConfigFile.registerUser(arg);
//controllerConfigFile.registerRepo();

//console.log(arg[0]);

controllerListTasks.listTasks(arg[0]);



