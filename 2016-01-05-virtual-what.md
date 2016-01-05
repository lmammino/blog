# virtual-what am I even looking at
Happy 2016! Let's create a website using the latest best practices:

1. create a directory
2. initialize git
2. set up the latest
   [`{webpack,react,redux,babel,css-modules,postcss,rucksack,react-router}`][0]
   boilerplate
3. write some code
4. deploy
5. success!

If you're anything like most people, you have no idea what's going on in the
second step. Some names might seem familiar, but some are new since you last
checked 4 weeks ago. You might feel silly for not knowing that, and keep quiet.
Maybe you feel things are moving too fast, and ashamed you've not been keeping
up.

It's not on you though; all these tools that might seem simple by themselves
turn into a giant ball of silly when chucked together. It's not pretty if
you're trying to do the right thing.

In this article I'll explain the ideas driving the current orientation of
tooling, and how to use minimal abstractions to achieve those ideas. But first
I want you to remember the following:

> Your choice of tools is irrelevant

If you're building a new product, don't worry about what boilerplate you're
using; it'll only be used once. Don't worry about what build system you're
going for, it's only a stepping stone for results. If you're building a
project, focus on being able to iterate fast and make a best effort to decouple
things. Your choice of tools today will not dictate the speed of iteration, nor
the quality of your product. Architecture, scope and maintenance are what you
should be worrying about.

## Concepts
Today's front end architecture is built around the classic MVC pattern. The
words `state` and `data` can be used interchangeably:

- views take state and are displayed to the user
- models hold the current state
- controllers modify the state

Note that views are responsible for served to the user as output (e.g. the
elements that are visible on the screen), but also serve as input (e.g. trigger
something when a button is clicked).*1*

And to make it up to date for 2016, we'd add:
- only views can trigger controllers
- only controllers can modify models
- when a model is modified, re-render the view

If we were to visualize it we would get:
```txt
┌───────┐  ┌──────────┐   ┌──────┐
│       │  │          │   │      │
│       │  │          │   │      │
│       │  │          │   │      │
│       ◀──│Controller│◀──┤      │
│       │  │          │   │      │    ┌────┐
│ Model │  │          │   │ View │◀──▶│User│
│       │  │          │   │      │    └────┘
│       │  └──────────┘   │      │
│       │                 │      │
│       ├─────────────────▶      │
│       │                 │      │
└───────┘                 └──────┘
```

Facebook's `react.js` exposes something called `virtual-dom`, which is also
been made available by [@raynos]() and [@matt-esch]() as a stand alone package.
But what does it do?

At its heart virtual-dom allows for an upper bound of mutations. This means
that whatever you change in the state, it will render at max `60fps`*2*. Though
`virtual-dom` and `react` are supposed to be fast, they perform poorly when
doing anything that requires high performance because of the garbage it
generates. *3*

*1*: it's arguable whether or not views are actually also the receivers of
input. I'm choosing to say they are because it makes the rest of the
abstractions easier to bridge into. I find considering views as the only point
of user IO to make for a simpler mental model.

*2*: I'm aware it's constrained by the browsers's RAF loop, but conventionally
  it's 60fps; so bear with me.

*3*: I have little experience with running into `react` / `virtual-dom`'s
limits, but I have friends who have; and they say it's bad. Frameworks are
nothing more than fancy ways of accessing dom methods, so if you know what
you're doing, vanilla DOM operations will always be faster. Don't let the hype
machine fool you into thinking otherwise.
