import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class RemoteHarvesterSpawner extends SubSpawner {
  bodyPartsTemplate(): any[] {
    // no need for more or the source will be empty before it get recharged
    return [
      {
        bodyParts: [WORK],
        maxCount: 5,
      },
      {
        bodyParts: [MOVE],
        maxCount: 3
      },
      {
        bodyParts: [CARRY],
        maxCount: 1
      }
    ]
  }


}
