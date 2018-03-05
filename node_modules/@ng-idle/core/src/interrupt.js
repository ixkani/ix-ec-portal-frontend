/*
 * A class for managing an interrupt from an interrupt source.
 */
var Interrupt = (function () {
    function Interrupt(source) {
        this.source = source;
    }
    /*
     * Subscribes to the interrupt using the specified function.
     * @param fn - The subscription function.
     */
    Interrupt.prototype.subscribe = function (fn) {
        this.sub = this.source.onInterrupt.subscribe(fn);
    };
    /*
     * Unsubscribes the interrupt.
     */
    Interrupt.prototype.unsubscribe = function () {
        this.sub.unsubscribe();
        this.sub = null;
    };
    /*
     * Keeps the subscription but resumes interrupt events.
     */
    Interrupt.prototype.resume = function () {
        this.source.attach();
    };
    /*
     * Keeps the subscription but pauses interrupt events.
     */
    Interrupt.prototype.pause = function () {
        this.source.detach();
    };
    return Interrupt;
}());
export { Interrupt };
//# sourceMappingURL=interrupt.js.map