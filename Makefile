SHELL=/bin/bash -euo pipefail

lint:
	echo lint

publish:
	echo Publish

release:
	mkdir -p dist/proxies/live
	cp ecs-proxies-deploy.yml dist/ecs-deploy-all.yml
	cp specification/eps-api-tool.json dist/
	cp -Rv proxies/live/apiproxy dist/proxies/live
