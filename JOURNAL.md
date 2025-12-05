# Build Journal
These are random thoughts as I build this thing. All the bad decisions, wrong pathways, brief moments of insight. I probably won’t keep up with it. It’s the first thing I’ll build while on ADHD meds so I’m curious how this will differ than the past. It’s indulgent, opinionated, hopefully honest. It’s definitely going to be full of spelling mistakes and grammatical errors and a hallmark of my writing: completely nonsenseical sentences where I edit them mid-thought. It’s probably not worth your time, but hey you’re here so you’re probably naturally curious.

## 2025-12-05 Nope
That was too easy to go down a rabbit hole, so nope, just three simple CSS rules: a clamped article width, a single legible font size on all platforms and centered with a simple margin auto. I thought about display: flex or a grid on the body, but that starts to get too far in to layout.

### Second Article
Okay looks like second article time so we’re going to find some holes now. First one. I missed adding a date to the first article. So we’ll update that. This one will need to support images too. I still want to avoid a build process. I’m thinking about making this an ultra-mac thing. Apple supports folder actions so maybe I’ll use that. Drop images in a folder and have the OS do the conversion. I’m very bullish on JPEG XL, but support isn’t there for Chrome yet so I might do JPEG XR for Safari/FF and whatever the best format is on Chrome/FF/older browsers. I forget.

#### No JPEG XL yet
No native conversion for JPEG XL yet. Bummer. Ok so two articles now. Added some more ultra minimal styling. I think the next step is to pivot from UX to DX as planned a couple of days ago.

## 2025-12-04 Let’s first fix URLs and RSS
So it’s published. Drag and dropped to a Cloudflare Pages site.

Ok let’s first figure out URLs/Slugs and then RSS … you know what. No event that’s too systemic, too focused on DX not UX. The next best thing to do is to make this more legible on different screen sizes. So let’s introduce the level of complexity – oh other than adding Git :)

Here’s the cool thing, at least I think. Because this site has no layout, the best way to increase readability might be with responsive typography. A later article percolating in my head is going to cover typography and its importance. TL;DR if you get your typography right and you get your form elements right 80% of the design work is done, but for some reason we frequently start with layout and breakpoints.

## 2025-12-03 First complexity
The first complexity is introducing version control. I could just manually upload this to Netlify or Cloudflare Pages. The project is certainly nowhere near complex enough to warrant version control, but version control will become necessary and one of the clear winners in modern web development is CI/CD over the tediuousness of FTP so complexity it is. The first version should still only include a single index.html file and a hidden .gitignore.

Manually adding ids, anchors is going to quickly get unsustainable and error prone. The ID obviously need to be unique, random UUID are a possibility, but kind of user hostile. Datetime would be easier to read, especially if appended by the article title. That means we need to introduce some sort of build process. Hmmm wish that didn’t have to happen so soon. Ok, new tenet for the site: this build system needs to be super minimal. Node introduces an insane level complexity. There’s AI, but that introduces entropy. There’s Python, but similar issues as Node. Bash script. AppleScript. ShortCuts? Also want to solve for … working with HTML is a little tricky, so maybe markdown would be a better default source document, but markdown is very basic, anything beyond HTML 1.0-ish you have to use html elements anyway. That said with the macOS 26 version of Notes you can export Markdown. So let’s see how about this:

In the Notes App we create a folder and folder structure like this:

Site
-> Drafts
-> Published

When a note is moved from Drafts to Published an automation exports it as Markdown in the correct folder. The folder has a folder action with two actions. First looks for new content, second looks for updated content. New content will get front matter and generate internal links. Update will create an updated front matter entry. Then future effort would be how to cover updated content.

Question. This is just differently complicated than node or python, but does have the advantage of not needing to download node or mess with python. It’s also Apple only.
