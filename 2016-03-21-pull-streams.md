# let's talk about streams

## What are streams?
Streams are an asynchronous abstraction that allows dealing with data in
small chunks, pushing bottlenecks into the IO layer. This usually leads to less
memory cost and increased performance, which is a very good thing.

In streams, data flows from a source, through a bunch of through streams, into
a sink:
```txt
  ┌────────┐   ┌─────────┐   ┌────────┐
  │ Source │──▶│ Through │──▶│  Sink  │
  └────────┘   └─────────┘   └────────┘
```

Node ships with streams built in. However over time they've proven to be
very complex. We're currently on the third iteration, where each version has
added a new layer of API's, events and concepts. From talking to Node users,
I've come across few that were comfortable using Node streams - which is
unfortunate since the concepts underlying them are very solid.

## Enter pull streams
`pull-stream`s are an alternative model for streams created by [Dominic
Tarr](https://github.com/dominictarr). Like Node streams v2 and v3, it has a
concept of _backpressure_. This means that instead of a source pushing out data
as fast as it can, the consumer stream _pulls_ data once it's ready to handle
more.  This leads to a program never holding more data in memory than it
strictly needs.

Just because the implementation of `pull-stream`s is so small, here's the full
source code:
```js
module.exports = function pull () {
  var args = [].slice.call(arguments)
  if (typeof arg[0] === 'function' && (args[0].length === 1) {
    return function (read) {
      args.unshift(read)
      return pull.apply(null, args)
    }
  }

  var read = args.shift()
  if(read && typeof read.source === 'function') read = read.source

  function next () {
    var s = args.shift()
    if(null == s) return next()
    if(typeof s === 'function') return s

    return function (read) {
      s.sink(read)
      return s.source
    }
  }

  while(args.length) read = next()(read)
  return read
}
```
With few lines of code there'll be fewer bugs, and room to optimize every last
bit of code.

## Pull streams
In pull streams there are 3 types of streams. Source, through and sink. In
order to let data flow, a source and sink must be connected. Through streams
are just combinations of sources and sinks, making every connection in the
pipeline a source and a sink that talk to each other. Conceptually it looks
like this:
```txt
  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
  │Source│──▶│ Sink │ ┌▶│ Sink │ ┌▶│ Sink │
  └──────┘   ├──────┤ │ ├──────┤ │ └──────┘
             │Source│─┘ │Source│─┘
             └──────┘   └──────┘
```

`pull-stream` comes with a bunch of additional files that contain convenience
functions. Let's use some of these to create a basic map-reduce pipeline where
we asynchronously `fs.stat` an array of files, and gather the results in an
array:
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
Something where Node streams struggle with is error handling. Because errors
don't propagate through `.pipe()` chains by default, it's common practice to
either use helper libraries or attach a `.on('error')` listener to every
stream. Getting errors wrong is definitely not great experience, and probably
the single greatest source of confusion.

In `pull-stream`s errors are passed into the callback, which grinds the whole
stream pipeline to a halt. It's again the familiar api of `cb(err)` for an
error and `cb(null, value)` for success, and the additional way of signaling
the end of a stream `cb(true)`.

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
      read = true               // mark that we're done
      return cb(null, file)     // pass value down the pipeline
    })
  }
}
```

## Eventual values
