+++
title = 'implicit rust'
created = '10-10-2016'
+++

I've been playing with Rust for a year now, and I find it to be a pleasant
experience. As someone who mostly does JavaScript and has done a bit of C in
the past I find it to be very intuitive.

But as with everything, there are blamishes. In the case of Rust, the main
things I find confusing (coming from JS/Node) is that implicit things can
happen. This behavior is also commonly referred to as "magic". In general I'd
say Rust isn't _bad_, but there's definitely been some behavior that's caused
raised eyebrows. This is little collection of things I've found confusing and
or surprising:

## glob imports
Probably the biggest offender in my view is that Rust allows for `*` imports.
This means that every value on the crate is pulled into local scope, and
exposed as a function. From the code I've seen, doing this with multiple crates
is not uncommon - and when not familiar with the function names each crate
exposes it can quickly become a mess. To put it in code:

```rust
extern crate getopts;
extern crate ncurses;

// uh oh, where does `prompt()` come from?
use getopts::*;
use ncurses::*;
prompt();

// I find this to be clearer
ncurses::prompt();
```

This also adds `Traits` and `Macros` if I'm not mistaken, making it even less
of a great idea.

For a language that works so hard on making code understandable, allowing this
at all feels like such an odd choice. I see how the argument for saving
keystrokes could be made, but even then: only explicitness can save us from
perpetual reverse engineering.

## lib prefix
When binding C into Rust there's a weird thing going on, namely: Rust expects
all C code to be prefixed with `lib`. Now while that's a very common pattern,
it feels very magicky.

Say we were binding `libutp` to rust. Our `Cargo.toml` would look like this:
```toml
[package]
name = "mycoolpackage"
links = "libutp"
build = "build.rs"
version = "1.0.0"
```

And in my `main.rs` I'd require it like this:
```rust
#[link(name="utp", kind="static")]
extern {
  fn utp_create_socket ();
}
```

See the mismatch between `utp` and `libutp`? That one caught me by surprise for
sure. I kind of wish this too was allowed:
```rust
#[link(name="libutp", kind="static")]
extern {
  fn utp_create_socket ();
}
```
I don't reckon `liblibutp` would ever be a thing, so this could perhaps safely
be added? I don't know - but this lil snip of implicitness might be solvable.

## Wrapping up
And that's it. My criticism is short, because Rust is getting so many things
right. Initially I also wanted to complain about `Macros` and `Traits`, but by
simply never using the glob import, they suddenly make so much more sense.

Even though this post is about the implicit parts of Rust I've stumbled upon,
there's one little feature I really wish was added to the language: single
function exports. In Node the vast majority of my packages are a single
anonymous function exposed by `module.exports = function () {}`. I wish we
could do that in Rust too so we could go for granular modularity without the
burden of unnecessary taxonomy. Naming things can be hard indeed when their
natural fit is to be nameless.

But anyway, that's enough for tonight. I hope this was useful. I for one am
very satisfied with Rust so far, and can't wait to keep exploring!
## function exports
