#!/usr/bin/env bash

##
## start.sh developed by Henrique Lechner < hlechner Θ gmail · com > - 2016
##
## Part of Wwidd software: https://github.com/wwidd/wwidd
##

## configurable variables:
nodejs_version_recommended="v0.9.3"

nodejs_version_oldest="v0.7.1"
nodejs_version_oldest_REG="^v0\.([0-6]\.[0-9]{1,3}|7\.0)$"
nodejs_version_newest="v0.9.3"


## bash colors:
bash_red='\e[1;31m'
bash_blue='\e[1;34m'
bash_reset='\e[0m'
bash_purple='\e[1;35m'
bash_und_yellow='\e[4;33m'
bash_underline='\e[4m'

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
ignore_terminal_check=false
nodejs_debug=false
wwidd_debug=false
node_command="node"

startsh_args="$@"

#####
### execwwidd(): execute the wwidd
#####
function execwwidd()
{
	if [[ -e "$wwidd_path/server/src/server.js" ]]; then
		## Enter on right folder
		cd "$wwidd_path""/server/src"

		## messages
		echo -e "$ok_msg Executing wwidd ..."
		echo -e "$ok_msg Node.JS return:"
		echo

		node_args="server.js"
		if [[ $nodejs_debug == true ]]; then
			node_args="debug $node_args"
		fi
		if [[ $wwidd_debug == true ]]; then
			node_args="$node_args debug"
		fi

		## executing wwidd
		$node_command $node_args

	else
		echo -e "$error_msg file: ""$bash_und_yellow""server/src/server.js""$bash_reset"" not found."
	fi
}


#####
### checknvm(): check if nvm is installed and also if the recommended version is installed on it
#####
function checknvm()
{
	if [[ "$nodeinstalled" == false ]] || [[ $($node_command "--version") != "$nodejs_version_recommended" ]]; then
		## check if nvm script exists and source it
		if [[ -e "/usr/share/nvm/init-nvm.sh" ]]; then
			source "/usr/share/nvm/init-nvm.sh"
		elif [[ -e "$HOME/.nvm/nvm.sh" ]]; then
			source "$HOME/.nvm/nvm.sh"
		fi

		if [[ "$nodeinstalled" == false ]]; then
			unset nodeinstalled
			return 0
		fi

		## check if nvm works
		checkapp false nvm
		if [[ "$?" != 0 ]]; then
			echo -e "$info_msg no nvm detected! Consider on install it to use the recommended node version."
			echo "===> Further details please check the nvm page: https://github.com/creationix/nvm"
			return 0
		fi

		if [[ "$(nvm version $nodejs_version_recommended)" == "$nodejs_version_recommended" ]]; then
			echo -e "$info_msg Node Version Manager: changing from $($node_command --version) to $nodejs_version_recommended ..."
			nvm use $nodejs_version_recommended > /dev/null
			checknode
		else
			echo -e "$info_msg $nodejs_version_recommended seems not be installed on nvm, please consider on install it:"
			echo "===> Try: nvm install $nodejs_version_recommended"
			checknode
		fi
	fi
}


#####
### copy_file(): copy the needed files from the zip file already downloaded
#####
function copy_file()
{
	if [[ "$1" == "server/src/node_modules/flock-0.1.3.js" ]]; then
		file_from_zip="Wwidd/common/flock/flock-0.1.3.js"
	else
		file_from_zip="Wwidd/$1"
	fi

	checkapp true unzip
	if [[ "$?" == 0 ]]; then
		file_path=$(dirname "$wwidd_path/$1")

		## create the directory if it doesn't exist
		if [[ ! -a "$file_path" ]]; then
			mkdir_msg=$( mkdir -p "$file_path" 2>&1 )
			if [[ "$?" != 0 ]]; then
				echo -e "$error_msg couldn't create the directory:"
				echo "$mkdir_msg"
				exit 1
			fi
		fi

		## extract the files from zip
		if [[ -w "$file_path" ]]; then
			unzip -p "$zipfile_tmp" "$file_from_zip" > "$wwidd_path/$1"
		else
			echo -e "$error_msg there is not permission to extract the file! check your wwidd file permissions."
			exit 1
		fi
	else
		return 1
	fi
}


#####
### download_depedence_files(): download the dependences
#####
function download_depedence_files()
{
	zipfile_base_url="http://wwidd.com/files/Wwidd046Ubu.zip"
	zipfile_url="http://wwidd.com/files/Wwidd046Ubu.zip"
	sha256zip="c4c8e4c086550b1ba730323fe3d1b6daba0c1260d80331add558f5ea9a103953"
	md5zip="6327537aaefef94114992eb9adb05248"

	echo "===> Check the wwidd wiki for further details: https://github.com/wwidd/wwidd/wiki"
	echo

	## ask if want to download it through the script
	while [[ "$download" != "Yes" ]]; do
		echo "Do you want to try to download the files from internet? [Y/n]"
		read download_try
		case "$download_try" in
			n|N|No|NO|nO)
				return 1
				;;
			y|Y|Yes|YES|YeS|yES|yeS|yEs|"")
				download="Yes"
				;;
			*)
				echo "Invalid Option!"
				;;
		esac
	done

	## check for wget,curl or fetch
	if [[ ! "$download_cmd" ]]; then
	        checkapp false wget && download_cmd="wget"
	fi

	if [[ ! "$download_cmd" ]]; then
	        checkapp false curl && download_cmd="curl"
	fi

	if [[ ! "$download_cmd" ]]; then
	        checkapp false fetch && download_cmd="fetch"
	fi

	if [[ ! "$download_cmd" ]]; then
		checkapp true "wget" "wget"
		return 1
	fi


	## do the connection check
	case "$download_cmd" in
	        wget)
		        wget -q --tries=2 --timeout=7 --spider "$zipfile_base_url" > /dev/null
		        connection_check="$?"
		        ;;
		curl)
		        curl -s --retry 2 --connect-timeout 7 "$zipfile_base_url" -o /dev/null
		        connection_check="$?"
		        ;;
		fetch)
		        fetch -q --timeout=7 "$zipfile_base_url" -o /dev/null
		        connection_check="$?"
		        ;;
	esac

	## if dont pass the connection check show it and return 1
	if [[ $connection_check != 0 ]]; then
		echo -e "$error_msg Couldn't connect to wwidd server!"
		echo "===> Check the connection and try again or copy manually the file."
		echo "===> further instructions could be found on wwidd wiki: https://github.com/wwidd/wwidd/wiki"
		return 1
	fi


	## create temp file
	checkapp false mktemp
	if [[ $? == 0 ]]; then
		zipfile_tmp=$(mktemp "/tmp/wwidd.zip.XXXXXXXXXXX")
	else
		zipfile_tmp="/tmp/wwidd.zip.$RANDOM$RANDOM"
		:> "$zipfile_tmp"
	fi

	## download the zipfile
	case "$download_cmd" in
		wget)
			echo "downloading from: $zipfile_url..."
			wget -q "$zipfile_url" -O "$zipfile_tmp" > /dev/null 2>&1
			if [[ "$?" != 0 ]]; then
				echo -e "$error_msg Wooops! something wrong happened on the download file process."
				rm -f "$zipfile_tmp"
				return 1
			fi
			;;
		curl)
			echo "downloading from: $zipfile_url..."
			curl -s "$zipfile_url" -o "$zipfile_tmp" > /dev/null 2>&1
			if [[ "$?" != 0 ]]; then
				echo -e "$error_msg Wooops! something wrong happened on the download file process."
				rm -f "$zipfile_tmp"
				return 1
			fi
			;;
		fetch)
			echo "downloading from: $zipfile_url..."
			fetch -q "$zipfile_url" -o "$zipfile_tmp" > /dev/null 2>&1
			if [[ "$?" != 0 ]]; then
				echo -e "$error_msg Wooops! something wrong happened on the download file process."
				rm -f "$zipfile_tmp"
				return 1
			fi
			;;
    		*)
			echo -e "$error_msg Wooops! something wrong happened on the download file process."
			rm -f "$zipfile_tmp"
			return 1
			;;
	esac


	if [[ -s "$zipfile_tmp" ]]; then
		##check for sha256sum
		if [[ ! "$checksum" ]]; then
			checkapp false sha256sum && checksum="sha256sum"
		fi

		##check for sha256 (freebsd)
		if [[ ! "$checksum" ]]; then
			checkapp false sha256 && checksum="sha256"
		fi

		##check for md5sum
		if [[ ! "$checksum" ]]; then
			checkapp false md5sum && checksum="md5sum"
		fi

		##check for md5 (freebsd)
		if [[ ! "$checksum" ]]; then
			checkapp false md5 && checksum="md5"
		fi

	else
		echo -e "$error_msg Wooops! something wrong happened on the temporary file creation."
		if [[ "$zipfile_tmp" ]]; then
			rm -f "$zipfile_tmp"
		fi
		return 1
	fi



	## check the checksum
	if [[ "$checksum" == "sha256sum" ]] || [[ "$checksum" == "sha256" ]]; then
		printf "$sha256zip  $zipfile_tmp" | $checksum -c > /dev/null 2>&1
		checksum_result="$?"
	elif [[ "$checksum" == "md5sum" ]] || [[ "$checksum" == "md5" ]]; then
		printf "$md5zip  $zipfile_tmp" | $checksum -c > /dev/null 2>&1
		checksum_result="$?"
	else
		echo -e "$error_msg Not found sha256 or md5 checksum on system!"
		rm -f "$zipfile_tmp"
		return 1
	fi


	## checksum on zip file match?
	if [[ "$checksum_result" != 0 ]]; then
		echo -e "$error_msg Checksum of the downloaded file doesn't match!"
		rm -f "$zipfile_tmp"
		return 1
	fi


	## copy files from zip
	for archive_file in "${dependence_not_found[@]}"
	do
		copy_file "$archive_file"

		## check is file is installed
		if [[ -e "$wwidd_path/$archive_file" ]]; then
			echo -e "$ok_msg File downloaded: $archive_file"
			dependence_not_found=( "${dependence_not_found[@]/$archive_file}" )
		fi

	done

	## if all dependence are installed change depedence_error status
	if [[ ! "$dependence_not_found" ]]; then
		dependence_error=false
	fi

	## remove the temp file
	if [[ "$zipfile_tmp" ]]; then
		rm -f "$zipfile_tmp"
		return 0
	fi
}


#####
### checknodeversion(): check if nodejs it too old
#####
function checknodeversion()
{
	checknvm
	node_version=$($node_command "--version")

	if [[ "$node_version" =~ $nodejs_version_oldest_REG ]]; then
		echo -e "$error_msg Your Node.JS version is too old! please upgrade to a version between \"$nodejs_version_oldest\" and \"$nodejs_version_newest\"."
		echo -e "==> Current version: $node_version"
		echo -e "==> Recommended version: $nodejs_version_recommended\n"
		exit 1
	else
		echo -e "$info_msg Node.JS version: $node_version"
	fi
}



function commandsuggestion()
{
	if [[ "$command_suggestion" ]]; then
		## print the suggested command
		echo -e "===> Try: $bash_underline$package_management $command_suggestion$bash_reset"
		if [[ $additional_msg ]]; then
			echo "===> $additional_msg"
		fi
	fi
}

#####
### distropackage(): suggest the command to install the missing dependence
#####
function distropackage()
{
        ##              [0]    [1]       [2]       [3]       [4]     [5]       [6]       [7]
        apps_default=( "vlc" "ffmpeg" "sqlite3" "xdg-utils" "gzip" "nodejs" "net-tools" "wget" )

        ## distro specific:
        apps_ubuntu=( )
        apps_arch=( [2]="sqlite" )
        apps_mint=( [1]=false )
        apps_freebsd=( [5]="node" [6]=false )
        apps_debian=( [1]=false )


        ## find app index into array
        for index in ${!apps_default[*]}
        do
                if [[ "${apps_default[$index]}" == "$1" ]]; then
                        local array_index=$index
                        break
                fi
        done

        ## check package management and package name
        case $distro in
                arch)
                        package_management="pacman -S"
                        package="${apps_arch[$array_index]}"
                        ;;
                ubuntu)
                        package_management="sudo apt-get install"
                        package="${apps_ubuntu[$array_index]}"
			additional_msg="Make sure that [universe] repository is enabled"
                        ;;
                mint)
                	package_management="sudo apt-get install"
                	package="${apps_mint[$array_index]}"
                	;;
                debian)
                	package_management="sudo apt-get install"
                	package="${apps_debian[$array_index]}"
                	;;
                freebsd)
                	package_management="pkg install"
                	package="${apps_freebsd[$array_index]}"
                	;;
        esac

	if [[ "$package" != false ]]; then
		## if no changes from default: uses default
		if [[ "$package" == "" ]]; then
		        package="${apps_default[$array_index]}"
		fi

		if [[ "$command_suggestion" ]]; then
			command_suggestion="$command_suggestion $package"
		else
			command_suggestion="$package"
		fi
	fi
}


#####
### checkapp(): Check if dependece (application) is already installed
#####
function checkapp()
{
	## $1 = true/false (return error and exit?)
	## $2 = command
	## $3 = default package name

	## messages
	depedence_msg="$bash_und_yellow""$2""$bash_reset"

	## check if the program exists
	if ( ! hash "$2" 2>/dev/null ); then
		## check if should return error message
		if [[ "$1" == true ]]; then
			echo -e "$error_msg dependence: $depedence_msg not installed."

			## check if it has distro instructions
			if [[ "$no_distro" == false ]]&&[[ "$3" ]]; then
				distropackage "$3"
			fi

			dependence_error=true
		fi
		return 1
	else
		return 0
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
		## check for node installed only through nvm
		nodeinstalled=false
		checknvm
		if ( hash node 2>/dev/null ); then
			return 0
		fi

		## send error message
		echo -e "$error_msg dependence: $depedence_msg not installed."
		## check if it has distro instructions
		if [[ $no_distro == false ]]; then
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

	if [[ ! -e "$wwidd_path/$1" ]]; then
		echo -e "$error_msg dependence: $depedence_msg does not exist!"

		dependence_error=true
		dependence_not_found+=( "$1" )
		return 1
	fi
}


#####
### checkdistro(): Check which distro is running on system
#####
function checkdistro()
{
	## check if the files used to discover the distro exist
	if [[ -e "/etc/lsb-release" ]]; then
		etc_issue=$(<"/etc/lsb-release")
		no_distro=false
	elif [[ -e "/etc/os-release" ]]; then
		etc_issue=$(<"/etc/os-release")
		no_distro=false
	elif [[ "$(uname)" == "FreeBSD" ]]||[[ "$OSTYPE" == "FreeBSD" ]]; then
		etc_issue="FreeBSD"
		no_distro=false
	else
		no_distro=true
		return 1
	fi

	## check which distro is that
	case "$etc_issue" in
		*DISTRIB_ID=Arch*|*ID=arch*|*ID_LIKE="arch"*)
			distro="arch"
			;;
		*DISTRIB_ID=Ubuntu*|*ID=ubuntu*)
			distro="ubuntu"
			;;
		*DISTRIB_ID=LinuxMint*)
			distro="mint"
			;;
		*ID=debian*)
			distro="debian"
			;;
		FreeBSD)
			distro="freebsd"
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
	echo "   -t, --ignore-terminal-check    do not check for terminal"
	echo "   -n, --nodejs-debug             activate the Node.JS debug"
	echo "   -v, --version                  output version information and exit"
	echo "   -h, --help                     display this help and exit"
	echo
	echo "Documentation at: <https://github.com/wwidd/wwidd/wiki>"
	exit 0
}


#####
### arguments_info(): shows the arguments enabled
#####
function arguments_info()
{
	if [[ $ignore_dependence_check == true ]]; then
		echo -e "$info_msg \"Ignore Dependence Check\" enabled";
	fi

	if [[ $nodejs_debug == true ]]; then
		echo -e "$info_msg \"Node.JS Debug\" enabled"
	fi

	if [[ $wwidd_debug == true ]]; then
		echo -e "$info_msg \"Wwidd Debug\" enabled"
	fi
}


#####
### term_check(): scheck if start.sh was executed through terminal
#####
function term_check()
{
	## check if start.sh was not executed through terminal
	if [[ ! -t 0 ]]; then
		## term messages
		term_msg_title="wwidd [start.sh]"
		term_msg_close="\n\n$info_msg Press ANY key to exit... "

		## term commands
		term_wwid="$startsh_path $startsh_args;"
		term_printf="printf '$term_msg_close';"
		term_wait="read -n1 -r;"

		term_commands="$term_wwid $term_printf $term_wait"


		## check if xterm is installed on system
		checkapp false xterm
		if [[ "$?" == 0 ]]; then
			## xterm arguments
			xterm_scrollbar="-rightbar -sb -sl 2048"
			xterm_internal_border="-b 5"
			xterm_color="-bg rgb:1d/20/26 -fg rgb:ab/b2/bf"

			# -xrm 'XTerm.VT100.translations: #override <Key>F1: exec-formatted("xdg-open https://github.com/wwidd/wwidd/wiki", SELECT)'

			xterm_args="$xterm_scrollbar $xterm_internal_border $xterm_color"

			## exec xterm
			xterm $xterm_args -title "$term_msg_title" -e "bash" -c "$term_commands"
			exit 0
		else
			checkapp false gnome-terminal
			if [[ "$?" == 0 ]]; then
				gnome-terminal --hide-menubar --window -x "bash" -c "$term_commands"
				exit 0
			else
				checkapp false konsole
				if [[ "$?" == 0 ]]; then
					konsole --name "$term_msg_title" --hide-tabbar --hide-menubar --separate -e "bash" -c "$term_commands"
					exit 0
				fi
			fi
		fi
	fi
}


#####
### start(): main function
#####
function start()
{
	if [[ $ignore_terminal_check == false ]]; then
		term_check
	fi
	## print the arguments enabled
	arguments_info

	if [[ $ignore_dependence_check == false ]]; then
		## check distribution for command suggestion
		checkdistro

		## check for: flock, jorder and jquery files
		## because of: https://github.com/wwidd/wwidd/issues/17
		checkdependence "server/src/node_modules/flock-0.1.3.js"
		checkdependence "common/flock/flock-0.1.3.js"
		checkdependence "client/www/jorder/jorder-1.2.1-min.js"
		checkdependence "client/www/jquery/jquery-1.7.min.js"

		if [[ $dependence_error == true ]]; then
			download_depedence_files
		fi

		## check if all dependences are installed
		checknode
		checkapp true "vlc"		"vlc"
		checkapp true "ffmpeg"		"ffmpeg"
		checkapp true "sqlite3" 	"sqlite3"
		checkapp true "xdg-open"	"xdg-utils"
		checkapp true "gzip"		"gzip"
		checkapp true "ifconfig"	"net-tools"

		commandsuggestion

		if [[ $dependence_error == false ]]; then
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
while [[ "$1" != "" ]]; do
	case "$1" in
		-h|--help)
			display_help
	    		;;
		-v|--version)
			display_version
			;;
		-i|--ignore-dependence-check)
			ignore_dependence_check=true
			;;
		-t|--ignore-terminal-check)
			ignore_terminal_check=true
			;;
		-n|--nodejs-debug)
			nodejs_debug=true
			;;
		-d|debug|--wwidd-debug)
			wwidd_debug=true
			;;
		-[a-z]*)
			while getopts ":hvind" opt "$1"; do
				case $opt in
					h)
						display_help
						;;
					v)
						display_version
						;;
					i)
						ignore_dependence_check=true
						;;
					t)
						ignore_terminal_check=true
						;;
					n)
						nodejs_debug=true
						;;
					d)
						wwidd_debug=true
						;;
					\?)
						echo -e "$error_msg Invalid option: -$OPTARG"
						echo "===> Try '$0 --help' for more information."
						exit 1
						;;
				esac
			done
			;;
		*)
			echo -e "$error_msg Invalid option: $1"
			echo "===> Try '$0 --help' for more information."
			exit 1
			;;
	esac
	shift
done

## call start() function (the main function)
start
