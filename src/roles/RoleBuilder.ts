import { Tasks } from 'creep-tasks/Tasks'

export class RoleBuilder {
  public static newTask(creep: Creep): void {
    // reset creep cache
    creep.memory.repairingId = null
    if (creep.carry.energy == 0) {
      this.getEnergy(creep)
    } else {
      let target = this.tryBuilding(creep);
      if (!target) {
        // repair constructions or increase walls
        this.tryRepairing(creep);
      }
    }
  }

  public static getEnergy(creep: Creep): void {
    let containers = creep.room.find(FIND_STRUCTURES, {
      filter: (i) => (i.structureType == STRUCTURE_CONTAINER || i.structureType == STRUCTURE_STORAGE) && i.store[RESOURCE_ENERGY] > 0
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
    const targets = this.findRepairSite(creep)
    // console.log(creep.name, "repairing", targets[0].structureType, targets[0].pos)
    const target = targets[0]
    if (target) {
      creep.memory.repairingId = target.id
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

  // limit wall to 5000 first, when all finished, we recursively increase wall limits if nothing else to repair
  public static findRepairSite(creep: Creep, wallLimit = 5000): Structure[] {
    let alreadyRepairingSites = _.map(Game.creeps, creep => creep.memory.repairingId)
    // repair only sites if they are hit more than what the creep carry
    let targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        let res;
        const needEnergy = (structure.hits < (structure.hitsMax - creep.carry.energy))
        const alreadyAssigned = _.includes(alreadyRepairingSites, structure.id)
        if (structure.structureType == STRUCTURE_WALL) {
          // limit wall strength to 5000 by default
          res = needEnergy && !alreadyAssigned && structure.hits < wallLimit
        } else {
          res = needEnergy && !alreadyAssigned
        }
        return res
      }
    });

    targets.sort((a, b) => a.hits - b.hits);

    if (targets.length == 0) {
      console.log("builder has repaired all, trying walls ", wallLimit + 50000)
      targets = this.findRepairSite(creep, wallLimit + 50000) as AnyStructure[]
    }
    return targets
  }
}
