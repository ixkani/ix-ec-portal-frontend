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
export { IdleExpiry };
//# sourceMappingURL=idleexpiry.js.map