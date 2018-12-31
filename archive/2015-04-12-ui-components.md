# ui components
When I say "reusable ui components", your first association might be bootstrap's
components. Though they're reusable, they're also very opinionated. Also as
soon as you're doing something more complicated in a page (e.g. making an app)
they tend to fall short. This is an overview of the components I think are
essential to build web applications with.

## Routers
Routers manage global page state, and should be a solved problem by now.
Unfortunately they're not, as there are differences in terms of composition,
locus (location(s) of invocation), and opinions on [the amount of cruft it
should contain](https://github.com/rackt/react-router/tree/master/docs/api).

It's often forgotten that a router is just a pattern matcher that invokes a
side effect. If you divide a router into those two separate parts there's no
need to create overcomplicated beasts. If this sort of makes sense,
check out [wayfarer](https://github.com/yoshuawuyts/wayfarer) and friends, it
might appeal to you.

## Forms
Any user interaction that isn't a button, is usually a form. Forms are the only
way (normal, bland, non-WebRTC / non-canvas) applications pull in data that
wasn't predefined by the program. Clicking a button is usually a predefined
action (e.g. star a thing), whereas a form is not (e.g. share a tweet). 

Apart from providing unique input, forms are also difficult creatures to
manage. Data must be sent in a special way, feedback must be provided at
certain points, checks must be done on the client. In terms of modularity this
is still an unsolved problem.

## Infinite List
Cocoa has an element called UITableView, which in its essence is just a long,
inifinite list of elements that are rendered. This is one of the trickier parts
for modern web apps, but essential. Tumblr, Facebook, Twitter and Pinterest are
at its core just an infinite list mounted on top of a backend.

## Honorable mentions
- buttons: they're everywhere. All these suckers need is an `.on('click')`
  listener
- dropdowns: though higher level, they're hard to build. Having an
  unopinionated reusable element for this would be neat.
- modals / notifications: tricky as they are, they're also necessary. Placing
  these elements well is not easy.
