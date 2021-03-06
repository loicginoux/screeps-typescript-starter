import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class HarvesterSpawner extends SubSpawner {
  bodyPartsTemplate(): any[] {
    // no need for more or the source will be empty before it get recharged
    return [
      {
        bodyParts: [WORK],
        maxCount: 5,
      },
      {
        bodyParts: [CARRY, MOVE],
        maxCount: 1
      }
    ]
  }


}
