import { Tasks } from 'creep-tasks/Tasks'
import { EnergyStructure } from 'creep-tasks/utilities/helpers';
import { Spawner } from 'spawner/Spawner';
import { u } from "utils/Utils";


export class RoleTruck {
  public static newTask(creep: Creep, container: StructureContainer): void {
    // creep has no evergy, go to container 1 get some
    if (creep.carry.energy == 0) {
      this.gotoAndWithdraw(creep, container)
    } else {
      let target = this.findClosestEnergyStructure(creep, container)
      // creep is full, go to give some energy
      if (target) {
        this.gotoAndTransfer(creep, target)
      } else {
        // all energy structures full, all containers full, find a controller
        const controller = creep.room.controller
        if (controller) {
          // this.gotoAndUpgrade(creep, controller)
        }
      }
    }
  }

  public static gotoAndWithdraw(creep: Creep, container: StructureContainer) {
    // console.log('gotoAndWithdraw', container)
    // when there is a storage and container is not full enough for
    //  use storage to take energy from
    const storage = creep.room.storage
    if (storage && container.store.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(storage) > 2) {
        creep.task = Tasks.goTo(storage.pos)
      } else if (storage.store.energy > creep.carryCapacity) {
        creep.task = Tasks.withdraw(storage)
      }
    }
    else if (creep.pos.getRangeTo(container) > 2) {
      creep.task = Tasks.goTo(container.pos)
    } else if (container.store.energy > creep.carryCapacity) {
      creep.task = Tasks.withdraw(container)
    }
  }

  public static gotoAndTransfer(creep: Creep, target: EnergyStructure) {
    // console.log('gotoAndTransfer', target)
    if (creep.pos.getRangeTo(target) > 1) {
      creep.task = Tasks.goTo(target)
    } else {
      creep.task = Tasks.transfer(target)
    }
  }

  public static gotoAndUpgrade(creep: Creep, controller: StructureController) {
    // console.log('gotoAndUpgrade')
    if (creep.pos.getRangeTo(controller) > 1) {
      creep.task = Tasks.goTo(controller)
    } else {
      creep.task = Tasks.upgrade(controller)
    }
  }

  public static findClosestEnergyStructure(creep: Creep, container: StructureContainer): EnergyStructure {
    let structures = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        const extensions = (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity)
        const spawns = (structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity)
        const towers = (structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity)
        let storage = false;
        if (structure.structureType == STRUCTURE_STORAGE) {
          const currentlyStored = _.sum(_.values(structure.store))
          storage = currentlyStored < structure.storeCapacity
        }
        return (extensions || spawns || towers || storage)
      }
    }) as EnergyStructure[];

    const priorities = [
      STRUCTURE_SPAWN,
      STRUCTURE_TOWER,
      STRUCTURE_EXTENSION,
      STRUCTURE_STORAGE,
    ]

    // sort by priority and then range
    structures = structures.sort((a: any, b: any) => {
      let res = u.compareValues(priorities.indexOf(a.structureType), priorities.indexOf(b.structureType))
      return res === 0
        ? u.compareValues(creep.pos.getRangeTo(a), creep.pos.getRangeTo(b))
        : res;
    })
    return structures[0]
  }
}
