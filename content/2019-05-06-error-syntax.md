+++
title = "error syntax"
date = 2019-05-06
+++

Earlier today [the final proposal for await
syntax](https://boats.gitlab.io/blog/post/await-decision/) was posted by the language team. And
while I consent to whichever solution the lang team deems best, one comment in particular left me
puzzled:

> (...) some members of the language team are excited about a potential future extensions
> in which (...) the dot await operation would be generalized so that await were a “normal” prefix
> keyword, but the dot combination applied to several such keywords, most importantly match:

```rust
foo.bar(..).baz(..).match {
    Variant1 => { ... }
    Variant2(quux) => { ... }
}
```

Which if I'm understanding correctly, means that the following code would be equivalent:

```rust
// using prefix keywords
match await foo.baz() {
    Variant1 => { ... }
    Variant2(quux) => { ... }
}

foo.baz().await.match {
    Variant1 => { ... }
    Variant2(quux) => { ... }
}
```

Except in the case of error handling, the precedence problem of `?` comes back into play, which
means we're back at square one. Except now we have two syntaxes, with both of their downsides, and
(what I think) is a more confusing user experience.

_note: before we proceed I'd like to share that I consent to whichever decision the language team
makes. As per Boat's blog post they're still looking to receive feedback, and I feel that writing
in this format is the most constructive way to provide it._

## "the power of the dot"
In conversations about the Rust language I've repeatedly hear the phrase "the power of the dot"
being brought up.

My understanding is that it allows packaging the Rust syntax into a nice box that can easily be
reasoned about, and expanded upon. Field-access await seems to fit nicely into this reasoning, and
the idea of allowing other operators to also be used in a similar way feels like it fits in that
model too.

And personally I can relate a lot: if you look at the language abstractly, it does feel rather
elegant. If keywords are also valid as fields, then there is a sense of duality between
free-standing keywords, and their dot-equivalent. I get it.

However from a practical point of view, keywords exist so you can quickly find interesting things in
code. Explicitly annotating async yield points with a keyword is very much in line with that. I
mean: there's multiple studies done on exactly this topic, and their findings are back up this idea
[1](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.364.6548&rep=rep1&type=pdf),
[2](https://users.soe.ucsc.edu/~cormac/papers/issta12a.pdf).

But I digress. I feel like the preferred outcome would be if we could both get a nice model to
reason about, and have keywords that stand out. Which is to say: what if could have both?

## Try positioning
This post is titled "error syntax", but so far we haven't talked about errors at all! But we're
getting to that now.

I think the idea of allowing "two syntaxes" for keywords is on the right track, but misses the mark.
Namely: it concerns itself with the wrong keyword. Rather than making `await` both a postfix field,
and a prefix keyword, I think we should take a look at the `?` operator instead.

If you've been following along, you've probably seen the `await?` syntax before. This exists for a
reason:

```rust
// what we wish we could do, but can't b/c of precedence
let res = await req.send_json()?;

// Currently proposed: move the await keyword
let res = req.send_json().await?;

// What we propose: move the ? keyword
let res = await? req.send_json();
```

We like the last example. The lang team is currently set on the second example. A common argument
against `await?` is that `.await` plays better with the language. But what if we took a step back
and for allowed `?` to be part of any expression?

Let's go over some commonly cited problems, and see how they could be resolved if we were more
flexible with `?`.

## Problem solving
```rust
let (x, y) = my_tree.operate();
```
