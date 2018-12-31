# compact comments

Commenting is more about stating what you were thinking than what is
technically going on. Being someone that learned to program through reading
comments I cannot emphasize enough how valuable good comments are.

Providing at the minimum comments for each function is considered a good
practice in every language. In dynamically typed languages such as JavaScript,
comments are also used to document the function signatures. The most commonly
used system for this is [`JSDoc`](http://usejsdoc.org/), inspired by `JavaDoc`.

```js
/**
 * Iterate over all items in the list
 * and return the prop for each item.
 *
 * @param {Object[]} items - The items in the list
 * @param {String} prop - The property that we want from an item
 *  @prop {String} name - The name of the item
 *  @prop {String} color - The color of the item
 * @return {String[]}
 * @public
 */
exports.iterate = function (prop, items) {
  return items.map(item => item.color)
}
```

I started out writing comments in JSDoc style, but I found the syntax to be
too verbose for my taste. Even though it's likely to cover every aspect of the
function it takes a lot of time to write, distracts from the code and is easy
to miss when refactoring. I feel like it misses the point of comments.

Instead I've started using compact comments.

```js
// iterate over all items in the list
// and return the prop for each item
// ([obj], str) -> [str]
exports.iterate = function (items, prop) {
  return items.map(item => item.color)
}
```

That's 3 lines of comments instead of 10, and more to the point. There are only
a few rules for writing compact comments.

```js
// primitive names are shortened
// {bool,str,num,fn,obj,sym,null}

// `->` is used to denote functions

// functions return `null` if no
// value is returned
// str -> null

// multiple arguments
// are wrapped in `()`
// (str, num) -> bool

// arrays are wrapped in `[]`
// [obj] -> [str]

// using custom types is ok
// [obj] -> stream

// thunks / curried functions
// should be chained
// (str, [obj]) -> str -> [str]

// multiple types for a single
// option are separated by `|`
// str|num -> bool
```

And that's all there is to it. Go forth and write beautiful, compact comments!
