#!/usr/bin/env node

/**
* DISCLAIMER
*
* I do not actually know any javascript. At All. Never seen it before.
* This code may break. It may already be broken. I don't know how to fix it.
* I wrote it, it kind of worked. That's the limit of my JS knowledge.
*/

'use strict'

// The number of args needed to be a valid command
var REQUIRED_NUMBER_OF_ARGS = 5;

// Require the fs module to write to the File system
var fs = require('fs');

// Require the Ears, Brain, and Train modules
var Train = require('./train');
var Brain = require('./brain');
var Ears = require('./ears');

// Create a new coverageBot
var coverageBot = {
  Brain: new Brain(),
  Ears: new Ears(process.env.SLACK_TOKEN)
};

/**
* Grab all the existing custom phrases that are defined in the
* custom-phrases.json file
*/
var customPhrasesText;
  try {
    customPhrasesText = fs.readFileSync(__dirname + '/custom-phrases.json').toString();
  } catch (err) {
    throw new Error('Uh oh, OITHD CoverageBot could not find the ' +
      'custom-phrases.json file, did you move it?');
}

/**
* Parse the custom phrases block into hopefully valid JSON. Fail if invalid
*/
var customPhrases;
  try {
    customPhrases = JSON.parse(customPhrasesText);
  } catch (err) {
    throw new Error('Uh oh, custom-phrases.json was ' +
      'not valid JSON! Fix it, please? :)');
}

/**
* Register all of the already known commands
*/
console.log('OITHD CoverageBot is learning...');
coverageBot.Teach = coverageBot.Brain.teach.bind(coverageBot.Brain);
Object.keys(customPhrases).forEach(function(key) {
  coverageBot.Teach(key, customPhrases[key]);
});
coverageBot.Brain.think();

/**
* Now run the bot. Allow the bot to train using the training command,
* otherwise it will respond to any and all text entered with the words
* cover or coverage
*/
console.log('OITHD CoverageBot finished learning, time to listen...');

/*
 * Message types:
 * direct_message
 *   In coveragebot direct message channel: <any text>
 *
 * direct_mention
 *   In any channel that coveragebot is in, begin with @coveragebot with keyword
 *
 * mention
 *   In any channel that coveragebot is in, include @coveragebot with keyword
 *
 * ambient
 *   In any channel that coveragebot is in, listen to all messages with keywoard
 */

// KLUDGE: I am bad at regexp
// Do not enable yet as they are buggy
/**
 * Any name that could mean Aldrich Hall
 * recognizes: ah, aldrich
 */
// var aldrich_regex = '(a(h|ldrich))';

/**
 * Any name that could mean modulars
 * recognizes: mod, mods, modulars
 */
// var modular_regex = '(mod(s|ulars))';

/**
 * Any name that could mean data center
 * recognizes: dc, data, datacenter, data center
 */
// var datacenter_regex = '(d(c|ata( ?center)?))';

/**
 * The full string that slackbot will listen for
 * Required: <cover> or <coverage>, and the location as defined by regex
 * optional: "at" or "in" or "the"
 * The strings are handled as case-insensitive by default
 */
// var coverage_string = '(cover(age)?) (at|in)? ?(the )?(' + aldrich_regex + '|'
//         + modular_regex + '|' + datacenter_regex + ') (.*)';

var coverage_string = [
  'cover(age)? (req(uest)?|pro(vide)?)',
  'cover(age)? (req(uest)?|pro(vide)?) (ah|aldrich|mods|modulars|dc|datacenter) (.*day|[^\s]+) ([0-2]?[0-9]) ([0-2]?[0-9])$',
];

coverageBot.Ears.listen().hear('TRAINING TIME!!!', function(bot, message) {
  // TODO add some king of Authentication, even just user.id == allowedId
  // to prevent anybody from training the bot.
  console.log('Delegating to on-the-fly training module...');
  Train(coverageBot.Brain, bot, message);
/**
 * TODO Natural Language Processing
 */
// }).hear('(cover|age)', function(bot, message) {
//   console.log('OITHD CoverageBot heard: ' + message.text);
//   var interpretation = coverageBot.Brain.interpret(message.text);
//   console.log('OITHD CoverageBot interpretation: ', interpretation);
//   if (interpretation.guess) {
//     console.log('Invoking skill: ' + interpretation.guess);
//     coverageBot.Brain.invoke(bot, message, interpretation.guess, interpretation);
//   } else {
//     bot.reply(message, 'Hmm... I couldn\'t tell what you said...');
//     bot.reply(message, '```\n' + JSON.stringify(interpretation) + '\n```');
//   }
  }).hear(coverage_string, function(bot, message) {
    /*
     * {
     *   "type": "message",
     *   "channel": "U024BE7LH",
     *   "user": "R143CD7MP ",
     *   "text": "lunchtime now!",
     *   "ts": "1450416257.000003",
     *   "team": "F038DHKHK",
     *   "event": "direct_message"
     * }
     */
  var messageSplitBySpaces = message.text.match(/\S+/g);

  debugCoverageCall(bot, message, messageSplitBySpaces);
  if (printMissingArgumentWarning(bot, message, messageSplitBySpaces)) {
    console.log("VALID input: continue");

    // Because we have at least a valid count of arguments, cache them into
    // variables for later use
    var coverageAction = messageSplitBySpaces[1];
    var coveragePlace = messageSplitBySpaces[2];
    var coverageDate = messageSplitBySpaces[3];
    var coverageTimeStart = messageSplitBySpaces[4];
    var coverageTimeEnd = messageSplitBySpaces[5];
  }
});

/**
 * A simple debug function which logs to console all of the arguments.
 * The slackbot will echo the results of this function
 */
function debugCoverageCall(bot, message, messageSplitBySpaces) {
  console.log("Received: " + message.text);
  bot.reply(message, "Received: " + message.text)

  var botResponse = ""
  var size = messageSplitBySpaces.length;
  // Start at i = 1, 0 is always the full message that was captured
  for (var i = 1; i < size; ++i) {
    var value = messageSplitBySpaces[i];
    console.log(value);
    botResponse += i + ": " + value + "\n";
  }
  bot.reply(message, botResponse);
}

/**
 * If there are missing arguments which are required to continue, print
 * an error message and stop execution
 */
function printMissingArgumentWarning(bot, message, messageSplitBySpaces) {
  var size = messageSplitBySpaces.length;
  if (size - 1 < REQUIRED_NUMBER_OF_ARGS) {
    var explanationString = "Missing arguments, required number is: "
      + REQUIRED_NUMBER_OF_ARGS +"\n";

    // KLUDGE: This is very ugly.
    // Figure out if this is a request or a provide
    var isCoverageRequest = messageSplitBySpaces[1].startsWith("req");
    if (isCoverageRequest) {
      explanationString += "Format: coverage request <place> <date> "
          + "<time-start> <time-end>\n";
    } else {
      explanationString += "Format: coverage provide <who> <date> "
          + "<time-start> <time-end>\n";
    }

    explanationString += "  Where:\n";
    explanationString += "    <action> is one of request or provide\n";

    // KLUDGE: This is very ugly.
    if (isCoverageRequest) {
      explanationString += "    <place> is one of ah, aldrich, mods,"
          + "modulars, dc, datacenter\n";
    } else {
      explanationString += "    <who> is the username of the person you will "
          + "be covering\n";
    }

    explanationString += "    <date> is a date string MM/DD/YYYY or a common "
        + "name like monday, tuesday\n";
    explanationString += "    <time-start> Is an hour in 24 hour time\n";
    explanationString += "    <time-end> Is an hour in 24 hour time that is "
        + "after <time-start>\n";
    console.log(explanationString);
    bot.reply(message, "```" + explanationString + "```");
    return false;
  } else {
    return true;
  }
}

// vim: set syntax=javascript tabstop=2 softtabstop=2 shiftwidth=2 shiftround expandtab:
