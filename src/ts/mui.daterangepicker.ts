/// <reference path="mui-daterangepicker.d.ts" />
/**
 * 日期范围选择控件 (修改自mui.poppicker.js)
 * 此组件依赖 listpcker ，请在页面中先引入 mui.picker.css + mui.picker.js
 */
(($: any, document: Document) => {
    const _id = <T>(a: T) => a;

    const _noop = () => {};

    const _isDate = (date: any) => date instanceof Date;

    const _isArray = $.isArrayLike || $.isArray || ((arr: any) => arr instanceof Array);

    const _isFunction = $.isFunction || ((func: any) => typeof func === 'function');

    const _isValidDateType = (value: string) => value === 'year' || value === 'month' || value === 'day';

    const _isInSet = (arr: any[], value: any) => arr.filter((val: any) => value === val)[0] !== void 0;

    //创建 DOM 
    $.dom = (str: any) => {
        if (typeof str !== 'string') {
            if ((str instanceof Array) || (str[0] && str.length))
                return Array.prototype.slice.call(str);
            else
                return [str];
        }!$.__create_dom_div__ && ($.__create_dom_div__ = document.createElement('div'));
        $.__create_dom_div__.innerHTML = str;
        return Array.prototype.slice.call($.__create_dom_div__.childNodes);
    }

    const defaultMonthLength = 12;

    const panelBuffer = '<div class="mui-drpicker">\
        <div class="mui-drpicker-header">\
            <button class="mui-btn mui-drpicker-btn-cancel">取消</button>\
            <button class="mui-btn mui-btn-blue mui-drpicker-btn-ok">确定</button>\
            <div class="mui-drpicker-clear"></div>\
        </div>\
        <div class="mui-drpicker-body mui-drpicker-spliter">\
        </div>\
    </div>';

    const pickerBuffer = '<div class="mui-picker">\
        <div class="mui-picker-inner">\
            <div class="mui-pciker-rule mui-pciker-rule-ft"></div>\
            <ul class="mui-pciker-list">\
            </ul>\
            <div class="mui-pciker-rule mui-pciker-rule-bg"></div>\
        </div>\
    </div>';

    const enumDateType: DateType = {year: 'year',month: 'month',day: 'day'};

    const layerOfDateType = {year: 2, month: 4, day: 6};

    const defaultOption: _PickerOption = {
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

    function safeOption(userOpt: any = defaultOption, defaultOpt: _PickerOption = defaultOption): _PickerOption {
        let resObj: _PickerOption | any = {};
        let {type: uType, buttons: uBtns, startDate: uStartD, endDate: uEndD, confirm: uConfirm, cancel: uCancel, container: uContainer } = userOpt;
        let {type: defType, buttons: defBtns, startDate: defStartD, endDate: defEndD, confirm: defConfirm, cancel: defCancel, container: defContainer } = defaultOpt;
        resObj.type = _isValidDateType(uType) ? uType : defType;
        resObj.buttons = _isArray(uBtns) && uBtns.length === 2 && uBtns.every((ele: any) => typeof ele === 'string') ? uBtns : defBtns;
        resObj.startDate = _isDate(uStartD) ? uStartD : defStartD;
        resObj.endDate = _isDate(uEndD) ? uEndD : defEndD;
        resObj.confirm = _isFunction(uConfirm) ? uConfirm : defConfirm;
        resObj.cancel = _isFunction(uCancel) ? uCancel: defCancel;
        // resObj.container = !!$(uContainer)[0] ? uContainer: defContainer;
        resObj.container = defContainer;

        return resObj;
    }


    /**
     * 获取指定月份的天数
     */
    function _daysEnum(month: number, year: number): number {
        if(_isInSet([1,3,5,7,8,10,12], month))
            return 31;
        if(_isInSet([4,6,9,11], month))
            return 30;
        if(month === 2)
            return year % 4 === 0 ? 29 : 28;
        return null;
    };


    class Observer {
        private __value: any;
        private __id: string;
        private __listeners: any[];
        private __isValid: (...args : any[]) => boolean;
        constructor(id: string, validator: (...args : any[]) => boolean) {
            let self = this;
            self.__id = id;
            self.__listeners = [];
            self.__isValid = _isFunction(validator) ? validator : (...args) => true;
        }
        getVal() {
            return this.__value;
        }
        setVal(value: any) {
            if (!this.__isValid(value)) {
                console.error(`set error: var ${this.__id}: value: ${value} is not a valid`);
                return;
            }
            this.__value = value;
            this.__listeners.forEach(func => func(value));
        }
        setValWithoutListener(value: any){
            if (!this.__isValid(value)) {
                console.error(`set error: var ${this.__id}: value: ${value} is not a valid`);
                return;
            }
            this.__value = value;
        }
        addListener(func: (...args : any[]) => void) {
            if (!_isFunction(func)) {
                console.error(`addListener: callback is not a function`);
                return;
            }
            this.__listeners.push(func);
        }
        removeListener(func: (...args : any[]) => void) {
            if (!_isFunction(func)) {
                console.error(`removeListener: scallback is not a function`);
                return;
            }
            this.__listeners.filter(_func => func !== _func);
        }
    }


    class PickerOption {
        private __buttons: Observer;
        private __dateConfig: Observer;
        private __confirm: Observer;
        private __cancel: Observer;
        private __container: Observer;
        constructor() {
            let self = this;
            // ['cancel', 'ok']
            self.__buttons = new Observer('button', value => _isArray(value) && value.length === 2 && value.every((ele: any) => typeof ele === 'string'));
            // [dateType, start date, end date]
            self.__dateConfig = new Observer('dateConfig', value => _isArray(value) && value.length === 3 && value.every((ele: any, idx: number) => idx === 0 ? _isValidDateType(ele) : _isDate(ele)));
            // function
            self.__confirm = new Observer('confirm', value => _isFunction(value));
            // function
            self.__cancel = new Observer('cancel', value => _isFunction(value));
            // css selector
            self.__container = new Observer('container', value => !!$(value)[0]);

            self.__dateConfig.addListener((arr: [string, Date, Date]) => arr[1].getTime() > arr[2].getTime() && self.__dateConfig.setValWithoutListener([arr[0], arr[2], arr[1]]));
            // self._noop = () => {};
        }
        listen(prop: string, listener: (...args : any[]) => void): PickerOption {
            let self = this;
            if (!_isFunction(listener)) {
                console.error(`listener is not a function`);
                return;
            }
            if (!self[`__${prop}`]) {
                return self;
            }
            self[`__${prop}`].addListener(listener);
            return self;
        }
        removeListen(prop: string, listener: (...args : any[]) => void): PickerOption {
            let self = this;
            if (!_isFunction(listener) || !self[`__${prop}`]) {
               return self;
            }
            self[`__${prop}`].removeListener(listener);
            return self;
        }
        setVal(prop: string, value: any): PickerOption {
            let self = this;
            if (!self[`__${prop}`]) {
                return self;
            }
            self[`__${prop}`].setVal(value);
            return self;
        }
        getVal(prop: string) {
            let self = this;
            if (!self[`__${prop}`]) {
                return;
            }
            return self[`__${prop}`].getVal();
        }

    }


    let _getSeriesNumArray = (() => {
        let cache: any = {};
        return (dateType: string, start: number, end: number, callback: Function = _id, canReuse: boolean = false): any[] => {
            let key: string = `${dateType}|${start}|${end}`;
            if (canReuse && !!cache[key])
                return cache[key];
            let arr: any[] = [];
            for (let i = 0, len = end - start; i <= len; i++) {
                arr.push(callback(start + i, i));
            }
            canReuse && (cache[key] = arr);
            return arr;
        }
    })();


    function _buildStructedDateArray(dateType: string, startDate: Date, endDate: Date): _pickerObj[] {
        const startYear = startDate.getFullYear(),
            startMonth = startDate.getMonth() + 1,
            startDay = startDate.getDate(),
            endYear = endDate.getFullYear(),
            endMonth = endDate.getMonth() + 1,
            endDay = endDate.getDate();
        return _getSeriesNumArray(enumDateType.year, startYear, endYear, (year: number, idx: number) => {
            let yObj: any = {
                text: year,
                value: year,
                index: idx,
            }
            if (dateType !== enumDateType.year) {
                let _startM = 1,
                    _endM = 12;
                year === startYear && (_startM = startMonth);
                year === endYear && (_endM = endMonth);
                yObj.children = _getSeriesNumArray(enumDateType.month, _startM, _endM, (month: number, idx: number) => {
                    let mObj: any = {
                        text: (month + 100 + '').substr(1, 2),
                        value: month,
                        index: idx,
                    }
                    if (dateType !== enumDateType.month) {
                        let _startD = 1,
                            _endD = _daysEnum(month, year);
                        year === startYear && month === startMonth && (_startD = startDay);
                        year === endYear && month === endMonth && (_endD = endDay);
                        mObj.children = _getSeriesNumArray(enumDateType.day, _startD, _endD, (day: number, idx: number) => {
                            let dObj = {
                                text: (day + 100 + '').substr(1, 2),
                                value: day,
                                index: idx
                            };
                            return dObj;
                        }, true)
                    }

                    return mObj;
                }, dateType === enumDateType.month)
            }

            return yObj;
        }, dateType === enumDateType.year)
    }


    const DateRangePicker = $.DateRangePicker = $.Class.extend({
        /**
         * where data stored
         */
        // _srcData: [_pickerObj[], _pickerObj[]],
        // _selectedIdxs = number[] (length in range(2, 4, 6))
        // 构造函数
        init: function(options: _PickerOption = defaultOption) {
            let self = this,
                pickerOpt = self.options = new PickerOption(),
                finalOpt = safeOption(options),
                $mask = self.$mask = $.createMask(),
                panel = self.panel = $.dom(panelBuffer)[0],
                okBtn = panel.querySelector('.mui-drpicker-btn-ok'),
                cancelBtn = panel.querySelector('.mui-drpicker-btn-cancel');

            self._initPickerOptionListener(pickerOpt);

            /**
             * inital listeners
             */
            self.cancelHandler = (event: Event) => {
                // cancel callback
                pickerOpt.getVal('cancel')();

                self.hide();
                // reset selected datas
                self.setSelectedIndexs(self._selectedIdxs);
            }

            self.okHandler = (event: Event) => {
                // update memory
                let slctedItems = self.getSelectedItems();
                self._selectedIdxs = slctedItems.map(item => item.index);
                // output result
                pickerOpt.getVal('confirm')(slctedItems);
                self.hide();
            }

            self.preventDefault = (event: Event) => event.preventDefault();

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
        _initPickerOptionListener: function (pickerOpt: PickerOption): void{
            let self = this;
            pickerOpt
                // .listen('type', () => {})
                .listen('buttons', (buttons:[string, string]) => {
                    const okBtn = self.panel.querySelector('.mui-drpicker-btn-ok'),
                        cancelBtn = self.panel.querySelector('.mui-drpicker-btn-cancel');
                    cancelBtn.innerText = buttons[0];
                    okBtn.innerText = buttons[1];
                })
                .listen('dateConfig', (config: [string, Date, Date]) => {
                    const [type, startDate, endDate] = config;
                    /**
                     * 1. generate new Date Range Data
                     * 2. set new Data to pickers and reset pickers
                     */
                    let generateData:_pickerObj[] = _buildStructedDateArray(type, startDate, endDate),
                        layer = layerOfDateType[type];
                    self._srcData = [generateData, generateData];
                    self._createPicker();
                    self.pickers[0].setItems(self._srcData[0]);
                    self.pickers[layer / 2].setItems(self._srcData[1]);
                    // init default selected indexs
                    self._selectedIdxs = (() => {
                        let arr = [];
                        for (var i = 0; i < layer; ++i) {
                            arr.push(0);
                        }
                        return arr;
                    })();
                })
                // .listen('confirm', () => {})
                // .listen('cancel', () => {})
                .listen('container', (containerDOMSelector: string) => {
                    self.container = $(containerDOMSelector)[0];
                    self.container.classList.add('mui-drpicker-container');
                    self.container.appendChild(self.panel);
                });

        },
        _createPicker: function(){
            let self = this,
                pickerOpt = self.options,
                pickerContainer = self.panel.querySelector('.mui-drpicker-body'),
                layer = layerOfDateType[pickerOpt.getVal('dateConfig')[0]],
                // 年选择与日/月选择器宽度比例
                yearPickerWidthRatio = 1.2,
                unitWidth = 87 / (layer + yearPickerWidthRatio * 2 - 2); // year picker as 2 unit width
                // remove remain pickers
                !!self.pickers && self.pickers.length !== 0 && self.pickers.forEach((picker: any) => picker.holder.parentNode.removeChild(picker.holder));
                self.pickers = []; 
                for(let i = 0; i < layer; i++){
                    let pickerElement = $.dom(pickerBuffer)[0];
                    pickerElement.style.width = `${ i === 0 || i === layer / 2 ? unitWidth * yearPickerWidthRatio : unitWidth}%`;
                    pickerElement.setAttribute('data-idx', i);
                    pickerContainer.appendChild(pickerElement);
                    let picker = $(pickerElement).picker();
                    self.pickers.push(picker);
                    pickerElement.addEventListener('change', function (event: Event | any) {
                        let nextPickerEle = this.nextSibling,
                            pickerIdx = +this.getAttribute('data-idx');
                        if ((pickerIdx + 1) === layer / 2) {
                            pickerElement.style.marginRight = '13%';
                        }
                        if(!nextPickerEle || !nextPickerEle.picker){
                            // only the right-last picker will gothrough here
                            // - get two sides pickers value and compare
                            // - if right < left , make right pickers scroll to left's value
                            let selectedIndxs = self.getSelectedIndexes();
                            for(let k = 0, len = layer / 2; k < len; k ++){
                                if (selectedIndxs[k] < selectedIndxs[k + len])
                                    break;
                                if (selectedIndxs[k] > selectedIndxs[k + len]){
                                    for (let j = k + len; j < layer; j++){
                                        self.pickers[j].setSelectedIndex(selectedIndxs[j - len]);
                                    }
                                    break;
                                }
                            }
                            return;
                        }
                        let eventData = event.detail || {},
                            preItem = eventData.item || {};

                        if( (pickerIdx + 1) * 2 % layer !== 0)
                            nextPickerEle.picker.setItems(preItem.children);
                        else{
                            // only the left-last picker will gothrough here
                            // - get two sides pickers value and compare
                            // - if left > right , make right pickers scroll to left's value
                            let selectedIndxs = self.getSelectedIndexes();
                            for(let k = 0, len = layer / 2; k < len; k ++){
                                if (selectedIndxs[k] < selectedIndxs[k + len])
                                    break;
                                if (selectedIndxs[k] > selectedIndxs[k + len]){
                                    for (let j = k + len; j < layer; j++){
                                        self.pickers[j].setSelectedIndex(selectedIndxs[j - len]);
                                    }
                                    break;
                                }
                            }
                        }
                    });
                }
        },
        /*********** public methods **********/
        /**
         * getSelectedItems
         */
        getSelectedItems: function() {
            let self = this;
            let items = [];
            for (let i = 0, len = self.pickers.length; i< len; i++){
                let picker = self.pickers[i];
                items.push(picker.getSelectedItem() || {});
            }
            return items;
        },
        /**
         * getSelectedItems
         */
        getSelectedIndexes: function() {
            let self = this;
            let items = [];
            for (let i = 0, len = self.pickers.length; i< len; i++){
                let picker = self.pickers[i];
                items.push(picker.getSelectedIndex());
            }
            return items;
        },
        setSelectedIndexs: function(indexs) {
            let self = this;
            if(!_isArray(indexs) || indexs.length !== self.pickers.length){
                console.error('invalid index array at DateRangePicker.setSelectedIndexs');
                return;
            }
            self.pickers.forEach((picker, idx) => picker.setSelectedIndex(indexs[idx]));

        },
        /**
         * setData
         */
        setDateRange: function(startDate: Date, endDate: Date, type: string = 'notAValidDateType') {
            if (!_isDate(startDate) || !_isDate(endDate)) {
                console.log(`invalid type: ${ typeof(_isDate(startDate) ? endDate: startDate) }, expect type: Date`);
                return;
            }
            let self = this,
                pickerOpt = self.options,
                dateType = _isValidDateType(type) ? type: pickerOpt.getVal('dateConfig')[0];
            pickerOpt.setVal('dateConfig', [dateType, startDate, endDate]);
        },
        /**
         * show
         */
        show: function(callback : () => void = _noop){
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
        hide: function(){
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
        dispose: function() {
            var self = this;
            self.hide();
            setTimeout(function() {
                self.panel.parentNode.removeChild(self.panel);
                for (var name in self) {
                    self[name] = null;
                    delete self[name];
                };
                self.disposed = true;
            }, 300);
        }
    });

})(mui, document);