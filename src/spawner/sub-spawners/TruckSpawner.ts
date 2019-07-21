import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class TruckSpawner extends SubSpawner {
  bodyPartsTemplate(): any[] {
    return [
      {
        bodyParts: [CARRY],
        maxCount: 5,
      },
      {
        bodyParts: [WORK, MOVE],
        maxCount: 1,
      }
    ]
  }

  spawningOptions(): Object {
    return { memory: { miningSourceId: this.spawningRequest.miningSite!.source.id } }
  }
}
