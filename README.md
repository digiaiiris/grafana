# Grafana

This is Digia Iiris's custom version of Grafana app with some added features

## Setting Up Development Environment

In short you need: Go, Node and Yarn to develop Grafana.
Read the instructions from Grafana site:
[Grafana Developer Guide](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md)

First start Grafana backend:
`make run`

Then start Grafana frontend:
`yarn start`

Open browser from http://localhost:3000

Note: You need to have Iiris frontend also running in http://localhost:8080 because our custom code will expect to find
Grafana in an iFrame under Iiris. You also need to set Grafana's config `allow_embed = true` in `conf/defaults.ini`.

## Make a Build

To build Grafana run:
`yarn build`

This will make a compiled version of Grafana to public-folder.

Finally run `. create-tarball.sh` which will create you `grafana-build.tar.gz` file.
You need to add this tarball to the release in github when tagging a new version. Tarball is loaded by Grafana's
Docker build in docker-hub.
