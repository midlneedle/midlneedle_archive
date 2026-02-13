**How I Built a Pebble Watchface That Caught the Founder's Attention**

This is about shipping a small project for a niche device. Everyone starts somewhere, right?

**Why Pebble**

[Pebble](https://en.wikipedia.org/wiki/Pebble_(watch)) always felt different to me. E-paper screen instead of bright OLED, battery that lasts a week instead of dying every night. A product that real people funded on Kickstarter, not something rolled out by a massive tech company.

When I saw a [Pebble Time](https://en.wikipedia.org/wiki/Pebble_Time) on my local marketplace, I bought it immediately. No hesitation.

I've been wearing it for about eight years now. During that time, the company went bankrupt and changed hands a few times, but turns out that wasn't the end of the story.

**How I started making watchfaces**

YouTube's algorithm recently threw me a video from [Eric Migicovsky](https://en.wikipedia.org/wiki/Eric_Migicovsky) – Pebble's founder. Turns out he's reviving the company and releasing a new model, nine years after the last one.

The whole revival story and the energy in the community got me interested in building something for the platform. I'd also been wanting to try vibe coding anyway.

From the start, I had a clear vision: a crisp grid of chunky pixels where the digits light up while everything else stays dark.

My first watchface turned out exactly like that. Pretty basic, but it matched what I was going for. Then I got curious and started experimenting with different patterns and animations, made a few more.

With each project, I learned more about the workflow. Figured out my stack, got comfortable with the emulator, started actually using GitHub properly. With all that experience, I approached my latest watchface.

**Details**

The visual design was the easy part. I already had mockups in Figma and knew how to use AI to speed up translating design to code.

But just porting the design would've been boring. I wanted to build something that captured what Pebble felt like, so I focused on the details.

**Launch animation** I wanted an effect where pixels randomly light up across the grid when you launch the watchface, and the digits gradually emerge from the chaos. After many iterations, I got it working. Honestly, most of my time went into tweaking and optimizing this animation.

**Vibration pattern** I also wanted the animation to have some physical feedback, similar to Apple's Haptics. I found one of the original Pebble OS vibration patterns\* and heavily customized it. The result is a pattern of very subtle taps that matches the animation's timing perfectly.

**Settings** Pebble SDK lets you customize almost any element of a watchface if you build it in. I added the essentials: 24/12-hour time format, ability to disable vibration and animation, theme selection.

After some research, I noticed people actually wanted hourly chime vibrations – a classic digital watch feature. So I added that too. Now it plays a short, subtle pattern when the hour changes.

I also spent time on the settings page UI. Instead of the bare HTML you usually see in watchface configs, I tried to make it feel more modern and polished.

**Shipping it**

I was happy with how it turned out, so I decided to share it with the community and put it up on the store\*.

To get some reach and make sure there weren't bugs\*, I posted in the Pebble owners' Discord. A few people actually shared photos of their watches running my watchface.

The response was positive overall, so I figured why not post about it on Twitter. Right before bed, I wrote something quick, tagged Eric Migicovsky's account, and hit post.

Woke up the next morning and the tweet had blown up – pretty wild for an account with literally zero followers. Turns out Eric Migicovsky had retweeted it. Getting noticed by Pebble's founder felt pretty good.

**What's next**

I'm thinking about implementing a few more watchfaces from my Figma backlog. I also have an idea for a watchface configurator template built with Astro, so anyone could quickly build a clean settings interface.

\*This was possible because they [open-sourced the system](https://github.com/google/pebble) earlier this year, so I could dig into the actual vibration pattern code.

\* I'll admit, I borrowed the watchface name – General Magic – from a now-defunct company that tried to create what later became smartphones back in the early 1990s. It was started by ex-Apple people – Andy Hertzfeld, Bill Atkinson, Joanna Hoffman, and Susan Kare. Felt like a nice reference to an interesting piece of tech history. [There's a good documentary about them](https://www.youtube.com/watch?v=uTdyb-RWNKo) if you're interested.

\*One bug did slip through – on the older 2014 models, the animation played much slower than intended. A user reached out about it on [GitHub](https://github.com/midlneedle/General_Magic_pebble_watchface/issues/1). I had to simplify it for the Classic models since their specs were way weaker than Pebble Time and couldn't handle the full animation.
