#!/usr/bin/env node

'use strict'

/**
 * Use NLP to parse a message into a scheduled coverage event
 */
module.exports = function(bot, message, skill, info) {
    console.log('SKILL: ' + skill);
    bot.reply(message, 'SKILL: ' + skill);

    console.log('MESSAGE: ' + message.text);
    bot.reply(message, 'MESSAGE: ' + message.text);
};
