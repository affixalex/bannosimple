"use strict";

const TweetAggregation = require("./tweet_aggregation.js");

class TweetReport {
  constructor(aggregate) {
    this.aggregate = aggregate;
  }
  
  stdout() {
    if ( this.aggregate.count == 0 ) {
      return;
    }
    
    this.aggregate.end = new Date().getTime()/1000|0; 
    // in UNIX timestamp format

    let runtime = this.aggregate.end - this.aggregate.start;
    let tps = (this.aggregate.count / runtime).toFixed(2);
  
    console.log("Runtime: " + runtime + " seconds");
    console.log("Total tweets: " + this.aggregate.count);
    console.log("Average tweets per...");
    console.log("\t Second: " + tps);
    // To make this more accurate, we'd want a sliding window.
    console.log("\t Minute: " + (tps * 60).toFixed(2) );
    console.log("\t Hour: " + (tps * 3600).toFixed(2) );

    console.log(""); // Newline for formatting
    console.log("Emoji Percentage: " + ((this.aggregate.emoji_count / this.aggregate.count) * 100).toFixed(2));
    console.log("Top Ten Emojis:");
    for ( let emoji of TweetAggregation.topTen(this.aggregate.emojis) ) {
      console.log("\t" + emoji.item + " : " + emoji.count);
    }

    console.log(""); // Newline for formatting
    console.log("Hashtag Percentage: " + ((this.aggregate.hashtag_count / this.aggregate.count) * 100).toFixed(2));
    console.log("Top Ten Hashtags:");
    for ( let tag of TweetAggregation.topTen(this.aggregate.hashtags) ) {
      console.log("\t" + tag.item + " : " + tag.count);
    }
  
    console.log(""); // Newline for formatting
    console.log("URL Percentage: " + ((this.aggregate.url_count / this.aggregate.count) * 100).toFixed(2));
    console.log("IMG URL Percentage: " + ((this.aggregate.img_url_count / this.aggregate.count) * 100).toFixed(2));
    console.log("Top Ten URLs:");
    for ( let url of TweetAggregation.topTen(this.aggregate.urls) ) {
      console.log("\t" + url.item + " : " + url.count);
    }
  }
}

module.exports = TweetReport;