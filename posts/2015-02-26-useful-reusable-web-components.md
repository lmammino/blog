# Useful reusable web components
So you've probably heard about web components by now: the umbralla term for all
things modular in your html. You've also probably heard about virtual DOM, the
technology that's the heart of all modern frameworks, enabling incredibly
performant interfaces.

The problem with web components is that they work differently than the virtual
DOM. Time for some code!
```html
<!---This is a web component--->
<time is="local-time" datetime="2014-04-01T16:30:00-08:00">
  April 1, 2014 4:30pm
</time>
```
```js
// And a deku component which uses virtual-dom
// under the hood.
var {component,dom} = require('deku')

var Button = component()
Button.prototype.render = (props, state) => dom('button', props.text) 

var scene = Button.render(document.body, { text: 'Click Me!' })
```
