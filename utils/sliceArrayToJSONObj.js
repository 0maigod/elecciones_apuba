module.exports = function sliceArrayToJSONObj (arr, idIn, idOut, listas){
    //header
    let keys = arr[0];
    //vacate keys from main array
    let newArr = arr.slice(idIn, idOut);
//     console.log(listas)
  
    let formatted = []
    let formattedList = []
    data = newArr

    for (let i=0; i<data.length; i++) {
        let d = data[i],
        o = {};
        let list = {}
        for (let j=0; j<keys.length; j++){
                for (let k=0; k<listas.length; k++){
                        if(keys[j]==listas[k]){
                                if(listas[k] == 'Urna'){
                                        o[keys[j]] = d[j];
                                }
                                else if(listas[k] == 'Nulo'){
                                        o[keys[j]] = d[j];
                                }
                                else if(listas[k] == 'Blanco'){
                                        o[keys[j]] = d[j];
                                }
                                else{
                                        list[keys[j]] = d[j]
                                }
                                o['list'] = list
                        }
                }
        }
        formatted.push(o);

    }
    return formatted;
  }

  
