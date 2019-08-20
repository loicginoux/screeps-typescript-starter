import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class BuilderSpawner extends SubSpawner {

  bodyPartsTemplate(): any[] {
    return [{
      bodyParts: [WORK, CARRY, MOVE],
      maxCount: this.maxCount()
    }]
  }

  maxCount(): number {
    let maxCount = 5;
    const constructionSites = this.spawningRequest.room.find(FIND_CONSTRUCTION_SITES).length
    let hitsTotal = 0;
    let hitsMaxTotal = 0;
    _.forEach(this.spawningRequest.room.find(FIND_MY_STRUCTURES), (s) => {
      hitsTotal += s.hits;
      hitsMaxTotal += s.hitsMax;
    });
    const overallStructuresState = hitsTotal / hitsMaxTotal;
    if (constructionSites == 0 || overallStructuresState > 0.7) {
      maxCount = 1
    }
    if ((constructionSites >= 1 && constructionSites <= 3) || (overallStructuresState >= 0.4 && overallStructuresState <= 0.7)) {
      maxCount = 3
    }
    return maxCount
  }
}
