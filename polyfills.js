// Polyfills for React Native
import { EventEmitter } from 'eventemitter3';

// Polyfill global.EventEmitter
if (typeof global.EventEmitter === 'undefined') {
  global.EventEmitter = EventEmitter;
}

// Polyfill process.nextTick if not available
if (typeof global.process === 'undefined') {
  global.process = { nextTick: setImmediate };
} else if (typeof global.process.nextTick === 'undefined') {
  global.process.nextTick = setImmediate;
}

// Polyfill setImmediate if not available
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => {
    return setTimeout(callback, 0, ...args);
  };
}
