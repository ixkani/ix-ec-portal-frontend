var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { EventTargetInterruptSource } from './eventtargetinterruptsource';
/*
 * An interrupt source that uses events on the document element (html tag).
 */
var DocumentInterruptSource = (function (_super) {
    __extends(DocumentInterruptSource, _super);
    function DocumentInterruptSource(events, throttleDelay) {
        if (throttleDelay === void 0) { throttleDelay = 500; }
        return _super.call(this, document.documentElement, events, throttleDelay) || this;
    }
    /*
     * Checks to see if the event should be filtered.
     * @param event - The original event object.
     * @return True if the event should be filtered (don't cause an interrupt); otherwise, false.
     */
    DocumentInterruptSource.prototype.filterEvent = function (event) {
        // some browser bad input hacks
        if (event.type === 'mousemove'
            && ((event.originalEvent && event.originalEvent.movementX === 0 &&
                event.originalEvent.movementY === 0)
                || (event.movementX !== void 0 && !event.movementX || !event.movementY))) {
            return true;
        }
        return false;
    };
    return DocumentInterruptSource;
}(EventTargetInterruptSource));
export { DocumentInterruptSource };
//# sourceMappingURL=documentinterruptsource.js.map