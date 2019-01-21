+++
title = "Async Await Syntax"
date = 2019-01-21
+++

There's [a few unresolved questions](https://areweasyncyet.rs/) before
async/await can land on Rust stable. In order for Futures to be stabilized,
there's [a final API change around
`Waker`](https://boats.gitlab.io/blog/post/wakers-ii/) that's currently being
resolved. The other question is about stabilizing the `await` keyword, and
specifically about what this should interact with `Result` types. In this post
I'd like to talk about this.

## The problem of precedence
In order to stabilize async/await, we must figure out what the syntax should
look like. The final unresolved question about the syntax is where to place the
`?` operator with Futures that can return a Result:

```rust
// Unstable macro
let response = await!(http::get(url))?;

// "Useful precedence"
let response = await http::get(url)?;

// "Obvious precedence"
let response = await? http::get(url);
```

Boats [goes in-depth on the
topic](https://boats.gitlab.io/blog/post/await-syntax/), and proposed we move
to stabilize a third variant that can serve as a stepping stone to either
proposal:

```rust
// Using a delimiter
let response = await { http::get(url) }?;
```

I think this third proposal is entirely reasonable, and is my preferred solution
if it means we can unblock Rust's progression into becoming a reliable choice
for network services.

But it's also deliberately kicking the can down the road, and we'll have to
figure out a solution eventually. So I'd like to talk about the differences
between "useful precedence" and "obvious precedence".

## Error handling
Probably the most important difference to consider between the two syntaxes is
how it actually works with error handling. Libraries such as `failure` and
[`error-chain`](https://docs.rs/error-chain/0.12.0/error_chain/#chaining-errors)
are popular because they allow us to add context to our errors, so we have to
resort less often to reading stack traces or using debuggers.

Consider the following code:
```rust
// Unstable macro
let response = await!(http::get(url)
  .context("HTTP request failed"))?;

// Useful precedence
let response = await http::get(url)
  .context("HTTP request failed")?;

// Obvious precedence
let response = await? http::get(url)
  .context("HTTP request failed");
```

Both versions seem more or less equivalent here, making any preference come down
to taste.

## Method chaining
The more common code example being used for syntax is using method chaining on
an HTTP request. In its essence that would again be a superset of the code
above:

```rust
// Unstable macro
let response = await!(http::post(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send()?;

// Useful precedence
let response = await http::get(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send()?;

// Obvious precedence
let response = await? http::get(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send();
```

Again both variants seem about the same. Though it's worth noting that if the
we later on wanted to add methods such as `.context()` to errors, with obvious
precedence it would be harder to spot missing instances by scanning the code.
I suspect this is because with obvious precedence it's no longer the case that
"all code that returns a `Result` ends with a `?`". Instead we need to look for
the `?` character, sandwiched between variable assignments, keywords, and other
operators.

Let's pick on some patterns where we refactor code:

## Refactoring Sync into Async
This pattern converts a sync API into its async counterpart. Not all APIs will
be this straight forward to port, but when converting `stdlib` to
[crates derived from stdlib](https://github.com/withoutboats/romio) it should
follow this relatively closely.

```rust
// Synchronous code
let response = http::post(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send()?;

// Useful precedence
let response = await http::get(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send()?;

// Obvious precedence
let response = await? http::get(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send();
```

Useful precedence has a 1 line diff, obvious precedence has a 2 line diff.

## Refactoring Unwrap into Error propagation
This pattern is used when converting proof-of-concepts into something that's
more ready for production. For example web scrapers and periodic database
queries come to mind.

```rust
// Unwrap
let response = http::post(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send().unwrap();

// Useful precedence
let response = await http::get(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send()?;

// Obvious precedence
let response = await? http::get(url)
  .header("Content-Type", "text/plain")
  .body("hello world")
  .send();
```

Useful precedence has a 1 line diff, obvious precedence has a 2 line diff.

## Note About Keywords
Something that doesn't seem talked about much is that obvious precedence
introduces 2 keywords, while obvious precedence only introduces 1.

Both introduce the `await` keyword, but obvious precedence also introduce
`await?` which has been referred to as "try await". I'm not sure if this
distinction would apply inside the compiler (I guess?), but when teaching Rust
to others we'd have to explain this special casing of the error handling of
rules.

Instead of appending each operation with a `?`, we'd have to explain that
`await` is special, and that there's distinct `await?` syntax if you want to
handle errors for anything asynchronous.

## Conclusion
And that's it. To be quite honest I'd be happy with either variant, and think
that if introducing `await {}` would allow us to ship sooner, we should
definitely go for it. But all in all, my preference does go out to useful
precedence because it seems to introduce the least amount of friction into the
language.

I hope this has been useful. Thanks for reading!
