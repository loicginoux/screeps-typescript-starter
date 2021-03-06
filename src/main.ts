import { ErrorMapper } from "utils/ErrorMapper";
import "utils/Traveler";
import "utils/WorldPosition";
import 'creep-tasks/prototypes'
import { Empire } from "Empire";
import { PubSub } from "utils/PubSub";
import { u } from "utils/Utils";
import { profiler } from "utils/profiler";
import { RoomDiscovery } from "utils/RoomDiscovery";

// profiler.enable();

Memory.debug = 0
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // profiler.wrap(function () {
  if (Game.cpu.tickLimit < 200) {
    console.log("Bucket :" + Game.cpu.bucket);
    console.log("Bucket almost empty. Skipping tick.");
    return;
  }

  global.memorySize = RawMemory.get().length;

  console.log(`tick: ${Game.time} - cpu: ${_.round((Game.cpu.getUsed() * 100), 2)} - mem: ${global.memorySize}`);

  // general publish subscriber used for inter module communication
  global.pubSub = new PubSub();

  global.empire = new Empire()
  global.profiler = profiler;

  global.empire.run()

  global.mainRoom = global.empire.roomCommanders[0];


  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
  // })
});
