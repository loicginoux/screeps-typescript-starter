import { SubSpawner } from "spawner/SubSpawner";

export default class BuilderSpawner extends SubSpawner {
  spawningOptions(): Object {
    return { memory: { miningSite: this.spawningRequest.miningSite } }
  }

  bodyParts(): BodyPartConstant[] {
    return [MOVE, WORK, CARRY];
  }
}
