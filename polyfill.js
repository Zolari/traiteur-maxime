// Polyfills pour navigateurs anciens (ES5)
// Compatible avec TV LG, PS Vita, navigateurs 2015+

// 1. Promise polyfill (simplifié)
if (typeof Promise === 'undefined') {
    window.Promise = function(executor) {
        var self = this;
        self.state = 'pending';
        self.value = undefined;
        self.callbacks = [];

        function resolve(value) {
            if (self.state !== 'pending') return;
            self.state = 'fulfilled';
            self.value = value;
            self.callbacks.forEach(function(cb) {
                if (cb.onFulfilled) cb.onFulfilled(value);
            });
        }

        function reject(reason) {
            if (self.state !== 'pending') return;
            self.state = 'rejected';
            self.value = reason;
            self.callbacks.forEach(function(cb) {
                if (cb.onRejected) cb.onRejected(reason);
            });
        }

        this.then = function(onFulfilled, onRejected) {
            return new Promise(function(resolve, reject) {
                self.callbacks.push({
                    onFulfilled: function(value) {
                        try {
                            var result = onFulfilled ? onFulfilled(value) : value;
                            resolve(result);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    onRejected: function(reason) {
                        try {
                            var result = onRejected ? onRejected(reason) : reason;
                            reject(result);
                        } catch (e) {
                            reject(e);
                        }
                    }
                });

                if (self.state === 'fulfilled' && onFulfilled) {
                    setTimeout(function() { onFulfilled(self.value); }, 0);
                }
                if (self.state === 'rejected' && onRejected) {
                    setTimeout(function() { onRejected(self.value); }, 0);
                }
            });
        };

        this.catch = function(onRejected) {
            return this.then(null, onRejected);
        };

        try {
            executor(resolve, reject);
        } catch (e) {
            reject(e);
        }
    };

    Promise.all = function(promises) {
        return new Promise(function(resolve, reject) {
            var results = [];
            var remaining = promises.length;

            if (remaining === 0) {
                resolve(results);
                return;
            }

            promises.forEach(function(promise, index) {
                Promise.resolve(promise).then(function(value) {
                    results[index] = value;
                    remaining--;
                    if (remaining === 0) {
                        resolve(results);
                    }
                }).catch(reject);
            });
        });
    };

    Promise.resolve = function(value) {
        return new Promise(function(resolve) {
            resolve(value);
        });
    };

    Promise.reject = function(reason) {
        return new Promise(function(resolve, reject) {
            reject(reason);
        });
    };
}

// 2. Fetch polyfill
if (typeof fetch === 'undefined') {
    window.fetch = function(url, options) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            var method = (options && options.method) || 'GET';

            xhr.open(method, url, true);

            // Headers
            if (options && options.headers) {
                for (var key in options.headers) {
                    if (options.headers.hasOwnProperty(key)) {
                        xhr.setRequestHeader(key, options.headers[key]);
                    }
                }
            }

            xhr.onload = function() {
                var response = {
                    ok: xhr.status >= 200 && xhr.status < 300,
                    status: xhr.status,
                    statusText: xhr.statusText,
                    url: url,
                    text: function() {
                        return Promise.resolve(xhr.responseText);
                    },
                    json: function() {
                        return Promise.resolve(JSON.parse(xhr.responseText));
                    },
                    headers: {
                        get: function(name) {
                            return xhr.getResponseHeader(name);
                        }
                    }
                };
                resolve(response);
            };

            xhr.onerror = function() {
                reject(new Error('Network error'));
            };

            xhr.send(options && options.body);
        });
    };
}

// 3. Object.assign polyfill
if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) {
                for (var nextKey in nextSource) {
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

// 4. Array.from polyfill
if (!Array.from) {
    Array.from = function(arrayLike) {
        var arr = [];
        for (var i = 0; i < arrayLike.length; i++) {
            arr.push(arrayLike[i]);
        }
        return arr;
    };
}

// 5. String.prototype.includes polyfill
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

// 6. Array.prototype.includes polyfill
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
        return this.indexOf(searchElement, fromIndex) !== -1;
    };
}

// 7. Array.prototype.find polyfill
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        for (var i = 0; i < this.length; i++) {
            if (predicate(this[i], i, this)) {
                return this[i];
            }
        }
        return undefined;
    };
}

// 8. Array.prototype.forEach polyfill (pour les NodeList)
if (!NodeList.prototype.forEach && Array.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

console.log('✅ Polyfills chargés pour navigateurs anciens');
