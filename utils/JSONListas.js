module.exports = function sliceArrayToJSONObj (arr, id, listas){
    //header
    let keys = listas;
    let formatted = []
    data = arr[id]
    o = {};

    for (let i=0; i<data.length; i++) {

        o[keys[i]] = data[i];        
        }
        formatted.push(o);
    return formatted;
  }

  
