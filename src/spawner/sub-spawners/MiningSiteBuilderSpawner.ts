import { SubSpawner } from "spawner/SubSpawner";

export default class MiningSiteBuilderSpawner extends SubSpawner {
  spawningOptions(): Object {
    return { memory: { room: this.spawningRequest.miningSite!.source.id } }
  }

  bodyParts(): BodyPartConstant[] {
    return [MOVE, WORK, CARRY];
  }
}
