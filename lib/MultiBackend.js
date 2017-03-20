'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactDndHtml5Backend = require('react-dnd-html5-backend');

var _reactDndHtml5Backend2 = _interopRequireDefault(_reactDndHtml5Backend);

var _reactDndTouchBackend = require('react-dnd-touch-backend');

var _reactDndTouchBackend2 = _interopRequireDefault(_reactDndTouchBackend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Backend = {
  HTML5: 0,
  TOUCH: 1,
  MAX: 2
};

var MultiBackend = function () {
  function MultiBackend(manager, sourceOptions) {
    var _this = this;

    _classCallCheck(this, MultiBackend);

    var options = { start: Backend.HTML5 };

    for (optionName in sourceOptions || {}) {
      options[optionName] = sourceOptions[optionName];
    }

    this.current = options.start;

    this.backends = [];
    this.backends[Backend.HTML5] = new _reactDndHtml5Backend2.default(manager);
    this.backends[Backend.TOUCH] = new _reactDndTouchBackend2.default({ enableMouseEvents: true })(manager);

    this.nodes = {};

    var funcs = ['setup', 'teardown', 'connectDragSource', 'connectDragPreview', 'connectDropTarget', 'previewEnabled', 'addEventListeners', 'removeEventListeners', 'backendSwitcher', 'cleanUpHandlers', 'applyToBackend', 'callBackends', 'restrictTouchBackend', 'freeTouchBackend'];
    funcs.forEach(function (func) {
      return _this[func] = _this[func].bind(_this);
    });
  }

  // DnD Backend API


  _createClass(MultiBackend, [{
    key: 'setup',
    value: function setup() {
      if (typeof window === 'undefined') {
        return;
      }

      if (this.constructor.isSetUp) {
        throw new Error('Cannot have two Multi backends at the same time.');
      }
      this.constructor.isSetUp = true;
      this.addEventListeners(window);
      this.backends[this.current].setup();
    }
  }, {
    key: 'teardown',
    value: function teardown() {
      if (typeof window === 'undefined') {
        return;
      }

      this.constructor.isSetUp = false;
      this.removeEventListeners(window);
      this.backends[this.current].teardown();
    }
  }, {
    key: 'connectDragSource',
    value: function connectDragSource() {
      return this.callBackends('connectDragSource', arguments);
    }
  }, {
    key: 'connectDragPreview',
    value: function connectDragPreview() {
      return this.callBackends('connectDragPreview', arguments);
    }
  }, {
    key: 'connectDropTarget',
    value: function connectDropTarget() {
      return this.callBackends('connectDropTarget', arguments);
    }

    // Use by Preview component

  }, {
    key: 'previewEnabled',
    value: function previewEnabled() {
      return this.current === Backend.TOUCH;
    }

    // Multi Backend Listeners

  }, {
    key: 'addEventListeners',
    value: function addEventListeners(target) {
      target.addEventListener('touchstart', this.backendSwitcher, true);
    }
  }, {
    key: 'removeEventListeners',
    value: function removeEventListeners(target) {
      target.removeEventListener('touchstart', this.backendSwitcher, true);
    }

    // Switching logic

  }, {
    key: 'backendSwitcher',
    value: function backendSwitcher(event) {
      var oldBackend = this.current;

      if (this.current === Backend.HTML5 && event.touches != null) {
        this.current = Backend.TOUCH;
        this.removeEventListeners(window);
      }

      if (this.current !== oldBackend) {
        this.backends[oldBackend].teardown();
        this.cleanUpHandlers(oldBackend);
        this.backends[this.current].setup();

        if (this.current === Backend.TOUCH) {
          this.freeTouchBackend();
          this.backends[this.current].handleTopMoveStartCapture(event);
          this.backends[this.current].getTopMoveStartHandler()(event);
        }
      }
    }
  }, {
    key: 'cleanUpHandlers',
    value: function cleanUpHandlers(backend) {
      for (var id in this.nodes) {
        var node = this.nodes[id];
        node.handlers[backend]();
        node.handlers[backend] = null;
      }
    }

    // Which backend should be called

  }, {
    key: 'applyToBackend',
    value: function applyToBackend(backend, func, args) {
      var self = this.backends[backend];
      return self[func].apply(self, args);
    }
  }, {
    key: 'callBackends',
    value: function callBackends(func, args) {
      var handlers = [];
      var nodeId = func + '_' + args[0];

      for (var i = 0; i < Backend.MAX; ++i) {
        if (i < this.current) {
          handlers.push(null);
          continue;
        }

        var touchAndNotCurrent = i == Backend.TOUCH && i != this.current;
        if (touchAndNotCurrent) {
          this.restrictTouchBackend(true);
        }
        handlers.push(this.applyToBackend(i, func, args));
        if (touchAndNotCurrent) {
          this.restrictTouchBackend(false);
        }
      }

      var nodes = this.nodes;
      nodes[nodeId] = { func: func, args: args, handlers: handlers };

      return function () {
        delete nodes[nodeId];
        for (var _i = 0; _i < handlers.length; ++_i) {
          var handler = handlers[_i];
          if (handler) {
            handler(arguments);
          }
        }
      };
    }

    // Special cases for TouchBackend

  }, {
    key: 'restrictTouchBackend',
    value: function restrictTouchBackend(enable) {
      this.backends[Backend.TOUCH].listenerTypes = enable ? ['touch'] : ['touch', 'mouse'];
    }
  }, {
    key: 'freeTouchBackend',
    value: function freeTouchBackend() {
      for (var id in this.nodes) {
        var node = this.nodes[id];
        node.handlers[Backend.TOUCH]();
        node.handlers[Backend.TOUCH] = this.applyToBackend(Backend.TOUCH, node.func, node.args);
      }
    }
  }]);

  return MultiBackend;
}();

MultiBackend.Backend = Backend;

exports.default = MultiBackend;