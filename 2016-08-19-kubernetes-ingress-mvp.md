---
title: 'kubernetes ingress mvp'
created: '19-08-2016'
---

Creating a service with `kubernetes` is lots of fun, but the amount of new
words that are introduced can be a bit much. And so I've found the need to go
into detail and define the relationship between `services`, `deploys` and
`ingress` because it's taken me a while to understand. To be honest I'm writing
this article as I'm figuring it out so that others will have the reference I
wish I had when I started.

What we're going to do here is deploy a minimal `nginx` server that is exposed
to the outside world. For your own apps you'd only need to change the image
from `nginx` to your own docker image. Here goes ⚡️

## Services
The goal of a `service` is to name things within your infrastructure. It's a
way of selecting a bunch of pods (read: containers) and group them together.
It's the "where" and "why" of our stuff.

```yml
# service.yml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 80
```

The `yaml` file here says: "run all deployments (and other things) labelled
"app: nginx" and expose their port 80 as port 80 on the service". This allows
us to give names to groups of things within our system which is 🆒.

The magic label to make it work with the google load balancer `ingress` later
on is "type: NodePort". Discovering the need for this lil label took me the
better part of 12 hours. Regardless, I think the whole thing's pretty readable.

## Deploys
Deploys are the filling of our sandwich. The furniture in our house. The
pickles in the jar. It's the "how" of our stuff. It defines how containers
should be composed into pods, which volumes should be mounted and all the other
good stuff. If services are the interfaces within our cluster then, deploys are
the details that are abstracted away.

```yml
# deployment.yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.9.1
        ports:
        - containerPort: 80
```

This takes the `nginx:1.9.1` image, labels it `app: nginx`, spawns up 1
instance, and exposes port 80 from the freshly spawned container. It doesn't do
a whole lot, but deployments can be extended to choose between rolling updates
and other strategies, mount volumes, secrets and other stuff. I think it's a
reasonable approach to managing docker flags.

## Ingress
`ingress` rules define which parts of our cluster are exposed to the outside
world. There's all sorts of fancy stuff you can do with load balancing and what
not, but the MVP case is just to expose port 80 so we can curl(1) an IP address
to see our thing ✨from the internet✨.

`services` are perfectly capable of exposing themselves to the outside world
through setting their service types, but using `ingress` is a little more
_explicit_. `ingress` is special in that it can provides a unified interface to
things like `haproxy`, `nginx` and cloud load balancers. In this case I haven't
figured out how to roll my own load balancer yet (12 hours of debugging
today, I'm tired) so we're just gonna go with the google money balancer.

```yml
# ingress.yml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: staging
spec:
  backend:
    serviceName: nginx
    servicePort: 80
```

All this does is: "route all traffic to service nginx on port 80". For domain
names you probably want to specify a static IP here so that the DNS mapping
makes sense. The `ingress` resource can also do all sorts of subrouting, but
we're not gonna bother with that here. It's probably a good idea to have a
centralized API gateway anyway, so nope nope this works well enough.

## Walking the puppy
This is where the shell happens.

```sh
# get all files live
$ kubectl apply -f ./deployment.yml
$ kubectl apply -f ./service.yml
$ kubectl apply -f ./ingress.yml
```
And then here comes the part where you gotta wait 5 minutes because googles
load balancer [takes a while to go live][time]. You can check the track the
status by doing:

```sh
# look for the "unknown" field. Once it's "healthy" we're live
$ while sleep 1; do kubectl describe ing; done
```

Voila, web scale.

## Wrapping up
And that's it! At the moment I like to structure these rules in my
infrastructure repository under the service name. E.g. something like this:
```txt
nginx/
  deployment.yml
  ingress.yml
  service.yml
service-auth/
  deployment.yml
  service.yml
```

This is great because at a glance you can run `tree(1)` and see which parts
have ingress rules, are services, have daemon sets etc. The downside of this
approach is that when provisioning a new cluster you need to run these files in
the right order or you'll get to trouble town. But getting the order right can
be scripted away so this approach is quite good.

And that's it for now. Flap your tiny wings and fly fly fly away.

_Yosh is a freelance software engineer, building all sorts of things. His
obsession this week is infrastructure and automation so hey enjoy a bunch of
articles ✌️_

[time]: https://github.com/kubernetes/contrib/blob/master/ingress/controllers/gce/BETA_LIMITATIONS.md
