import { Tasks } from 'creep-tasks/Tasks'
// import { EnergyStructure } from 'creep-tasks/utilities/helpers';

export class RoleMiningSiteBuilder {
  public static newTask(creep: Creep, source: Source): void {
    if (creep.carry.energy == 0) {
      if (creep.pos.getRangeTo(source) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.harvest(source)
      }
    } else {
      // u.log("findClosestEnergyStructure")
      let buildingContainers = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {
        filter: i => i.structureType === STRUCTURE_CONTAINER
      })

      if (buildingContainers[0]) {
        if (creep.pos.getRangeTo(buildingContainers[0]) > 1) {
          creep.task = Tasks.goTo(buildingContainers[0])
        } else {
          creep.task = Tasks.build(buildingContainers[0])
        }
      }

    }
  }
}
