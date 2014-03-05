var path = require('path'),
	colog = require('colog'),
	sha1 = require('sha1'),
	controllerConfigFile = require(path.resolve(__dirname,'../controllers/controller_config_file.js')),
	controllerSaveWork = require(path.resolve(__dirname,'../controllers/controller_save_work.js')),
	controllerAddTask = require(path.resolve(__dirname,'../controllers/controller_add_task.js')),
	controllerModifyTask = require(path.resolve(__dirname,'../controllers/controller_modify_task.js')),
	controllerListTasks = require(path.resolve(__dirname,'../controllers/controller_list_tasks.js'));

var LOGINPARAMETER = 4;

var arg = process.argv.splice(2);

switch(arg[0])
{	// user credentials
	case 'login':
		if(arg.length === LOGINPARAMETER){
			arg = arg.splice(1);
			controllerConfigFile.registerUser(arg);
		}
		else{
			colog.log(colog.colorRed('Error: ttlogn login email password git_name'));
		}
		break;
	// add a new ...
	case 'add':
		switch(arg[1])
		{	// repository
			case 'repo':
				controllerConfigFile.registerRepo();
				break;
			//task
			case 'task':
				controllerAddTask.saveWork();
				break;
			default:
			colog.log(colog.colorRed('Error: add [repo|task]'));
		}
		break;
	case 'modify':
		switch(arg[1])
		{
			case 'task':
				controllerModifyTask.modifyWork();
				break;
			default:
			colog.log(colog.colorRed('Error: modify task'));
		}
		break;
	//list of commits
	case 'ls':
		controllerListTasks.listTasks(arg[1]);
		break;
	//save the commits
	case 'save':
		controllerSaveWork.saveWork(arg[1]);
		break;
	default:
		colog.log(colog.colorRed('Error: bad command'));
}
