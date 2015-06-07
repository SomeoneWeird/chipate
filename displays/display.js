
const EMPTY_MEM_FUNC = function () { return (new Array(64*32+1)).join(0).split('').map(function(num) { return parseInt(num, 10); }); };

class Display {
 
  constructor() {
    this.memory = EMPTY_MEM_FUNC();
  }

  clear() {
    this.memory = EMPTY_MEM_FUNC();
  }

}

export default Display;
