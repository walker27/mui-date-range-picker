var $ = mui;
var drpicker = new $.DateRangePicker({
    startDate: new Date('2014.01.01'),
    endDate: new Date(),
    type: 'month',
    confirm: function(items){
        var len = items.length;
        mui('#result')[0].innerHTML = items.reduce(function(result, ele, idx){
            return result + ele.text + (idx === len / 2 - 1 ? ' - ': idx === len - 1 ? '' : '.');
        }, '');
    }
});
$('#showDrpicker')[0].addEventListener('tap', function() {
    drpicker.show();
});
