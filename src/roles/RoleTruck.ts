import { default as Tasks } from 'creep-tasks'
// import { EnergyStructure } from 'creep-tasks/utilities/helpers';

export class RoleTruck {
  public static newTask(creep: Creep, container: StructureContainer): void {
    // creep has no evergy, go to container 1 get some
    if (creep.carry.energy < creep.carryCapacity) {
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
          this.gotoAndUpgrade(creep, controller)
        }
      }
    }
  }

  public static gotoAndWithdraw(creep: Creep, container: StructureContainer) {
    // console.log('gotoAndWithdraw', container)
    if (creep.pos.getRangeTo(container) > 2) {
      creep.task = Tasks.goTo(container.pos)
    } else {
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
    return creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity
        // structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity ||
        // structure.structureType == STRUCTURE_CONTAINER && structure.id != container.id;
      }
    })[0] as EnergyStructure;
  }
}
