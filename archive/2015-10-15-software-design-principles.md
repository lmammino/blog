# software design principles
Writing programs is hard. It's up to programmers to make it easier. Here's some
of my thoughts.

## The trick to writing large programs is writing small programs that work well
## together
> Taking a monolith, splitting it up into microservices with message queues
> between them only means you turned your problem into a distributed problem.

There's a difference between inherent complexity, and accidental complexity.
Microservices are a sure-fire way of causing more problems than it solves,
adding a lot of accidental complexity. In real-world scenario's it's not
uncommon to see local development environment run multiple VMs that emulate a
production environment, all without having a single unit test.

This type of development is problematic, as it tries to mold a monolith into a
networked monlith. This type of gargantuan often has so much complexity that no
person can fully comprehend every point of failure. Instead of creating such a
networked monolith, it's better to take the offline-first approach and create
composable, isolated single nodes. Conventional architecture doesn't operate in
this way, but it is the only way large systems can exist and understood.

## Moore's law doesn't dictate the current state, only future growth
As someone from the "West" it's easy to forget that the majority of the earths
inhabitants don't have an online presence and multiple high-end computing
devices readily available. Despite that the trend seems to be to write programs
that have performance as an afterthought. If you write programs to work on
low-end devices, you reach a broader audience and end up writing faster code
for high-end devices too. In the process you'll probably gain a deeper
understanding of the problem too, which leads to a cleaner result.

## Standards are reliable, frameworks are glue
Every generation repeats itself, and with that repetition comes huge waste.
Frameworks and languages are particularly guilty of this, causing massive
repetition and rewrites all in the name of "improvement". Instead of the
endless cycles of repitition, find ways of surviving frameworks and new
languages.

For example: the current web is barely catching up with techniques that have
been staple in graphics programming for over decades.

## Open is better than closed
Projects have a >90% rate of failure, and with >90% of those projects kept
private, a massive amount of effort goes to waste. Instead of keeping projects
private out of fear, it's better to accept the inherent redundancy of the work
and share it with others for the possibility that it might be useful.

Your work wouldn't be possible without others having shared prior work, accept
that and contribute.

## Cut scope, not quality
Iteration is the way to succes. Cutting scope means you prepare for iteration.
It's easier to start with good quality and add features, than start with all
the features and gradually increase quality. The outside world will only ever
care about features, until it all burns down. Recognize and defend quality, in
the long run that is what will set you and your projects apart.
