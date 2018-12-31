# Unix is not discoverable
Unix is good. Very good. It follows a philosophy of composing tiny programs
that do one thing well. Though that works excellently in practice, getting to a
point where you have a working knowledge of how to use those problems is hard.

> Unix is not discoverable.

After having done enough of something it's hard to think about how you did
things before that. Do you remember life before the `ls` command? How did you
program? How did you find out about that command?

[Laurie Voss recently tweeted][0] that "Unix is not discoverable".
And he's right. Unix is not friendly to beginners because it doesn't show you
how to get started.

Composability and loose coupling make it hard to find out which tools should be
coupled in the first place. It's only through peers that we learn how to
combine those tools. If you have no peers Unix is hard.

So we need something better to make Unix discoverable. The [`bro(1)`][1] pages have
made a good attempt at making Unix usable, they summarize commands into
snippets that solve common use cases. It makes it easier to be productive with
a tool. But you need to know about that tool before you can find out how to use
it.

What we need is guidance. We need opinions. We need a peer that tells us how to
do things, and which tools to use. We can get productive with those tools
later, introductions come first.

Imagine a hypothetical `how(1)` tool. A tool that shows you how to do things.
Imagine this being the first thing you see when you start a terminal:
```txt
Last login: Wed Nov  4 19:05:55 on ttys000
Type 'how start' to get started.

❯
```

And so your journey begins. Starting off with listing things and slowly
progressing into languages, networking and filesystems. We need a peer when no
peer is around. We need a `how(1)`.

[0]: https://twitter.com/seldo/status/658802369983938560
[1]: http://bropages.org
