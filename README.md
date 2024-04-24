For development launch this command : `docker compose up`

- Build API images :
  `docker build -f Dockerfile.prod . -t customers-subscriptions`
  `docker build -f Dockerfile.db . -t postgres`
