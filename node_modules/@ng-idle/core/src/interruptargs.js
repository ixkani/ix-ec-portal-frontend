/*
 * A class for expressing arguments to interrupt events.
 */
var InterruptArgs = (function () {
    function InterruptArgs(source, innerArgs, force) {
        if (force === void 0) { force = false; }
        this.source = source;
        this.innerArgs = innerArgs;
        this.force = force;
    }
    return InterruptArgs;
}());
export { InterruptArgs };
//# sourceMappingURL=interruptargs.js.map