
import Display from "./display";

class CanvasDisplay extends Display {

  constructor(id) {

    super();

    if(typeof document === 'undefined') {
      throw new Error('CanvasDisplay can only be used from a webpage.');
    }

    this.pWidth  = 64;
    this.pHeight = 32;
    this.element = document.getElementById(id);
    this.canvas  = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.imgData = this.context.createImageData(this.pWidth, this.pHeight);

    this.element.appendChild(this.canvas);
    this.clear();

  }

  clear() {
    super.clear();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setPixel(x, y, active) {

  }

  draw(x, y, sprite) {

    this.context.putImageData(this.imgData, 0, 0);

  }

}