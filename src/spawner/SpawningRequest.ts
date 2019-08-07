import { MiningSite } from "mining/MiningSite";

type SpawnType =
  | "harvester"
  | "miningSiteTruck"
  | "truck"
  | "upgrader"
  | "miningSiteBuilder"
  | "builder"
  | "soldier"
  | "explorer"
  | "long-distance-harvester"
  | "long-distance-truck"
  | "reserver";
// | "reparator"
// | "fighter"
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
    miningSite?: MiningSite,
    roomTarget?: string
  }
  priority: number,
  spawner?: StructureSpawn
}
