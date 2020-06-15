"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Deque = exports.randomPick = exports.popFrom = exports.swap = exports.shuffle = void 0;
// Shuffle array in-place
function shuffle(array) {
    for (var i = 0; i < array.length; i++) {
        var pick = Math.floor(Math.random() * array.length); // [0 ~ 1)
        swap(array, i, pick);
    }
    return array;
}
exports.shuffle = shuffle;
function swap(array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
}
exports.swap = swap;
function popFrom(array, i) {
    return [array[i], array.slice(0, i).concat(array.slice(i + 1))];
}
exports.popFrom = popFrom;
function randomPick(array) {
    var pick = Math.floor(Math.random() * array.length);
    return array[pick];
}
exports.randomPick = randomPick;
var Deque = /** @class */ (function (_super) {
    __extends(Deque, _super);
    function Deque() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = this;
        console.log("123");
        _this = _super.apply(this, args) || this;
        return _this;
    }
    Deque.prototype.first = function () {
        return this[0];
    };
    Deque.prototype.last = function () {
        return this[this.length - 1];
    };
    return Deque;
}(Array));
exports.Deque = Deque;
