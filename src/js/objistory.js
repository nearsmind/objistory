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

    var operations = {
        ADD: ADD,
        DELETE: DELETE,
        SET: SET,
        SETARRAY: SETARRAY
    };

    function isString(item) {
        return (typeof item === "string");
    }

    function isInteger(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
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

    function extendValue(value) {
        if (isTrueObject(value)) {
            return extend(true, {}, value);
        } else if (Array.isArray(value)) {
            return extend(true, [], value);
        } else if (isObject(value)) {
            return extendSimpleValue(value);
        }

        return value;
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
            switch (Object.prototype.toString.call(arg)) {
                case '[object Date]' : return new Date(arg.valueOf());
                case '[object String]' : return new String(arg.valueOf());
                case '[object Number]' : return new Number(arg.valueOf());
                case '[object Boolean]' : return new Boolean(arg.valueOf());
                case '[object RegExp]' : return new RegExp(arg.valueOf());
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

        function getPropertyValueHistory(prop) {
            var values = [],
                change,
                lastChange,
                i;

            for (i = 1; i < _lastChangeId; i++) {
                change = _changesHistory[i];

                if (change.prop === prop) {
                    lastChange = change;
                    values.push(
                        {
                            value: change.oldValue,
                            moment: change.moment
                        });
                }
            }

            if (lastChange && lastChange.operation !== DELETE) {
                values.push(
                    {
                        value: change.newValue,
                        moment: change.moment
                    }
                );
            }

            if (values.length > 0 && !values[0].value) {
                 values.splice(0, 1);
            }

            return extendValue(values);
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

            return (!lastObj && defaultValue ? defaultValue : lastObj);
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

            _lastChangeId = ++_workingObj._oioh_version;

            _changesHistory[_workingObj._oioh_version] = {
                operation: operation,
                prop: prop,
                oldValue: (_keepOldValue ? extendValue(oldValue) : undefined),
                newValue: extendValue(newValue),
                moment: (new Date().valueOf())
            };
        }

        function add(prop, value, isNotToHistorize, objToUse) {
            upd(ADD, prop, value, isNotToHistorize, objToUse);
        }

        function set(prop, value, isNotToHistorize, objToUse) {
            upd(SET, prop, value, isNotToHistorize, objToUse);
        }

        function setarray(prop, value, isNotToHistorize, objToUse) {
            upd(SETARRAY, prop, value, isNotToHistorize, objToUse);
        }

        function del(prop, value, isNotToHistorize, objToUse) {
            upd(DELETE, prop, value, isNotToHistorize, objToUse);
        }

        function upd(operation, prop, value, isNotToHistorize, objToUse) {
            if (!prop || !isString(prop) || !prop.trim().length > 0) {
                return;
            }

            value = extendValue(value);

            var lastObj = objToUse || _workingObj,
                parent,
                props = prop.split('.'),
                propToUse;

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
                case SET : setValue(parent, lastObj, propToUse, prop, value, isNotToHistorize); break;
                case SETARRAY : setArrayValues(parent, lastObj, propToUse, prop, value, isNotToHistorize); break;
                case ADD : addValue(parent, lastObj, propToUse, prop, value, isNotToHistorize); break;
                case DELETE : deleteValue(parent, lastObj, propToUse, prop, value, isNotToHistorize); break;
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
        function setValue(parent, obj, propToUse, prop, value, isNotToHistorize) {
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
        function setArrayValues(parent, obj, propToUse, prop, value, isNotToHistorize) {
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
        function addValue(parent, obj, propToUse, prop, value, isNotToHistorize) {
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
        function deleteValue(parent, obj, propToUse, prop, objToDelete, isNotToHistorize) {
            if (!getBool(isNotToHistorize)) {
                historizeOperation(DELETE, prop, obj[propToUse], objToDelete);
            }

            if (obj[propToUse]) {
                if (Array.isArray(obj[propToUse]) && objToDelete) {
                    var idx = (isObject(objToDelete) ? obj[propToUse].indexOf(objToDelete) : objToDelete);

                    obj[propToUse].splice(idx, 1);
                } else {
                    delete obj[propToUse];
                }
            }
        }

        function traceHistory(prop) {
            if (prop === null || prop === undefined || prop === '') {
                return extendValue(_changesHistory);
            }

            var values = [],
                change,
                i;

            for (i = 1; i < _lastChangeId; i++) {
                change = _changesHistory[i];

                if (change.prop === prop) {
                    values.push(change);
                }
            }

            return extendValue(values);
        }

        /**
         * restore the history
         * @param restorePoint
         * @param inputObject
         */
        function restoreAt(restorePoint, inputObject) {
            var i, to, history, objToRestore;

            objToRestore = (inputObject ? inputObject : _workingObj);
            to = (restorePoint && isInteger(restorePoint) ? restorePoint : BEGINING_OF_TIME);

            for (i = objToRestore._oioh_version; i > to; i--) {
                history = _changesHistory[i];

                if (history) {
                    switch (history.operation) {
                        case SET : set(history.prop, history.oldValue, true, objToRestore); break;
                        case SETARRAY : setarray(history.prop, history.oldValue, true, objToRestore); break;
                        case ADD :
                            if (isObject(history.oldValue) || Array.isArray(history.oldValue)) {
                                set(history.prop, history.oldValue, true, objToRestore)
                            } else {
                                del(history.prop, history.newValue, true, objToRestore);
                            }
                            break;
                        case DELETE : add(history.prop, history.oldValue, true, objToRestore); break;
                    }
                }
            }

            objToRestore._oioh_version = to;
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
                        case SET : set(history.prop, history.newValue, true, objToApply); break;
                        case SETARRAY : setarray(history.prop, history.newValue, true, objToApply); break;
                        case ADD : add(history.prop, history.newValue, true, objToApply); break;
                        case DELETE : del(history.prop, history.newValue, true, objToApply); break;
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
            set: set,
            setarray: setarray,
            add: add,
            del: del,
            upd: upd,
            traceHistory: traceHistory,
            applyOn: applyOn,
            restoreAt: restoreAt,
            changeObjectToHistorize: changeObjectToHistorize,
            getPropertyValueHistory: getPropertyValueHistory
        };
    }

    return {
        historize: historize,
        operations: operations,
        extendValue: extendValue,
        BEGINING_OF_TIME: BEGINING_OF_TIME,
        END_OF_TIME: END_OF_TIME
    }
}());
