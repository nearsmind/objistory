/**
 This utils are created by Leclerc Kevin (leclerc.kevin@gmail.com)
 You can use this utils to simulate history on an object and apply the history on another object.
 */
var objistory = (function () {
    "use strict";

    const ADD = 'add',
        DELETE = 'delete',
        SET = 'set',
        SETARRAY = 'setarray',
        BEGINING_OF_TIME = 0,
        END_OF_TIME = -1;

    function historize(objToHistorize, keepOldValue) {
        var _changesHistory = {},
            _lastChangeId,
            _workingObj = objToHistorize,
            _keepOldValue = getBool(keepOldValue) || false;

        //initialize if the prop don't exists
        (function () {
            if (!_workingObj._oioh_version) {
                _workingObj._oioh_version = 0;
            }

            _lastChangeId = _workingObj._oioh_version;
        })();

        function isString(item) {
            return (typeof item === "string");
        }

        function isInteger(value) {
            return typeof value === "number" &&
                isFinite(value) &&
                Math.floor(value) === value;
        }

        function isObject(item) {
            return (typeof item === "object" && !Array.isArray(item) && item !== null);
        }

        function isTrueObject(item) {
            return (Object.prototype.toString.call(item) === '[object Object]');
        }

        function getBool(val) {
            if (val === undefined) {
                return false;
            }

            var num = +val;
            return !isNaN(num) ? !!num : !!String(val).toLowerCase().replace(!!0, '');
        }

        /**
         * Get the value of the data object
         * @param prop
         * @param defaultValue
         * @returns {*}
         */
        function get(prop, defaultValue) {
            if (!prop || !isString(prop) || !prop.trim().length > 0) {
                return;
            }

            var props = prop.split('.'),
                lastObj = _workingObj;

            if (props && props.length > 1) {
                //run into the object to got the value of prop
                for (var key in props) {
                    lastObj = lastObj[props[key]];
                }
            } else {
                lastObj = _workingObj[props[0]];
            }

            if (!lastObj && defaultValue) {
                return defaultValue;
            }

            return lastObj;
        }

        /**
         * add the operation on history
         * @param operation
         * @param prop
         * @param oldValue
         * @param newValue
         */
        function historizeOperation(operation, prop, oldValue, newValue) {
            if (_lastChangeId > _workingObj._oioh_version) {
                for (var i = _lastChangeId; i > _workingObj._oioh_version; i--) {
                    delete _changesHistory[i];
                }
            }

            _workingObj._oioh_version++;
            _lastChangeId = _workingObj._oioh_version;

            if (_keepOldValue) {
                oldValue = extendValue(oldValue);
            }

            newValue = extendValue(newValue);

            _changesHistory[_workingObj._oioh_version] = {
                operation: operation,
                prop: prop,
                oldValue: oldValue,
                newValue: newValue
            };
        }

        function upd(operation, prop, value, isNotToHistorize, objToUse) {
            if (!prop || !isString(prop) || !prop.trim().length > 0) {
                return;
            }

            value = extendValue(value);

            var lastObj = objToUse || _workingObj,
                parent,
                props = prop.split('.'),
                key = 0, propToUse;

            if (props && props.length > 1) {
                //run into the object to got the value of prop
                for (var i = 0; i < props.length - 1; i++) {
                    if (isTrueObject(lastObj[props[i]]) || Array.isArray(lastObj[props[i]])) {
                        parent = lastObj;
                        lastObj = lastObj[props[i]];
                    }
                }

                propToUse = props[props.length - 1];
            } else {
                propToUse = props[0];
            }

            switch (operation) {
                case SET : set(parent, lastObj, propToUse, prop, value, isNotToHistorize); break;
                case SETARRAY : setArray(parent, lastObj, propToUse, prop, value, isNotToHistorize); break;
                case ADD : add(parent, lastObj, propToUse, prop, value, isNotToHistorize); break;
                case DELETE : del(parent, lastObj, propToUse, prop, value, isNotToHistorize); break;
            }
        }

        /**
         * Set the value of the data object
         * @param parent
         * @param obj
         * @param propToUse
         * @param prop
         * @param value
         * @param isNotToHistorize
         */
        function set(parent, obj, propToUse, prop, value, isNotToHistorize) {
            if (isInteger(Number(propToUse)) && Array.isArray(parent)) {
                obj = parent;
            }

            if (!getBool(isNotToHistorize)) {
                historizeOperation(SET, prop, obj[propToUse], value);
            }

            obj[propToUse] = value;
        }

        /**
         * Set an array value of the data object
         * @param parent
         * @param obj
         * @param propToUse
         * @param prop
         * @param value
         * @param isNotToHistorize
         */
        function setArray(parent, obj, propToUse, prop, value, isNotToHistorize) {
            if (isInteger(Number(propToUse)) && Array.isArray(parent)) {
                obj = parent;
            }

            if (!getBool(isNotToHistorize)) {
                historizeOperation(SETARRAY, prop, obj[propToUse], value);
            }

            obj[propToUse] = [];

            if (value) {
                value.forEach(function setValues(v, position) {
                    obj[propToUse].push(v);
                });
            }
        }

        /**
         * add a property to an object
         * @param parent
         * @param obj
         * @param propToUse
         * @param prop
         * @param value
         * @param isNotToHistorize
         */
        function add(parent, obj, propToUse, prop, value, isNotToHistorize) {
            if (!getBool(isNotToHistorize)) {
                historizeOperation(ADD, prop, obj[propToUse], value);
            }

            if (obj[propToUse] && Array.isArray(obj[propToUse])) {
                if (Array.isArray(value)) {
                    value.forEach(function setValues(v, position) {
                        obj[propToUse].push(v);
                    });
                } else {
                    obj[propToUse].push(value);
                }
            } else if (Array.isArray(value)) {
                if (!obj[propToUse]) {
                    obj[propToUse] = [];
                }

                value.forEach(function setValues(v, position) {
                    obj[propToUse].push(v);
                });
            } else {
                obj[propToUse] = value;
            }
        }

        /**
         * delete a property from an object
         * @param parent
         * @param obj
         * @param propToUse
         * @param prop
         * @param objToDelete
         * @param isNotToHistorize
         */
        function del(parent, obj, propToUse, prop, objToDelete, isNotToHistorize) {
            if (!getBool(isNotToHistorize)) {
                historizeOperation(DELETE, prop, obj[propToUse], objToDelete);
            }

            if (obj[propToUse]) {
                if (Array.isArray(obj[propToUse]) && objToDelete) {
                    var idx = -1;

                    if (isObject(objToDelete)) {
                        idx = obj[propToUse].indexOf(objToDelete);
                    } else {
                        idx = objToDelete;
                    }

                    obj[propToUse].splice(idx, 1);
                } else {
                    delete obj[propToUse];
                }
            }
        }

        /**
         * Clone an object
         * @param   {Boolean} deep     [[Description]]
         * @param   {Object} [out={}] [[Description]]
         * @returns {Object} [[Description]]
         */
        function extend(deep, out) {
            out = out || {};

            for (var i = 2; i < arguments.length; i++) {
                if (!arguments[i]) {
                    continue;
                }

                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key)) {
                        if (Object.prototype.toString.call(arguments[i][key]) === '[object Object]') {
                            if (deep) {
                                out[key] = extend(deep, out[key], arguments[i][key]);
                            }
                        } else if (Array.isArray(arguments[i][key])) {
                            out[key] = [];

                            extendArray(deep, out[key], arguments[i][key]);
                        } else {
                            out[key] = extendSimpleValue(arguments[i][key]);
                        }
                    }
                }
            }

            return out;
        }

        /**
         *
         * @param arg
         * @returns {*}
         */
        function extendSimpleValue(arg) {
            if (typeof arg === "object") {
                if (Object.prototype.toString.call(arg) === '[object Date]') {
                    return new Date((arg).getTime());
                } else if (Object.prototype.toString.call(arg) === '[object String]') {
                    return new String((arg).toString());
                } else if (Object.prototype.toString.call(arg) === '[object Number]') {
                    return new Number((arg).toString());
                } else if (Object.prototype.toString.call(arg) === '[object Boolean]') {
                    return new Boolean(getBool(arg));
                }
            }

            return arg;
        }

        /**
         * Clone an array
         * @param {Boolean} deep     [[Description]]
         * @param {Object} out      [[Description]]
         * @param {Object} objArray [[Description]]
         */
        function extendArray(deep, out, objArray) {
            objArray.forEach(function runIntoArray(obj, pos) {

                if (Object.prototype.toString.call(obj) === '[object Object]') {
                    if (deep) {
                        out[pos] = extend(deep, out[pos], obj);
                    }
                } else if (Array.isArray(obj)) {
                    out[pos] = [];

                    extendArray(deep, out[pos], obj);
                } else {
                    out[pos] = obj;
                }
            });
        }

        function traceHistory() {
            console.log(_changesHistory);
        }

        /**
         * restore the history
         * @param restorePoint
         * @param inputObject
         */
        function restoreAt(restorePoint, inputObject) {
            var i, to, history, objToRestore;

            objToRestore = (inputObject ? inputObject : _workingObj);

            if (restorePoint && isInteger(restorePoint)) {
                to = restorePoint;
            } else {
                to = BEGINING_OF_TIME;
            }

            for (i = objToRestore._oioh_version; i > to; i--) {
                history = _changesHistory[i];

                if (history) {
                    switch (history.operation) {
                        case SET :
                            upd(SET, history.prop, history.oldValue, true, objToRestore);
                            break;
                        case SETARRAY :
                            upd(SETARRAY, history.prop, history.oldValue, true, objToRestore);
                            break;
                        case ADD :
                            if (isObject(history.oldValue) || Array.isArray(history.oldValue)) {
                                upd(SET, history.prop, history.oldValue, true, objToRestore)
                            } else {
                                upd(DELETE, history.prop, history.newValue, true, objToRestore);
                            }
                            break;
                        case DELETE :
                            upd(ADD, history.prop, history.oldValue, true, objToRestore);
                            break;
                    }
                }
            }

            objToRestore._oioh_version = to;
        }

        function extendValue(oldValue) {
            if (isTrueObject(oldValue)) {
                return extend(true, {}, oldValue);
            } else if (Array.isArray(oldValue)) {
                return extend(true, [], oldValue);
            } else if (isObject(oldValue)) {
                return extendSimpleValue(oldValue);
            }

            return oldValue;
        }

        /**
         * apply the history on another object
         * @param inputObject if undefined, use the working object
         * @param stopAt
         * @param startAt
         */
        function applyOn(inputObject, stopAt, startAt) {
            var i, from, to, history, objToApply;

            objToApply = (inputObject ? inputObject : _workingObj);

            if (startAt && isInteger(startAt)) {
                if (startAt === END_OF_TIME) {
                    from = objToApply._oioh_version;
                } else {
                    from = (startAt > 0 ? startAt : BEGINING_OF_TIME);
                }
            } else {
                from = objToApply._oioh_version || BEGINING_OF_TIME;
            }

            if (stopAt && isInteger(stopAt) && stopAt > 0 && stopAt < _lastChangeId) {
                to = stopAt;
            } else {
                to = _lastChangeId;
            }

            for (i = from; i <= to; i++) {
                history = _changesHistory[i];

                if (history) {
                    switch (history.operation) {
                        case SET :
                            upd(SET, history.prop, history.newValue, true, objToApply);
                            break;
                        case SETARRAY :
                            upd(SETARRAY, history.prop, history.newValue, true, objToApply);
                            break;
                        case ADD :
                            upd(ADD, history.prop, history.newValue, true, objToApply);
                            break;
                        case DELETE :
                            upd(DELETE, history.prop, history.newValue, true, objToApply);
                            break;
                    }
                }
            }

            objToApply._oioh_version = to;
        }

        function changeObjectToHistorize(newObjToHistorize) {
            _workingObj = newObjToHistorize;
        }

        return {
            get: get,
            upd: upd,
            traceHistory: traceHistory,
            applyOn: applyOn,
            restoreAt: restoreAt,
            changeObjectToHistorize: changeObjectToHistorize,
            extendValue: extendValue
        };
    }

    return {
        historize: historize,
        BEGINING_OF_TIME: BEGINING_OF_TIME,
        END_OF_TIME: END_OF_TIME,
        SET: SET,
        SETARRAY: SETARRAY,
        ADD: ADD,
        DELETE: DELETE
    }
}());
