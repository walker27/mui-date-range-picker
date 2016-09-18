function isInRange(arr, value) {
    let res = arr.filter(function(ele){
        return ele === value;
    });
    console.log('value:',value ,' -> ', res[0] !== void 0);
    return res[0] !== void 0;
}

// let arr = [0,1,23,5,8,9, null];
let arr = new Array(6);

isInRange(arr,0)
isInRange(arr,1)
isInRange(arr,2)
isInRange(arr,6)