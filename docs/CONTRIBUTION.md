# Running Terraform Lineup locally

There are a few conditions to run the application locally:

- docker must be running and /var/run/docker.sock must be available
- a `settings.yaml` file must be available in `api/config`

```shell
cd api
cp -R /config/settings-template.yaml config/settings.yaml
```

# Building containers

```shell
cd stack
LINEUP_CONTAINER=lineup-service npx run build
LINEUP_CONTAINER=lineup-terraform npx run build
```