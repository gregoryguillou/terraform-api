# Building and working with docker-compose

> **Note**: Future releases of Terraform--deck might support docker
  orchestration platforms, like Kubernetes. However, for now, you can
  only run on a single server with docker-compose

## Cloning or forking `terraform-deck`

Clone or fork and clone the project to install it on your laptop?

## Building containers

To build the containers, you should run the `build` command from
`stack/runfile.js`. In order to proceed:

```shell
cd api
npm install
cd ../stack
npm install
npx run build
```

## Create a settings.yaml file

The whole docker-compose configuration is stored in
`api/config/settings.yaml`. Create it from `api/config/settings-template.yaml` 
and modify the values as described in the 
[Installation Guide](../INSTALLATION.md)

## Running Docker Compose

To run the API, you should define the version to use. By default, it should use the
latest tagged version from the docker store. Assuming you've built the containers
you might want to use the version we've built by setting `VERSION` to `latest` in
the `.env` file

```shell
cd stack/docker
echo "VERSION=latest" >.env
docker-compose up -d
```

## Other considerations

You should be good to go. However, this configuration is given for demonstration
and development only. If you want to build a more serious configuration, you should:
- Perform some capacity planning especially in term of memory to avoid any OOM Kill
- Enforce the API with a loadbalancer secured by an SSL certificate
