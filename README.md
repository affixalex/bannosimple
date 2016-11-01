# BannoSimple

This is just a minimal example. The code in `reporter.js` kinda speaks for itself. I didn't bother with any secret management here, you're free to just use
my API keys for the sake of demonstration.

## Running

I use Node 5.10.1 and NPM 3.8.3, provided you have them...

    npm install && node reporter.js

## The Birds and Bees of Hashtags and Emojis

http://instagram-engineering.tumblr.com/post/118304328152/emojineering-part-2-implementing-hashtag-emoji

This uses that naive/simplistic regular expression range approach that Instagram started with, but as they describe in that link: some emoji consist of multiple code points. There are only a few thousand of these, so it's actually fairly easy to iterate through all of them as each tweet arrives but doing it *correctly* is a little more tricky.

If I were really doing this in anger, I would probably want to combine the two 
approaches - a first pass with a ranged regular expression as it currently 
uses, a second pass to identify each match with the :textual: representation. 

https://github.com/twitter/twemoji - This is the library I'd actually want to use, but out of the box it isn't really fit for purpose. 

## On Scalability

Let's imagine we're consuming the entire twitter feed - would this program 
scale? No, it is asymptotically bad. This runs in polynomial time and the calls 
to `_.findIndex` in the hashtag and URL space don't really have an upper bound 
on runtime. Reassuringly, using `_.findIndex` on the emojis actually does have 
an upper bound. There are only so many code points.

So, how would you mitigate this?

Let's imagine we divide the system into a pipeline.

    consumption -> analysis -> presentation

The consumption phase wouldn't actually perform any analytics. Since it is only 
analyzing 140 characters at most, we could come up with an algorithm with 
pretty decent worst case performance. During the consumption phase, we'd just want to keep track of:

1. Retweet? True or false.
2. Hashtag entities
3. URL entities
4. Emoji entities

For maximum flexibility, this data would be serialized into a table row for 
each individual tweet with millisecond accuracy timestamps. I am imagining 
unacknowledged writes to RethinkDB. We could likely accept some percentage of 
failed writes here in exchange for speed. If we were using ZFS, I think this 
would allow writes to be reordered optimally to maintain as much throughput as 
possible.

For the analysis phase, we'd essentially be doing a map/reduce for a given time 
period. We can't do an incremental map/reduce per se, but we could do a 
streaming map and let the client reduce it. This is tricky!

For the presentation phase, I'd use socket.io and rethinkdb. When a client 
connected, it would be brought current on a need-to-know basis to fill in the 
blanks in the timeline (in the client). Once up-to-date, it would begin 
forwarding a RethinkDB changestream to the client.