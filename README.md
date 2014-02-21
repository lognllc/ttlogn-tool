ttlogn-tool
===========

## ttlogin 
Sets a user in the config file. If the config file doesn't exists, it is created. The user information is obtained by the parameters.

### Parameters
* email: email of the user
* password: password of the user
* git_name: the git name of the user

## add repo
Sets a repository in the config file. If the config file doesn't exists, it is created. The path of the repository will be the current working directory. It doesn't receives parameters.

## ls
Searches for the repositories in the configuration file. Then, depending on the parameter receive: [-d/-w/-m], print a list of commits of the branches of the different repositories. If there isn't a parameter the default value is '-d'.

### Parameters
* -d: print the commits of the day
* -w: print the commits of the week
* -m: print the commits of the month
