import { ErrorMapper } from "utils/ErrorMapper";
import { PrimeMinister } from "PrimeMinister";
import { PubSub } from "utils/PubSub";

pubsub = PubSub.new()
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);
  let roomName = Object.keys(Game.rooms)[0]
  let primeMinister = new PrimeMinister(Game.rooms[roomName])

  primeMinister.run()

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
