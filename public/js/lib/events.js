var EventEmitter = require('ampersand-events');

var events = EventEmitter.createEmitter();

events.NEW_QUESTION = 'question:created';
events.SHOW_QUESTION = 'question:show';

module.exports = events;