# Make sure pipenv is good to go
echo "Do fresh install to make sure everything is there"
python3 -m pipenv install

VENV=$(python3 -m pipenv --venv)
ls $VENV/lib
SITE_PACKAGES=$VENV/lib/python3.6/site-packages
echo "Library Location: $SITE_PACKAGES"
DIR=$(pwd)

cd $SITE_PACKAGES
zip -r9 $DIR/handler.zip *

cd $DIR
zip -g handler.zip handler.py