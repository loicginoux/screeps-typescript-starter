import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class SoldierSpawner extends SubSpawner {
  bodyPartsTemplate(): any[] {
    return [
      {
        bodyParts: [TOUGH],
        maxCount: -1
      },
      {
        bodyParts: [ATTACK, MOVE],
        maxCount: -1
      },
      {
        bodyParts: [HEAL],
        maxCount: -1
      }
    ]
  }
}
