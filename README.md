ttlogn-tool
===========

ttlogn is a software that helps the worker managing his tasks. It shows and manage the tasks finished and to do, of the worker in an easy way. Also it helps the with the log of his tasks in a Timetracker.

## Installation
npm install -g ttlogn

[--help](#--help)
[login](##login)
add repo
delete repo
ls
save
add entry
modify entry
delete entry
clients
story ls
delete story

## --help
Prints the man page, displays the help.

## login
Sets a user in the config file. If the config file doesn't exists, it is created. The user information is obtained by the parameters.

### Parameters
* Log(n) email: email of Log(n) of the user
* Timetracker password: password of the user
* Git user: the git name of the user
* Pivotal email: email used for Pivotal Tracker
* Pivotal password: password for Pivotal Tracker

### Example
```Shell
ttlogn login
prompt: Log(n) email :  user@logn.com
prompt: Timetracker password:  
prompt: Git user:  git_user
prompt: Pivotal email:  user@gmail.com
prompt: Pivotal password:  
Adding user:
user@logn.com, user@gmail.com, git_user
Success: configuration file saved
```

## add repo
Stores a repository in the config file. The config file must exists. The path of the repository will be the current working directory.

### Parameters
* Project: project to bind the repo
* Branch: select the branch or all the branches to bind with the project

### Examples
```Shell
ttlogn add repo
1: Project 1
2: Project 2
3: Cancel
prompt: Number of the project:  1
Select a branch: 
1: master
2: branch 1
3: All
prompt: Number of the branch: :  3
Adding repository: repo_path, and project: Project 1
Success: configuration file saved
```

## delete repo
Delete an existing repository in the configuration file.

### Parameters
* Repository: path of the repository to delete 

### Examples
```Shell
ttlogn delete repo
1: Repository 1
2: Repository 2
3: Cancel
prompt: Number of the repository: :  1
Do you want to delete: 
Repository 1
prompt: (y or n):  y
Success: configuration file saved
```

## ls
Searches for the repositories in the configuration file. Then, depending on the parameter receive: [-d/-w/-m], print a list of commits of the branches of the different repositories. If there isn't a parameter the default value is '-d'.

### Parameters
* [-d]: print the commits of the day
* [-w]: print the commits of the week
* [-m]: print the commits of the month

### Examples
```Shell
ttlogn ls -d
Loading...

-------------------------------
Project 1
-------------------------------

Wednesday, 26 March 2014
	Example Task 11 (3h)
Hours worked: 3

-------------------------------
Project 2
-------------------------------

Wednesday, 26 March 2014
	Example Task 21 (2h)
Hours worked: 2
```

## save
Searches for the repositories in the configuration file. Then, depending on the parameter received: [-d/-w/-m], saves the commits of the branches of the different repositories. If there isn't a parameter the default value is '-d'. The commits need to have a specific format, test (worked_hours h). Ex: Test commit (2h) 

### Parameters
* [-d]: print the commits of the day
* [-w]: print the commits of the week
* [-m]: print the commits of the month

### Examples
```Shell
ttlogn save -d
Loading...
Saving commit: Example Task 11 (3h)
Saving commit: Example Task 21 (2h)
Saved successful
```

## add entry
Add a new time entry to the Timetracker.

### Parameters
* Project: project of the Timetracker that will store the entry
* Description: description of the entry
* Worked hours: worked hours in this entry
* Begin of the task: Is the hour of the begin of the task. Is needed depending of the type of user. The format is (HH:mm). Ex: 09:00

### Examples
```Shell
ttlogn add entry
1: Project 1
2: Project 2
3: Cancel
prompt: Number of the project:  1
prompt: Description of the taks:  Example task 12
prompt: Worked hours:  4h
prompt: Begin of the task (HH:mm):  09:35
Time entry saved
```

## modify entry
Modify a existing time entry in the Timetracker. 

### Parameters
* Date: date of the entry
* Project: project of the Timetracker that will store the entry
* Description: description of the entry
* Worked hours: worked hours in this entry
* Hour type: hour type of the entry
* Begin of the task: Is the hour of the begin of the task. Is needed depending of the type of user. The format is (HH:mm). Ex: 09:00

### Examples
```Shell
ttlogn modify entry
1: Project 1
2: Project 2
3: Cancel
prompt: Number of the project:  1 
1: Example Task 11 (3h)
2: Example task 12
3: Cancel
prompt: Number of the Time Entry:  1
Select a field: 
1: Created: 2014-03-26 10:29:34
2: Description: Example Task 11 (3h)
3: Time: 2
4: Hour Type: Billable
5: Proyect: Project 1
6: Begin of task:  8.29
7: Save 
8: Cancel 
prompt: Number of field:  (1) 7
Time entry saved
```

## delete entry
Deletes an existing time entry in the Timetracker

### Parameters
* Project: project in the Timetracker that has the entry to delete
* Entry: entry to delete

### Examples
```Shell
ttlogn delete entry
1: Project 1
2: Project 2
3: Cancel
prompt: Number of the project:  1 
1: Example Task 11 (3h)
2: Example task 12
3: Cancel
prompt: Number of the Time Entry:  1
Do you want to delete: 
Example Task 11 (3h)
prompt: (y or n):  y
Time entry deleted
```

## clients
Prints the clients in the Timetracker of an user .

### Examples
```Shell
ttlogn clients
1. Client 1
2. Client 2
3. Client 3
```

## story ls	[-a]
Searches for the stories in Pivotal Tracker. If the parameter received is '-a', print all the stories of the user. If there isn't a parameter print a list of the started and unstarted stories of the user.

### Parameters
* [-a]: print all stories of the user

### Examples
```Shell
ttlogn story ls
Loading...

Project 1
-------------------------------
-------------------------------
Story 1 - type
Description
-------------------------------
Story 2 - type
Description
-------------------------------

Project 2
-------------------------------
-------------------------------
Story 1 - type
Description
-------------------------------
```

## delete story
Deletes an existing story in Pivotal Tracker.

### Parameters
* Project: project of Pivotal Tracker that has the entry to delete
* Story: story in the Pivotal Tracker to delete

### Examples
```Shell
ttlogn delete story
Loading...
1: Project 1
2: Project 2
3: Cancel
prompt: Number of the project:  1
1: Story 1
2: Story 2
3: Cancel
prompt: Number of the story:  1
Do you want to delete: 
Story 1
prompt: (y or n):  y
Story deleted
```

