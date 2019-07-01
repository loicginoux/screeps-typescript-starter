import { default as Tasks } from 'creep-tasks'
// import { EnergyStructure } from 'creep-tasks/utilities/helpers';

export class RoleBuilder {
  public static newTask(creep: Creep, source: Source): void {
    if (creep.carry.energy < creep.carryCapacity) {
      if (creep.pos.getRangeTo(source) > 1) {
        creep.task = Tasks.goTo(source.pos)
      } else {
        creep.task = Tasks.harvest(source)
      }
    } else {
      // Utils.log("findClosestEnergyStructure")
      const constructionSiteId = Memory.miningSites[source.id].buildingContainers[0]
      if (constructionSiteId) {
        const constructionSite = Game.getObjectById(constructionSiteId) as ConstructionSite
        if (constructionSite) {
          if (creep.pos.getRangeTo(constructionSite) > 1) {
            creep.task = Tasks.goTo(constructionSite)
          } else {
            creep.task = Tasks.build(constructionSite)
          }
        }
      } else {
        // all mining site buildings done
        // const controller = creep.room.controller
        // if (controller) {
        //   if (creep.pos.getRangeTo(controller) > 1) {
        //     creep.task = Tasks.goTo(controller.pos)
        //   } else {
        //     creep.task = Tasks.upgrade(controller)
        //   }
        // }
      }
    }
  }
}
