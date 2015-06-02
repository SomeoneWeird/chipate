
import assert from "assert";

import CPU from "../cpu.js";

describe("Chip8 CPU", function() {

  describe("reset", function() {

    it("should reset the state of the CPU", function() {

      let cpu = new CPU();

      cpu.registers.I = 5;

      cpu.reset();

      assert.equal(cpu.registers.I, 0);

    });

    it("should load font into memory when reset", function() {

      let cpu = new CPU();

      assert.equal(cpu.memory[0x80], 0xF0);
      assert.equal(cpu.memory[0x89], 0x70);

    });

  });

  describe("load", function() {

    it("should load program into memory starting at romBase", function() {

      let cpu = new CPU();

      cpu.load([ 0x01, 0x02, 0x03, 0x04 ]);

      assert.equal(cpu.memory[cpu.romBase    ], 0x01);
      assert.equal(cpu.memory[cpu.romBase + 1], 0x02);
      assert.equal(cpu.memory[cpu.romBase + 2], 0x03);
      assert.equal(cpu.memory[cpu.romBase + 3], 0x04);

    });

  });

  describe("readNext", function() {

    it("should read next instruction and increase SP", function() {

      let cpu = new CPU();
      cpu.load([ 0x01, 0x02 ]);

      assert.equal(cpu.PC, cpu.romBase);

      assert.equal(cpu.readNext(), 0x01);

      assert.equal(cpu.PC, cpu.romBase + 1);

    });

  });

  describe("OPCodes", function() {

    describe("00E0 - CLS", function() {

      xit("should clear the display");

    });

    describe("00EE - RET", function() {


    });

    describe("2nnn - CALL addr", function() {


    });

    describe("3xkk - SE Vx, byte", function() {


    });

    describe("4xkk - SNE Vx, byte", function() {


    });

    describe("5xy0 - SE Vx, Vy", function() {


    });

    describe("7xkk - ADD Vx, byte", function() {


    });

    describe("8xy1 - OR Vx, Vy", function() {


    });

    describe("8xy2 - AND Vx, Vy", function() {


    });

    describe("8xy3 - XOR Vx, Vy", function() {


    });

    describe("8xy4 - ADD Vx, Vy", function() {


    });

    describe("8xy5 - SUB Vx, Vy", function() {


    });

    describe("8xy6 - SHR Vx", function() {


    });

    describe("8xy7 - SUBN Vx, Vy", function() {


    });

    describe("8xyE - SHL Vx", function() {


    });

    describe("9xy0 - SNE Vx, Vy", function() {


    });

    describe("Cxkk - RND Vx, byte", function() {


    });

    describe("Dxyn - DRW Vx, Vy, n", function() {


    });

    describe("Ex9E - SKP Vx", function() {


    });

    describe("ExA1 - SKNP Vx", function() {


    });

    describe("Fx0A - LD Vx, K", function() {


    });

    describe("Fx29 - LD F, Vx", function() {


    });

    describe("Fx33 - LD B, Vx", function() {


    });

    describe("Fx55 - LD [I], Vx", function() {


    });

    describe("Fx65 - LD Vx, [I]", function() {


    });

  });

});
