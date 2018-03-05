(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs/add/operator/throttleTime'), require('rxjs/add/observable/fromEvent'), require('rxjs/Observable'), require('@angular/core')) :
    typeof define === 'function' && define.amd ? define(['exports', 'rxjs/add/operator/throttleTime', 'rxjs/add/observable/fromEvent', 'rxjs/Observable', '@angular/core'], factory) :
    (factory((global.ngidle = global.ngidle || {}, global.ngidle.core = global.ngidle.core || {}),global.rxjs_add_operator_throttleTime,global.rxjs_add_observable_fromEvent,global.rxjs_Observable,global.ng.core));
}(this, (function (exports,rxjs_add_operator_throttleTime,rxjs_add_observable_fromEvent,rxjs_Observable,_angular_core) { 'use strict';

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

/*
 * A base for classes that act as a source for interrupts.
 */
var InterruptSource = (function () {
    function InterruptSource(attachFn, detachFn) {
        this.attachFn = attachFn;
        this.detachFn = detachFn;
        this.isAttached = false;
        this.onInterrupt = new _angular_core.EventEmitter();
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

var __extends$1 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * An interrupt source on an EventTarget object, such as a Window or HTMLElement.
 */
var EventTargetInterruptSource = (function (_super) {
    __extends$1(EventTargetInterruptSource, _super);
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
            var src = rxjs_Observable.Observable.fromEvent(target, event);
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

var __extends = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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

var __extends$3 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * An interrupt source on the Window object.
 */
var WindowInterruptSource = (function (_super) {
    __extends$3(WindowInterruptSource, _super);
    function WindowInterruptSource(events, throttleDelay) {
        if (throttleDelay === void 0) { throttleDelay = 500; }
        return _super.call(this, window, events, throttleDelay) || this;
    }
    return WindowInterruptSource;
}(EventTargetInterruptSource));

var __extends$2 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * An interrupt source on the storage event of Window.
 */
var StorageInterruptSource = (function (_super) {
    __extends$2(StorageInterruptSource, _super);
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

/*
 * Represents a base class for types that provide expiry detection for the Idle service.
 */
var IdleExpiry = (function () {
    function IdleExpiry() {
        this.idValue = new Date();
        this.idlingValue = false;
    }
    /*
     * Gets or sets a unique ID for the window
     * @param id - The id.
     * @return The current id.
     */
    IdleExpiry.prototype.id = function (value) {
        if (value !== void 0) {
            if (!value) {
                throw new Error('A value must be specified for the ID.');
            }
            this.idValue = value;
        }
        return this.idValue;
    };
    /*
     * Gets or sets the idling value.
     * @param value - The value to set.
     * @return The idling value.
     */
    IdleExpiry.prototype.idling = function (value) {
        if (value !== void 0) {
            this.idlingValue = value;
        }
        return this.idlingValue;
    };
    /*
     * Returns the current Date.
     * @return The current Date.
     */
    IdleExpiry.prototype.now = function () {
        return new Date();
    };
    /*
     * Returns whether or not it is expired.
     * @return True if expired; otherwise, false.
     */
    IdleExpiry.prototype.isExpired = function () {
        var expiry = this.last();
        return expiry != null && expiry <= this.now();
    };
    return IdleExpiry;
}());

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

var KeepaliveSvc = (function () {
    function KeepaliveSvc() {
    }
    return KeepaliveSvc;
}());

/*
 * Represents an alternative storage for browser that doesn't support localstorage. (i.e. Safari in
 * private mode)
 * @implements Storage
 */
var AlternativeStorage = (function () {
    function AlternativeStorage() {
        this.storageMap = {};
    }
    Object.defineProperty(AlternativeStorage.prototype, "length", {
        /*
         * Returns an integer representing the number of data items stored in the storageMap object.
         */
        get: function () {
            return Object.keys(this.storageMap).length;
        },
        enumerable: true,
        configurable: true
    });
    /*
     * Remove all keys out of the storage.
     */
    AlternativeStorage.prototype.clear = function () {
        this.storageMap = {};
    };
    /*
     * Return the key's value
     *
     * @param key - name of the key to retrieve the value of.
     * @return The key's value
     */
    AlternativeStorage.prototype.getItem = function (key) {
        if (typeof this.storageMap[key] !== 'undefined') {
            return this.storageMap[key];
        }
        return null;
    };
    /*
     * Return the nth key in the storage
     *
     * @param index - the number of the key you want to get the name of.
     * @return The name of the key.
     */
    AlternativeStorage.prototype.key = function (index) {
        return Object.keys(this.storageMap)[index] || null;
    };
    /*
     * Remove a key from the storage.
     *
     * @param key - the name of the key you want to remove.
     */
    AlternativeStorage.prototype.removeItem = function (key) {
        this.storageMap[key] = undefined;
    };
    /*
     * Add a key to the storage, or update a key's value if it already exists.
     *
     * @param key - the name of the key.
     * @param value - the value you want to give to the key.
     */
    AlternativeStorage.prototype.setItem = function (key, value) {
        this.storageMap[key] = value;
    };
    return AlternativeStorage;
}());

/*
 * Represents a localStorage store.
 */
var LocalStorage = (function () {
    function LocalStorage() {
        this.storage = this.getStorage();
    }
    /*
     * Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem
     * throw QuotaExceededError. We're going to detect this and just silently drop any calls to
     * setItem
     * to avoid the entire page breaking, without having to do a check at each usage of Storage.
     */
    LocalStorage.prototype.getStorage = function () {
        try {
            var storage = localStorage;
            storage.setItem('ng2IdleStorage', '');
            storage.removeItem('ng2IdleStorage');
            return storage;
        }
        catch (err) {
            return new AlternativeStorage();
        }
    };
    /*
     * Gets an item in the storage.
     *
     * @param value - The value to get.
     * @return The current value.
     */
    LocalStorage.prototype.getItem = function (key) {
        return this.storage.getItem('ng2Idle.' + key);
    };
    /*
     * Removes an item in the storage.
     *
     * @param value - The value to remove.
     */
    LocalStorage.prototype.removeItem = function (key) {
        this.storage.removeItem('ng2Idle.' + key);
    };
    /*
     * Sets an item in the storage.
     *
     * @param key - The key to set the value.
     * @param value - The value to set to the key.
     */
    LocalStorage.prototype.setItem = function (key, data) {
        this.storage.setItem('ng2Idle.' + key, data);
    };
    /*
     * Represents the storage, commonly use for testing purposes.
     *
     * @param key - The key to set the value.
     * @param value - The value to set to the key.
     */
    LocalStorage.prototype._wrapped = function () {
        return this.storage;
    };
    return LocalStorage;
}());
LocalStorage.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
LocalStorage.ctorParameters = function () { return []; };

var __extends$4 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * Represents a localStorage store of expiry values.
 * @extends IdleExpiry
 */
var LocalStorageExpiry = (function (_super) {
    __extends$4(LocalStorageExpiry, _super);
    function LocalStorageExpiry(localStorage) {
        var _this = _super.call(this) || this;
        _this.localStorage = localStorage;
        _this.idleName = 'main';
        return _this;
    }
    /*
     * Gets or sets the last expiry date in localStorage.
     * If localStorage doesn't work correctly (i.e. Safari in private mode), we store the expiry value in memory.
     * @param value - The expiry value to set; omit to only return the value.
     * @return The current expiry value.
     */
    LocalStorageExpiry.prototype.last = function (value) {
        if (value !== void 0) {
            this.setExpiry(value);
        }
        return this.getExpiry();
    };
    LocalStorageExpiry.prototype.idling = function (value) {
        if (value !== void 0) {
            this.setIdling(value);
        }
        return this.getIdling();
    };
    /*
     * Gets the idle name.
     * @return The name of the idle.
     */
    LocalStorageExpiry.prototype.getIdleName = function () {
        return this.idleName;
    };
    /*
     * Sets the idle name.
     * @param The name of the idle.
     */
    LocalStorageExpiry.prototype.setIdleName = function (key) {
        if (key) {
            this.idleName = key;
        }
    };
    LocalStorageExpiry.prototype.getExpiry = function () {
        var expiry = this.localStorage.getItem(this.idleName + '.expiry');
        if (expiry) {
            return new Date(parseInt(expiry, 10));
        }
        else {
            return null;
        }
    };
    LocalStorageExpiry.prototype.setExpiry = function (value) {
        if (value) {
            this.localStorage.setItem(this.idleName + '.expiry', value.getTime().toString());
        }
        else {
            this.localStorage.removeItem(this.idleName + '.expiry');
        }
    };
    LocalStorageExpiry.prototype.getIdling = function () {
        var idling = this.localStorage.getItem(this.idleName + '.idling');
        if (idling) {
            return idling === 'true';
        }
        else {
            return false;
        }
    };
    LocalStorageExpiry.prototype.setIdling = function (value) {
        if (value) {
            this.localStorage.setItem(this.idleName + '.idling', value.toString());
        }
        else {
            this.localStorage.setItem(this.idleName + '.idling', 'false');
        }
    };
    return LocalStorageExpiry;
}(IdleExpiry));
LocalStorageExpiry.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
LocalStorageExpiry.ctorParameters = function () { return [
    { type: LocalStorage, },
]; };

/*
 * Indicates the desired auto resume behavior.
 */

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
})(exports.AutoResume || (exports.AutoResume = {}));
/**
 * A service for detecting and responding to user idleness.
 */
var Idle = (function () {
    function Idle(expiry, keepaliveSvc) {
        this.expiry = expiry;
        this.idle = 20 * 60; // in seconds
        this.timeoutVal = 30; // in seconds
        this.autoResume = exports.AutoResume.idle;
        this.interrupts = new Array;
        this.running = false;
        this.keepaliveEnabled = false;
        this.onIdleStart = new _angular_core.EventEmitter;
        this.onIdleEnd = new _angular_core.EventEmitter;
        this.onTimeoutWarning = new _angular_core.EventEmitter();
        this.onTimeout = new _angular_core.EventEmitter();
        this.onInterrupt = new _angular_core.EventEmitter;
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
        if (force === true || this.autoResume === exports.AutoResume.idle ||
            (this.autoResume === exports.AutoResume.notIdle && !this.expiry.idling())) {
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
Idle.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
Idle.ctorParameters = function () { return [
    { type: IdleExpiry, },
    { type: KeepaliveSvc, decorators: [{ type: _angular_core.Optional },] },
]; };

var __extends$5 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * Represents a simple in-memory store of expiry values.
 * @extends IdleExpiry
 */
var SimpleExpiry = (function (_super) {
    __extends$5(SimpleExpiry, _super);
    function SimpleExpiry() {
        var _this = _super.call(this) || this;
        _this.lastValue = null;
        return _this;
    }
    /*
     * Gets or sets the last expiry date.
     * @param value - The expiry value to set; omit to only return the value.
     * @return The current expiry value.
     */
    SimpleExpiry.prototype.last = function (value) {
        if (value !== void 0) {
            this.lastValue = value;
        }
        return this.lastValue;
    };
    return SimpleExpiry;
}(IdleExpiry));

var NgIdleModule = (function () {
    function NgIdleModule() {
    }
    NgIdleModule.forRoot = function () {
        return {
            ngModule: NgIdleModule,
            providers: [LocalStorageExpiry, { provide: IdleExpiry, useExisting: LocalStorageExpiry }, Idle]
        };
    };
    return NgIdleModule;
}());
NgIdleModule.decorators = [
    { type: _angular_core.NgModule, args: [{
                providers: [LocalStorage]
            },] },
];
/** @nocollapse */
NgIdleModule.ctorParameters = function () { return []; };

var DEFAULT_INTERRUPTSOURCES = [new DocumentInterruptSource('mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll'), new StorageInterruptSource()];

exports.DEFAULT_INTERRUPTSOURCES = DEFAULT_INTERRUPTSOURCES;
exports.NgIdleModule = NgIdleModule;
exports.Idle = Idle;
exports.InterruptArgs = InterruptArgs;
exports.InterruptSource = InterruptSource;
exports.EventTargetInterruptSource = EventTargetInterruptSource;
exports.DocumentInterruptSource = DocumentInterruptSource;
exports.WindowInterruptSource = WindowInterruptSource;
exports.StorageInterruptSource = StorageInterruptSource;
exports.KeepaliveSvc = KeepaliveSvc;
exports.IdleExpiry = IdleExpiry;
exports.SimpleExpiry = SimpleExpiry;
exports.LocalStorage = LocalStorage;
exports.LocalStorageExpiry = LocalStorageExpiry;

Object.defineProperty(exports, '__esModule', { value: true });

})));
