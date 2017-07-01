(function (exports, require, module, __filename, __dirname) { 'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.











createPred = createPred;exports.
























createBuilder = createBuilder;exports.


























transformInput = transformInput;var _ramda = require('ramda');var _fixtures = require('./fixtures');require('./type-container');var _validation = require('../validation');function createPred(val) {switch (true) {case isDirectlyEquals(val):return obj => obj === val;case isCheckByType(val):return (0, _ramda.is)(val);case (0, _fixtures.isMezzanine)(val):{var cast = val;return obj => cast.is(obj);}case typeof val === 'function':{var _cast = val;return _cast;}case (0, _ramda.isNil)(val):return _ramda.isNil;case typeof val === 'object':{var _cast2 = val;var mapped = (0, _ramda.map)(createPred, _cast2);return reducePred(mapped);}default:{var _cast3 = val;return _cast3;}}}function createBuilder(val, data) {switch (true) {case isDirectlyEquals(val):return data;case isCheckByType(val):return data;case (0, _fixtures.isMezzanine)(val):return val(data);case typeof val === 'function':return data;case (0, _ramda.isNil)(val):return data;case typeof val === 'object':return reduceBuilder(val, data);default:return data;}}function reduceBuilder(predMap, data) {return (0, _ramda.mapObjIndexed)((val, key) => createBuilder(val, (0, _ramda.prop)(key, data)), predMap);} //$FlowIssue
var reducePred = _ramda.where;function transformInput(val, isMono) {switch (true) {
    case isMono === false:return val;
    case (0, _fixtures.isMezzanine)(val):return { value: val };
    case !(0, _fixtures.isObject)(val):return { value: val };
    case !(0, _fixtures.ensureProp)('value', val):return { value: val };
    default:return val;}

}

var isDirectlyEquals = val =>
typeof val === 'string' ||
typeof val === 'number' ||
typeof val === 'boolean';
var isCheckByType = val =>
val === String ||
val === Number ||
val === Boolean ||
val === Function ||
val === Array;

var checkByTypeCheck = new _validation.Check(
isCheckByType,
() => 'sholud check by type',
'check by type');
var checkByType = new _validation.Rule(
'check by type',
() => 'sholud check by type',
[checkByTypeCheck]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlc2NyaXB0b3IuanMiXSwibmFtZXMiOlsiY3JlYXRlUHJlZCIsImNyZWF0ZUJ1aWxkZXIiLCJ0cmFuc2Zvcm1JbnB1dCIsInZhbCIsImlzRGlyZWN0bHlFcXVhbHMiLCJvYmoiLCJpc0NoZWNrQnlUeXBlIiwiY2FzdCIsImlzIiwibWFwcGVkIiwicmVkdWNlUHJlZCIsImRhdGEiLCJyZWR1Y2VCdWlsZGVyIiwicHJlZE1hcCIsImtleSIsImlzTW9ubyIsInZhbHVlIiwiU3RyaW5nIiwiTnVtYmVyIiwiQm9vbGVhbiIsIkZ1bmN0aW9uIiwiQXJyYXkiLCJjaGVja0J5VHlwZUNoZWNrIiwiY2hlY2tCeVR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVlnQkEsVSxHQUFBQSxVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBQyxhLEdBQUFBLGE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCQUMsYyxHQUFBQSxjLENBOURoQiw4QkFDQSxzQ0FDQSw0QkFDQSwyQ0FPTyxTQUFTRixVQUFULENBQXVCRyxHQUF2QixFQUFxQyxDQUMxQyxRQUFRLElBQVIsR0FDRSxLQUFLQyxpQkFBaUJELEdBQWpCLENBQUwsQ0FBNEIsT0FBUUUsR0FBRCxJQUFnQkEsUUFBUUYsR0FBL0IsQ0FDNUIsS0FBS0csY0FBY0gsR0FBZCxDQUFMLENBQXlCLE9BQU8sZUFBR0EsR0FBSCxDQUFQLENBQ3pCLEtBQUssMkJBQVlBLEdBQVosQ0FBTCxDQUF1QixDQUNyQixJQUFNSSxPQUF1QkosR0FBN0IsQ0FDQSxPQUFRRSxHQUFELElBQWdCRSxLQUFLQyxFQUFMLENBQVFILEdBQVIsQ0FBdkIsQ0FDRCxDQUNELEtBQUssT0FBT0YsR0FBUCxLQUFlLFVBQXBCLENBQWdDLENBQzlCLElBQU1JLFFBQWNKLEdBQXBCLENBQ0EsT0FBT0ksS0FBUCxDQUNELENBQ0QsS0FBSyxrQkFBTUosR0FBTixDQUFMLENBQWlCLG9CQUNqQixLQUFLLE9BQU9BLEdBQVAsS0FBZSxRQUFwQixDQUE4QixDQUM1QixJQUFNSSxTQUE0QkosR0FBbEMsQ0FDQSxJQUFNTSxTQUFnQyxnQkFBSVQsVUFBSixFQUFnQk8sTUFBaEIsQ0FBdEMsQ0FDQSxPQUFPRyxXQUFXRCxNQUFYLENBQVAsQ0FDRCxDQUNELFFBQVMsQ0FDUCxJQUFNRixTQUFjSixHQUFwQixDQUNBLE9BQU9JLE1BQVAsQ0FDRCxDQXBCSCxDQXNCRCxDQUVNLFNBQVNOLGFBQVQsQ0FBdUJFLEdBQXZCLEVBQXdDUSxJQUF4QyxFQUFvRCxDQUN6RCxRQUFRLElBQVIsR0FDRSxLQUFLUCxpQkFBaUJELEdBQWpCLENBQUwsQ0FBNEIsT0FBT1EsSUFBUCxDQUM1QixLQUFLTCxjQUFjSCxHQUFkLENBQUwsQ0FBeUIsT0FBT1EsSUFBUCxDQUN6QixLQUFLLDJCQUFZUixHQUFaLENBQUwsQ0FBdUIsT0FBT0EsSUFBSVEsSUFBSixDQUFQLENBQ3ZCLEtBQUssT0FBT1IsR0FBUCxLQUFlLFVBQXBCLENBQWdDLE9BQU9RLElBQVAsQ0FDaEMsS0FBSyxrQkFBTVIsR0FBTixDQUFMLENBQWlCLE9BQU9RLElBQVAsQ0FDakIsS0FBSyxPQUFPUixHQUFQLEtBQWUsUUFBcEIsQ0FBOEIsT0FBT1MsY0FBY1QsR0FBZCxFQUFtQlEsSUFBbkIsQ0FBUCxDQUM5QixRQUFTLE9BQU9BLElBQVAsQ0FQWCxDQVNELENBRUQsU0FBU0MsYUFBVCxDQUFtREMsT0FBbkQsRUFBcUVGLElBQXJFLEVBQWlGLENBQy9FLE9BQU8sMEJBQ0wsQ0FBQ1IsR0FBRCxFQUFNVyxHQUFOLEtBQ0ViLGNBQ0VFLEdBREYsRUFFRSxpQkFBS1csR0FBTCxFQUFVSCxJQUFWLENBRkYsQ0FGRyxFQUtMRSxPQUxLLENBQVAsQ0FNRCxDLENBS0Q7QUFDQSxJQUFNSCx5QkFBTixDQUVPLFNBQVNSLGNBQVQsQ0FBd0JDLEdBQXhCLEVBQWtDWSxNQUFsQyxFQUFtRCxDQUN4RCxRQUFRLElBQVI7QUFDRSxTQUFLQSxXQUFXLEtBQWhCLENBQWdDLE9BQU9aLEdBQVA7QUFDaEMsU0FBSywyQkFBWUEsR0FBWixDQUFMLENBQWdDLE9BQU8sRUFBRWEsT0FBT2IsR0FBVCxFQUFQO0FBQ2hDLFNBQUssQ0FBQyx3QkFBU0EsR0FBVCxDQUFOLENBQWdDLE9BQU8sRUFBRWEsT0FBT2IsR0FBVCxFQUFQO0FBQ2hDLFNBQUssQ0FBQywwQkFBVyxPQUFYLEVBQW9CQSxHQUFwQixDQUFOLENBQWdDLE9BQU8sRUFBRWEsT0FBT2IsR0FBVCxFQUFQO0FBQ2hDLFlBQWdDLE9BQU9BLEdBQVAsQ0FMbEM7O0FBT0Q7O0FBRUQsSUFBTUMsbUJBQW9CRCxHQUFEO0FBQ3ZCLE9BQU9BLEdBQVAsS0FBZSxRQUFmO0FBQ0csT0FBT0EsR0FBUCxLQUFlLFFBRGxCO0FBRUcsT0FBT0EsR0FBUCxLQUFlLFNBSHBCO0FBSUEsSUFBTUcsZ0JBQWlCSCxHQUFEO0FBQ3BCQSxRQUFRYyxNQUFSO0FBQ0dkLFFBQVFlLE1BRFg7QUFFR2YsUUFBUWdCLE9BRlg7QUFHR2hCLFFBQVFpQixRQUhYO0FBSUdqQixRQUFRa0IsS0FMYjs7QUFPQSxJQUFNQyxtQkFBMkM7QUFDL0NoQixhQUQrQztBQUUvQyxNQUFNLHNCQUZ5QztBQUcvQyxlQUgrQyxDQUFqRDtBQUlBLElBQU1pQixjQUFxQztBQUN6QyxlQUR5QztBQUV6QyxNQUFNLHNCQUZtQztBQUd6QyxDQUFDRCxnQkFBRCxDQUh5QyxDQUEzQyIsImZpbGUiOiJkZXNjcmlwdG9yLmpzIiwic291cmNlUm9vdCI6Ii9ob21lL3plcm9iaWFzL193ZWIvbWV6emFuaW5lL3NyYy90eXBlIiwic291cmNlc0NvbnRlbnQiOlsiLy9AZmxvd1xuXG5pbXBvcnQgeyBtYXAsIGlzLCBpc05pbCwgd2hlcmUsIHByb3AsIGFzc29jLCBtYXBPYmpJbmRleGVkIH0gZnJvbSAncmFtZGEnXG5pbXBvcnQgeyBlbnN1cmVQcm9wLCBpc09iamVjdCwgaXNNZXp6YW5pbmUgfSBmcm9tICcuL2ZpeHR1cmVzJ1xuaW1wb3J0IHsgdHlwZSBUeXBlUmVjb3JkIH0gZnJvbSAnLi90eXBlLWNvbnRhaW5lcidcbmltcG9ydCB7IENoZWNrLCBSdWxlIH0gZnJvbSAnLi4vdmFsaWRhdGlvbidcblxuXG5cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcmVkPFQ+KHZhbDogVCk6IFByZWQge1xuICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlIGlzRGlyZWN0bHlFcXVhbHModmFsKTogcmV0dXJuIChvYmo6IG1peGVkKSA9PiBvYmogPT09IHZhbFxuICAgIGNhc2UgaXNDaGVja0J5VHlwZSh2YWwpOiByZXR1cm4gaXModmFsKVxuICAgIGNhc2UgaXNNZXp6YW5pbmUodmFsKToge1xuICAgICAgY29uc3QgY2FzdDogVHlwZVJlY29yZDxUPiA9ICh2YWw6IGFueSlcbiAgICAgIHJldHVybiAob2JqOiBtaXhlZCkgPT4gY2FzdC5pcyhvYmopXG4gICAgfVxuICAgIGNhc2UgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJzoge1xuICAgICAgY29uc3QgY2FzdDogUHJlZCA9ICh2YWw6IGFueSlcbiAgICAgIHJldHVybiBjYXN0XG4gICAgfVxuICAgIGNhc2UgaXNOaWwodmFsKTogcmV0dXJuIGlzTmlsXG4gICAgY2FzZSB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jzoge1xuICAgICAgY29uc3QgY2FzdDoge1trZXk6IHN0cmluZ106IFR9ID0gKHZhbDogYW55KVxuICAgICAgY29uc3QgbWFwcGVkOiB7W2tleTogc3RyaW5nXTogUHJlZH0gPSBtYXAoY3JlYXRlUHJlZCwgY2FzdClcbiAgICAgIHJldHVybiByZWR1Y2VQcmVkKG1hcHBlZClcbiAgICB9XG4gICAgZGVmYXVsdDoge1xuICAgICAgY29uc3QgY2FzdDogUHJlZCA9ICh2YWw6IGFueSlcbiAgICAgIHJldHVybiBjYXN0XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCdWlsZGVyKHZhbDogJEZsb3dJc3N1ZSwgZGF0YTogKik6ICoge1xuICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlIGlzRGlyZWN0bHlFcXVhbHModmFsKTogcmV0dXJuIGRhdGFcbiAgICBjYXNlIGlzQ2hlY2tCeVR5cGUodmFsKTogcmV0dXJuIGRhdGFcbiAgICBjYXNlIGlzTWV6emFuaW5lKHZhbCk6IHJldHVybiB2YWwoZGF0YSlcbiAgICBjYXNlIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbic6IHJldHVybiBkYXRhXG4gICAgY2FzZSBpc05pbCh2YWwpOiByZXR1cm4gZGF0YVxuICAgIGNhc2UgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc6IHJldHVybiByZWR1Y2VCdWlsZGVyKHZhbCwgZGF0YSlcbiAgICBkZWZhdWx0OiByZXR1cm4gZGF0YVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZHVjZUJ1aWxkZXI8VCwgRGF0YToge1tpZDogc3RyaW5nXTogVH0+KHByZWRNYXA6IFByZWRNYXAsIGRhdGE6IERhdGEpIHtcbiAgcmV0dXJuIG1hcE9iakluZGV4ZWQoXG4gICAgKHZhbCwga2V5OiBzdHJpbmcpID0+XG4gICAgICBjcmVhdGVCdWlsZGVyKFxuICAgICAgICB2YWwsXG4gICAgICAgIHByb3Aoa2V5LCBkYXRhKSksXG4gICAgcHJlZE1hcClcbn1cbmV4cG9ydCB0eXBlIFByZWQgPSA8K1Q+KHZhbDogVCkgPT4gYm9vbGVhblxudHlwZSBQcmVkTWFwID0ge1trZXk6IHN0cmluZ106IFByZWR9XG50eXBlIFJlZHVjZVByZWQgPSAocHJlZE1hcDogUHJlZE1hcCkgPT4gUHJlZFxuXG4vLyRGbG93SXNzdWVcbmNvbnN0IHJlZHVjZVByZWQ6IFJlZHVjZVByZWQgPSB3aGVyZVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtSW5wdXQodmFsOiBhbnksIGlzTW9ubzogYm9vbGVhbikge1xuICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlIGlzTW9ubyA9PT0gZmFsc2UgICAgICAgICA6IHJldHVybiB2YWxcbiAgICBjYXNlIGlzTWV6emFuaW5lKHZhbCkgICAgICAgICA6IHJldHVybiB7IHZhbHVlOiB2YWwgfVxuICAgIGNhc2UgIWlzT2JqZWN0KHZhbCkgICAgICAgICAgIDogcmV0dXJuIHsgdmFsdWU6IHZhbCB9XG4gICAgY2FzZSAhZW5zdXJlUHJvcCgndmFsdWUnLCB2YWwpOiByZXR1cm4geyB2YWx1ZTogdmFsIH1cbiAgICBkZWZhdWx0ICAgICAgICAgICAgICAgICAgICAgICA6IHJldHVybiB2YWxcbiAgfVxufVxuXG5jb25zdCBpc0RpcmVjdGx5RXF1YWxzID0gKHZhbDogbWl4ZWQpOiBib29sZWFuICVjaGVja3MgPT5cbiAgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZydcbiAgfHwgdHlwZW9mIHZhbCA9PT0gJ251bWJlcidcbiAgfHwgdHlwZW9mIHZhbCA9PT0gJ2Jvb2xlYW4nXG5jb25zdCBpc0NoZWNrQnlUeXBlID0gKHZhbDogbWl4ZWQpOiBib29sZWFuICVjaGVja3MgPT5cbiAgdmFsID09PSBTdHJpbmdcbiAgfHwgdmFsID09PSBOdW1iZXJcbiAgfHwgdmFsID09PSBCb29sZWFuXG4gIHx8IHZhbCA9PT0gRnVuY3Rpb25cbiAgfHwgdmFsID09PSBBcnJheVxuXG5jb25zdCBjaGVja0J5VHlwZUNoZWNrOiBDaGVjazwnY2hlY2sgYnkgdHlwZSc+ID0gbmV3IENoZWNrKFxuICBpc0NoZWNrQnlUeXBlLFxuICAoKSA9PiAnc2hvbHVkIGNoZWNrIGJ5IHR5cGUnLFxuICAnY2hlY2sgYnkgdHlwZScpXG5jb25zdCBjaGVja0J5VHlwZTogUnVsZTwnY2hlY2sgYnkgdHlwZSc+ID0gbmV3IFJ1bGUoXG4gICdjaGVjayBieSB0eXBlJyxcbiAgKCkgPT4gJ3Nob2x1ZCBjaGVjayBieSB0eXBlJyxcbiAgW2NoZWNrQnlUeXBlQ2hlY2tdXG4pXG4iXX0=
});