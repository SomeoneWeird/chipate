
import Input from "./input";

const keyCodes = {
  49: 0x01, // 1
  50: 0x02, // 2
  51: 0x03, // 3
  52: 0x0C, // 4
  81: 0x04, // Q
  87: 0x05, // W
  69: 0x06, // E
  82: 0x0D, // R
  65: 0x07, // A
  83: 0x08, // S
  68: 0x09, // D
  70: 0x0E, // F
  90: 0x0A, // Z
  88: 0x00, // X
  67: 0x0B, // C
  86: 0x0F  // V
}

class WebInput extends Input {
  
  constructor() {

    super();

    if(typeof document === 'undefined') {
      throw new Error('WebInput can only be used from a webpage.')
    }

    document.onkeydown = (event) => {
      let k = keyCodes[event.keyCode];
      if(!k) return;
      this.setKeyDown(k);
    }

    document.onkeyup = (event) => {
      let k = keyCodes[event.keyCode];
      if(!k) return;
      this.setKeyUp(k);
    }

  }

}

export default WebInput;
