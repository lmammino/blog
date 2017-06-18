---
title: 'Choo, architecture & performance'
created: '18-06-2017'
---

Almost every [Choo](https://github.com/yoshuawuyts/choo) release so far has
managed to include more features, and reduce the size on disk. In the upcoming
v6 release we're now sitting at 3.8Kb.

People often ask how it's possible to do pack a "batteries included" browser
framework into something that's about an order of magnitude smaller than
conventional options. This post is intended to break down the bits that make up
choo, and explain why we made certain choices - all with the hopes of making
frameworks feel less magical. Here goes.

__note:__ Everything here is from our perspective. Different people have
different constraints and silver bullets don't exist. It's fine to disagree,
but keep in mind that everyone has the best intentions and it's not a
competition. This is our take on things.

## Rendering
The core building block of any browser framework is creating HTML elements.
We've chosen to use ES6 tagged template strings for this, because it allows
writing domain specific languages (DSLs) in the browser without needing to
change the language. In choo you can do it like this:

```js
var choo = require('choo/html')

var planet = 'earth'
var myElement = html`
  <section>
    Hello ${planet}
  </secion>
`
document.body.appendChild(myElement)
```

Under the hood tagged template strings are just functions, with the strings and
interpolated values (e.g. `planet`) being passed as arguments. In turn the HTML
is then parsed, and becomes a bunch of `document.createElement()` and
`Element.setAttribute()` calls. The module we use for this is called
[bel](https://github.com/shama/bel).

The downside of using tagged template strings in the browser, is that parsing
the HTML and converting it to DOM elements is a little expensive. But luckily
this can be optimized by using [yo-yoify](https://github.com/shama/yo-yoify)
during compilation.

In Node, `bel` falls back to just rendering strings instead of DOM nodes by
using [pelo](https://github.com/shuhei/pelo). When coupled with caching, this
approach allows for sub-millisecond response times in many cases.

## Assertions
One of core values in the Unix philosophy is to fail hard and fail early. The
clearer the error message, the better the debugging experience will be. Node
ships with `require('assert')` for this purpose. It allows creating conditional
statements, that if they fail will `throw` an `Error`. We use assertions all
over the place; not only to check input types, but to make sure every
assumption in our code is accounted for. We try and make errors friendly, and
easy to track down - all with the goal to make debugging take less time, and
the framework work _for_ you.

In production you might not want to ship all assertions - after all, they're
mostly to catch developer errors. Luckily _there's a transform for that™_ in
[unassertify](https://ghub.io/unassertify).

## DOM diffing
Dom diffing is a form of declarative rendering. Instead of telling the browser
_how_ to create elements, you specify _what_ you want to render and let an
algorithm take care of it. In theory this might be slower than manual DOM
updates, but it drastically reduces rendering bugs. As a first pass this is
excellent, since it's still possible to drop down into the DOM and perform
manual mutations. DOM diffing looks somewhat like this:

```js
var nanomorph = require('nanomorph')
var html = require('bel')

var a = html`<div>hello earthlings</div>`
var b = html`<div>tears of joy</div>`
nanomorph(a, b) // tell "a" to look like "b"

console.log(a.toString() === '<div>tears of joy</div>') // true
```

The module we use for diffing is
[nanomorph](https://github.com/yoshuawuyts/nanomorph). You might have heard of
the term "virtual DOM" before; this is not it. Instead of using a _"virtual"
DOM_ (e.g. nested objects), we use actual DOM nodes.

This comes with a few tradeoffs: overall it's a little slower, but it uses less
memory and doesn't introduce a custom format to represent the DOM. This means
it's compatible with virtually all existing libraries, as long as they return
DOM nodes. Yay for compatibility.

## Routing
In choo we use the [nanorouter](https://github.com/yoshuawuyts/nanorouter)
library. This is a router built around a trie data structure. It supports
partials (e.g. `/foo/:bar`) and wilcard routes (e.g. `/foo/*`) and doesn't do
much more. It's all executed synchronously, and doesn't do anything besides
routing things. Exactly what youd'd expect from a router.

## Links
Hyperlinks are one of the cornerstones of websites - it puts the Hyper in
HyperText (Markup Language). Because the framework ships with a router, it's
aware of all routes. So to handle links we attach a listener at the root node
for all `'click'` events, and if they come from an `<a>` tag we handle them
with the router. This makes switching pages heaps easy.

## Events (the browser kind)
Modern browsers are quite consistent with their event implementations. Some
frameworks have a notion of "synthetic events", but we don't do anything with
that out of the box with choo (e.g. through `Element.addEventListener()`).

For those unfamiliar with "synthetic events": it's a method where instead of
attaching specific listeners to elements, you attach a single listener on the
root node (e.g. `document.body`), and catch events as they bubble up. This
allows for some performance gains because you attaching listeners on elements
can cost a bit of time. We consider this to be an optimization though: an
optimization that can be implemented in specific cases, but not the right
tradeoff to use everywhere.

## Events (the application kind)
Many frameworks are tightly knit with some form of event bus for application
logic. Probably a good example of this is React and Redux: there are other
options available, but it's usually one that has the dominant mindshare.

In choo we've decided to ship an event bus and router in core. Not only does
this mean there's less boilerplate when setting things up, it also means we
have a clear way to send events around. The router uses it to send `'navigate'`
events whenever we change routes, and by emitting `'render'` we can trigger
re-renders in our application. This means there's one less thing to worry
about.

The API is similar to Node's `require('events')` API, with the one difference
that we support `.on('*')`. This listener allows full inspection of each event
that flows through the emitter, which is great for development logging and
monitoring production loads.

Having a Node-style event emitters in core also means that more elaborate
setups can be implemented on top of it. For example `RxJs` and `pull-stream`
have adapters that work out of the box with choo. We use
[nanobus](https://github.com/yoshuawuyts/nanobus) for our events.

## State

State is just an object. It's up to you to format it however you prefer. Some
people might prefer elaborate transaction systems, while others have to
minimize garbage collection. Choo leaves this entirely up to you by only
exposing a mutable object, and a `'render'` event to trigger re-renders.

## Performance monitoring

Modern browsers ship something called the User Timing API, which is part of the
Performance API. You can create user timings by creating two marks, and then
measuring the time between them. It looks like this:

```js
window.performance.mark('first-mark')
// execute code here
window.performance.mark('second-mark')
window.performance.measure('my-measure', 'first-mark', 'second-mark')
console.log(window.performance.getEntries('my-measure')[0])
```

User timings are very useful. With them you can answer questions like: "how
long did it take to render my view?" and "what is the slowest component on my
page, on average?" Once you start using timings everywhere, it becomes an
amazing tool to keep track of performance.

The result is something like this:

![screenshot of the choo console](./screenshot.png)

In the Choo ecosystem we use two packages for this:
[nanotiming](https://github.com/yoshuawuyts/nanotiming) to create the marks,
and measure them during the browser's idle time. And
[on-performance](https://github.com/yoshuawuyts/on-performance) to listen to
performance events as they come in. `on-performance` uses the
`window.PerformanceObserver` API, which is currently only supported in Chrome
and Firefox behind a flag. It seems the w3c is committed to expanding this API
though, with events added for "time till first meaningful paint" and the like.

## Idle time
The browser event loop can create a new frame every 16 milliseconds. Creating
more frames isn't useful, because humans don't notice if we show more than 60
frames a second. A good strategy to hit 60 FPS is to create a distinction
between "important work" and "work that we can get to eventually". This often
boils down to "work important to render things" and "everything else".

Modern browsers ship with an API that allows you to schedule work in the spare
time of each frame. The `window.requestIdleCallback()` API triggers a callback
when all timers have resolved for a frame, and all rendering is done. Not all
browser support this API though, so we use the
[on-idle](https://github.com/yoshuawuyts/on-idle) package for this.

A fair warning with this API tho: if you use it to render anything on the
DOM it will cause a blocking recalc at the start of the next frame. Use this
API only to prepare for renders (e.g. build a DOM tree), or do other work that
doesn't affect the DOM.

We make use of idle time for things like logging, creating HTTP requests,
mutating objects and otherwise expensive operations that don't directly affect
the user interface.

We're big fans of the RIC API because it allows for better results by working
smarter, not harder.

## Animation frames
Another API to work with the browser frames is `window.requestAnimationFrame`.
In Choo we use [nanoraf](https://github.com/yoshuawuyts/nanoraf) to create an
upper limit of 60 frames a second, but do nothing by default. Re-rendering
is done by calling the `emit('render')` event. Because re-renders are explicit,
we can update the state without it also causing a re-render.

## Wrapping up
And that's about it. There's many more things going on in the extended choo
ecosystem (e.g. [compilers](https://github.com/yoshuawuyts/bankai), [API
frameworks](https://github.com/shipharbor/merry), [reusable
components](https://github.com/yoshuawuyts/microcomponent)) but this should
cover the core of things. Let us know what you thought in the comments.

✌️ -[Yosh](https://twitter.com/yoshuawuyts)
