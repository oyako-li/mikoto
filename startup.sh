#!/usr/bin/bash
if [ "$(echo $VIRTUAL_ENV | grep '/\.gstr$')" == "" ]; then
    echo ".gstr is not activate";
    source ./.gstr/bin/activate;

fi

(python3 ./src/tty/control.py /dev/ttyUSB0 115200) & (npm run start)
