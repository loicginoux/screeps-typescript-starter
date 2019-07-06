import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class UpgraderSpawner extends SubSpawner {
  bodyParts(): BodyPartConstant[] {
    return [MOVE, WORK, CARRY];
  }

  spawningOptions(): Object {
    return { memory: { room: this.spawningRequest.room!.name } }
  }
}
