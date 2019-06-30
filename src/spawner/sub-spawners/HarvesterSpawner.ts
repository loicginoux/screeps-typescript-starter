import { SubSpawner } from "spawner/SubSpawner";

export default class HarvesterSpawner extends SubSpawner {
  spawningOptions(): Object {
    return { memory: { miningSourceId: this.spawningRequest.miningSite!.source.id } }
  }

  bodyParts(): BodyPartConstant[] {
    return [MOVE, WORK, CARRY];
  }
}