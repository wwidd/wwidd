#!/bin/bash

##
## start.sh developed by Henrique Lechner < hlechner Θ gmail · com > - 2016
##
## Part of Wwidd software: https://github.com/wwidd/wwidd
##

## bash colors:
bash_red='\e[1;31m'
bash_blue='\e[1;34m'
bash_reset='\e[0m'
bash_purple='\e[1;35m'
bash_und_yellow='\e[4;33m'

## bash messages:
error_msg="$bash_red""[ERROR]""$bash_reset"
ok_msg="$bash_blue""[OK]""$bash_reset"
info_msg="$bash_purple""[INFO]""$bash_reset"

## check the wwidd path
startsh_path=$(readlink -f "$BASH_SOURCE")
wwidd_path=$(dirname "$startsh_path")

## default variables values
dependence_error=false
ignore_dependence_check=false
nodejs_debug=false
wwidd_debug=false
node_command="node"


#####
### execwwidd(): execute the wwidd
#####
function execwwidd()
{
	if [ -e "$wwidd_path/server/src/server.js" ]; then
		## Enter on right folder
		cd "$wwidd_path""/server/src"

		## messages
		echo -e "$ok_msg Executing wwidd ..."
		echo -e "$ok_msg Node.JS return:"
		echo

		## executing wwidd
		if [ $nodejs_debug == false ] && [ $wwidd_debug == false ]; then
			$node_command server.js
		elif [ $nodejs_debug == true ] && [ $wwidd_debug == false ]; then
			$node_command debug server.js
		elif [ $nodejs_debug == false ] && [ $wwidd_debug == true ]; then
			$node_command server.js debug
		elif [ $nodejs_debug == true ] && [ $wwidd_debug == true ]; then
			$node_command debug server.js debug
		fi
	else
		echo -e "$error_msg file: ""$bash_und_yellow""server/src/server.js"$bash_reset" not found."
	fi
}


#####
### checknodeversion(): check if nodejs it too old
#####
function checknodeversion()
{
	node_version=$($node_command "--version")
	#echo $node_version
	if [[ "$node_version" =~ ^v0\.[0-6]\.[0-9][0-9]?[0-9]?$ ]] || [[ "$node_version" =~ ^v0\.7\.0$ ]]; then
		echo -e "$error_msg your Node.JS version is too old! please upgrade to a version between \"v0.7.1\" and \"v0.9.3\". Your version is: $node_version"
		exit 1
	fi
}


#####
### distropackage(): suggest the command to install the missing dependence
#####
function distropackage()
{
	## set the right package name
	if [ -z $2 ]; then
		package=$1
	elif [ $distro == "arch" ]; then
		package=$2
	else
		package=$1
	fi

	## print the suggested command
	echo "=====> Try: $package_management $package"
}


#####
### checkapp(): Check if dependece (application) is already installed
#####
function checkapp()
{
	## messages
	depedence_msg="$bash_und_yellow""$1""$bash_reset"

	## check if the program exists
	if ( ! hash $1 2>/dev/null ); then
		echo -e "$error_msg dependence: $depedence_msg not installed."

		## check if it has distro instructions
		if [ $no_distro == false ]; then
			distropackage $1 $2
		fi

		dependence_error=true
		return 1
	fi
}


#####
### checknode(): check if nodejs is installed
#####
function checknode()
{
	## messages
	depedence_msg="$bash_und_yellow""node""$bash_reset"

	## check if the nodejs exists and if the command is "node" or "nodejs"
	if ( hash node 2>/dev/null ); then
		node_command="node"
	elif ( hash nodejs 2>/dev/null ); then
		node_command="nodejs"
	else
		echo -e "$error_msg dependence: $depedence_msg not installed."
		## check if it has distro instructions
		if [ $no_distro == false ]; then
			distropackage "nodejs"
		fi

		dependence_error=true
		return 1
	fi
}


#####
### checkdependence(): Check if dependece (file) is already installed
#####
function checkdependence()
{
	## messages
	depedence_msg="$bash_und_yellow""$wwidd_path/$1""$bash_reset"

	if [ ! -e "$wwidd_path/$1" ]; then
		echo -e "$error_msg dependence: $depedence_msg does not exist!"
		echo "=====> Check the wwidd wiki for further details: https://github.com/wwidd/wwidd/wiki"

		dependence_error=true
		return 1
	fi
}


#####
### checkdistro(): Check which distro is running on system
#####
function checkdistro()
{
	## check if the files used to discover the distro exist
	if [ -e /etc/os-release ]; then
		etc_issue=$(</etc/os-release)
		no_distro=false
	elif [ -e /etc/lsb-release ]; then
		etc_issue=$(</etc/lsb-release)
		no_distro=false
	else
		no_distro=true
		return 1
	fi

	## check which distro is that
	case "$etc_issue" in
		*ID=arch*|*DISTRIB_ID=Arch*)
			package_management="pacman -S"
			distro="arch"
			;;
		*ID=ubuntu*|*DISTRIB_ID=Ubuntu*)
			package_management="sudo apt-get install"
			distro="ubuntu"
			;;
		*)
			no_distro=true
			;;
	esac
}


#####
### display_version(): output version information and exit
#####
function display_version()
{
	echo ""
	echo "Version function not implemented."
	exit 0
}


#####
### display_help(): output help information and exit
#####
function display_help()
{
	echo ""
	echo "Usage: $0 [options]"
	echo
	echo "Options:"
	echo "   -d, debug, --wwidd-debug       activate the Wwidd debug"
	echo "   -i, --ignore-dependence-check  do not check for dependences"
	echo "   -n, --nodejs-debug             activate the Node.JS debug"
	echo "   -v, --version                  output version information and exit"
	echo "   -h, --help                     display this help and exit"
	echo
	echo "Documentation at: <https://github.com/wwidd/wwidd/wiki>"
	exit 0
}

#####
### start(): main function
#####
function start()
{

	if [ $ignore_dependence_check == false ]; then
		## check distribution for command suggestion
		checkdistro

		## check for: flock, jorder and jquery files
		## because of: https://github.com/wwidd/wwidd/issues/17
		checkdependence "server/src/node_modules/flock-0.1.3.js"
		checkdependence "common/flock/flock-0.1.3.js"
		checkdependence "client/www/jorder/jorder-1.2.1-min.js"
		checkdependence "client/www/jquery/jquery-1.7.min.js"

		## check if all dependences are installed
		checknode
		checkapp "vlc"
		checkapp "ffmpeg"
		checkapp "sqlite3" "sqlite"

		if [ $dependence_error == false ]; then
			## check nodejs version
			checknodeversion
		else
			exit 1
		fi
	fi

	## call function execwwidd()
	execwwidd
}





## dealing with arguments
while [ "$1" != "" ]; do
	case "$1" in
		-h|--help)
			display_help
	    		;;
		-i|--ignore-dependence-check)
			ignore_dependence_check=true
			echo -e "$info_msg \"Ignore Dependence Check\" enabled"
			;;
		-n|--nodejs-debug)
			nodejs_debug=true
			echo -e "$info_msg \"Node.JS Debug\" enabled"
			;;
		-d|debug|--wwidd-debug)
			wwidd_debug=true
			echo -e "$info_msg \"Wwidd Debug\" enabled"
			;;
		-v|--version)
			display_version
			;;
		*)
			echo "$0: invalid option: $1"
			echo "Try '$0 --help' for more information."
			exit 1
			;;
	esac
	shift
done


## call start() function (the main function)
start
