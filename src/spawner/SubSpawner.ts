import { SpawningRequest } from "spawner/SpawningRequest";

export class SubSpawner {

  bodyPartsTemplate(): any[] {
    return [{
      bodyParts: [WORK, CARRY, MOVE],
      maxCount: 3
    }]
  }

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
    let totalEnergyAvailable = this.availableRoomEnergy()
    // it seems like if spawner is empty it does not recharge itself
    let energyAvailable = totalEnergyAvailable;
    let bodyParts = [] as BodyPartConstant[];
    let previousBodyParts = [] as BodyPartConstant[];
    let i = 0;
    while (energyAvailable > 0 && (bodyParts != previousBodyParts || bodyParts.length == 0)) {
      energyAvailable = totalEnergyAvailable;
      i += 1
      // console.log("energyAvailable", energyAvailable)
      previousBodyParts = bodyParts;
      this.bodyPartsTemplate().forEach(partTemplate => {
        if (partTemplate.maxCount == -1 || partTemplate.maxCount >= i) {
          bodyParts = partTemplate.bodyParts.concat(bodyParts)
        }
      });
      // console.log("bodyParts", bodyParts)
      let bodyCost = this.calculateBodyCost(bodyParts);
      // console.log("bodyCost", bodyCost)
      energyAvailable -= bodyCost;
    }
    // console.log("previousBodyParts", previousBodyParts)
    return previousBodyParts
    // return [WORK, CARRY, MOVE];
  }

  availableRoomEnergy(): number {
    return this.spawningRequest.room.energyAvailable
  }

  creepName(): string {
    return `${this.spawningRequest.role}_${Game.time}`
  }

  spawningOptions(): Object {
    return {}
  }

  calculateBodyCost(bodyParts: BodyPartConstant[]): number {
    let cost = 0
    bodyParts.forEach(part => {
      cost += BODYPART_COST[part]
    });
    return cost;
  }

}
