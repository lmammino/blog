+++
title = "Product Strategy"
date = 2019-02-15
+++

I don't like talking about business much. It kind of feels like a chore I'd
rather not have to deal with. But I do have to deal with it because I run my own
software consultancy.

I've recently come across some interesting articles involving product strategy.
And I've been thinking about how they apply to the projects I build. I've found
that these are useful perspectives to consider when building products. Even if
it's just to think about how others are strategizing.

## Bundling and Unbundling
> "There are only two ways to make money in business: One is to bundle; the
> other is unbundle."

_— [How to Succeed in Business by Bundling – and
Unbundling](https://hbr.org/2014/06/how-to-succeed-in-business-by-bundling-and-unbundling)
(2014)_

The way I like to think about it is that there's value in producing parts so
people can acquire exactly the bits they want. And there's value in assembling
parts into a cohesive whole and giving people a cohesive experience.

Like with every analogy, this is a simplification. But I think it's a useful
lens to apply. When you're building an (open source) project, are you bundling
or unbundling?

In my own work I've recently been doing a lot of work around both bundling and
unbundling. [Choo](http://choo.io/), [Bankai](https://github.com/choojs/bankai)
and [Tide](https://github.com/rust-net-web/tide) are all examples of projects
where we bundle. The focus is on creating great user experiences, where all the
base wiring has already been taken care of for you.

On the other hand, the whole
[nano* suite](https://github.com/search?q=org%3Achoojs+nano&unscoped_q=nano) is
about creating parts that solve one problem well and can be assembled using only
the parts you need. This is valuable so people looking to build new experiences
don't have to start from scratch, but can instead use the parts you've provided
-- and help improve those shared foundations in the process.

## Commoditize Your Complement
> A classic pattern in technology economics (...) is
> layers of the stack attempting to become monopolies while turning other layers
> into perfectly-competitive markets which are commoditized, in order to harvest
> most of the consumer surplus; discussion and examples.

_— [Commoditize Your Complement](https://www.gwern.net/Complement#2) (2018)_

I found out about this article in the wake of GitHub's announcement to give
everyone free private repositories, where they used to cost a monthly fee.
People explained this as a move to curb competition. By preventing competitors
from taking people in by offering free private repos, GitHub can retain more
people on their platform, which in turn helps their business.

When applying this to more developer-focused projects (e.g. OSS), I can see this
being done by creating specs after products are done. For example Kubernetes
feels like it's pulled this trick several times over. They needed a deployment
engine that could compete with AWS, so they took an internal project and
transformed it into a standard.

And when Kubernetes' relationship with Docker became contentious, they again
moved to replace Docker with [a standard](https://www.opencontainers.org/),
causing Docker [to get with the program](https://mobyproject.org/).

I don't know if I like this approach much myself. It feels very much like
politics, and I don't like those. But being able to identify when such
strategies are used seems like a useful skill to have.

## Wrapping Up
I hope this was somewhat interesting. I've been thinking about this quite a bit
recently, and found it to be useful. With a bit of luck it can be useful for you
too!
