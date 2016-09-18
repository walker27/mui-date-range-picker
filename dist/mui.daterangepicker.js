/// <reference path="mui-daterangepicker.d.ts" />
/**
 * 日期范围选择控件 (修改自mui.poppicker.js)
 * 此组件依赖 listpcker ，请在页面中先引入 mui.picker.css + mui.picker.js
 */
(function ($, document) {
    var _id = function (a) { return a; };
    var _noop = function () { };
    var _isDate = function (date) { return date instanceof Date; };
    var _isArray = $.isArrayLike || $.isArray || (function (arr) { return arr instanceof Array; });
    var _isFunction = $.isFunction || (function (func) { return typeof func === 'function'; });
    var _isValidDateType = function (value) { return value === 'year' || value === 'month' || value === 'day'; };
    var _isInSet = function (arr, value) { return arr.filter(function (val) { return value === val; })[0] !== void 0; };
    //创建 DOM 
    $.dom = function (str) {
        if (typeof str !== 'string') {
            if ((str instanceof Array) || (str[0] && str.length))
                return Array.prototype.slice.call(str);
            else
                return [str];
        }
        !$.__create_dom_div__ && ($.__create_dom_div__ = document.createElement('div'));
        $.__create_dom_div__.innerHTML = str;
        return Array.prototype.slice.call($.__create_dom_div__.childNodes);
    };
    var defaultMonthLength = 12;
    var panelBuffer = '<div class="mui-drpicker">\
        <div class="mui-drpicker-header">\
            <button class="mui-btn mui-drpicker-btn-cancel">取消</button>\
            <button class="mui-btn mui-btn-blue mui-drpicker-btn-ok">确定</button>\
            <div class="mui-drpicker-clear"></div>\
        </div>\
        <div class="mui-drpicker-body mui-drpicker-spliter">\
        </div>\
    </div>';
    var pickerBuffer = '<div class="mui-picker">\
        <div class="mui-picker-inner">\
            <div class="mui-pciker-rule mui-pciker-rule-ft"></div>\
            <ul class="mui-pciker-list">\
            </ul>\
            <div class="mui-pciker-rule mui-pciker-rule-bg"></div>\
        </div>\
    </div>';
    var enumDateType = { year: 'year', month: 'month', day: 'day' };
    var layerOfDateType = { year: 2, month: 4, day: 6 };
    var defaultOption = {
        // dateType
        type: enumDateType.day,
        // 按钮标题
        buttons: ['取消', '确定'],
        // button "ok" callback
        confirm: _noop,
        // button "cancel" callback  
        cancel: _noop,
        startDate: new Date('2015-01-01'),
        endDate: new Date('2016-01-01'),
        container: 'body'
    };
    function safeOption(userOpt, defaultOpt) {
        if (userOpt === void 0) { userOpt = defaultOption; }
        if (defaultOpt === void 0) { defaultOpt = defaultOption; }
        var resObj = {};
        var uType = userOpt.type, uBtns = userOpt.buttons, uStartD = userOpt.startDate, uEndD = userOpt.endDate, uConfirm = userOpt.confirm, uCancel = userOpt.cancel, uContainer = userOpt.container;
        var defType = defaultOpt.type, defBtns = defaultOpt.buttons, defStartD = defaultOpt.startDate, defEndD = defaultOpt.endDate, defConfirm = defaultOpt.confirm, defCancel = defaultOpt.cancel, defContainer = defaultOpt.container;
        resObj.type = _isValidDateType(uType) ? uType : defType;
        resObj.buttons = _isArray(uBtns) && uBtns.length === 2 && uBtns.every(function (ele) { return typeof ele === 'string'; }) ? uBtns : defBtns;
        resObj.startDate = _isDate(uStartD) ? uStartD : defStartD;
        resObj.endDate = _isDate(uEndD) ? uEndD : defEndD;
        resObj.confirm = _isFunction(uConfirm) ? uConfirm : defConfirm;
        resObj.cancel = _isFunction(uCancel) ? uCancel : defCancel;
        // resObj.container = !!$(uContainer)[0] ? uContainer: defContainer;
        resObj.container = defContainer;
        return resObj;
    }
    /**
     * 获取指定月份的天数
     */
    function _daysEnum(month, year) {
        if (_isInSet([1, 3, 5, 7, 8, 10, 12], month))
            return 31;
        if (_isInSet([4, 6, 9, 11], month))
            return 30;
        if (month === 2)
            return year % 4 === 0 ? 29 : 28;
        return null;
    }
    ;
    var Observer = (function () {
        function Observer(id, validator) {
            var self = this;
            self.__id = id;
            self.__listeners = [];
            self.__isValid = _isFunction(validator) ? validator : function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                return true;
            };
        }
        Observer.prototype.getVal = function () {
            return this.__value;
        };
        Observer.prototype.setVal = function (value) {
            if (!this.__isValid(value)) {
                console.error("set error: var " + this.__id + ": value: " + value + " is not a valid");
                return;
            }
            this.__value = value;
            this.__listeners.forEach(function (func) { return func(value); });
        };
        Observer.prototype.setValWithoutListener = function (value) {
            if (!this.__isValid(value)) {
                console.error("set error: var " + this.__id + ": value: " + value + " is not a valid");
                return;
            }
            this.__value = value;
        };
        Observer.prototype.addListener = function (func) {
            if (!_isFunction(func)) {
                console.error("addListener: callback is not a function");
                return;
            }
            this.__listeners.push(func);
        };
        Observer.prototype.removeListener = function (func) {
            if (!_isFunction(func)) {
                console.error("removeListener: scallback is not a function");
                return;
            }
            this.__listeners.filter(function (_func) { return func !== _func; });
        };
        return Observer;
    }());
    var PickerOption = (function () {
        function PickerOption() {
            var self = this;
            // ['cancel', 'ok']
            self.__buttons = new Observer('button', function (value) { return _isArray(value) && value.length === 2 && value.every(function (ele) { return typeof ele === 'string'; }); });
            // [dateType, start date, end date]
            self.__dateConfig = new Observer('dateConfig', function (value) { return _isArray(value) && value.length === 3 && value.every(function (ele, idx) { return idx === 0 ? _isValidDateType(ele) : _isDate(ele); }); });
            // function
            self.__confirm = new Observer('confirm', function (value) { return _isFunction(value); });
            // function
            self.__cancel = new Observer('cancel', function (value) { return _isFunction(value); });
            // css selector
            self.__container = new Observer('container', function (value) { return !!$(value)[0]; });
            self.__dateConfig.addListener(function (arr) { return arr[1].getTime() > arr[2].getTime() && self.__dateConfig.setValWithoutListener([arr[0], arr[2], arr[1]]); });
            // self._noop = () => {};
        }
        PickerOption.prototype.listen = function (prop, listener) {
            var self = this;
            if (!_isFunction(listener)) {
                console.error("listener is not a function");
                return;
            }
            if (!self[("__" + prop)]) {
                return self;
            }
            self[("__" + prop)].addListener(listener);
            return self;
        };
        PickerOption.prototype.removeListen = function (prop, listener) {
            var self = this;
            if (!_isFunction(listener) || !self[("__" + prop)]) {
                return self;
            }
            self[("__" + prop)].removeListener(listener);
            return self;
        };
        PickerOption.prototype.setVal = function (prop, value) {
            var self = this;
            if (!self[("__" + prop)]) {
                return self;
            }
            self[("__" + prop)].setVal(value);
            return self;
        };
        PickerOption.prototype.getVal = function (prop) {
            var self = this;
            if (!self[("__" + prop)]) {
                return;
            }
            return self[("__" + prop)].getVal();
        };
        return PickerOption;
    }());
    var _getSeriesNumArray = (function () {
        var cache = {};
        return function (dateType, start, end, callback, canReuse) {
            if (callback === void 0) { callback = _id; }
            if (canReuse === void 0) { canReuse = false; }
            var key = dateType + "|" + start + "|" + end;
            if (canReuse && !!cache[key])
                return cache[key];
            var arr = [];
            for (var i = 0, len = end - start; i <= len; i++) {
                arr.push(callback(start + i, i));
            }
            canReuse && (cache[key] = arr);
            return arr;
        };
    })();
    function _buildStructedDateArray(dateType, startDate, endDate) {
        var startYear = startDate.getFullYear(), startMonth = startDate.getMonth() + 1, startDay = startDate.getDate(), endYear = endDate.getFullYear(), endMonth = endDate.getMonth() + 1, endDay = endDate.getDate();
        return _getSeriesNumArray(enumDateType.year, startYear, endYear, function (year, idx) {
            var yObj = {
                text: year,
                value: year,
                index: idx,
            };
            if (dateType !== enumDateType.year) {
                var _startM = 1, _endM = 12;
                year === startYear && (_startM = startMonth);
                year === endYear && (_endM = endMonth);
                yObj.children = _getSeriesNumArray(enumDateType.month, _startM, _endM, function (month, idx) {
                    var mObj = {
                        text: (month + 100 + '').substr(1, 2),
                        value: month,
                        index: idx,
                    };
                    if (dateType !== enumDateType.month) {
                        var _startD = 1, _endD = _daysEnum(month, year);
                        year === startYear && month === startMonth && (_startD = startDay);
                        year === endYear && month === endMonth && (_endD = endDay);
                        mObj.children = _getSeriesNumArray(enumDateType.day, _startD, _endD, function (day, idx) {
                            var dObj = {
                                text: (day + 100 + '').substr(1, 2),
                                value: day,
                                index: idx
                            };
                            return dObj;
                        }, true);
                    }
                    return mObj;
                }, dateType === enumDateType.month);
            }
            return yObj;
        }, dateType === enumDateType.year);
    }
    var DateRangePicker = $.DateRangePicker = $.Class.extend({
        /**
         * where data stored
         */
        // _srcData: [_pickerObj[], _pickerObj[]],
        // _selectedIdxs = number[] (length in range(2, 4, 6))
        // 构造函数
        init: function (options) {
            if (options === void 0) { options = defaultOption; }
            var self = this, pickerOpt = self.options = new PickerOption(), finalOpt = safeOption(options), $mask = self.$mask = $.createMask(), panel = self.panel = $.dom(panelBuffer)[0], okBtn = panel.querySelector('.mui-drpicker-btn-ok'), cancelBtn = panel.querySelector('.mui-drpicker-btn-cancel');
            self._initPickerOptionListener(pickerOpt);
            /**
             * inital listeners
             */
            self.cancelHandler = function (event) {
                // cancel callback
                pickerOpt.getVal('cancel')();
                self.hide();
                // reset selected datas
                self.setSelectedIndexs(self._selectedIdxs);
            };
            self.okHandler = function (event) {
                // update memory
                var slctedItems = self.getSelectedItems();
                self._selectedIdxs = slctedItems.map(function (item) { return item.index; });
                // output result
                pickerOpt.getVal('confirm')(slctedItems);
                self.hide();
            };
            self.preventDefault = function (event) { return event.preventDefault(); };
            cancelBtn.addEventListener('tap', self.cancelHandler, false);
            okBtn.addEventListener('tap', self.okHandler, false);
            $mask[0].addEventListener('tap', self.cancelHandler, false);
            // 防止穿透滚动
            panel.addEventListener('touchstart', self.preventDefault, false);
            panel.addEventListener('touchmove', self.preventDefault, false);
            pickerOpt
                .setVal('container', finalOpt.container)
                .setVal('buttons', finalOpt.buttons)
                .setVal('dateConfig', [finalOpt.type, finalOpt.startDate, finalOpt.endDate])
                .setVal('confirm', finalOpt.confirm)
                .setVal('cancel', finalOpt.cancel);
        },
        /*********** private methods **********/
        _initPickerOptionListener: function (pickerOpt) {
            var self = this;
            pickerOpt
                .listen('buttons', function (buttons) {
                var okBtn = self.panel.querySelector('.mui-drpicker-btn-ok'), cancelBtn = self.panel.querySelector('.mui-drpicker-btn-cancel');
                cancelBtn.innerText = buttons[0];
                okBtn.innerText = buttons[1];
            })
                .listen('dateConfig', function (config) {
                var type = config[0], startDate = config[1], endDate = config[2];
                /**
                 * 1. generate new Date Range Data
                 * 2. set new Data to pickers and reset pickers
                 */
                var generateData = _buildStructedDateArray(type, startDate, endDate), layer = layerOfDateType[type];
                self._srcData = [generateData, generateData];
                self._createPicker();
                self.pickers[0].setItems(self._srcData[0]);
                self.pickers[layer / 2].setItems(self._srcData[1]);
                // init default selected indexs
                self._selectedIdxs = (function () {
                    var arr = [];
                    for (var i = 0; i < layer; ++i) {
                        arr.push(0);
                    }
                    return arr;
                })();
            })
                .listen('container', function (containerDOMSelector) {
                self.container = $(containerDOMSelector)[0];
                self.container.classList.add('mui-drpicker-container');
                self.container.appendChild(self.panel);
            });
        },
        _createPicker: function () {
            var self = this, pickerOpt = self.options, pickerContainer = self.panel.querySelector('.mui-drpicker-body'), layer = layerOfDateType[pickerOpt.getVal('dateConfig')[0]], 
            // 年选择与日/月选择器宽度比例
            yearPickerWidthRatio = 1.2, unitWidth = 87 / (layer + yearPickerWidthRatio * 2 - 2); // year picker as 2 unit width
            // remove remain pickers
            !!self.pickers && self.pickers.length !== 0 && self.pickers.forEach(function (picker) { return picker.holder.parentNode.removeChild(picker.holder); });
            self.pickers = [];
            var _loop_1 = function(i) {
                var pickerElement = $.dom(pickerBuffer)[0];
                pickerElement.style.width = (i === 0 || i === layer / 2 ? unitWidth * yearPickerWidthRatio : unitWidth) + "%";
                pickerElement.setAttribute('data-idx', i);
                pickerContainer.appendChild(pickerElement);
                var picker = $(pickerElement).picker();
                self.pickers.push(picker);
                pickerElement.addEventListener('change', function (event) {
                    var nextPickerEle = this.nextSibling, pickerIdx = +this.getAttribute('data-idx');
                    if ((pickerIdx + 1) === layer / 2) {
                        pickerElement.style.marginRight = '13%';
                    }
                    if (!nextPickerEle || !nextPickerEle.picker) {
                        // only the right-last picker will gothrough here
                        // - get two sides pickers value and compare
                        // - if right < left , make right pickers scroll to left's value
                        var selectedIndxs = self.getSelectedIndexes();
                        for (var k = 0, len = layer / 2; k < len; k++) {
                            if (selectedIndxs[k] < selectedIndxs[k + len])
                                break;
                            if (selectedIndxs[k] > selectedIndxs[k + len]) {
                                for (var j = k + len; j < layer; j++) {
                                    self.pickers[j].setSelectedIndex(selectedIndxs[j - len]);
                                }
                                break;
                            }
                        }
                        return;
                    }
                    var eventData = event.detail || {}, preItem = eventData.item || {};
                    if ((pickerIdx + 1) * 2 % layer !== 0)
                        nextPickerEle.picker.setItems(preItem.children);
                    else {
                        // only the left-last picker will gothrough here
                        // - get two sides pickers value and compare
                        // - if left > right , make right pickers scroll to left's value
                        var selectedIndxs = self.getSelectedIndexes();
                        for (var k = 0, len = layer / 2; k < len; k++) {
                            if (selectedIndxs[k] < selectedIndxs[k + len])
                                break;
                            if (selectedIndxs[k] > selectedIndxs[k + len]) {
                                for (var j = k + len; j < layer; j++) {
                                    self.pickers[j].setSelectedIndex(selectedIndxs[j - len]);
                                }
                                break;
                            }
                        }
                    }
                });
            };
            for (var i = 0; i < layer; i++) {
                _loop_1(i);
            }
        },
        /*********** public methods **********/
        /**
         * getSelectedItems
         */
        getSelectedItems: function () {
            var self = this;
            var items = [];
            for (var i = 0, len = self.pickers.length; i < len; i++) {
                var picker = self.pickers[i];
                items.push(picker.getSelectedItem() || {});
            }
            return items;
        },
        /**
         * getSelectedItems
         */
        getSelectedIndexes: function () {
            var self = this;
            var items = [];
            for (var i = 0, len = self.pickers.length; i < len; i++) {
                var picker = self.pickers[i];
                items.push(picker.getSelectedIndex());
            }
            return items;
        },
        setSelectedIndexs: function (indexs) {
            var self = this;
            if (!_isArray(indexs) || indexs.length !== self.pickers.length) {
                console.error('invalid index array at DateRangePicker.setSelectedIndexs');
                return;
            }
            self.pickers.forEach(function (picker, idx) { return picker.setSelectedIndex(indexs[idx]); });
        },
        /**
         * setData
         */
        setDateRange: function (startDate, endDate, type) {
            if (type === void 0) { type = 'notAValidDateType'; }
            if (!_isDate(startDate) || !_isDate(endDate)) {
                console.log("invalid type: " + typeof (_isDate(startDate) ? endDate : startDate) + ", expect type: Date");
                return;
            }
            var self = this, pickerOpt = self.options, dateType = _isValidDateType(type) ? type : pickerOpt.getVal('dateConfig')[0];
            pickerOpt.setVal('dateConfig', [dateType, startDate, endDate]);
        },
        /**
         * show
         */
        show: function (callback) {
            if (callback === void 0) { callback = _noop; }
            var self = this;
            self.callback = callback;
            self.$mask.show();
            self.container.classList.add($.className('poppicker-active-for-page'));
            self.panel.classList.add($.className('active'));
            //处理物理返回键
            self.__back = $.back;
            $.back = self.cancelHandler;
        },
        /**
         * hide
         */
        hide: function () {
            var self = this;
            if (self.disposed)
                return;
            self.panel.classList.remove($.className('active'));
            self.$mask.close();
            document.body.classList.remove($.className('poppicker-active-for-page'));
            //处理物理返回键
            $.back = self.__back;
        },
        /**
         * dispose
         */
        dispose: function () {
            var self = this;
            self.hide();
            setTimeout(function () {
                self.panel.parentNode.removeChild(self.panel);
                for (var name in self) {
                    self[name] = null;
                    delete self[name];
                }
                ;
                self.disposed = true;
            }, 300);
        }
    });
})(mui, document);
