var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/observable/fromEvent';
import { Observable } from 'rxjs/Observable';
import { InterruptArgs } from './interruptargs';
import { InterruptSource } from './interruptsource';
/*
 * An interrupt source on an EventTarget object, such as a Window or HTMLElement.
 */
var EventTargetInterruptSource = (function (_super) {
    __extends(EventTargetInterruptSource, _super);
    function EventTargetInterruptSource(target, events, throttleDelay) {
        if (throttleDelay === void 0) { throttleDelay = 500; }
        var _this = _super.call(this, null, null) || this;
        _this.target = target;
        _this.events = events;
        _this.throttleDelay = throttleDelay;
        _this.eventSrc = new Array;
        _this.eventSubscription = new Array;
        var self = _this;
        events.split(' ').forEach(function (event) {
            var src = Observable.fromEvent(target, event);
            if (self.throttleDelay > 0) {
                src = src.throttleTime(self.throttleDelay);
            }
            self.eventSrc.push(src);
        });
        var handler = function (innerArgs) {
            if (self.filterEvent(innerArgs)) {
                return;
            }
            var args = new InterruptArgs(this, innerArgs);
            self.onInterrupt.emit(args);
        };
        _this.attachFn = function () {
            _this.eventSrc.forEach(function (src) {
                self.eventSubscription.push(src.subscribe(handler));
            });
        };
        _this.detachFn = function () {
            _this.eventSubscription.forEach(function (sub) {
                sub.unsubscribe();
            });
            _this.eventSubscription.length = 0;
        };
        return _this;
    }
    /*
     * Checks to see if the event should be filtered. Always returns false unless overriden.
     * @param event - The original event object.
     * @return True if the event should be filtered (don't cause an interrupt); otherwise, false.
     */
    EventTargetInterruptSource.prototype.filterEvent = function (event) {
        return false;
    };
    return EventTargetInterruptSource;
}(InterruptSource));
export { EventTargetInterruptSource };
//# sourceMappingURL=eventtargetinterruptsource.js.map