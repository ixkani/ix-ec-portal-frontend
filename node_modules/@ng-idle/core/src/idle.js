import { EventEmitter, Injectable, Optional } from '@angular/core';
import { IdleExpiry } from './idleexpiry';
import { Interrupt } from './interrupt';
import { KeepaliveSvc } from './keepalivesvc';
import { LocalStorageExpiry } from './localstorageexpiry';
/*
 * Indicates the desired auto resume behavior.
 */
export var AutoResume;
(function (AutoResume) {
    /*
     * Auto resume functionality will be disabled.
     */
    AutoResume[AutoResume["disabled"] = 0] = "disabled";
    /*
     * Can resume automatically even if they are idle.
     */
    AutoResume[AutoResume["idle"] = 1] = "idle";
    /*
     * Can only resume automatically if they are not yet idle.
     */
    AutoResume[AutoResume["notIdle"] = 2] = "notIdle";
})(AutoResume || (AutoResume = {}));
/**
 * A service for detecting and responding to user idleness.
 */
var Idle = (function () {
    function Idle(expiry, keepaliveSvc) {
        this.expiry = expiry;
        this.idle = 20 * 60; // in seconds
        this.timeoutVal = 30; // in seconds
        this.autoResume = AutoResume.idle;
        this.interrupts = new Array;
        this.running = false;
        this.keepaliveEnabled = false;
        this.onIdleStart = new EventEmitter;
        this.onIdleEnd = new EventEmitter;
        this.onTimeoutWarning = new EventEmitter();
        this.onTimeout = new EventEmitter();
        this.onInterrupt = new EventEmitter;
        if (keepaliveSvc) {
            this.keepaliveSvc = keepaliveSvc;
            this.keepaliveEnabled = true;
        }
        this.setIdling(false);
    }
    /*
     * Sets the idle name for localStorage.
     * Important to set if multiple instances of Idle with LocalStorageExpiry
     * @param The name of the idle.
     */
    Idle.prototype.setIdleName = function (key) {
        if (this.expiry instanceof LocalStorageExpiry) {
            this.expiry.setIdleName(key);
        }
        else {
            throw new Error('Cannot set expiry key name because no LocalStorageExpiry has been provided.');
        }
    };
    /*
     * Returns whether or not keepalive integration is enabled.
     * @return True if integration is enabled; otherwise, false.
     */
    Idle.prototype.getKeepaliveEnabled = function () {
        return this.keepaliveEnabled;
    };
    /*
     * Sets and returns whether or not keepalive integration is enabled.
     * @param True if the integration is enabled; otherwise, false.
     * @return The current value.
     */
    Idle.prototype.setKeepaliveEnabled = function (value) {
        if (!this.keepaliveSvc) {
            throw new Error('Cannot enable keepalive integration because no KeepaliveSvc has been provided.');
        }
        return this.keepaliveEnabled = value;
    };
    /*
     * Returns the current timeout value.
     * @return The timeout value in seconds.
     */
    Idle.prototype.getTimeout = function () {
        return this.timeoutVal;
    };
    /*
     * Sets the timeout value.
     * @param seconds - The timeout value in seconds. 0 or false to disable timeout feature.
     * @return The current value. If disabled, the value will be 0.
     */
    Idle.prototype.setTimeout = function (seconds) {
        if (seconds === false) {
            this.timeoutVal = 0;
        }
        else if (typeof seconds === 'number' && seconds >= 0) {
            this.timeoutVal = seconds;
        }
        else {
            throw new Error('\'seconds\' can only be \'false\' or a positive number.');
        }
        return this.timeoutVal;
    };
    /*
     * Returns the current idle value.
     * @return The idle value in seconds.
     */
    Idle.prototype.getIdle = function () {
        return this.idle;
    };
    /*
     * Sets the idle value.
     * @param seconds - The idle value in seconds.
     * @return The idle value in seconds.
     */
    Idle.prototype.setIdle = function (seconds) {
        if (seconds <= 0) {
            throw new Error('\'seconds\' must be greater zero');
        }
        return this.idle = seconds;
    };
    /*
     * Returns the current autoresume value.
     * @return The current value.
     */
    Idle.prototype.getAutoResume = function () {
        return this.autoResume;
    };
    Idle.prototype.setAutoResume = function (value) {
        return this.autoResume = value;
    };
    /*
     * Sets interrupts from the specified sources.
     * @param sources - Interrupt sources.
     * @return The resulting interrupts.
     */
    Idle.prototype.setInterrupts = function (sources) {
        this.clearInterrupts();
        var self = this;
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            var sub = new Interrupt(source);
            sub.subscribe(function (args) {
                self.interrupt(args.force, args.innerArgs);
            });
            this.interrupts.push(sub);
        }
        return this.interrupts;
    };
    /*
     * Returns the current interrupts.
     * @return The current interrupts.
     */
    Idle.prototype.getInterrupts = function () {
        return this.interrupts;
    };
    /*
     * Pauses, unsubscribes, and clears the current interrupt subscriptions.
     */
    Idle.prototype.clearInterrupts = function () {
        for (var _i = 0, _a = this.interrupts; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.pause();
            sub.unsubscribe();
        }
        this.interrupts.length = 0;
    };
    /*
     * Returns whether or not the service is running i.e. watching for idleness.
     * @return True if service is watching; otherwise, false.
     */
    Idle.prototype.isRunning = function () {
        return this.running;
    };
    /*
     * Returns whether or not the user is considered idle.
     * @return True if the user is in the idle state; otherwise, false.
     */
    Idle.prototype.isIdling = function () {
        return this.idling;
    };
    /*
     * Starts watching for inactivity.
     */
    Idle.prototype.watch = function (skipExpiry) {
        var _this = this;
        this.safeClearInterval('idleHandle');
        this.safeClearInterval('timeoutHandle');
        var timeout = !this.timeoutVal ? 0 : this.timeoutVal;
        if (!skipExpiry) {
            var value = new Date(this.expiry.now().getTime() + ((this.idle + timeout) * 1000));
            this.expiry.last(value);
        }
        if (this.idling) {
            this.toggleState();
        }
        if (!this.running) {
            this.startKeepalive();
            this.toggleInterrupts(true);
        }
        this.running = true;
        var watchFn = function () {
            var diff = _this.getExpiryDiff(timeout);
            if (diff > 0) {
                _this.safeClearInterval('idleHandle');
                _this.idleHandle = setInterval(watchFn, diff);
            }
            else {
                _this.toggleState();
            }
        };
        this.idleHandle = setInterval(watchFn, this.idle * 1000);
    };
    /*
     * Stops watching for inactivity.
     */
    Idle.prototype.stop = function () {
        this.stopKeepalive();
        this.toggleInterrupts(false);
        this.safeClearInterval('idleHandle');
        this.safeClearInterval('timeoutHandle');
        this.setIdling(false);
        this.running = false;
        this.expiry.last(null);
    };
    /*
     * Forces a timeout event and state.
     */
    Idle.prototype.timeout = function () {
        this.stopKeepalive();
        this.toggleInterrupts(false);
        this.safeClearInterval('idleHandle');
        this.safeClearInterval('timeoutHandle');
        this.setIdling(true);
        this.running = false;
        this.countdown = 0;
        this.onTimeout.emit(null);
    };
    /*
     * Signals that user activity has occurred.
     * @param force - Forces watch to be called, unless they are timed out.
     * @param eventArgs - Optional source event arguments.
     */
    Idle.prototype.interrupt = function (force, eventArgs) {
        if (!this.running) {
            return;
        }
        if (this.timeoutVal && this.expiry.isExpired()) {
            this.timeout();
            return;
        }
        this.onInterrupt.emit(eventArgs);
        if (force === true || this.autoResume === AutoResume.idle ||
            (this.autoResume === AutoResume.notIdle && !this.expiry.idling())) {
            this.watch(force);
        }
    };
    Idle.prototype.setIdling = function (value) {
        this.idling = value;
        this.expiry.idling(value);
    };
    Idle.prototype.toggleState = function () {
        var _this = this;
        this.setIdling(!this.idling);
        if (this.idling) {
            this.onIdleStart.emit(null);
            this.stopKeepalive();
            if (this.timeoutVal > 0) {
                this.countdown = this.timeoutVal;
                this.doCountdown();
                this.timeoutHandle = setInterval(function () {
                    _this.doCountdown();
                }, 1000);
            }
        }
        else {
            this.toggleInterrupts(true);
            this.onIdleEnd.emit(null);
            this.startKeepalive();
        }
        this.safeClearInterval('idleHandle');
    };
    Idle.prototype.toggleInterrupts = function (resume) {
        for (var _i = 0, _a = this.interrupts; _i < _a.length; _i++) {
            var interrupt = _a[_i];
            if (resume) {
                interrupt.resume();
            }
            else {
                interrupt.pause();
            }
        }
    };
    Idle.prototype.getExpiryDiff = function (timeout) {
        var now = this.expiry.now();
        var last = this.expiry.last() || now;
        return last.getTime() - now.getTime() - (timeout * 1000);
    };
    Idle.prototype.doCountdown = function () {
        var timeout = !this.timeoutVal ? 0 : this.timeoutVal;
        var diff = this.getExpiryDiff(timeout);
        if (diff > 0) {
            this.safeClearInterval('timeoutHandle');
            this.interrupt(true);
            return;
        }
        if (!this.idling) {
            return;
        }
        if (this.countdown <= 0) {
            this.timeout();
            return;
        }
        this.onTimeoutWarning.emit(this.countdown);
        this.countdown--;
    };
    Idle.prototype.safeClearInterval = function (handleName) {
        if (this[handleName]) {
            clearInterval(this[handleName]);
            this[handleName] = null;
        }
    };
    Idle.prototype.startKeepalive = function () {
        if (!this.keepaliveSvc || !this.keepaliveEnabled) {
            return;
        }
        if (this.running) {
            this.keepaliveSvc.ping();
        }
        this.keepaliveSvc.start();
    };
    Idle.prototype.stopKeepalive = function () {
        if (!this.keepaliveSvc || !this.keepaliveEnabled) {
            return;
        }
        this.keepaliveSvc.stop();
    };
    /*
     * Called by Angular when destroying the instance.
     */
    Idle.prototype.ngOnDestroy = function () {
        this.stop();
        this.clearInterrupts();
    };
    return Idle;
}());
export { Idle };
Idle.decorators = [
    { type: Injectable },
];
/** @nocollapse */
Idle.ctorParameters = function () { return [
    { type: IdleExpiry, },
    { type: KeepaliveSvc, decorators: [{ type: Optional },] },
]; };
//# sourceMappingURL=idle.js.map