import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class HarvesterSpawner extends SubSpawner {
  spawningOptions(): Object {
    return { memory: { miningSourceId: this.spawningRequest.miningSite!.source.id } }
  }

  bodyParts(): BodyPartConstant[] {
    return [MOVE, WORK, CARRY];
  }
}
