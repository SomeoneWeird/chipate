import sinon from "sinon";
import assert from "assert";

import Display from "../displays/console";

describe("Console Display", function() {

  beforeEach(function() {

    this.sinon = sinon.sandbox.create();

  });

  afterEach(function(){

    this.sinon.restore();

  });

  describe("._draw", function() {

    it("draws the corrent memory by calling console.log", function() {

      let display = new Display();

      var logSpy = this.sinon.stub(display, '_log');

      display.clear();

      assert.equal(logSpy.callCount, 32);
      assert(logSpy.firstCall.calledWith((new Array(65)).join(0)));
      assert(logSpy.lastCall.calledWith((new Array(65)).join(0)));

    });

  });

  describe(".clear", function() {

    it("should clear the display buffer", function() {

      let display = new Display();

      display.memory = (new Array(64*32+1)).join(1);

      display.clear();

      assert.deepEqual(display.memory, (new Array(64*32+1)).join(0).split(''));

    });

    it("should draw the cleared buffer", function() {

      let display = new Display();
      let drawSpy = this.sinon.spy(display, "_draw");

      display.memory = (new Array(64*32+1)).join(1).split('');

      display.clear();

      assert(drawSpy.called);

    });

  });

  describe(".draw", function() {

    it("should draw the mem buffer", function() {

      let display = new Display();
      let drawSpy = this.sinon.spy(display, "_draw");

      display.draw(0, 0, []);

      assert(drawSpy.called);

    });

    it("draws sprite at position x, y", function() {

      let display = new Display();

      display.draw(0,0, [0xFF]);

      assert.equal(display.memory[0], 1);
      assert.equal(display.memory[1], 1);
      assert.equal(display.memory[2], 1);
      assert.equal(display.memory[3], 1);
      assert.equal(display.memory[4], 1);
      assert.equal(display.memory[5], 1);
      assert.equal(display.memory[6], 1);
      assert.equal(display.memory[7], 1);

    });

    it("should toggle a pixel using XOR with the underlying pixel", function() {

      let display = new Display();

      display.draw(0,0, [0xFF]);
      display.draw(0,0, [0xFF]);

      assert.equal(display.memory[0], 0);
      assert.equal(display.memory[1], 0);
      assert.equal(display.memory[2], 0);
      assert.equal(display.memory[3], 0);
      assert.equal(display.memory[4], 0);
      assert.equal(display.memory[5], 0);
      assert.equal(display.memory[6], 0);
      assert.equal(display.memory[7], 0);

    });

    it("returns 1 if a sprite is overwriting another sprite", function() {

      let result;
      let display = new Display();

      result = display.draw(0,0, [0xFF]);
      assert.equal(result, 0);
      result = display.draw(0,0, [0xFF]);
      assert.equal(result, 1);

    });

    it("should wrap a sprite, if it reaches the boundary of the display before finishing", function() {

      let display = new Display();

      display.draw(63, 31, [0xC0, 0xC0]);

      assert.equal(display.memory[0], 1);
      assert.equal(display.memory[31*64], 1);

    });

  });
});

