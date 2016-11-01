"use strict";

const Twitter          = require("twitter");
const TweetAggregation = require("./lib/tweet_aggregation.js");
const TweetConsumer    = require("./lib/tweet_consumer.js");
const TweetReport      = require("./lib/tweet_report.js");

const twitter_client = new Twitter({
  consumer_key: 'CZiH9nNdZusUh2NZSIehGvCx5',
  consumer_secret: 'D6TJQECyRpgOCPXTKgkACPrZOJn55hcRSTWHZ7ivUwMmjt8cUQ',
  access_token_key: '73754977-YkRb0LtskSUBSxIaYDQ5m0GnTgzW9SIXRHZXikkoH',
  access_token_secret: 'pLqREFzqZDWkhUUZl3ZtpD09Xcptaln8CMaAXSuLTaOgv'
});

var aggregate = new TweetAggregation();
var consumer  = new TweetConsumer(aggregate);

twitter_client.stream('statuses/sample', function(stream) {
  console.log("Connected to the twitter stream!");
  console.log("For best results, use an 80x48 unicode terminal.");
  console.log("Hit ctrl+c (or send SIGINT) to quit and print a report.");
  stream.on('data', function(tweet) {
    consumer.eat(tweet);
  });
});

// This runs into a sort of race condition. I can elaborate more. 
setInterval(
  function(){
    new TweetReport(aggregate).stdout();
  }, 
  5000
);

// We could also take a SIGHUP to print, which I think would be more elegant.
process.on('SIGINT', function() {
  console.log("\nCaught interrupt signal - printing report...\n\n");
  const twitter_client = null; // kill the stream.
  new TweetReport(aggregate).stdout();
  process.exit();
});