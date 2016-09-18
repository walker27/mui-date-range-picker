#MUI Date Range Picker#

v0.0.1

Mui Date Range Picker is a [MUI](https://github.com/dcloudio/mui) plugin to select a date range.

* requires MUI 2.4.0+ and mui.picker.js

it expired by mui.poppicker.js

###CONFIG###
* config.type: string 
    - value: 'year' || 'month' || 'day',
    - description: set picker's date type
* config.buttons: [string, string]
    - value: ['cancelBtnText', 'okBtnText']
    - description: set cancel button and ok button's text
* config.confim: function
     - value: (object[]) => void
     - descripton: triggered when ok button clicked with picked date array as parameters.
* config.cancel: function
     - value: () => void
     - description: triggered when ok button clicked.
* config.startDate: Date
     - value: Date
     - description: picker start Date
* config.endDate: Date
     - value: Date
     - description: picker end Date
###LICENSE###
This MUI date range picker plugin is under MIT LICENSE

