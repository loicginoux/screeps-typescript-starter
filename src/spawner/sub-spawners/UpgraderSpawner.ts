import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class UpgraderSpawner extends SubSpawner {
  bodyPartsTemplate(): any[] {
    return [{
      bodyParts: [WORK, CARRY, MOVE],
      maxCount: 5
    }]
  }
}
