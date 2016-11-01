"use strict";

const _           = require("lodash");
const EmojiRegex  = /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g;
const IMGURLRegex = /https?:\/\/(.+?\.)?(pic.twitter|instagram)\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?/

class TweetConsumer {
  constructor(aggregate) {
    this.aggregate = aggregate;
  }
  
  eat(tweet) {
    if ( this.aggregate.count == 0 ) {
      // The start time is only when we start eating tweets.
      this.aggregate.start = new Date().getTime()/1000|0;
    }
    if ( tweet.retweeted_status != null && tweet.retweeted_status.length > 0 ) {
      this._eat(tweet.retweeted_status);
    } else {
      this._eat(tweet);
    }
  }
  
  _eat(tweet) {
    this.aggregate.count += 1;
    if ( tweet.entities != null ) {
      // If the tweet contains URLs, aggregate them.
      if ( tweet.entities.urls.length > 0 ) {
        for ( let i = 0; i < tweet.entities.urls.length; i++ ) {
          let this_url = tweet.entities.urls[i].expanded_url;
          this.aggregate.url_count += 1;
          // Check for images.
          if ( this_url.match(IMGURLRegex) ) {
            this.aggregate.img_url_count += 1;
          }
      
          let idx = _.findIndex(this.aggregate.urls, function(e) { 
            return e.item == this_url;
          });
      
          if ( idx > -1 ) {
            this.aggregate.urls[idx].count += 1;
          } else {
            this.aggregate.urls.push(
              {
                item: this_url,
                count: 1
              }
            ) 
          }
        }
      }
      // If the tweet contains hashtags, aggregate them.
      if ( tweet.entities.hashtags.length > 0 ) {
        for (let i = 0; i < tweet.entities.hashtags.length; i++) {
          let this_tag = tweet.entities.hashtags[i].text;
          this.aggregate.hashtag_count += 1;
      
          let idx = _.findIndex(this.aggregate.hashtags, function(e) { 
            return e.item == this_tag;
          });
      
          if ( idx > -1 ) {
            this.aggregate.hashtags[idx].count += 1;
          } else {
            this.aggregate.hashtags.push(
              {
                item: this_tag,
                count: 1
              }
            ) 
          }
        }
      }
    } // This is the end of the entities branch.
    //Even if the tweet doesn't contain any entities, it may have emojis!
    let matches = EmojiRegex.exec(tweet.text);
    if ( Array.isArray(matches) && matches.length > 0 ) {
      for ( let match of matches ) {
        this.aggregate.emoji_count += 1;
        let idx = _.findIndex(this.aggregate.emojis, function(e) { 
          return e.item == match;
        });
        if ( idx > -1 ) {
          this.aggregate.emojis[idx].count += 1;
        } else {
          this.aggregate.emojis.push(
            {
              item: match,
              count: 1
            }
          ) 
        }
      }
    }
  }
}

module.exports = TweetConsumer;