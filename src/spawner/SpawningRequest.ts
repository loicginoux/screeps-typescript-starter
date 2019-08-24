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
  | "reserver"
  | "dismantler";
// | "reparator"
// | "fighter"
// | "pickaboo"
// | "healer"
// | "claimer"
// | "miner"
// | "versatile"
// | "attacker"
// | "pestcontrol";

export interface SpawningRequest {
  role: SpawnType,
  room: Room,
  memory: {
    room?: string,
    // miningSite?: MiningSite,
    miningSourceId?: string
    roomTarget?: string
  }
  priority: number,
  spawner?: StructureSpawn
}
