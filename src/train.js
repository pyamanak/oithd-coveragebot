#!/usr/bin/env node

/**
* DISCLAIMER
*
* I do not actually know any javascript. At All. Never seen it before.
* This code may break. It may already be broken. I don't know how to fix it.
* I wrote it, it kind of worked. That's the limit of my JS knowledge.
*/

'use strict'

// Require the fs module to save to filesystem
var fs = require('fs');

// This is where we will store all of the custom phrases
var CUSTOM_PHRASE_LOC = __dirname + '/custom-phrases.json';

// Export the module name
module.exports = Train;

/**
* Weird interactive training function.
*
* Works on a very basic level. Don't expect too much from it
*/
function Train(Brain, bot, message) {
  console.log('Inside on-the-fly training module.');
  console.log('Asking user for name of skill.');
  var phraseExamples = [];
  var phraseName;
  bot.startConversation(message, function(err, convo) {
    convo.ask('Sure, what do you want to call this skill? ' +
      'This is the machine name, so pick a good name for a file basename.',
      [{
        pattern: '.*',
        callback: function(response, convo) {
          phraseName = response.text;
          convo.say('Right, I\'ll call it `' + phraseName + '`.');
          convo.say('Okay, now give me a bunch of ways you might say this. ' +
            'When you\'re done, just sent me the word done all by itself on a line.');
          convo.ask('How might you say this?',
            [{
              pattern: '.*',
              callback: function(response, convo) {
                phraseExamples.push(response.text);
                reprompt(convo);
                convo.next();
              }
            }]);
        convo.next();
        }
      }]
    );

    function reprompt(convo) {
      convo.ask('Okay, how else?',
      [{
        pattern: '^done$',
        callback: function(response, convo) {
          convo.say('Great, now let me think about that...');
          Brain.teach(phraseName, phraseExamples);
          Brain.think();
          writeSkill(phraseName, phraseExamples, function(err) {
            if (err) {
              return convo.say('Shoot, something went wrong while I was trying ' +
              'to add that to my brain:\n```\n' + JSON.stringify(err) + '\n```');
            }
            convo.say('All done! You should try seeing if I understood now!');
          });
          convo.next();
        }
      },
      {
        pattern: '.*',
        callback: function(response, convo) {
          phraseExamples.push(response.text);
          reprompt(convo);
          convo.next();
        }
      }
      ]);
    }
  });
};

/**
* Saves a new skill to disk with its given recognition pieces
*
* NOTE Saving a skill with the same name will OVERWRITE it, not APPEND
*/
function writeSkill(name, vocab, callback) {
  console.log('About to write files for a new empty phrase/skill type...');
  fs.readFile(CUSTOM_PHRASE_LOC, function(err, data) {
    if (err) {
      console.error('Error loading custom phrase JSON into memory.');
      return callback(err);
    }

    console.log('Parsing custom phrase JSON');
    var customPhrases = JSON.parse(data.toString());
    customPhrases[name] = vocab;
    console.log('About to serialize and write new phrase object...');
    fs.writeFile(CUSTOM_PHRASE_LOC, JSON.stringify(customPhrases, null, 2), function(err) {

      if (err) {
        console.error('Error while writing new serialized phrase object.');
        return callback(err);
      }

      console.log('Writing updated phrase JSON finished, copying empty_skill.js...');
      var emptySkillStream = fs.createReadStream(__dirname + '/empty_skill.js');
      var writeStream = fs.createWriteStream(__dirname + '/../skills/' + name + '.js');
      emptySkillStream.pipe(writeStream);
      emptySkillStream.on('error', callback);
      writeStream.on('error', callback);
      writeStream.on('finish', callback.bind(null, null));
    });
  });
}

// vim: set syntax=javascript tabstop=2 softtabstop=2 shiftwidth=2 shiftround expandtab:
