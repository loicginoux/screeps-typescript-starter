import { SubSpawner } from "spawner/SubSpawner";

export default class BuilderSpawner extends SubSpawner {
  spawningOptions(): Object {
    return { memory: { room: this.spawningRequest.room!.name } }
  }

  bodyParts(): BodyPartConstant[] {
    return [MOVE, WORK, CARRY];
  }
}
