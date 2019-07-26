import { MiningSite } from "mining/MiningSite";

type SpawnType =
  | "harvester"
  | "miningSiteTruck"
  | "truck"
  | "upgrader"
  | "miningSiteBuilder"
  | "builder"
  | "soldier";
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

export interface SpawningRequest {
  role: SpawnType,
  room: Room,
  memory: {
    room?: string,
    miningSite?: MiningSite
  }
  priority: number,
  spawner?: StructureSpawn
}
