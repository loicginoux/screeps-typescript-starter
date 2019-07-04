import { ErrorMapper } from "utils/ErrorMapper";
import { Empire } from "Empire";
import { Utils } from "utils/Utils";

Memory.debug = 1
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  Utils.log(`Current game tick is ${Game.time}`);
  global.empire = new Empire()

  global.empire.run()

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
