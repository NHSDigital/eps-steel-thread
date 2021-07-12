SHELL=/bin/bash -euo pipefail

lint:
	echo lint

publish:
	echo Publish

release:
	mkdir -p dist/proxies/live
	cp eps-api-tool.json dist/
    cp -Rv proxies/live/apiproxy dist/proxies/live
