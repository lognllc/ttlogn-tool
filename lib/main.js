var path = require('path'),
	colog = require('colog'),
	sha1 = require('sha1'),
	controllerConfigFile = require(path.resolve(__dirname,'../controllers/controllerConfigFile.js')),
	controllerSaveWork = require(path.resolve(__dirname,'../controllers/controllerSaveWork.js')),
	controllerListTasks = require(path.resolve(__dirname,'../controllers/controllerListTasks.js'));

var LOGINPARAMETER = 4;

var arg = process.argv.splice(2);

//userDataAccess.getUser();

//console.log(sha1('RtB8gDm'+'pwd1234'));

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
		controllerListTasks.listTasks(arg[1]);
		break;
	default:
		colog.log(colog.colorRed('Error: bad command'));
}
