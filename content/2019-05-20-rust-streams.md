+++
title = "rust streams"
date = 2019-06-20
+++

As Rust's async story is evolving, so is Rust's streaming story. In this post
we'll take a look at how Rust's streaming model works, how to use it
effectively, and where things are heading in the future.

## The stream traits
In synchronous Rust, the core streaming abstraction is that of [`Iterator`]. It
provides a way of yielding items in a sequence, and blocks in between.
Composition is done by passing iterators into the constructors of other
iterators, allowing us to plumb things together without much fanfare.

In asynchronous Rust the core streaming abstraction is [`Stream`]. It behaves
very similar to `Iterator`, but instead of blocking between each item yield, it
allows other tasks to run while it waits.

In addition async Rust has counterparts to the synchronous [`Read`] and
[`Write`] in the form of [`AsyncRead`] and [`AsyncWrite`]. The purpose of these
traits is to represent unparsed bytes, often coming directly from the IO layer
(such as from sockets or files).

```rust
use futures::prelude::*;
use runtime::fs::File;

let f = file::create("foo.txt").await?; // create a file
f.write_all(b"hello world").await?;     // write data to the file (AsyncWrite)

let f = file::open("foo.txt").await?; // open a file
let mut buffer = Vec::new();          // init the buffer to read the data into
f.read_to_end(&mut buffer).await?;    // read the whole file (AsyncRead)
```

Rust streams have some of the best features of other languages. For example:
they sidestep inheritance problems as seen in [Node.js's Duplex
streams](https://nodejs.org/api/stream.html#stream_class_stream_duplex) by
leveraging Rust's trait system. But they also implement backpressure and lazy
iteration, improving their efficiency. And on top of that, Rust streams allow
asynchronous iteration using the same type.

There's a lot to like about Rust streams, even though there are still some kinks
to be sorted out.

[`Iterator`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html
[`Stream`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/stream/trait.Stream.html
[`Read`]: https://doc.rust-lang.org/std/io/trait.Read.html
[`Write`]: https://doc.rust-lang.org/std/io/trait.Write.html
[`AsyncRead`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/io/trait.AsyncRead.html
[`AsyncWrite`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/io/trait.AsyncWrite.html

## Streams and roles
Let's start off by enumerating the kinds of streams that can be expressed in
a typical system:

- __source:__ a stream that can produce data
- __sink:__ a stream that can consume data
- __through:__ a stream that consumes data, operates on it, and then produces
new data
- __duplex:__ a stream can produce data, and independently can also consume
data

Establishing common terminology is useful because Rust's stream traits don't
map 1:1 to these roles. In fact, each of Rust's stream traits can be used to
fill many different roles. Here's an overview of which roles each trait can
take part in:

|              | Source  |  Sink   | Through | Duplex  |
| ------------ | ------- | ------- | ------- | ------- |
| `AsyncRead`  | __Yes__ | _No_    | __Yes__ | __Yes__ |
| `AsyncWrite` | _No_    | __Yes__ | _No_    | __Yes__ |
| `Stream`     | __Yes__ | _No_    | __Yes__ | _No_    |

There's quite a bit to unpack here. Let's dig in!

### duplex
`duplex` is always implemented using `AsyncRead` + `AsyncWrite`. This is not
unlike other languages. A key difference, however, is that using Rust's trait
system we can evade multiple inheritance problems that plague some other
languages. Examples of `duplex` streams include sockets and files.

### through
`through` streams are implemented using either `AsyncRead` or `Stream`. Data
flows from one stream to the other by passing another `through` into its
constructor.

In Rust, the only difference between `source` and `through` is in how the
traits are used, not in the trait definitions themselves. An example:

```rust
let s = b"hello planet";                // source  (AsyncRead)
let s = gzip::compress(s).await?;       // through (AsyncRead)
let s = my_protocol::parse(f).await?;   // through (Stream)
```

### asyncread vs stream
Another point of interest is the distinction between `AsyncRead` and
`Stream`. Both kinds of streams are allowed to operate on `[u8]`. But the key
difference is that `AsyncRead` yields _unparsed_ data. While `Stream` yields
_parsed_ data.

This is equivalent to the relationship between stdlib's `Read` and `Iterator`
traits. In the following example we convert arbitrary amount of bytes into
separate lines of bytes using [`split`]. We've marked each line with the
traits and yield types:

```rust
use std::io;

let f = io::File::open("foo.txt")?; // Read<[u8]>
let f = io::BufReader::new(f);      // Read<[u8]>
for buf in f.split(b'\n') {         // Iterator<[u8]>
    println!("{}", buf);
}
```

Same data types. Different traits.

Unfortunately [`AsyncRead.split`] does something radically different, so this
example can't be directly copied over yet (more on what `split` does later).
So don't try and write this in async Rust quite yet.

### sinks
The way streams work is that at the end of a stream pipeline, there's a
`sink` or iterator requesting items from the streams. This means that the
stream pipeline will only yield data if it's requested for. This is commonly
referred to as "lazy iteration", or "streams with backpressure".

Currently there's no dedicated syntax to loop through streams. Instead it's
recommended to use a `while Some` loop:

```rust
let stream = my_protocol::parse(f).await?;
while Some(item) in stream.next().await {
    println!("{:?}", item);
}
```

Now that we have a slightly better picture of how Rust's traits related to
streaming concepts, we're ready to take a look at how to create streaming
pipelines.

[`map` combinator]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.map
[`split`]: https://doc.rust-lang.org/std/io/trait.BufRead.html#method.split
[`AsyncRead.split`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/io/trait.AsyncReadExt.html#method.split 

## Pipelines
One of the staples of streams-based programming is being able to compose
streams together. In shell you can pipe programs together using `|`, and in
Node.js you can do the same using `.pipe`. A typical shell example looks like
this:

```shell
$ cat foo.txt | gzip > foo.txt.gz
```

The example above reads data from `foo.txt`, pipes it through `gzip` to
compress the data, and writes the result back out to a new file.

Rust streams have a very similar model. In fact we could imagine the same
code being written in Rust as:

```rust
use runtime::fs::File;

File::open("foo.txt")
    .and_then(|s| gzip::compress(s))
    .and_then(|s| word_count::bytes(s))
    .and_then(|s| s.copy_into(File::create("foo.txt.gz")))
    .await?;
```

This code example won't run today because not all packages exist yet. But it
illustrates quite well how Rust's streams work in practice. We can express the
pipeline abstractly as follows:

```txt
┌───────────┐   ┌───────────┐   ┌────────────┐
│ AsyncRead │──>│ AsyncRead │──>│ AsyncWrite │
└───────────┘   └───────────┘   └────────────┘
```

Data goes from the source file, through the compressor into the destination
file. Different pipelines will use different combinations of `AsyncRead` and
`Sink`. But in all patterns it's going to be common to pass the last stream
down to the next constructor, until we reach a sink.

## Piping duplex streams
When duplex streams are involved, the streaming model gets a little trickier.
Let's pretend we're opening a socket that implements `AsyncRead` + `AsyncWrite`:

```rust
let mut sock = Socket::new("localhost:3000");
dbg!(sock) // implements AsyncRead + AsyncWrite
```

We want to read data from the socket, operate on each value, and write data back
to the socket. In Rust this would get us in trouble because we can't hold a
mutable reference to the same value in two places. So duplex streams have a
convenient `split` method to split the socket into a reader and writer half:

```rust
let mut sock = Socket::new("localhost:3000");
let (reader, writer) = &mut sock.split();
```

## Piping AsyncRead to AsyncWrite
In the example above, the `Socket` duplex is both a _source_, and a _sink_.
Neither of these methods wraps another stream. And sometimes we're only
interested in the read or the write half of the stream. Which is why it's
uncommon for Duplex streams to take other streams in their constructor.

So how do we write data to it?

Well, Rust conveniently has a [`copy_into`] combinator for this exact purpose.
It takes data from an `AsyncRead`, and writes it to an `AsyncWrite`:

[`copy_into`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/io/trait.AsyncReadExt.html#method.copy_into

```rust
let mut sock = Socket::new("localhost:3000");
let (reader, writer) = &mut sock.split();
reader.copy_into(writer).await?;
```

## Piping Stream to AsyncWrite
If we want to write data from a `Stream` to an `AsyncWrite`, things become quite
a bit tricky. First off our `Stream` should output bytes (`&[u8]` or `Vec<u8>`),
because IO devices can only read bytes.

But more importantly: there's currently no `copy_into` combinator available! But
we can work around that by converting from `Stream` into `AsyncRead`, and then
calling `copy_into` on that:

```rust
stream
    .map(io::Result::Ok)  // convert each `Vec<u8>` to `Result<Vec<u8>>`
    .into_async_read()    // convert the stream to `AsyncRead`
    .copy_into(writer)    // copy the data to the sink
    .await?;              // start the pipeline
```

Currently this code does suffer from [a double buffering
bug](https://github.com/rust-lang-nursery/futures-rs/issues/1659), which makes
it less efficient than it could be. But what would likely work best here is if
`copy_into` [would work for `Stream`
too](https://github.com/rust-lang-nursery/futures-rs/issues/1661):

```rust
stream.copy_into(writer).await?;
```

## Handling errors
One of the biggest mistakes Node.js made when it introduced streams, was that
`pipe` doesn't forward errors. Luckily in Rust streams this is solved because of
how streams are wrapped in constructors. This means that streams automatically
forward errors, and pipelines handle them.

The only difficulty with error handling is that the error kinds need to line up.
This can be particularly tricky when creating pipelines that include errors
other than `io::Error`. But the ecosystem is still young, and patterns are still
emerging, so it shouldn't be surprising not everything is streamlined quite yet.

## writing codecs
It's common for parser protocols be split into an _encoder_ and _decoder_ half.
Encoders convert structs to sequences of bytes. And decoders convert bytes into
structs. This can easily be modeled in Rust:

```rust
/// The type we're converting to and from.
pub struct MyFrame;

/// Convert frames to bytes.
pub struct Encode;
impl Encode {
    /// Take a stream of frames, and return a stream of bytes.
    pub fn new(stream: impl Stream<Item = MyFrame>) -> Self;
}
impl Stream for Encode {
    type Item = Result<Vec<u8>, Error>;
}

/// Convert bytes to frames.
pub struct Decode;
impl Decode {
    /// Take a stream of bytes, and return a stream of frames.
    pub fn new(reader: impl AsyncRead) -> Self;
}
impl Stream for Decode {
    type Item = Result<MyFrame, Error>;
}
```

There exist specialized crates that are meant to assist in the creation of
codecs. But in practice codecs are mostly a design pattern, and the easiest way
to write them is using the standard stream traits directly.

_note: depending on your use case you might need to perform some internal
buffering when writing decoders. But all that requires is a good (ring)buffer
abstraction, and there's a variety on crates.io._

## ad-hoc streams using combinators
Sometimes you want to quickly operate on the output of a stream. Whether it's
filtering out results you're not interested in, concatenating items, or doing a
quick count. Streams combinators allow you to perform these tasks with little
overhead.

Say we wanted to read data from a file, and split it by newline. The [`lines`]
combinators provides that:

```rust
let mut sock = Socket::new("localhost:3000");
let (reader, _) = &mut sock.split();

// This is returns a stream of `String`
let lines = reader.lines().await?;
```

Now what if we wanted to parse those lines using [`serde`]? Cue the [`map`]
combinator:

```rust
let mut sock = Socket::new("localhost:3000");
let (reader, _) = &mut sock.split();

#[derive(Deserialize)]
struct Pet {
    name: String,
}

// This returns a stream of `Result<Pet>`
let pet_stream = reader
    .lines()
    .map(|line| serde_json::parse::<Pet>(line));
```

Another interesting fact to point out is that `Vec<u8>` implements both
`AsyncRead` and `AsyncWrite`, which means that if you want to concatenate all
values of a stream, it's possible to use a buffer directly for that.

There are probably many more combinators that could be added, and patterns to be
explored. But the core mechanics of Rust's streams feel really solid, and more
combinators can be added as we grow the ecosystem.

[`map`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/future/trait.FutureExt.html#method.map
[`lines`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/io/trait.AsyncBufReadExt.html#method.lines
[`serde`]: https://docs.rs/serde/1.0.92/serde/

## Why we do not talk about the sink trait
Surprise! There's another trait you should know about. Its name is [`Sink`], and
it's the odd one out in the lot. It's not just confusing to say out loud (are we
talking about [`Sync`] or `Sink`?), but the trait itself is quite out there.
Take a look at the definition:

[`Sink`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/sink/trait.Sink.html
[`Sync`]: https://doc.rust-lang.org/std/marker/trait.Sync.html

```rust
pub trait Sink<Item> {
    type SinkError;
    fn poll_ready(
        self: Pin<&mut Self>,
        cx: &mut Contex
    ) -> Poll<Result<(), Self::SinkError>>;
    fn start_send(
        self: Pin<&mut Self>,
        item: Item
    ) -> Result<(), Self::SinkError>;
    fn poll_flush(
        self: Pin<&mut Self>,
        cx: &mut Context
    ) -> Poll<Result<(), Self::SinkError>>;
    fn poll_close(
        self: Pin<&mut Self>,
        cx: &mut Context
    ) -> Poll<Result<(), Self::SinkError>>;
}
```

That's right. Whenever you implement `Sink` you need to implement 4 methods, 1
associated type, and 1 generic parameter. Oh and also a mandatory internal
buffer. Because all those methods in the trait definition are hooks into a very
specific lifecycle. Where the only way to move data through that cycle is by
temporarily storing data internally, and yielding it again at a later point.

Maybe you've caught on to it, but `Sink` is not simple. Its _raison d'être_ is
to be a typed counterpart to `AsyncWrite`. It usually wraps a writer in its
constructor, and then serializes types into it.

On paper this might sound appealing. But in practice nobody dares write this
monster of a trait without heavy-handed help from crates.io. Which begs the
question if this amount of complexity is actually worth it. And the answer increasingly seems to be a resounding _"no"_.

`Sink` doesn't bring anything to the table that can't be solved more
elegantly and with less ceremony using the 3 standard stream traits. So save
yourself some trouble, and don't bother with `Sink`.

## What's next?
### async iteration syntax
Async iteration of streams is currently possible, but it isn't necessarily nice
to use. Most user land iteration of streams is done using `while Some` loops

```rust
let mut listener = TcpListener::bind("127.0.0.1:8081")?;
let incoming = listener.incoming();
while Some(conn) in incoming.await {
    let conn = conn?;
    /* handle connection */
}
```

It'd be nicer if we could write this as a `for await` loop instead:

```rust
let mut listener = TcpListener::bind("127.0.0.1:8081")?;
for conn.await? in listener.incoming() {
    /* handle connection */
}
```

It's unclear when this will happen. But it's definitely something worth looking
forward to!

### async trait streams
Speaking of improvements, the stream traits themselves could use some work.
Currently the traits are quite similar to the `Future` trait:

```rust
pub trait AsyncRead {
    fn poll_read(
        self: Pin<&mut Self>,
        cx: &mut Context,
        buf: &mut [u8]
    ) -> Poll<io::Result<usize>>;
}
```

What makes this especially tricky is the definition of `self: Pin<&mut Self>`.
This means this method is only implemented for instances of `Self` that are
[pinned]. I don't want to bore you with all the ways _why_ this is tricky, but
instead I want to mention that lately I've been hearing conversations about a
possible simplification of these traits.

In principle the stream traits don't have anything async about them. The only
reason why they're async is because they return futures, and might need to wait
on other futures internally. This is important, because once `async` is allowed
in traits directly, it seems like it would be possible to simplify the traits
significantly.

```rust
pub trait AsyncRead {
    async fn read(&mut self, buf: &mut [u8]) -> io::Result<usize>;
}
```

This would be particularly nice because it would mean `AsyncRead`, `AsyncWrite`
and `Stream` would be defined the exact same way as std `Read`, `Write`, and
`Iterator` with the only difference being the `async` keyword in front of the
methods.

```rust
pub trait Read {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize>;
}
```

Nothing about this is sure though. But I'm cautiously optimistic about the
possibilities here.

[pinned]: https://doc.rust-lang.org/std/pin/index.html

### anonymous streams using `yield`
Speaking of improvements to how we define streams, another thing that has been
talked about is adding syntax for generators. Generators would likely use the
`yield` keyword, and we could imagine a stream essentially being a generator of
futures. And just like `async/await` allows us to skip the boilerplate around
constructing futures, `yield` would give us the same for streams:

```rust
async fn keep_squaring(mut val: u64) -> yield u64 {
   loop {
       val *= 2;
       yield val;
   }
}

for val.await in keep_squaring(4) {
    dbg!(val);
}
```

This one might be a lot further out though, but seems like it has the potential
to provide some welcome workflow improvements.

### zero-copy reads and writes
A nice feature `AsyncRead` and `AsyncWrite` have is support for vectored IO
through [`poll_read_vectored`] and [`poll_write_vectored`]. This allows
optimizing performance for specific applications.

A similar method that might be useful to add in the future are
`poll_read_vec` and `poll_write_vec` (perhaps under a less confusing name).
These methods would allow passing buffers directly into the methods, and
using a `mem::swap` trick, prevent performing one extra `memcpy` on every
operation. Allowing us to increase performance in certain APIs significantly,
without needing to modify the end-user API at all.

This is particularly relevant when wrapping synchronous APIs (which currently
means: almost every filesystem operation). But more importantly: it would allow
us to remove the extra overhead Rust currently has for futures based IO,
compared to using the OS APIs directly.

[`poll_read_vectored`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/io/trait.AsyncRead.html#method.poll_read_vectored
[`poll_write_vectored`]: https://docs.rs/futures-preview/0.3.0-alpha.16/futures/io/trait.AsyncWrite.html#method.poll_write_vectored

## Conclusion
In this post we've talked about the different kinds of async streams rust has,
discussed common patterns and pitfalls, and looked towards a possible future of
streams.

The future or Rust streams is incredibly exciting! If we can nail the ergonomics
of piping streams together, we'll be one step closer to making Rust a great
option for the space traditionally held by scripting languages. But with Rust's
reliability guarantees.

We hope you enjoyed reading about streams! -- have a great week!

_Thanks to Irina Shestak, Nemo157, David Barsky, Stjepan Glavina, and Hugh
Kennedy for reading and providing feedback, ideas, and input on the many
iterations of this post._