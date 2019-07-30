import { Tasks } from 'creep-tasks/Tasks'
import { EnergyStructure } from 'creep-tasks/utilities/helpers';
import { u } from 'utils/Utils';

export class RoleBuilder {
  public static newTask(creep: Creep, availableEnergyStructures: EnergyStructure[]): void {
    // reset creep cache
    creep.memory.repairingId = null
    if (creep.carry.energy == 0) {
      u.whileCheckForDroppedEnergy(creep, () => {
        this.getEnergy(creep, availableEnergyStructures);
      })
    } else {
      let target = u.tryBuilding(creep);
      if (!target) {
        // repair constructions or increase walls
        this.tryRepairing(creep);
      }
    }
  }

  public static getEnergy(creep: Creep, availableEnergyStructures: EnergyStructure[]): void {
    const priorities = [
      STRUCTURE_STORAGE,
      STRUCTURE_CONTAINER
    ]

    // sort by priority and then range
    availableEnergyStructures = _.filter(availableEnergyStructures, i => _.includes(priorities, i.structureType))
    availableEnergyStructures = availableEnergyStructures.sort((a: any, b: any) => {
      let res = u.compareValues(priorities.indexOf(a.structureType), priorities.indexOf(b.structureType))
      return res === 0
        ? u.compareValues(creep.pos.getRangeTo(a), creep.pos.getRangeTo(b))
        : res;
    })

    // get from containers first
    if (availableEnergyStructures.length > 0) {
      // console.log("builder availableEnergyStructures[0]", creep.pos, availableEnergyStructures[0].structureType, availableEnergyStructures[0].pos)
      if (creep.pos.getRangeTo(availableEnergyStructures[0]) > 1) {
        creep.task = Tasks.goTo(availableEnergyStructures[0])
      } else {
        creep.task = Tasks.withdraw(availableEnergyStructures[0])
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

  // limit wall to 5000 first, when all finished, we recursively increase wall limits if nothing else to repair
  public static findRepairSite(creep: Creep, wallLimit = 5000): Structure[] {
    let alreadyRepairingSites = _.map(Game.creeps, creep => creep.memory.repairingId)
    // repair only sites if they are hit more than what the creep carry
    let targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        let res = true;
        const needEnergy = (structure.hits < (structure.hitsMax - creep.carry.energy))
        const alreadyAssigned = _.includes(alreadyRepairingSites, structure.id)
        if (structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL) {
          res = structure.hits < wallLimit
        }
        return res && needEnergy && !alreadyAssigned
      }
    });

    targets.sort((a, b) => a.hits - b.hits);

    let wallOrRamparts = creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART })
    // try upgrading walls or ramparts
    if (targets.length == 0 && wallOrRamparts.length > 0) {
      // console.log("builder has repaired all, trying walls ", wallLimit + 50000)
      targets = this.findRepairSite(creep, wallLimit + 50000) as AnyStructure[]
    }
    return targets
  }
}
