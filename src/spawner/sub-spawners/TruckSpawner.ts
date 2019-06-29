import { SubSpawner } from "spawner/SubSpawner";

export default class TruckSpawner extends SubSpawner {
  spawningOptions(): Object {
    return { memory: { miningSourceId: this.spawningRequest.miningSite!.source.id } }
  }
}
