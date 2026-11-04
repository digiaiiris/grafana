# Grafana

This is Digia Iiris's custom version of Grafana app with some added features


## Setting Up Development Environment

In short you need: Go, Node and Yarn to develop Grafana.
Read the instructions from Grafana site:
[Grafana Developer Guide](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md)

We suggest you use tools like "goenv" and "nvm" to be able to switch between Go and Node versions.
The following is a quick guide for running Grafana in your development environment:

### Installing, switching Go versions and running the backend:

First we need a tool to manage Go versions. We use a tool called "goenv" for this. Installation
instructions can be found from the link below:

https://github.com/go-nv/goenv/blob/master/INSTALL.md

Fish shell users can also use this:

https://github.com/bulkware/fish-goenv

The required Go version is defined in the `.go-version` file, so it isn't repeated here.
Install that version and set it as active:
```
goenv install $(cat .go-version)
goenv global $(cat .go-version)
make run
```

### Installing, switching Node version(s) and running the frontend:

First we need a tool to manage Node versions. We use a tool called "nvm" for this: Installation
instructions can be found from the link below:

https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating

After installing `nvm`, you can install and manage Node versions. The required Node version
is defined in the `.nvmrc` file, and `nvm` reads it automatically:

```
nvm install   # installs the version from .nvmrc
nvm use       # switches to the version from .nvmrc
npm install -g yarn
yarn install --immutable
yarn start
```

Open browser from http://localhost:3000

Note: You need to have Iiris frontend also running in http://localhost:8080 because our custom code
will expect to find Grafana in an iFrame under Iiris. You also need to set Grafana's config
`allow_embed = true` in `conf/defaults.ini`.


## Make a Build

To build Grafana run:
`yarn build`

This will make a compiled version of Grafana to public-folder.

Finally run `. create-tarball.sh` which will create you `grafana-build.tar.gz` file.
You need to add this tarball to the release in github when tagging a new version. Tarball is loaded by Grafana's
Docker build in docker-hub.
