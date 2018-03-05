var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { WindowInterruptSource } from './windowinterruptsource';
/*
 * An interrupt source on the storage event of Window.
 */
var StorageInterruptSource = (function (_super) {
    __extends(StorageInterruptSource, _super);
    function StorageInterruptSource(throttleDelay) {
        if (throttleDelay === void 0) { throttleDelay = 500; }
        return _super.call(this, 'storage', throttleDelay) || this;
    }
    /*
     * Checks to see if the event should be filtered.
     * @param event - The original event object.
     * @return True if the event should be filtered (don't cause an interrupt); otherwise, false.
     */
    StorageInterruptSource.prototype.filterEvent = function (event) {
        if (event.key.indexOf('ng2Idle.') >= 0 && event.key.indexOf('.expiry') >= 0) {
            return false;
        }
        return true;
    };
    return StorageInterruptSource;
}(WindowInterruptSource));
export { StorageInterruptSource };
//# sourceMappingURL=storageinterruptsource.js.map