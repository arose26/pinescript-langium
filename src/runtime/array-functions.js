/**
 * Runtime library for PineScript array functions
 * This file provides JavaScript implementations of PineScript's array functions
 */

// Array creation functions
function array_new_float(size = 0, initialValue = 0.0) {
    return new Array(size).fill(initialValue);
}

function array_new_int(size = 0, initialValue = 0) {
    return new Array(size).fill(initialValue);
}

function array_new_bool(size = 0, initialValue = false) {
    return new Array(size).fill(initialValue);
}

function array_new_string(size = 0, initialValue = '') {
    return new Array(size).fill(initialValue);
}

// Array manipulation functions
function array_push(arr, value) {
    arr.push(value);
    return arr;
}

function array_pop(arr) {
    if (arr.length === 0) {
        return null;
    }
    return arr.pop();
}

function array_get(arr, index) {
    if (index < 0 || index >= arr.length) {
        return null;
    }
    return arr[index];
}

function array_set(arr, index, value) {
    if (index < 0 || index >= arr.length) {
        return arr;
    }
    arr[index] = value;
    return arr;
}

function array_size(arr) {
    return arr.length;
}

function array_insert(arr, index, value) {
    if (index < 0 || index > arr.length) {
        return arr;
    }
    arr.splice(index, 0, value);
    return arr;
}

function array_remove(arr, index) {
    if (index < 0 || index >= arr.length) {
        return arr;
    }
    arr.splice(index, 1);
    return arr;
}

function array_clear(arr) {
    arr.length = 0;
    return arr;
}

function array_copy(arr) {
    return [...arr];
}

function array_slice(arr, start, end) {
    return arr.slice(start, end);
}

function array_fill(arr, value, size) {
    arr.length = 0;
    for (let i = 0; i < size; i++) {
        arr.push(value);
    }
    return arr;
}

function array_join(arr, separator) {
    return arr.join(separator);
}

function array_sort(arr) {
    return [...arr].sort((a, b) => a - b);
}

function array_reverse(arr) {
    return [...arr].reverse();
}

function array_indexOf(arr, value) {
    return arr.indexOf(value);
}

function array_includes(arr, value) {
    return arr.includes(value);
}

// Export all functions
module.exports = {
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
};
