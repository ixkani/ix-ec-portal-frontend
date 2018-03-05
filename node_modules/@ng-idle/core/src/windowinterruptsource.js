var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { EventTargetInterruptSource } from './eventtargetinterruptsource';
/*
 * An interrupt source on the Window object.
 */
var WindowInterruptSource = (function (_super) {
    __extends(WindowInterruptSource, _super);
    function WindowInterruptSource(events, throttleDelay) {
        if (throttleDelay === void 0) { throttleDelay = 500; }
        return _super.call(this, window, events, throttleDelay) || this;
    }
    return WindowInterruptSource;
}(EventTargetInterruptSource));
export { WindowInterruptSource };
//# sourceMappingURL=windowinterruptsource.js.map