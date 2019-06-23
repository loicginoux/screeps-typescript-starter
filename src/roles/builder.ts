export class roleBuilder {
  public static run(creep: Creep): void {
    if (creep.memory.working && creep.carry.energy == 0) {
      creep.memory.working = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
      creep.memory.working = true;
      creep.say('🚧 build');
      if (!creep.memory.buildingSourceId) {
        // this.assignedBuildingSource(creep)
        // this.moveToAssignedSource(creep)
      }
    }

    if (creep.memory.working) {
      this.buildClosestConstructionSite(creep)
    }
    else {
      this.harvestClosestSource(creep)
    }
  }

  public static harvestClosestSource(creep: Creep) {
    var sources = _.sortBy(creep.room.find(FIND_SOURCES_ACTIVE), s => creep.pos.getRangeTo(s))
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  }

  public static buildClosestConstructionSite(creep: Creep) {
    var constructionSite = _.sortBy(creep.room.find(FIND_CONSTRUCTION_SITES), s => creep.pos.getRangeTo(s))
    if (creep.build(constructionSite[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(constructionSite[0], { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  }

  // public static assignedBuildingSource(creep: Creep) {
  // }

  // public static moveToAssignedSource(creep: Creep) {
  //   let assignedSource;
  //   let sources = _.sortBy(creep.room.find(FIND_SOURCES), s => creep.pos.getRangeTo(s))
  //   // let notAssignedSources = _.filter(sources, s => creep.pos.getRangeTo(s))

  //   creep.moveTo(assignedSource, { visualizePathStyle: { stroke: '#ffaa00' } });
  // }
}
