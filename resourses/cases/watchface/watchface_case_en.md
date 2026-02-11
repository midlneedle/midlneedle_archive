**How I built a Pebble watchface and got props from the company's founder**

This is a story about how I shipped a small product for a pretty niche device – but hey, everyone's gotta start somewhere, right?

**Why Pebble**

Pebble always felt like the indie darling of the tech world. E-paper display instead of flashy OLED, week-long battery instead of daily charging – a product brought to life by regular people on Kickstarter, not rolled off some corporate assembly line.

So when I spotted a Pebble Time on a local marketplace, there was zero hesitation – I was already sold.

I've been wearing these for about eight years now. During that time, the company went bankrupt and changed hands a few times, but turns out that wasn't the end of the story.

**How I started making watchfaces**

Recently, YouTube's algorithm threw me a video from Eric Migicovsky – Pebble's founder – where I learned he's reviving Pebble and dropping a new model, nine years after the last one.

This whole phoenix-from-the-ashes startup vibe and the general excitement in the community inspired me to build something for the platform, especially since I'd been wanting to try vibe coding anyway.

From the start, I had a clear vision: a crisp grid of chunky pixels where the digits themselves would "glow" while the rest stayed dim.

My first watchface turned out exactly like that – yeah, pretty basic, but it nailed what I was going for. Then I got curious about experimenting with patterns and animations, so I made a few more.

With each new project, I got better at the workflow – figured out my stack, learned how to work efficiently with the emulator, and finally got the hang of GitHub. Armed with this knowledge, I approached my latest watchface (at the time of writing this).

**Details**

The visual design was the easy part: by this point I had a Figma mockup and knew how to use AI to speed up translating design to code.

But just porting the design would've been boring. I wanted to build something that captured Pebble's spirit, so I started adding details.

**Launch animation** I wanted an effect where pixels light up randomly across the grid when you launch the watchface, and the digits gradually emerge from the chaos – after many iterations, the idea finally came together. Most of the time was actually spent trying to optimize and polish the animation.

**Vibration pattern** Next, I wanted the animation to have some physical feedback, like Apple's Haptics. I took one of the original Pebble OS vibrations\* as a reference and heavily customized it. The result is a pattern of barely-there taps that syncs perfectly with the animation's timing and pace.

**Settings** Pebble SDK lets you customize pretty much any element of a watchface if the developer builds it in. I picked out a few must-have options: 24/12-hour time format, ability to disable vibration/animation, and theme selection.

After some quick research, I noticed some users missed having hourly chime vibration – a classic digital watch feature. So I added that too: now it plays a short, subtle pattern that gently signals when the hour changes.

I also spent time on the settings page UI. Instead of the bare HTML you usually see in watchface configs, I tried to make it feel more familiar to modern users.

**Shipping it**

I was happy with how it turned out and decided to share the watchface with the community and put it up on the store\*.

To get a bit more reach and make sure there weren't any bugs\*, I posted in the Pebble owners' Discord community and a few people even shared photos of their watches running my face.

Overall the response was positive, so I thought why not post about it on Twitter – before bed I threw together a quick message, tagged Eric Migicovsky's account, and hit "Post".

Imagine my surprise the next morning – the post blew up, especially for my completely zero-follower account. Turns out Eric Migicovsky had reposted my message. Pretty cool getting a little shoutout from Pebble's founder himself :)

**What's next**

I'm thinking about implementing a few more watchfaces from my Figma into code, and I've also got an idea to build a template for watchface configurators based on the lightweight Astro web framework, so anyone could quickly throw together a clean settings interface.

\*This was possible because they open-sourced the system earlier this year and I was able to find the code for specific vibration patterns.

\* I'll admit, I pretty brazenly borrowed the watchface name – General Magic – from a now-defunct company that tried to create what we'd later call a smartphone back in the early 1990s. Its founders were Apple alumni – Andy Hertzfeld, Bill Atkinson, Joanna Hoffman, and my personal favorite Susan Kare. Felt like a cool reference that might remind people of this interesting project from the past. Highly recommend the documentary about them, btw.

\*One bug did slip through – on the older 2014 models, the animation played several times slower than intended. A user reached out about it in GitHub issues. Had to simplify it a bit for the Classic models since their specs were way weaker than Pebble Time and they just couldn't handle the animation.
