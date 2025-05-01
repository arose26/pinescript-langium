/**
 * Runtime wrapper for PineScript to JavaScript transpilation
 * This file provides JavaScript implementations of PineScript's built-in functions and methods
 */

// Import array functions
const {
    array_new_float,
    array_new_int,
    array_new_bool,
    array_new_string,
    array_push,
    array_pop,
    array_get,
    array_set,
    array_size,
    array_insert,
    array_remove,
    array_clear,
    array_copy,
    array_slice,
    array_fill,
    array_join,
    array_sort,
    array_reverse,
    array_indexOf,
    array_includes
} = require('./array-functions.js');

// Create namespace objects
const array = {
    new_float: array_new_float,
    new_int: array_new_int,
    new_bool: array_new_bool,
    new_string: array_new_string,
    push: array_push,
    pop: array_pop,
    get: array_get,
    set: array_set,
    size: array_size,
    insert: array_insert,
    remove: array_remove,
    clear: array_clear,
    copy: array_copy,
    slice: array_slice,
    fill: array_fill,
    join: array_join,
    sort: array_sort,
    reverse: array_reverse,
    indexOf: array_indexOf,
    includes: array_includes
};

// Add array methods to Array prototype for convenience
Array.prototype.push_back = function(value) {
    this.push(value);
    return this;
};

Array.prototype.pop_back = function() {
    return this.pop();
};

Array.prototype.size = function() {
    return this.length;
};

Array.prototype.copy = function() {
    return [...this];
};

Array.prototype.clear = function() {
    this.length = 0;
    return this;
};

Array.prototype.fill = function(value, size) {
    this.length = 0;
    for (let i = 0; i < size; i++) {
        this.push(value);
    }
    return this;
};

// Export all namespaces and functions
module.exports = {
    array
};
