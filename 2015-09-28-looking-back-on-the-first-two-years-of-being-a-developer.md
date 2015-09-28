# looking back on the first two years of being a developer

Becoming a developer is hard. I started coding about 2 years ago. Now I'm in
the top 50 contributors on npm, am a regular speaker at meetups, would do
pretty well at npm module trivia, and feel comfortable doing and am doing
pretty well for myself as a JavaScript consultant. This is a little writeup of
how I got into programming.

## 2011 - Psychology
Four years ago I started as a freshman in Amsterdam to study Psychology.
Though at times it was interesting, it didn't do much for me. What I actually
wanted to do was Industrial Design to figure out how to make humans and
computers work well together. Unfortunately that required me to have elected
certain science courses at age 15, which I never did.

## Early 2013 - HTML & CSS
Psychology bored me, so I put in the minimum amount of effort to prevent
getting kicked out of uni and focused on other things instead. I managed to get
a job as an Office Manager at a design agency for a day a week. There I saw the
most wonderful things being created, and I decided I wanted to make pretty
things too. So I dove into HTML & CSS, and started creating gray boxes in other
gray boxes. I even managed to embed some images. I was ready to become a
startup founder.

## Mid 2013 - JavaScript, act 1 (the framework monster)
School numbed my mind, so I wanted to create a company to make education more
entertaining. As a broke student with moderate connections and little
experience in the art of hustling there was but one option: build it myself.

I figured that if a 20-something in a movie could do it, so could I. I booted
up Google, searched how to create a "web app" and dove deep into the combined
mess of Codecademy, Angular documentation and Sails.js.

Looking back this was probably the least productive phase of my career. In the
end of this I had no idea how to write logic, had no conception of which
components made up applications and couldn't write a for-loop if my life
depended on it. I was trying to take shortcuts, the results were poor.

## Fall 2013 - C
After a few weeks of frustration of copy-and-pasting Angular and Sails
boilerplate I realized I wasn't getting anywhere. I talked to some people, and
ended up applying for the "Programming Minor" at the University of Amsterdam.

The minor started on 2013-09-01 with an accellerated version of Harvard's open
CS50 course. In a period of about 2 months, we dove head-first into data
structures, control flow, build systems, unix, recursion, web protocols, PHP,
C, shell and more. It was brutal. About 3 weeks in I almost quit (the exercises
were too hard, I was in tears), but somehow managed to pull through. After 2
months, 20% of the students had dropped out. I was now able to comfortably
write C.

## Winter 2013 - JavaScript, act 2 (the tale of NPM and React)
After Harvard's CS50 two more courses followed: algorithms and app-building.
Though algorithms was sharp and educational, the app-building course seemed
interesting, but empty and shallow. I didn't feel engaged by Ruby and Java.
Instead I decided it was time for me to pick up JavaScript again.

Instead of continuing the educational startup (I was still working on it in the
background) I decided to write my first npm package: a `yo` generator. It took
me about 2 weeks to build, but I felt amazing.

I continued building generators, modules to help build those generators and
started dipped my toes into React for a school assignment. React was a
game-changer for me. I was suddenly able to create interfaces without having to
understand those verbose DOM methods. State was less of a concern, and
applications felt cohesive. I was in love.

## Early 2014 - Getting a job, act 1
At this point I had written half a dozen npm modules, done about 3 months of
React development and was gradually getting comfortable with JavaScript.
University minors are supposed to last 6 months, and I felt continuing
psychology was a dead end for me. Above all, I wanted to do more React!

So in a somehow odd turn of events, I reached out to
[@vjeux](https://twitter.com/vjeux), one of the React core developers, and he
landed me an interview for an internship position at Facebook!

The Facebook interviews were quite interesting. I ended up passing the first
and second round (general interview & project assignment) but messed up the
third round (live coding with an engineer). The whole process took about a full
month of my life, and was definitely worth it. I felt defeated, but
invigorated. After all: I had impressed Facebook engineers enough with my
handy work that they wanted to see me in action.

## Mid 2014 - Getting a job, act 2
I wasn't ready to go back to Psychology, so I applied at a Dutch magazine
startup where one of my friends worked. He got me an interview, and after two
somewhat rough interview rounds I was hired. This was all I dreamt of, right?

Wrong. I was fired after three weeks. The reason: I didn't fit in with the
team. My results were lacking, which in itself wasn't a problem, but I annoyed
other engineers. Looking back it wasn't surprising. Up until this point I had
only worked alone, and didn't know how to suggest improvements without coming
off as being harsh. Though on the other hand: my suggestions were warranted as
I haven't encountered a worse code base to date. It was probably for the
better that we split up.

## Mid 2014 - The Art of Unix programming
Probably the most important advice I got from one of the engineers of my
now-ex-employer was to read "The Art of Unix Programming". I ended up reading
it during uni's summer break.

Though being extremely dry, it showed me how systems should be written. I felt
enlightened; for the first time ever I now understood how complex systems had
come to be.

## Mid 2014 - Getting a job, act 3
The start of the next college year was looming, and I still didn't have a job.
I was getting a bit panicky; not having a job meant going back to uni. I rented
a co-working space during the summer to work from. Not to take on contracting
work, but to have a spot where I could hammer work down. I spent time
configuring docker, writing modules and playing around with animations. I was
far from an expert, but at least I now knew where I wanted to head to.

I spent a good deal of time attending meetups, sometimes up to 3 nights a week.
By sheer chance I had befriended the CEO of Phusion, [Ninh Bui]() a few months
earlier. He introduced me to Framer's creator [Koen Bok](), who then
introduced me to Wercker's CEO [Micha Hernadez van Leuven](). Wercker happened
to be looking for engineers, and after a talk at their offices we agreed to
have a little trial to see if we liked each other. I ended up working there
just short of a year.

## Mid 2014 - Having a job and keeping it
I was in, I had a job! In case things went awry I still had a plan B: going
back to uni, skipping all Psychology classes and instead work down a sturdy
buffet of computer science courses. (Note: I wasn't allowed to enroll in
Computer Science, but was allowed to take all courses individually. Oh, the
joys of bureaucracy).

The trial as Wercker was simple: there were 3 weeks until the start of the
uni year (September 1st, 2014). I was tasked with building a standalone OS X
application that talked to an API and showed notifications natively
cross-platform. I nailed it.

Working in a team is very different from working by yourself, especially when
working on an existing product. Every project is bound to have a backlog of
unsolved issues, team members with different opinions and unexpected changes in
organization (shifting deadlines, staff changes, etc). In our case the team was
spread too thin over too many fronts at once.

Between a shift from vanilla LXC to Docker, a rewrite of core elements from
Node to Go, a new scheduler on top of CoreOS, a Docker image repository, UI
changes, API rearchitecture and a relentless push to add new features, we
probably took on too much work.

When I wasn't at work writing code for the job, I was either on a date,
swimming laps or writing npm packages. I slept on average 5 hours a night. At
that point there was very little else going on in my life, and I was starting
to burn up.

## Winter 2014 - Vim & tmux
Around Christmas of 2014, I was having a constant feeling of panic. I was
pushing myself too hard and my body and mind were taking the toll. I was
writing code all day, almost every day. Like someone suffering from Stockholm's
I took pride in the fact that I worked every day. My foster parents were
concerned and I ended up spending several weekends in a row at theirs to take
it easy.

During the Christmas holidays I ended up travelling to Budapest and reflected
on what I was doing. I went out every day, coded very little and started to
realize what was important to me in life. Coding all day, every day was not
worth it.

While stuck on an airport in Vienna (for 14 hours) I watched a few [Cyberwizard
lectures]() realized that in order to do more I should work smarter, not
harder. So I fired up `vimtutor` and started foraging into the lands of
(neo)vim and `tmux`. This ended paying off greatly; it reduced strain on both
my mind and wrists, and I was able to switch contexts faster.

## Early 2015 - Writing things down
The essence of computing is to make repetition redundant. I found myself
looking up the same topics over and over again on Stack Overflow. Instead of
buying books on certain topics, I decided to start writing down everything I
came across instead in  my
[knowledge](https://github.com/yoshuawuyts/knowledge) repo.

If there's any advice I can give to anyone it'd be that: keep public notes.
It starts of as convenient reference for yourself, but it ends up becoming a
way to share your brain with others.

## Spring 2015 Bay Area, GLSL and screwing up
Wercker has offices in both Amsterdam and San Francisco. With co-workers
travelling between the two, I felt it was time for me to do the same. So I
talked to my boss, booked myself a ticket and went off to the US with just a
backpack.

As a developer, the Bay area is somewhere you probably want to have been at
least once, if only to judge the place for yourself. During the day I worked
from an office at Folsom street, and during the night I spent time at meetups
in SF, on a boat in Alameda or hacking in Oakland. I ended up meeting some
people I'd only known from the internet (hi [@isaacs](), [@jjjohnny](),
[@substack]()), and felt happy with where I was heading.

## Going freelance


## Looking back
In the past two years I've learned a lot about myself and about making things
alike.

## Looking forward

