## Description

This project is used to maintain customer's subscriptions and notify them when their subscription expires (15 days, the exact day and 15 days after).

Docker, Node.js, Express, Sequelize as the main technologies.

The subscription's state machine is tested with Jest.

## Architecture

- A Postgres Database that contains 3 tables : customer, subscription, customer_subscription
- An Express api that will be accessed by a frontend application ([coach-admin](https://github.com/AudreyFI/coach-admin)) and by a cron job to manage the validity of the subscriptions (changing status and sending notifications to the customers)

These layers will be containerized (Docker).

## Setup

You'll need to install Docker to launch this project locally

```bash
mkdir data
sudo chmod - R 777 data
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
EMAIL_CC=CHANGEME
SMTP_HOST=CHANGEME
SMTP_USER=CHANGEME
SMTP_PASSWORD=CHANGEME
FRONTEND_URL=CHANGEME
FRONTEND_NETWORK_URL=CHANGEME
```

## Database backup and restore

A docker container named `backup` is doing backups everydays and writes a file here /backup. It also cleans the old files to keep only 2. To restore the database (with the correct dump name. And be sure you created a dumps folder inside your db container) :

```bash
docker cp backup/2024-07-14-15-03-39.dump db:dumps/restore.dump
docker exec -it db bash -c 'pg_restore -c --user <USER> --dbname <DBNAME> dumps/restore.dump'
docker exec -it db bash -c 'rm dumps/restore.dump'
```

You can use the /send-dumps.py script to send the generated backup to the email address you want and execute it with the cron job, for example (to run every week):

```bash
0 0 * * 0 python send-dumps.py
```

## Expiration notifications

The endpoint [customer-subscription/check-validity](http://localhost:3001/customer-subscription/check-validity) is looking for invalid subscriptions : end date between today - 15 and today + 15.
It calls a state machine to update the subscription's state and send an email to the customer.

You can also use a cron to call this endpoint everyday (at eight) :

```bash
0 8 * * * curl --silent http://localhost:3001/customer-subscription/check-validity
```
