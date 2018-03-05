import { EventEmitter } from '@angular/core';
/*
 * A base for classes that act as a source for interrupts.
 */
var InterruptSource = (function () {
    function InterruptSource(attachFn, detachFn) {
        this.attachFn = attachFn;
        this.detachFn = detachFn;
        this.isAttached = false;
        this.onInterrupt = new EventEmitter();
    }
    /*
     * Attaches to the specified events on the specified source.
     */
    InterruptSource.prototype.attach = function () {
        if (!this.isAttached && this.attachFn) {
            this.attachFn(this);
        }
        this.isAttached = true;
    };
    /*
     * Detaches from the specified events on the specified source.
     */
    InterruptSource.prototype.detach = function () {
        if (this.isAttached && this.detachFn) {
            this.detachFn(this);
        }
        this.isAttached = false;
    };
    return InterruptSource;
}());
export { InterruptSource };
//# sourceMappingURL=interruptsource.js.map