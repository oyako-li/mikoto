if [ "$(ls .gstr)" == "" ]; then
    echo 'not finded .gstr env!';
    python3 -m venv .gstr --system-site-packages;
    chmod 700 ./.gstr/bin/activate;
    ./.gstr/bin/activate;
    pip3 install -r requirements.txt;
    deactivate;
else echo 'already exist .gstr';
fi

npm ci;
chmod 700 startup.sh;
source ./startup.sh;