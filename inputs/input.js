
class Input {

  constructor() {
    this.keysDown = [];
  }

  setKeyDown(id) {
    if(!~this.keysDown.indexOf(id)) {
      this.keysDown.push(id);
    }
  }

  setKeyUp(id) {
    this.keysDown.splice(this.keysDown.indexOf(id), 1);
  }

  isKeyDown(id) {
    return !!~this.keysDown.indexOf(id);
  }

}

export default Input;
