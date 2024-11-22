build-arm:
	@echo "Zip all files"
	zip build-arm.zip package.json package-lock.json .env Dockerfile.db Dockerfile.prod docker-compose-arm.yml tsconfig.json
	zip -r build-arm.zip src
