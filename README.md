## Description

This project is used to maintain customer's subscriptions and notify them when their subscription expires (15 days, the exact day and 15 days after).

Docker, Node.js, Express, Sequelize as the main technologies.
The subscription state machine is tested with Jest.

## Architecture

- A Postgres Database that contains 3 tables : customer, subscription, customer_subscription
- An Express api that will be accessed by a frontend application (another repo will be added for this soon) and by a cron job to manage the validity of the subscriptions (changing status and sending notifications to the customers)

These layers will be containerized (Docker).

## Setup

You'll need to install Docker to launch this project locally

```bash
mkdir data
sudo rm -r data/*
sudo chown $USER data
docker compose build
docker compose up -d
```

Then fill in the .env.example file and rename it .env

```bash
POSTGRES_USER=CHANGEME
POSTGRES_PASSWORD=CHANGEME
POSTGRES_DB=CHANGEME
HOST=CHANGEME
APP_NAME=CHANGEME
EMAIL_SENDER=CHANGEME
SMTP_HOST=CHANGEME
SMTP_USER=CHANGEME
SMTP_PASSWORD=CHANGEME
```

I use mailtrap as an Email Delivery Platform https://mailtrap.io/

## Database backup and restore

A docker container named `backup` is doing backups everydays and writes a file here /backup/dump.sql. To restore the database :

```bash
docker cp backup/2024-07-14-15-03-39.dump db:test.dump
docker exec -it db bash -c 'pg_restore -c --user <USER> --dbname <DBNAME> /test.dump'
```
