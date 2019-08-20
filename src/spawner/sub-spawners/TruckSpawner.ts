import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class TruckSpawner extends SubSpawner {
  bodyPartsTemplate(): any[] {
    return [
      {
        bodyParts: [CARRY, MOVE],
        maxCount: 5,
      },
      {
        bodyParts: [WORK],
        maxCount: 1,
      }
    ]
  }
}
