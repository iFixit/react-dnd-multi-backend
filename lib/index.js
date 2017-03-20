'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Preview = undefined;
exports.default = createMultiBackend;

var _MultiBackend = require('./MultiBackend');

var _MultiBackend2 = _interopRequireDefault(_MultiBackend);

var _Preview = require('./Preview');

var _Preview2 = _interopRequireDefault(_Preview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Preview = exports.Preview = _Preview2.default;

function createMultiBackend(managerOrOptions) {
  if (managerOrOptions.getMonitor) {
    return new _MultiBackend2.default(managerOrOptions);
  } else {
    return function (manager) {
      return new _MultiBackend2.default(manager, managerOrOptions);
    };
  }
}