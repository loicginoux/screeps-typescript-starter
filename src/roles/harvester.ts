import { Utils } from "utils/utils";

export class roleHarvester {
  public static run(creep: Creep): void {
    if (creep.carry.energy < creep.carryCapacity) {
      this.harvestClosestSource(creep)
    }
    else {
      this.transferEnergy(creep)
    }
  }

  public static transferEnergy(creep: Creep) {
    let structures = Utils.findStructuresThatNeedsEnergy()
    if (structures.length > 0) {
      if (creep.transfer(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(structures[0], { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }

  public static harvestClosestSource(creep: Creep) {
    var sources = _.sortBy(creep.room.find(FIND_SOURCES_ACTIVE), s => creep.pos.getRangeTo(s))

    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  }

}
