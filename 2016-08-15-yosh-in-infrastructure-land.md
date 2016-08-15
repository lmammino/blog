---
title: 'Yosh in infrastructure land'
created: '15-08-2016'
---

I've been working on infrastructure for the last week or so. Not just because I
think it's fun (I really do), it's also a requirement for this client project
I'm working on. We don't have a dedicated ops person on the team, so I figured
I might as well setup some stuff before diving back into JS land. This is a lil
overview of the stuff I'm doing.

## The platform
[docker(1)][docker] is pretty cool as it allows you to create tiny operating
systems that just run your app. I quite enjoy creating small [alpine][alpine]
boxes for my apps. But all those machines need to run on a computer, so we
gotta setup that computer.

My computer of choice nowadays is [google cloud][gcloud]. It's because unlike
AWS the UI is non-terrible. It's actually nice to work with. I know some of the
more _"serious"_ ops people might argue that UI doesn't matter, it's the
features that matter. But I digress; if I can't make sense of the UI, I won't
be using any of the features anyway so hey google cloud is what I like to roll
with for now.

## The container host
So on google cloud there's this thing called the "Google Container Engine"
(GKE). It allows you to setup a [kubernetes][kube] cluster with a single click.
It pretty much works as advertised. I like to automate stuff down to a single
command though, so I'm using [terraform(1)][tf] and [gcloud(1)][gcloud1] for
that.

Kubernetes is cool in that it's really good at managing containers. If you've
ever used docker, you might remember writing out a whole lot of flags to mount
volumes, ports, security and more. With kubernetes you write down those flags
in a (quite readable) `.yml` format and then run `$ kubectl apply -f <file>` on
it to deploy it to your cluster. It _feels_ real good.

Kubernetes can hold all sorts of stuff. Deploying stuff without having any
downtime works quite well too. Even managing secrets works quite well. Secrets
are also just `.yml` files that hold some strings. They're all stored in-memory
so an attacker would need to try a bit harder to read them.

All in all: I'm quite pleased with kubernetes. It's not perfect, but it feels a
step up from managing containers / machines by hand; and sure as hell a lot
less magicky than [heroku][heroku].

## Continuous everything
So being able to run containers is cool, but what are we gonna run on it? The
first thing to go with would be automation. To make our systems work for us
it'd be nice if we could create continous deployment.

The way I view continuous deployment is like this:
- a piece of code is written
- the code is uploaded to a feature branch on a git host
- tests are run, if tests pass we can merge it to our dev branch
- our dev branch is automatically deployed to our staging environment
- if we're happy with our staging environment, we merge dev to master
- master is automatically deployed to production

My tool of choice for this is [buildkite][buildkite]. It's a semi self-hosted
automation provider built by amazing folks. They're just 3 people building
something that works super well and looks, well, very pretty. I've been hanging
out in their [slack][bk-slack] over the weekend and they've been super helpful.

Anyway, I've now got a whole automated setup for my containers where I'm
creating a base build which contains my dev dependencies, and an optimized
build that's ready for production. The dockerfiles in my directory now have
this structure:

```txt
.buildkite
docker
  build/
    Dockerfile
  optimize/
    Dockerfile
```

The reason why I'm nesting Dockerfiles like that is because it's supposedly
best practice to not name a Dockerfile something different. Ah well, I don't
mind nesting directories too much in this case.

## The bad
So far the only problems I've had with this setup is that `npm(1)` eats a whole
bunch of memory for builds. My tiny machines were crashing all the time.
Luckily I've been able to work around this by setting some flags in Node. My
dockerfile now looks like this:

```Dockerfile
FROM mhart/alpine-node:4

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install img dependencies from: https://pkgs.alpinelinux.org/packages
RUN apk update
RUN apk add jq

# Install app dependencies
COPY package.json /usr/src/app/
RUN /usr/bin/node \
  --max_semi_space_size=1 \
  --max_old_space_size=198 \
  --max_executable_size=148 \
  /usr/bin/npm install

# Add installed binaries to env
ENV PATH /app/node_modules/.bin:$PATH

# Bundle app source
COPY . /usr/src/app

EXPOSE 8080
CMD ["npm", "start"]
```

All the Node flags you're seeing there prevent memory usage from spinning out
of control preventing builds from crashing. The only downside is that builds
now take forever, but yeah at least they finish. Maybe I should move to nodes
with more than `0.6GB` of RAM soon but who knows. Maybe.

## Wrapping up
And that's it. I'm now running a whole bunch of containers on top of
kubernetes on my own servers. As I'm not done with the infrastructure setup
for my client yet I'll probably be doing some more work in the coming days /
weeks. Something I'm keen on for my own infrastructure is to add more robots.
Stuff like [mention bot][mention-bot] and [ghb0t][ghbot] seem like nice little
additions; but I can imagine taking the idea of running a robot legion a little
further. Hah.

If you're interested, here are the notes of the stuff I've been working on;
maybe it'll be useful.

- https://github.com/yoshuawuyts/infrastructure
- https://github.com/yoshuawuyts/playground-docker-buildkite
- https://github.com/yoshuawuyts/knowledge/blob/master/bin/docker.md
- https://github.com/yoshuawuyts/knowledge/blob/master/bin/gcloud.md
- https://github.com/yoshuawuyts/knowledge/blob/master/bin/kubectl.md

Cheers! ✌️

[docker]: https://www.docker.com/
[alpine]: https://www.alpinelinux.org/
[gcloud]: https://cloud.google.com/
[tf]: https://www.terraform.io/
[gcloud1]: https://cloud.google.com/sdk/gcloud/
[kube]: http://kubernetes.io/
[heroku]: http://www.heroku.com/
[buildkite]: https://buildkite.com
[bk-slack]: https://chat.buildkite.com/
[mention-bot]: https://github.com/facebook/mention-bot
[ghbot]: https://github.com/jfrazelle/ghb0t
