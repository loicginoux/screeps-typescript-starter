import { SubSpawner } from "spawner/SubSpawner";

export default class UpgraderSpawner extends SubSpawner {
  bodyParts(): BodyPartConstant[] {
    return [MOVE, WORK, CARRY];
  }

  spawningOptions(): Object {
    return { memory: { room: this.spawningRequest.room!.name } }
  }
}
