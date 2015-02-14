# Loose coupling, local modules and you.

===========================================================
- quote unix principles on loose coupling [tim's repo]
- quote unix about clear folder structures

- talk about symlinks
- talk about npm scopes
- show how local modules do what they do

- known issues (e.g. shrinkwrap, multi stage install
- ../ paths
===========================================================

There are a few hard things in computer science, of which naming things is the
problem we run in most often (e.g. all day long). Every programmer names their
things differently, which can be a small adjustment if someone else reviews the
code. But when dealing with large, nested hierarchies named according to
someone's mental model of the problem it can get confusing pretty quickly.

On the problem of naming directories, the `unix principles` state that: "your
project's root directory should scream what domain it's about. Not what
framework you're using." Now this might seem strange at first; many frameworks
name their root directories things like `src`, `models` or `dist`. By looking
at the root directory you get zero indication of the domain the project is
concerned with. The only solution to nested directories being unclear, is to
not nest directories.

NPM modules adhere pretty well to the unix conventions. They're self-contained, 
have a single point of entry\* and have tests + documentation
in a single place. Whenever a module starts deviating from this layout it's
usually an indication that it should be split up into smaller parts.



\* It's actually possible to have multiple entry paths into NPM modules.
Besides the `bin` command which is linked globally (or locally if run from
within `npm run`), you can also do `require('foo/bar')` where `bar` is a file 
other than `index.js` in root.
