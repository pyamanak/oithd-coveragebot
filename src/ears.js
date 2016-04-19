#!/usr/bin/env node

/**
* DISCLAIMER
*
* I do not actually know any javascript. At All. Never seen it before.
* This code may break. It may already be broken. I don't know how to fix it.
* I wrote it, it kind of worked. That's the limit of my JS knowledge.
*/

'use strict'

// The botkit module
var BotKit = require('botkit');

// Export this module as Ears
module.exports = Ears;

/**
* Create a new botkit with debugging messages turned off
*/
var Bot = BotKit.slackbot({
  debug: false,
});

/**
* Constructor for this module
*/
function Ears(token) {
  this.scopes = [
    'ambient',
    'direct_mention',
    'direct_message',
    'mention'
  ];
  this.token = token;
}

/**
* Connect the bot to Slack and begin listening for any given strings
* processed using hear()
*/
Ears.prototype.listen = function() {
  console.log('TOKEN: ' + this.token);
  this.bot = Bot.spawn({
    token: this.token
  }).startRTM();
  return this;
}

/**
* Register a pattern that the Ears should listen to
* handle these patterns in the callback
*/
Ears.prototype.hear = function(pattern, callback) {
  Bot.hears(pattern, this.scopes, callback);
  return this;
};

// vim: set syntax=javascript tabstop=2 softtabstop=2 shiftwidth=2 shiftround expandtab:
