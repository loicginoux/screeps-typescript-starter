import { SubSpawner } from "spawner/SubSpawner";

export default class UpgraderSpawner extends SubSpawner {
  bodyParts(): BodyPartConstant[] {
    return [MOVE, WORK, CARRY];
  }
}
