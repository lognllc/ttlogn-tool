var path = require('path'),
	colog = require('colog'),
	_ = require('underscore'),
	controllerConfigFile = require(path.resolve(__dirname,'../controllers/controller_config_file.js')),
	controllerSaveWork = require(path.resolve(__dirname,'../controllers/controller_save_work.js')),
	controllerAddTask = require(path.resolve(__dirname,'../controllers/controller_add_tt_task.js')),
	controllerModifyTask = require(path.resolve(__dirname,'../controllers/controller_modify_tt_task.js')),
	controllerDeleteTask = require(path.resolve(__dirname,'../controllers/controller_delete_tt_task.js')),
	controllerDeleteStory = require(path.resolve(__dirname,'../controllers/controller_delete_story.js')),
	controllerListClients = require(path.resolve(__dirname,'../controllers/controller_list_clients.js')),
	controllerListStories = require(path.resolve(__dirname,'../controllers/controller_list_stories.js')),
	controllerHelp = require(path.resolve(__dirname,'../controllers/controller_help.js')),
	controllerListCommits = require(path.resolve(__dirname,'../controllers/controller_list_commit.js'));

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
			//repo of config
			case 'story':
				controllerDeleteStory.deleteStory();
				break;
			default:
			colog.log(colog.colorRed('Error: delete [task|repo|story]'));
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
				controllerListStories.listStories(arg[2]);
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
		controllerHelp.displayHelp();
		break;
	default:
		colog.log(colog.colorRed('Error: bad command'));
}