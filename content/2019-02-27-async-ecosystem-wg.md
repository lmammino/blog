+++
title = "async ecosystem wg"
date = 2019-02-27
+++

12 months ago, the first iteration of the networking working group kicked off. 6
months later we underwent change, and created 3 sub-working groups. It's a new
year, a new rust edition, and a good time to re-evaluate our organizational
structures.

## THE PATH TAKEN
During the last set of organizational changes we came up with with a structure
of 3 sub-working groups:

- __web networking:__ focused on improving the experience of building web
    services in rust.
- __async networking:__ focused on creating language & ecosystem support for
    async primitives such as
    [Futures](https://docs.rs/futures-preview/0.3.0-alpha.13/futures/) and
    `async/await` syntax.
- __embedded networking:__ focused on creating abstractions for async support on
    `#[no_std]` platforms.

This worked well for a while, but it quickly became clear that this structure
came with non-trivial overhead.

Organizing meetings for the working groups, between
working groups, and with the core team took effort. Enough effort that between
deadlines, holidays and other events, involvement wasn't consistent.

Another challenge has been to create clear communication to people outside of
the working groups. Between 3 sub working groups, libraries in different
organizations, and multiple channels it can be hard to keep up with what's going
on.

## THE PATH AHEAD
We'll be changing our current structure to a new structure of 2 separate working
groups:

- __async foundations:__ focused on progressing the async primitives in the
    language and compiler.
- __async ecosystem:__ focused on progressing the ecosystem around the async
    foundations.

The async foundations working group will operate [as part of the lang
WG](http://smallcultfollowing.com/babysteps/blog/2019/02/22/rust-lang-team-working-groups/),
similar to the traits, grammar, and FFI working groups.

The async ecosystem working group will live under
[github.com/rustasync](https://github.com/rustasync). Projects we'll be working
on include the [Tide web framework](https://docs.rs/tide/0.0.5/tide/), [Romio
reactor](https://docs.rs/romio/0.3.0-alpha.2/romio/), and [Juliex
executor](https://docs.rs/juliex/0.3.0-alpha.1/juliex/).

We believe that by creating these projects we'll be able to better identify
which pieces in the ecosystem are missing. And identify where it makes sense to
create shared abstractions.

A historical example can be found in Romio and Juliex. The experience of
writing them has been [a key
driver](https://boats.gitlab.io/blog/post/wakers-ii/) in the decision to
simplify the
[`std::task::Waker`](https://doc.rust-lang.org/nightly/std/task/struct.Waker.html)
type, providing a better interface for everyone.

We expect the new working group structure will allow us to create better
results, communicate better, and in the end help elevate Rust's async story to
be second to none.

## BECOME INVOLVED
The async ecosystem working group has text-only meetings every [Thursdays at 4pm
UTC](https://everytimezone.com/s/526cb9d1) on [our Discord
channel](https://discordapp.com/channels/442252698964721669/474974025454452766).
We have [agendas for each
meeting](https://paper.dropbox.com/doc/Rust-Web-WG-Meeting--AYW9XbFMYXQNjU_5A0hW6eBLAg-lsZeIpXH6yHQ93zlf4vrM),
and store minutes in a public repository so people can catch up async. The
meetings are open to anyone interested, and we encourage people to add questions
/ topics to the agenda to discuss.

Thanks everyone for reading. We're excited for the future of async Rust, and we
hope you are too!
