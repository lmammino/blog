# testing specs
So today my friend [James][1] told me about the way he recently rewrote all of
his company's JavaScript UI tests in Ruby. I thought it was nuts at first, but
actually it might be less silly than it might seem at first.

## Ruby
So Ruby is generally regarded as a bad fit for a lot of things, but it has its
strengths. It's regarded as a good language for creating DSLs, and has some of
the most formidable browser drivers of any language. I know it has more than a
few rough sides, but bear with me for a moment.

## Portability
So the idea of portability has been bothering me for a while now. As I'm slowly
getting more and more into Rust, I'm really missing some of the tools I have
available when writing Node. Usually the only portable things are documentation
/ specs, C libraries and tests. Or well; it would be nice if tests were
portable.

To make tests portable it needs to be interoperable with any language. Having a
method of RPC (e.g. HTTP) makes this possible; it's also good if the tests are
independent of the code. [gherkin][2] is a language specifically made to draw
out tests with. It plays real nice with Ruby, and is intended to be understood
by non-technical humans. I know that people have strong doubts if this works;
but I can't think of a better way of creating portable specifications than have
them written in a specialized language.

## Cucumber
So why use Ruby to write the tests that the `gherkin` specs define? Because
it's not JavaScript. I see often people confound unit testing with
implementation testing. The moment tests start using spies and mocks to
intercept internals and redefine behavior, tests become fragile and actually
hinder refactoring. If a different language is used to write the tests in, this
becomes a whole lot harder - forcing better, more portable tests.

## Wrapping it up
So I think the idea of writing UI tests in Ruby is pretty compelling. Perhaps
even more tests. So the arguments for using Ruby to write tests are:

- pretty good libs to write tests in
- using another language to write tests in makes it harder to write shady tests
- has good DSL capabilities which make for nice tests
- integrates pretty well with `gherkin`

I'm definitely going to give it a shot, as in a worst case scenario I'll have
spent learning the basics of Ruby and have written a bunch of portable
`gherkin` files. 🎉 -Yosh

[1]: https://twitter.com/cccc00
[2]: https://github.com/cucumber/cucumber/wiki/Gherkin
