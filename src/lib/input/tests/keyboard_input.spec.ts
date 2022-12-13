import KeyboardInput from "@lib/input/keyboard_input";

describe("KeyboardInput", () => {
    let keyboardInput: KeyboardInput;
    
    beforeEach(() => {
      keyboardInput = new KeyboardInput();
    });
  
    it("should be defined", () => {
      expect(keyboardInput).toBeDefined();
    });
  });
  