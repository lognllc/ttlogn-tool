var path = require('path'),
	colog = require('colog'),
	controllerConfigFile = require(path.resolve(__dirname,'../controllers/controller_config_file.js')),
	controllerSaveWork = require(path.resolve(__dirname,'../controllers/controller_save_work.js')),
	controllerAddEntry = require(path.resolve(__dirname,'../controllers/controller_add_entry.js')),
	controllerModifyEntry = require(path.resolve(__dirname,'../controllers/controller_modify_entry.js')),
	controllerModifyTask = require(path.resolve(__dirname,'../controllers/controller_modify_task.js')),
	controllerModifyStory = require(path.resolve(__dirname,'../controllers/controller_modify_story.js')),
	controllerDeleteEntry = require(path.resolve(__dirname,'../controllers/controller_delete_entry.js')),
	controllerDeleteStory = require(path.resolve(__dirname,'../controllers/controller_delete_story.js')),
	controllerListClients = require(path.resolve(__dirname,'../controllers/controller_list_clients.js')),
	controllerAddStory = require(path.resolve(__dirname,'../controllers/controller_add_story.js')),
	controllerAddTask = require(path.resolve(__dirname,'../controllers/controller_add_task.js')),
	controllerDeliverStories = require(path.resolve(__dirname,'../controllers/controller_deliver_stories.js')),
	controllerListStories = require(path.resolve(__dirname,'../controllers/controller_list_stories.js')),
	controllerListTasks = require(path.resolve(__dirname,'../controllers/controller_list_tasks.js')),
	controllerHelp = require(path.resolve(__dirname,'../controllers/controller_help.js')),
	controllerListCommits = require(path.resolve(__dirname,'../controllers/controller_list_commit.js'));

var arg = process.argv.splice(2);

switch(arg[0])
{	// user credentials
	case 'login':
		controllerConfigFile.registerUser();
		break;
	// remove the config file
	case 'logout':
		controllerConfigFile.deleteConfig();
		break;
	// add a new ...
	case 'add':
		switch(arg[1])
		{	// repository
			case 'repo':
				controllerConfigFile.registerRepo();
				break;
			// entry of TT
			case 'entry':
				controllerAddEntry.saveWork();
				break;
			// story of pivotal
			case 'story':
				controllerAddStory.addStory();
				break;
			// task of pivotal
			case 'task':
				controllerAddTask.addTask(arg[2]);
				break;
			default:
			colog.log(colog.colorRed('Error: add [repo|entry|story [-a]|task [-a]]'));
		}
		break;
	// modify a ...
	case 'modify':
		switch(arg[1])
		{
			// task of pivotal
			case 'task':
				controllerModifyTask.modifyTask(arg[2]);
				break;
			// entry of TT
			case 'entry':
				controllerModifyEntry.modifyWork();
				break;
			// story of pivotal
			case 'story':
				controllerModifyStory.modifyStory(arg[2]);
				break;
			default:
			colog.log(colog.colorRed('Error: modify [entry|story [-a]|task [-a]]'));
		}
		break;
	// delete a ...
	case 'delete':
		switch(arg[1])
		{
			// entry of TT
			case 'entry':
				controllerDeleteEntry.deleteWork();
				break;
			// repo of config
			case 'repo':
				controllerConfigFile.deleteRepo();
				break;
			// story of pivotal
			case 'story':
				controllerDeleteStory.deleteStory(arg[2]);
				break;
			default:
			colog.log(colog.colorRed('Error: delete [entry|repo|story [-a]]'));
		}
		break;
	// list of commits
	case 'ls':
		controllerListCommits.listTasks(arg[1]);
		break;
	// clients 
	case 'clients':
		controllerListClients.listClients();
		break;
	// save the commits
	case 'save':
		controllerSaveWork.saveWork(arg[1]);
		break;
	case 'story':
		switch(arg[1])
		{
			// list stories
			case 'ls':
				controllerListStories.listStories(arg[2]);
				break;
			// deliver all finish stories
			case 'deliver':
				controllerDeliverStories.deliverStories();
				break;
			default:
				colog.log(colog.colorRed('Error: story [ls [-a]|deliver]'));
		}
		break;
	// task 
	case 'task':
		// list tasks
		if(arg[1] === 'ls'){
			controllerListTasks.listTasks(arg[2]);
		}
		else{
			colog.log(colog.colorRed('task ls [-a]'));
		}
		break;
	// help
	case '--help':
		controllerHelp.displayHelp();
		break;
	default:
		colog.log(colog.colorRed('Error: bad command'));
		colog.log(colog.colorRed('Use "ttlogn --help"'));
}