if [ "$(ls .gstr)" == "" ]; then
    echo 'not finded .gstr env!';
    python3 -m venv .gstr;
    chmod +x ./.gstr/bin/activate;
    source ./.gstr/bin/activate;
    pip3 install -r requirements.txt;
    deactivate;
else echo 'already exist .gstr';
fi

if [ "$(ls node_modules)" == "" ]; then
    echo 'not finded node_modules';
    npm install;
fi

npm ci;
chmod +x automata.sh;
source ./automata.sh;