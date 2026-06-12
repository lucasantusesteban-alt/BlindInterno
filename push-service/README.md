# BlindSaint Push Service

Standalone Node worker that sends Web Push notifications to the team.

- **Daily digest** at 09:00 Europe/Madrid: each user's pending tasks + today's events.
- **Event reminders** ~30 min before an internal/social event starts.
- Cleans up expired subscriptions (HTTP 404/410) automatically.

## How it works

- Reads subscriptions, tasks, events and users from PocketBase (`https://pb.obrion.es`)
  authenticating as a dedicated service superuser.
- Signs and sends Web Push using VAPID (`web-push`).
- Schedules with `node-cron`.

## Deploy (on the VPS)

Secrets live only in `/opt/push-service/.env` (see `.env.example`), never in git.

```bash
cd /opt/push-service
sudo docker build -t blindsaint-push:latest .
sudo docker run -d --name blindsaint-push --restart unless-stopped \
  --env-file /opt/push-service/.env blindsaint-push:latest
```

## Manual triggers (control server, localhost only)

```bash
sudo docker exec blindsaint-push wget -qO- http://127.0.0.1:8099/run/test       # test push to all subs
sudo docker exec blindsaint-push wget -qO- http://127.0.0.1:8099/run/digest     # daily digest now
sudo docker exec blindsaint-push wget -qO- http://127.0.0.1:8099/run/reminders  # event reminders now
```
