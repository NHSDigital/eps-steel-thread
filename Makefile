SHELL=/bin/bash -euo pipefail

lint:
	echo lint

publish:
	echo Publish

release:
	mkdir -p dist
	cp eps-api-tool.json dist/
