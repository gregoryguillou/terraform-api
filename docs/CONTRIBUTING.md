# Contribute to Terraform-deck

## Your support is welcome

There are many ways to contribute to `Terraform-deck`:

- Try it, review the documentation and, if you have any problem, open an issue
  on the project
- If you like it, watch it on github, write tweets or article, share your
  experience with others; put some videos on Youtube...
- If face a problem, OPEN AN ISSUE! Describe it as much as you can. Be kind and
  follow the [code of conduct](https://github.com/gregoryguillou/terraform-deck/blob/master/docs/CODE_OF_CONDUCT.md). We value your feedback!
- If you have ideas for enhancements or new business cases that you do not
  manage to handle, don't hesitate to open an issue too or, if you prefer
  [contact m from github](https://github.com/gregoryguillou).
- Fork the project and create pull-request to correct or enrich the
  documentation, examples, drawings or whatever you want
- Review and comment the code, provide development ideas. `Terraform-deck` relies 
  on a large set of technologies and can easily be enhanced, because we are all
  beginners with Swagger, ExpressJS, Mocha, Bunyan, Docker and many more... 

Obviously, we would love you contribute to the code too. In order to do so,
there are several ways:

- You can contribute to the code by funding other people work for your own 
  benefit. [Contact me](https://github.com/gregoryguillou) if:
  - you need a feature that does not exist yet, and your organisation can fund
    it.
  - you want to subscribe to an open-source friendly support for `Terraform-deck`
  - you want to get some help to setup specific integrations with different
    applications, backends services or security systems
  - you want some specific terraform stacks to be developed for your needs and
    would agree this jobs to benefit the open-source community

- You can also fork the project and correct the code. Before you do it, read
  [concept guide](https://github.com/gregoryguillou/terraform-deck/blob/master/docs/CONCEPT.md)
  and go through the [tutorial](https://github.com/gregoryguillou/terraform-deck/blob/master/docs/TUTORIAL.md).
  The later, should provide you with most of what you need to understand about
  the architecture and will allow you to install a full development stack with
  some working example.

## Understand the organisation of the code

This section remains WIP. It would be important to describe the organisation
of the code and that would be a perfect place leave it.

## Deploying a new version

If you plan to deploy a new release, there are a few things to do. Some need
to be prapare before you roll out a new tag; some are 

### Before you deploy the version

- Add the version tag in `docker-compose.yml`
- Change the version in the `settings-template.yaml`
- Change the version in package.json
- change the version in swagger.yaml
### After you deploy the version

Make sure deployment works with docker compose by running the following
command and testing on it.

```shell
cd stack
docker-compose up -d
```

