import { Tasks } from 'creep-tasks/Tasks'
import { EnergyStructure } from 'creep-tasks/utilities/helpers';
import { RoleRemoteMiningSiteTruck } from "roles/RoleRemoteMiningSiteTruck";
import { u } from "utils/Utils";


export class RoleDismantler extends RoleRemoteMiningSiteTruck {
  public static newTask(creep: Creep, neededEnergyStructures: EnergyStructure[]): void {
    // creep has no evergy, go to container 1 get some
    if (creep.carry.energy == 0) {
      u.whileCheckForDroppedEnergy(creep, () => {
        this.dismantle(creep);
      })
    } else {
      // console.log(creep.name, " try building")
      let constructionSite = u.tryBuilding(creep);
      if (!constructionSite) {
        this.whileCheckForRepairSite(creep, () => {
          this.transferEnergy(creep, neededEnergyStructures)
        })
      }
    }
  }

  public static dismantle(creep: Creep): void {

    let availableEnergyStructures = Game.rooms[creep.memory.roomTarget].find(FIND_HOSTILE_STRUCTURES)

    availableEnergyStructures = availableEnergyStructures.sort((a: any, b: any) => {
      return u.compareValues(creep.pos.getRangeTo(a), creep.pos.getRangeTo(b))
    })

    // get from containers first
    if (availableEnergyStructures.length > 0) {
      if (creep.pos.getRangeTo(availableEnergyStructures[0]) > 1) {
        creep.task = Tasks.goTo(availableEnergyStructures[0])
      } else {
        creep.task = Tasks.dismantle(availableEnergyStructures[0])
      }
    }
  }
}
