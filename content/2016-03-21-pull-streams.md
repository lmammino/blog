+++
title = "pull streams"
date = 2016-03-21
+++

_This post is part of a series:_

- _Pull Streams (current)_
- [_Rust Streams_](/rust-streams)

Streams are an asynchronous abstraction that allows dealing with large data sets
in small chunks, pushing bottlenecks into the IO layer. This usually leads to less
memory cost and increased performance, which is a _very_ good thing.

In streams, data flows from a Source, through a bunch of Through streams, into
a Sink:
```txt
  ┌────────┐   ┌─────────┐   ┌────────┐
  │ Source │──▶│ Through │──▶│  Sink  │
  └────────┘   └─────────┘   └────────┘
```

Node has shipped streams as part of its standard library since its early days.
However with each release, new features, APIs and concepts were added, making
the current implementation very unwieldy. In my years as a Node developer I've
only met a handful of developers that felt comfortable using the current
version of Node streams. In an ideal world streams would be used as much in
Node as pipes are used in shell.

## Enter pull-streams
[pull-stream](https://github.com/dominictarr/pull-stream) is an alternative
model for streams created by [Dominic Tarr](https://github.com/dominictarr).
Like Node streams, it has a concept of _backpressure_. This means that instead
of a source pushing out data as fast as it can, the consumer stream _pulls_
data once it's ready to handle more. This leads to a program never holding more
data in memory than it needs.

The Node streams source is well over 1200 lines, without even accounting for
dependencies. The `pull-stream` source is just 28 lines, which is a whopping
`0.4kb` minified:
```js
module.exports = function pull (a) {
  if (typeof a === 'function' && a.length === 1) {
    return function (read) {
      var args = [].slice.call(arguments)
      return pull.apply(null, args)
    }
  }

  var read = a
  var n = arguments.length
  var i = 1

  if (read && typeof read.source === 'function') {
    read = read.source
  }

  for (; i < n; i++) {
    var s = arguments[i]
    if (typeof s === 'function') {
      read = s(read)
    } else if (s && typeof s === 'object') {
      s.sink(read)
      read = s.source
    }
  }

  return read
}
```
Don’t be fooled by the simple exterior though, `pull-stream` provides the same
functionality as Node streams do. With fewer lines of code there’ll be less
bugs, and room to optimize every last bit of code.

## Pull-stream types
In pull-streams there are 3 types of streams: source, through and sink. In
order to let data flow, a source and sink must be connected. Through streams
are combinations of sources and sinks, making every connection in the pipeline
a source and a sink that talk to each other. Conceptually it looks like this:
```txt
  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
  │Source│──▶│ Sink │ ┌▶│ Sink │ ┌▶│ Sink │
  └──────┘   ├──────┤ │ ├──────┤ │ └──────┘
             │Source│─┘ │Source│─┘
             └──────┘   └──────┘
              Through    Through
```

If a source and a through stream are connected they will not start emitting
data until a sink is attached at the end. Likewise, if a through and sink are
connected, they will not start flowing data until a source is attached at the
start. This allows composition of arbitrary streams into pipelines similar to
what [pumpify](https://github.com/mafintosh/pumpify) provides for Node streams.

## Composition
`pull-stream`s use the `pull()` function to combine sinks and sources. Because
sinks connect to sources, any number of streams can be connected. It's
functional composition all the way.

Duplex (through) streams are objects that have a `.source` and `.sink` properties
on them. The following three methods of connecting `pull-stream`s are equivalent:

```js
pull(a.source, b.sink)
pull(b.source, a.sink)
```
```js
b.sink(a.source)
a.sink(b.source)
```
```js
pull(a, b, a)
```

## Helper functions
`pull-stream` ships with helper functions such as `asyncMap` that make common
interactions trivial. See the docs for available
[sources](https://github.com/dominictarr/pull-stream/blob/master/docs/sources.md),
[sinks](https://github.com/dominictarr/pull-stream/blob/master/docs/sinks.md)
and
[throughs](https://github.com/dominictarr/pull-stream/blob/master/docs/throughs.md).

Let's create a basic map-reduce pipeline using `asyncMap` where we
asynchronously `fs.stat` an array of files, and gather the results in an array:
```js
const pull = require('pull')
const fs = require('fs')

const source = pull.values([ './file1', './file2', './file3' ])
const through = pull.asyncMap(fs.stat)
const sink = pull.collect(function (err, array) {
  if (err) return console.error(err)
  console.log(array)
})

pull(source, through, sink)
```
Because under the hood we're just composing functions, the overhead of doing
this is reduced to a bare minimum.

## Error handling
In Node streams errors don't propagate through `.pipe()` chains. It's therefore
common practice to either use helper libraries or attach a `.on('error')`
listener to every stream. Getting errors wrong is not a great feeling.

In `pull-stream`s errors are passed into the callback, which grinds the whole
stream pipeline to a halt. It's again the familiar API of `cb(err)` for an
error and `cb(null, value)` for success.

Here's a source stream that returns a single `fs.stat` value:
```js
const fs = require('fs')

function readFile (filename) {
  var read = false   // keep track if we've executed the action

  return function source (end, cb) {
    if (end) return cb(end)     // stop signal was passed, stop doing things
    if (read) return cb(true)   // we're done with fs.stat, stop doing things

    fs.stat(filename, function (err, file) {
      if (err) return cb(err)   // ohey, an error
      read = true               // mark that we've executed the action
      return cb(null, file)     // pass value down the pipeline
    })
  }
}
```

## Wrapping it up
And that's it. I could keep whipping out `pull-stream` examples, but I think
we've made our point: streams are a cool idea; `pull-stream` is a neat
implementation. If you're keen to learn more, take a look at the links below.
I hope this was useful; give `pull-stream` a try let me know how you go! -Yosh

- [twitter/yoshuawuyts](https://twitter.com/yoshuawuyts)
- [github/yoshuawuyts](https://github.com/yoshuawuyts)

## See Also
- [pull-stream](https://github.com/dominictarr/pull-stream)
- [pull-stream-examples](https://github.com/dominictarr/pull-stream-examples)
- [pull-stream/spec](https://github.com/dominictarr/pull-stream/blob/master/spec.md)
- [pull-stream/sources](https://github.com/dominictarr/pull-stream/blob/master/docs/sources.md)
- [pull-stream/sinks](https://github.com/dominictarr/pull-stream/blob/master/docs/sinks.md)
- [pull-stream/throughs](https://github.com/dominictarr/pull-stream/blob/master/docs/throughs.md)
