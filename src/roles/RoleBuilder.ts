import { default as Tasks } from 'creep-tasks'

export class RoleBuilder {
  public static newTask(creep: Creep): void {
    if (creep.carry.energy == 0) {
      this.getEnergy(creep)
    } else {
      let target = this.tryBuilding(creep);
      if (!target) {
        this.tryRepairing(creep);
      }
    }
  }

  public static getEnergy(creep: Creep): void {
    let containers = creep.room.find(FIND_STRUCTURES, {
      filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0
    }) as StructureContainer[];
    containers = _.sortBy(containers, s => creep.pos.getRangeTo(s))
    // get from containers first
    if (containers.length > 0) {
      if (creep.pos.getRangeTo(containers[0]) > 1) {
        creep.task = Tasks.goTo(containers[0])
      } else {
        creep.task = Tasks.withdraw(containers[0])
      }
    } else {
      // else get from source directly
      let sources = creep.room.find(FIND_SOURCES_ACTIVE) as Source[]
      sources = _.sortBy(sources, s => creep.pos.getRangeTo(s))
      if (sources.length > 0) {
        if (creep.pos.getRangeTo(sources[0]) > 1) {
          creep.task = Tasks.goTo(sources[0])
        } else {
          creep.task = Tasks.harvest(sources[0])
        }
      }
    }
  }

  public static tryBuilding(creep: Creep): ConstructionSite {
    let target = this.findConstructionSite(creep)
    if (target) {
      if (creep.pos.getRangeTo(target) > 1) {
        creep.task = Tasks.goTo(target)
      } else {
        creep.task = Tasks.build(target)
      }
    }
    return target
  }

  public static tryRepairing(creep: Creep): Structure {
    let target = this.findRepairSite(creep)
    if (target) {
      if (creep.pos.getRangeTo(target) > 1) {
        creep.task = Tasks.goTo(target)
      } else {
        creep.task = Tasks.repair(target)
      }
    }
    return target
  }

  public static findConstructionSite(creep: Creep): ConstructionSite {
    let targets = creep.room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[]
    const priorities = [
      STRUCTURE_SPAWN,
      STRUCTURE_TOWER,
      STRUCTURE_EXTENSION,
      STRUCTURE_ROAD,
      STRUCTURE_CONTAINER,
      STRUCTURE_RAMPART,
      STRUCTURE_WALL,
      STRUCTURE_LINK,
      STRUCTURE_STORAGE,
      STRUCTURE_OBSERVER,
      STRUCTURE_POWER_BANK,
      STRUCTURE_POWER_SPAWN,
      STRUCTURE_EXTRACTOR,
      STRUCTURE_LAB,
      STRUCTURE_TERMINAL,
      STRUCTURE_NUKER,
      STRUCTURE_PORTAL,
    ]
    if (targets) {
      targets = _.sortBy(targets, i => { priorities.indexOf(i.structureType) })
    }
    return targets[0]
  }

  public static findRepairSite(creep: Creep): Structure {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        let res;
        if (structure.structureType == STRUCTURE_WALL) {
          // limit wall strength to 5000
          res = (structure.hits < structure.hitsMax && structure.hits < 5000)
        } else {
          res = structure.hits < structure.hitsMax
        }
        return res
      }
    });

    targets.sort((a, b) => a.hits - b.hits);

    return targets[0]
  }
}
