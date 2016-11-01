"use strict";

class TweetAggregation {
  constructor() {
    this.start = null;
    this.end = null;
    this.count = 0;
    this.urls = [];
    this.url_count = 0;
    this.img_url_count = 0;
    this.hashtags = [];
    this.hashtag_count = 0;
    this.emojis = [];
    this.emoji_count = 0;
  }
  
  static topTen(obj) {
    let result = obj.sort(
      function(a, b) { 
        return b.count - a.count; 
      }
    );
    return result.slice(0, 10);
  }
}

module.exports = TweetAggregation;