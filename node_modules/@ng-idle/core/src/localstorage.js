import { Injectable } from '@angular/core';
import { AlternativeStorage } from './alternativestorage';
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
export { LocalStorage };
LocalStorage.decorators = [
    { type: Injectable },
];
/** @nocollapse */
LocalStorage.ctorParameters = function () { return []; };
//# sourceMappingURL=localstorage.js.map