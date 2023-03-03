#!/usr/bin/bash
if [ "$(echo $VIRTUAL_ENV | grep '/\.gstr$')" == "" ]; then
    echo ".gstr is not activate";
    source ./.gstr/bin/activate;

fi

function usage {
    echo "
    [usage]
    $0 <ARG1> <ARG2> [options]

    [args]
    ARG1:
        ttyUSBports
    ARG2:
        Serial_transports_speed
    
    [options]
    -h | --help:
        show help
    -o | --out <VALUE>:
        tty output dir setting
    -s | --speed <VALUE>:
        set diffelent speed
    
    [example]
    $0 hoge fuga -r piyo    
    "
}

function error {
    echo "[error] $1" >&2
    exit 1
}

function info {
    echo "[info] $1"
}

function invoke {
    info $@
    $@ || error "execution error on command"
}

SCRIPT_DIR=$(cd $(dirname $0); pwd)
OUT=/dev/ttyUSB0;
SPEED=115200;
CLEARKER=$(echo '');

args=()
while [ "$#" != 0 ]; do
    case $1 in 
        -h | --help     ) usage;;
        -o | --out      ) shift; OUT=$1;;
        -s | --speed    ) shift; SPEED=$1;;
        -c | --clearker ) CLEARKER=$(npm run start:electron);;
        -* | --*        ) error "$1 : dont much any options";;
        *               ) args+=("$1");; # add options to array
    esac
    shift
done

# [ "${#args[@]}" != 2 ] && usage

# ARG1="${args[0]}"
# ARG2="${args[2]}"
# cd $SCRIPT_DIR

# set -eu

# info "ARG1: ${ARG1}"
# info "ARG2: ${ARG2}"
# info "-o: ${OUT}"
# info "-s: ${SPEED}"
# info "-c: ${CLEARKER}"
# invoke id
# E4:5F:01:37:15:65	192.168.0.10
(python3 ./src/tty/qr_detector.py $OUT $SPEED) & (echo $CLEARKER)
