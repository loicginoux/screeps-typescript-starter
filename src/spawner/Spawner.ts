import * as subs from "./sub-spawners";
import { pubSub } from "utils/PubSub";
import { MiningSite } from "mining/MiningSite";

type SpawnType =
  | "harvester"
  | "static-harvester"
  | "truck"
  | "upgrader"
  | "builder";
// | "reparator"
// | "fighter"
// | "explorer"
// | "long-distance-harvester"
// | "pickaboo"
// | "healer"
// | "claimer"
// | "miner"
// | "versatile"
// | "attacker"
// | "pestcontrol"
// | "dismantler";

interface SpawningOption {
  type: SpawnType,
  miningSite?: MiningSite

}
export class Spawner {
  constructor(private room: Room) {
    pubSub.subscribe('SPAWN_NEEDED', this.spawn)
  }

  spawn(spawningOptions: SpawningOption): Creep {
    let subSpawnerClass: any = new (subs as any)[`${spawningOptions.type}Spawner`];
    let subSpawner = subSpawnerClass(spawningOptions)
    return subSpawner.spawn();
  }

  findUsableSpawner(): StructureSpawn | null {
    let firstSpawn = this.room.find(FIND_MY_STRUCTURES, {
      filter: i => i.structureType === "spawn"
    })[0] as StructureSpawn | null;
    return firstSpawn;
  }
}
