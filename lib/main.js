var path = require('path'),
	colog = require('colog'),
	exec = require('child_process').exec,
	_ = require('underscore'),
	help = require('show-help'),
	controllerConfigFile = require(path.resolve(__dirname,'../controllers/controller_config_file.js')),
	controllerSaveWork = require(path.resolve(__dirname,'../controllers/controller_save_work.js')),
	controllerAddTask = require(path.resolve(__dirname,'../controllers/controller_add_tt_task.js')),
	controllerModifyTask = require(path.resolve(__dirname,'../controllers/controller_modify_tt_task.js')),
	controllerDeleteTask = require(path.resolve(__dirname,'../controllers/controller_delete_tt_task.js')),
	controllerListClients = require(path.resolve(__dirname,'../controllers/controller_list_clients.js')),
	controllerListStories = require(path.resolve(__dirname,'../controllers/controller_list_stories.js')),
	controllerListCommits = require(path.resolve(__dirname,'../controllers/controller_list_commit.js'));

var LOGINPARAMETER = 5;

var arg = process.argv.splice(2);

//process.setMaxListeners(0);

switch(arg[0])
{	// user credentials
	case 'login':
		controllerConfigFile.registerUser();
		break;
	// add a new ...
	case 'add':
		switch(arg[1])
		{	// repository
			case 'repo':
				console.log('antes de register repo');
				controllerConfigFile.registerRepo();
				break;
			//task of TT
			case 'task':
				controllerAddTask.saveWork();
				break;
			default:
			colog.log(colog.colorRed('Error: add [repo [branch]|task]'));
		}
		break;
	// modify a ...
	case 'modify':
		switch(arg[1])
		{
			//task of TT
			case 'task':
				controllerModifyTask.modifyWork();
				break;
			default:
			colog.log(colog.colorRed('Error: modify task'));
		}
		break;
	// delete a ...
	case 'delete':
		switch(arg[1])
		{
			//task of TT
			case 'task':
				controllerDeleteTask.deleteWork();
				break;
			//repo of config
			case 'repo':
				controllerConfigFile.deleteRepo();
				break;
			default:
			colog.log(colog.colorRed('Error: delete [task|repo]'));
		}
		break;
	//list of commits
	case 'ls':
		controllerListCommits.listTasks(arg[1]);
		break;
	case 'clients':
		controllerListClients.listClients();
		break;
	//save the commits
	case 'save':
		controllerSaveWork.saveWork(arg[1]);
		break;
	//save the commits
	case 'list':
			switch(arg[1])
		{
			//story
			case 'stories':
				controllerListStories.getPivotalProjects(arg[2]);
				break;
			//pivotal task
			case 'task':
				//controllerConfigFile.deleteRepo();
				break;
			default:
			colog.log(colog.colorRed('Error: list [story|task]'));
		}
		break;
	case '--help':
		exec('man ttlogn', function (error, stdout, stderr) {
			console.log(stdout);
			//console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
		});
//		exec('man ttlogn');
		break;
	default:
		colog.log(colog.colorRed('Error: bad command'));
}