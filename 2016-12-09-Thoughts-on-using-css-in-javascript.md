---
title: 'Thoughts on using css-in-javascript'
created: '09-12-2016'
---

Every now and then articles pop up about a new package that handles allows
people to define CSS styles inside their JavaScript source files. I've been
doing this for a while now using
[sheetify](https://github.com/stackcss/sheetify), and feel like I have given
this a reasonable amount of thought that might be worth writing down and
sharing with others. Here goes.

## What is "CSS-in-JS"?
CSS-in-JS (or "inline CSS"), is when CSS is defined inside a JavaScript source
file. Packages usually either use JavaScript objects to define styles, with
key-value pairs defining properties. Or they use inline template strings
containing CSS source code. In turn these can either return inline properties
(e.g the `style` property in HTML) or they become regular CSS classes inside a
`style` or `link` tag.

```js
// either JS objects
var rule = css({
  color: 'blue'
})

// or template strings
var rule = css`
  :host { color: blue }
`
```

Sometimes these packages include features such as prefixing classes to prevent
conflicts, deduplication of classes, allowing CSS to be imported from npm and
heaps of other things.

## Inline styles vs classes
I'm not a fan of extra properties on my DOM elements. I remember feeling
confused the first time I looked at Angular code and saw a whole bunch of
`ng-*` things on the HTML. It wasn't what I was used to when first learning
HTML and it wasn't obvious to me why it was there. I like it when my HTML
inside the browser is readable, and I don't feel inline styles help with this.

```html
<!-- inline CSS -->
<button class="Button" style="font-family: inherit; font-size: 14px; font-weight: 600; line-height: 16px; min-height: 32px; text-decoration: none; display: inline-block; margin: 0px; padding: 8px 16px; cursor: pointer; border: 0px; border-radius: 2px; color: rgb(255, 255, 255); background-color: rgb(0, 140, 239); box-sizing: border-box;">
  Hello
</button>

<!-- traditional classes -->
<button class="namespace-button">
  Hello
</button>

<!-- micro classes -->
<button class="f3 b lh-title h2 no-underline pointer br1 b--none white bg-blue">
  Hello
</button>
```

I'm a big fan of micro classes because they convey a lot of information in few
characters. Like with Unix commands there might be an initial learning curve,
but once you get past the bump creating new styles becomes faster than any
other approach. I don't like traditional classes because they convey very
little information in comparison.

## Shadow DOM and the :host selector
Sheetify allows defining styles inline using tagged template strings. The
classes inside it are defined globally and can thus conflict. This makes for
the need to allow "scoped" classes that cannot conflict.

Say we want to define the class ".disabled" twice. Just defining it wouldn't
work:
```css
/* all instances of .disabled will turn gray */
.disabled { color: black }
.disabled { color: gray }
```

In the old days we'd used to scope these classes using the `>` selector to make
sure they were from the right parent element. But it turned out that not only
was that slow (selectors are evaluated from right-to-left) it was inefficient
for programmers. Whenever an element in the DOM was moved around it meant that
the CSS needed to reflect this structure. So BEM was invented to solve this:

```css
/* BEM and friends */
.firstElement--disabled { color: black }
.secondElement--disabled { color: gray }
```

But naming things is hard. The wonderful folks of
[css-modules](https://github.com/css-modules/css-modules) figured out that
instead of manually naming namespaces using hashes was just as convenient and
faster to work with.

For `sheetify` we decided to overload `:host` selector to be transformed to a
hash of the styles. This means that anytime you need to namespace a thing, the
`:host` selector will make sure it doesn't conflict with any selector in your
application. The `:host` selector comes from the WebComponent world in order to
style the element where the webcomponent is mounted on. Or something like that.

```js
var css = require('sheetify')
var html = require('bel')

var prefix = css`
  :host { color: blue}
`
var el = html`
  <button class=${prefix}>click me</button>
`
```

## Runtime vs Compile time
CSS-in-JS can either be done during runtime or during compilation. For sheetify
we've chosen to only to support a compilation step so we don't have to ship a
runtime. Runtimes will always have an overhead, which is always slower than
plain CSS.

Runtimes allow for cool dynamic things to happen with CSS, but we figured that
because we wanted to allow sheetify to import packages from npm it would have
to be a compile step. This is because Node's `require()` function doesn't allow
importing files other than JSON or `.js`, and we don't want to overload
`require()` to magically support it. Also having both a compile step and a
runtime was probably a bad tradeoff.

## Combining styles
The whole prefix thing is only useful when doing highly unique things. Most of
CSS is quite repetitive and relies on consistent ratios. Using a micro classes
like [tachyons](http://tachyons.io/) is a great way to reduce repetition and
ensure consistency.

From there the step up is to build components. Components are cool because
they're easy to re-use, and tweaks to the element propagate throughout the
project.

Sharing styles (or themes) can also be done by sharing strings of nultiple
classes and adding them to elements. Together with a component-based
architecture it then suddently becomes easy to create consistent components
throughout the application.

## What about variables?
The CSS variable spec is cool and should generally be enough. So far I haven't
had a need for anything more complicated, and I struggle to think of a time
when I would. Yay.

## CSS going forward
I don't feel there's much left to change in `sheetify`; because we don't ship a
runtime we're already as fast as we can be. `sheetify` also includes a plugin
system which could be used for cool things like deduping classes, pruning
classes and other sorts of cool things.

We started work on a project called
[base-elements](https://github.com/yoshuawuyts/base-elements) which provides
standalone elements that take care of complicated things like styling progress
bars, modals and the like. Maybe we've finally come full circle and are now
able to create a modular Bootstrap. My hope is that we will all soon be
building elements that can be plugged into any framework and that have styles
that don't ever conflict. I think that'd be very rad.

And that's it. Those are some of the thoughts I have on CSS-in-JS and hopefully
explains some of the decisions that were made in building
[sheetify](https://github.com/stackcss/sheetify). Cheers!
