# Lineup

Think about `Lineup` like your terraform project managed by a server. You
would provision/unprovision environments from a simple command or from a
REST API. It can be used:

- to create and destroy environments on-demand. As a developer, you will not
  need to configure your environment anymore, neither wait for your
  command to finish before you can start working again on a different branch
  or simply stop your laptop
- to update environments on-demand. As a developer, you might need to apply
  some version changes, you can just kick them off
- to make the infrastructure code accessible from any frontend applications. 
  You can grant access to your environment though self-service portals or 
  via a chatbot and allow users to interact with complete systems, not
  just instances, from the push of a button
- to **reduce cost**. Add time lease rules to your environments and provide
  centralized cleanup jobs to reduce your infrastructure needs.
  Lineup can also easily be used to track resource consumption, contact
  people and do more cleanup
- to extend the use of your infrastructure to other use-cases, including
  demonstration, training or self-service to your customers if you have a
  SaaS environment.
- to do more. Lineup is what you want it to be... Provide some feedback and
  do not hesitate to contribute.

> **Important**:
  There are a few things we discourage you from doing! This is because
  Lineup remains new and is extremely sensitive to the quality
  of the Terraform scripts you are writing. As a result, you should not
  mix the creation/update/deletion of an environment from Lineup and from
  another set of tools. We also with your CI/CD or for your production
  environment. It also includes managing your Terraform environment from
  Lineup and by another mean.

---
# Do you want to play with it?

If you want to work with Lineup, you'll find below a set of documentation
to help you:

- [A step-by-step demonstration of Lineup with Consul](docs/TUTORIAL.md)
- [The concept guide](docs/CONCEPT.md)
- [The installation guide](docs/INSTALLATION.md)
- [The guidelines to develop and deploy scripts for Lineup](docs/GUIDELINES.md)
- [The reference documentation for the API](docs/REFERENCE.adoc)
- [Frequently Asked Question](docs/FAQ.md)

Last and not least, if you have any question, open issues and PR on Github and refer to
the [Code of Conduct](docs/CODE_OF_CONDUCT.md) and the [Contribution Guide](docs/CONTRIBUTION.md)
