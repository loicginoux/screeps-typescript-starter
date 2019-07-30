import { Tasks } from 'creep-tasks/Tasks'
import { EnergyStructure } from 'creep-tasks/utilities/helpers';
import { u } from 'utils/Utils';

export class RoleUpgrader {
  public static newTask(creep: Creep, availableEnergyStructures: EnergyStructure[]): void {

    if (creep.carry.energy == 0) {
      u.whileCheckForDroppedEnergy(creep, () => {
        this.getEnergy(creep, availableEnergyStructures);
      })
    } else {
      const controller = creep.room.controller
      if (controller) {
        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
          creep.travelTo(controller);
        }
      }
    }
  }


  public static getEnergy(creep: Creep, availableEnergyStructures: EnergyStructure[]): void {
    const priorities = [
      STRUCTURE_LINK,
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
      // console.log("upgrader availableEnergyStructures[0]", creep.pos, availableEnergyStructures[0].structureType, availableEnergyStructures[0].pos)
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
}
