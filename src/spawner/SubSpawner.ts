import { SpawningRequest } from "spawner/SpawningRequest";

export class SubSpawner {

  constructor(public spawningRequest: SpawningRequest) { }
  spawn(): number {
    if (this.spawningRequest.spawner) {
      this.spawningRequest.spawner.spawnCreep(
        this.bodyParts(),
        this.creepName(),
        this.spawningOptions()
      )
      return OK
    }
    return -1
  }

  bodyParts(): BodyPartConstant[] {
    return [WORK, CARRY, MOVE];
  }

  creepName(): string {
    return `${this.spawningRequest.role}_${Game.time}`
  }

  spawningOptions(): Object {
    return {}
  }
}
