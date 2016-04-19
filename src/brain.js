#!/usr/bin/env node

/**
* DISCLAIMER
*
* I do not actually know any javascript. At All. Never seen it before.
* This code may break. It may already be broken. I don't know how to fix it.
* I wrote it, it kind of worked. That's the limit of my JS knowledge.
*/

'use strict'

// The natural language processing module
var NLP = require('natural');

// Export this module as Brain
module.exports = Brain;

/**
* Constructor for this module
*/
function Brain() {
  this.classifier = new NLP.LogisticRegressionClassifier();
  this.minConfidence = 0.7;
}

/**
* Teach the NLP module about a given phrase
*/
Brain.prototype.teach = function(label, phrases) {
  phrases.forEach(function(phrase) {
    console.log('Ingesting example for ' + label + ': ' + phrase);
    this.classifier.addDocument(phrase.toLowerCase(), label);
  }.bind(this));
return this;
};

/**
* Given an amount of entries in teach(), process the entries into the bot
*/
Brain.prototype.think = function() {
  this.classifier.train();
  return this;
};

/**
* Intepret the given string phrase as a 'skill' the bot understands
*/
Brain.prototype.interpret = function(phrase) {
  console.log("PHRASE: " + phrase)
  var guesses = this.classifier.getClassifications(phrase.toLowerCase());
  var guess = guesses.reduce(toMaxValue);
  return {
    probabilities: guesses,
    guess: guess.value > this.minConfidence ? guess.label : null
  };
};

/**
* Invoke the given process for a known skill
*/
Brain.prototype.invoke = function(bot, message, skill, info) {
  var skillCode;
  console.log('Grabbing code for skill: ' + skill);

  try {
    skillCode = require('../skills/' + skill);
  } catch (err) {
    throw new Error('The invoked skill doesn\'t exist!');
  }

  console.log('Running skill code for ' + skill + '...');
  skillCode(bot, message, skill, info);
  return this;
};

/**
* A hlper function to find the mathematical max value of two numbers
*/
function toMaxValue(x, y) {
  return x && x.value > y.value ? x : y;
}

// vim: set syntax=javascript tabstop=2 softtabstop=2 shiftwidth=2 shiftround expandtab:
