ttlogn-tool
===========

## ttlogin 
Sets a user in the config file. If the config file doesn't exists, it is created. The user information is obtained by the parameters.

### Parameters
* Log(n) email: email of Log(n) of the user
* Timetracker password: password of the user
* Git user: the git name of the user
* Pivotal email: email used for Pivotal Tracker
* Pivotal password: password for Pivotal Tracker

## add repo
Sets a repository in the config file. The configuration file must exists. The path of the repository will be the current working directory.

### Parameters
* Project: project to bind the repo
* Branch: select the branch or all the branches to bind with the project

## ls
Searches for the repositories in the configuration file. Then, depending on the parameter receive: [-d/-w/-m], print a list of commits of the branches of the different repositories. If there isn't a parameter the default value is '-d'.

### Parameters
* [-d]: print the commits of the day
* [-w]: print the commits of the week
* [-m]: print the commits of the month

## add entry
Add a new entry to the Timetracker.

### Parameters
* Project: project that will store the entry.
* Description: description of the entry.
* Worked hours: worked hours in this entry.
* Begin of the task: Is the hour of the begin of the task. Is needed depending of the type of user. The format is (HH:mm). Ex: 09:00. 

## modify entry
Modify a existing entry in the Timetracker.

## delete entry
Deletes an existing entry in the Timetracker

## delete repo
Delete an existing repository in the configuration file.

## delete story
Deletes an existing story in Pivotal Tracker.


## clients
Prints the clients of an user.

## save
Searches for the repositories in the configuration file. Then, depending on the parameter received: [-d/-w/-m], saves the commits of the branches of the different repositories. If there isn't a parameter the default value is '-d'. The commits need to have a specific format, test (worked_hours h). Ex: Test commit (2h) 

### Parameters
* [-d]: print the commits of the day
* [-w]: print the commits of the week
* [-m]: print the commits of the month

## story ls	[-a]
Searches for the stories in Pivotal Tracker. If the parameter received is '-a', print all the stories of the user. If there isn't a parameter print a list of the started and unstarted stories of the user.

### Parameters
* [-a]: print all stories of the user

## --help
Prints the man page, displays the help.
