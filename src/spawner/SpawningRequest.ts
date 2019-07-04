import { MiningSite } from "mining/MiningSite";

type SpawnType =
  | "harvester"
  | "truck"
  | "upgrader"
  | "miningSiteBuilder"
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

export interface SpawningRequest {
  role: SpawnType,
  miningSite?: MiningSite
  priority: number,
  room?: Room,
  spawner?: StructureSpawn
}
