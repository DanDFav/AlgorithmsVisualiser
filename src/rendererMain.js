window.addEventListener("DOMContentLoaded", async ()=>{
    let array = generateSet()
    quickSort(array, 0, array.length-1)
    console.log(array)
});

class Partition {
    constructor(parent, array, pivot, low, high){
        this.parent = parent
        this.array = array 
        this.pivot = pivot
        this.low   = low
        this.high  = high
    }

    partition(){
        let pivot = array[high]
        let i = low - 1
    
        for (let j = low; j <= high; j++) {
            if(array[j] < pivot){
                i++
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
    
        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        return i + 1; 
    }
}

function quickSort(array, low, high){
    if(low < high){
        let p = partition(array, low, high)

        quickSort(array, low, p - 1);
        quickSort(array, p + 1, high);
    }
}



function swap(array, a, b){
    let temp = array[a]
    array[a] = array[b]
    array[b] = temp
}



function generateSet() {
    let set = new Array(50)
    for (let i = 0; i < set.length; i++) {
        set[i] = Math.floor(Math.random() * 100)
    }
 
    return set
}