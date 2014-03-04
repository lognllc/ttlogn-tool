var path = require('path'),
	colog = require('colog'),
	sha1 = require('sha1'),
	controllerConfigFile = require(path.resolve(__dirname,'../controllers/controller_config_file.js')),
	controllerSaveWork = require(path.resolve(__dirname,'../controllers/controller_save_work.js')),
	controllerListTasks = require(path.resolve(__dirname,'../controllers/controller_list_tasks.js'));

var LOGINPARAMETER = 4;

var arg = process.argv.splice(2);

switch(arg[0])
{
	case 'login':
		if(arg.length === LOGINPARAMETER){
			arg = arg.splice(1);
			controllerConfigFile.registerUser(arg);
		}
		else{
			colog.log(colog.colorRed('Error: ttlogn login email password git_name'));
		}
		break;
	case 'add':
		if(arg[1] === 'repo'){
			controllerConfigFile.registerRepo();
		}
		else{
			colog.log(colog.colorRed('Error: add repo'));
		}
		break;
	case 'ls':
		controllerListTasks.listTasks(arg[1]);
		break;
	case 'save':
		controllerSaveWork.saveWork(arg[1]);
		break;
	default:
		colog.log(colog.colorRed('Error: bad command'));
}
