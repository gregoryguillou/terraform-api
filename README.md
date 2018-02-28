# Terraform Lineup

Terraform Lineup allows to provision/unprovision environments from a simple
command. It can be used:

- to start and stop environments on-demand. As a developer, you will not
  need to configure your environment anymore, neither wait for your
  command to finish before you can start working again on a different branch
  or simply stop your laptop
- to update environments on-demand. As a developer, you might need to apply
  some version changes
- to be accessible from your frontend applications. Grant access to your
  environment though self-service portals or chatbots and allow users
  to interact with complete systems, not just instances, from the push of
  a button
- to reduce cost. Add time lease rules to your environments and provide
  centralized cleanup jobs to reduce your infrastructure needs. Terraform
  Lineup can also easily be used to track resource consumption, contact
  people and do more cleanup
- to extend the use of your infrastructure to other areas, including
  demonstration, training or self-service to your customers if you have a
  SaaS environment.
- to do more... Terraform Lineup is what you want it to be...

    Important notes:
    There are a few things we discourage you from doing. This is because
    Terraform Lineup remains new and is extremely sensitive to the quality
    of the Terraform scripts you are writing. As a result, you should not
    mix the creation/update/deletion of an environment from Terraform
    Lineup and from another set of tools. We also 
    with your CI/CD or for your production environment. It also includes
    managing your Terraform environment from Lineup and by another mean.

## For more informations

If you want to know more, jump to:

- [A step-by-step demonstration of Terraform Lineup with Consul](docs/TUTORIAL.md)
- [The concept guide](docs/CONCEPT.md)
- [The installation guide](docs/INSTALLATION.md)
- [The guidelines to develop and deploy Terraform scripts for Lineup](docs/GUIDELINES.md)
- [The reference documentation for the API](docs/REFERENCE.md)
- [Frequently Asked Question](docs/FAQ.md)

Last and not least, if you have any question, open issues and PR on Github and refer to
the [Code of Conduct](docs/CODEOFCONDUCT.md)
