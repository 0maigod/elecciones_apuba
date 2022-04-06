module.exports = function arrayToJSONObject (arr){
    //header
    let keys = arr[0];
  
    //vacate keys from main array
    let newArr = arr.slice(1, arr.length);
  
    let formatted = [],
    data = newArr,
    cols = keys,
    l = cols.length;
    for (let i=0; i<data.length; i++) {
            let d = data[i],
                    o = {};
            for (let j=0; j<l; j++)
                    o[cols[j]] = d[j];
            formatted.push(o);
    }
    return formatted;
  }

  
