build:
	@echo "Zip all files"
	zip build-back.zip package.json package-lock.json .env Dockerfile.db Dockerfile.prod docker-compose-arm.yml tsconfig.json
	zip -r build-back.zip src
