(function (exports, require, module, __filename, __dirname) { 'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.Rule = exports.Check = exports.decorators = exports.Tuple = exports.Maybe = exports.Type = exports.Union = undefined;var _validation = require('./validation');Object.defineProperty(exports, 'Check', { enumerable: true, get: function () {return _validation.












    Check;} });Object.defineProperty(exports, 'Rule', { enumerable: true, get: function () {return _validation.Rule;} });var _union = require('./union');var _union2 = _interopRequireDefault(_union);var _type = require('./type');var _type2 = _interopRequireDefault(_type);var _maybe = require('./data-types/maybe');var _maybe2 = _interopRequireDefault(_maybe);var _tuple = require('./data-types/tuple');var _tuple2 = _interopRequireDefault(_tuple);var _decorators = require('./decorators');var decorators = _interopRequireWildcard(_decorators);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}exports.Union = _union2.default;exports.Type = _type2.default;exports.Maybe = _maybe2.default;exports.Tuple = _tuple2.default;exports.decorators = decorators;

var Point = _type2.default`Point`({
  x: Number,
  y: Number });


var rawData = { x: 1, y: 10 };
var point1 = Point(rawData);
var point2 = Point(point1

// point2.equals(point1)
);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkNoZWNrIiwiUnVsZSIsImRlY29yYXRvcnMiLCJVbmlvbiIsIlR5cGUiLCJNYXliZSIsIlR1cGxlIiwiUG9pbnQiLCJ4IiwiTnVtYmVyIiwieSIsInJhd0RhdGEiLCJwb2ludDEiLCJwb2ludDIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFhU0EsUyxzR0FBT0MsSSxNQVhoQixnQyw2Q0FDQSw4QiwyQ0FDQSwyQyw2Q0FDQSwyQyw2Q0FNQSwwQyxJQUFZQyxVLDZZQUpIQyxLLDJCQUNBQyxJLDBCQUNBQyxLLDJCQUNBQyxLLDJCQUVBSixVLEdBQUFBLFU7O0FBR1QsSUFBTUssUUFBUSxjQUFLLE9BQUwsQ0FBWTtBQUN4QkMsS0FBR0MsTUFEcUI7QUFFeEJDLEtBQUdELE1BRnFCLEVBQVosQ0FBZDs7O0FBS0EsSUFBTUUsVUFBVSxFQUFFSCxHQUFHLENBQUwsRUFBUUUsR0FBRyxFQUFYLEVBQWhCO0FBQ0EsSUFBTUUsU0FBU0wsTUFBTUksT0FBTixDQUFmO0FBQ0EsSUFBTUUsU0FBU04sTUFBTUs7O0FBRXJCO0FBRmUsQ0FBZiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZVJvb3QiOiIvaG9tZS96ZXJvYmlhcy9fd2ViL21lenphbmluZS9zcmMiLCJzb3VyY2VzQ29udGVudCI6WyIvL0BmbG93XG5cbmltcG9ydCBVbmlvbiBmcm9tICcuL3VuaW9uJ1xuaW1wb3J0IFR5cGUgZnJvbSAnLi90eXBlJ1xuaW1wb3J0IE1heWJlIGZyb20gJy4vZGF0YS10eXBlcy9tYXliZSdcbmltcG9ydCBUdXBsZSBmcm9tICcuL2RhdGEtdHlwZXMvdHVwbGUnXG5cbmV4cG9ydCB7IFVuaW9uIH1cbmV4cG9ydCB7IFR5cGUgfVxuZXhwb3J0IHsgTWF5YmUgfVxuZXhwb3J0IHsgVHVwbGUgfVxuaW1wb3J0ICogYXMgZGVjb3JhdG9ycyBmcm9tICcuL2RlY29yYXRvcnMnXG5leHBvcnQgeyBkZWNvcmF0b3JzIH1cbmV4cG9ydCB7IENoZWNrLCBSdWxlIH0gZnJvbSAnLi92YWxpZGF0aW9uJ1xuXG5jb25zdCBQb2ludCA9IFR5cGVgUG9pbnRgKHtcbiAgeDogTnVtYmVyLFxuICB5OiBOdW1iZXIsXG59KVxuXG5jb25zdCByYXdEYXRhID0geyB4OiAxLCB5OiAxMCB9XG5jb25zdCBwb2ludDEgPSBQb2ludChyYXdEYXRhKVxuY29uc3QgcG9pbnQyID0gUG9pbnQocG9pbnQxKVxuXG4vLyBwb2ludDIuZXF1YWxzKHBvaW50MSlcbiJdfQ==
});