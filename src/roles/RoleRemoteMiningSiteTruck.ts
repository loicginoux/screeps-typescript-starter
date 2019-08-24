import { Tasks } from 'creep-tasks/Tasks'
import { EnergyStructure } from 'creep-tasks/utilities/helpers';
import { RoleMiningSiteTruck } from "roles/RoleMiningSiteTruck";
import { u } from "utils/Utils";
import { EnergyManager } from "EnergyManager";


export class RoleRemoteMiningSiteTruck extends RoleMiningSiteTruck {
  public static newTask(creep: Creep, availableEnergyStructures: EnergyStructure[], neededEnergyStructures: EnergyStructure[]): void {
    // creep has no evergy, go to container 1 get some
    console.log(creep.name, "new task")
    creep.memory.energyTarget = null;
    if (creep.carry.energy == 0) {
      // u.whileCheckForDroppedEnergy(creep, () => {
      this.getEnergy(creep, availableEnergyStructures);
      // })
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

  public static getEnergy(creep: Creep, availableEnergyStructures: EnergyStructure[]): void {
    const priorities = [
      STRUCTURE_CONTAINER
    ]

    // only get energy from containers
    // sorted by container must be full enough first
    // and then range
    availableEnergyStructures = _.filter(availableEnergyStructures, i => _.includes(priorities, i.structureType))
    // availableEnergyStructures = _.filter(availableEnergyStructures, (i: StructureContainer) => {
    //   // only keep containers that will have energy when all creeps assigned withdraw their part
    //   let creepsAssigned = EnergyManager.getCreepsAssignedToEnergyTarget(i)
    //   const totalEnergyWillBeWithdraw = _.reduce(creepsAssigned, (total, c: Creep) => {
    //     return (c) ? (total + c.carryCapacity) : total;
    //   }, 0);
    //   console.log("totalEnergyWillBeWithdraw", totalEnergyWillBeWithdraw, creep.carryCapacity, JSON.stringify(i.pos), i.store.energy)
    //   return totalEnergyWillBeWithdraw + creep.carryCapacity <= i.store.energy
    // })
    // if (creep.name == "miningSiteTruck_1036414") {
    //   console.log(creep.name, "availableEnergyStructures", JSON.stringify(availableEnergyStructures))
    // }
    console.log(creep.name, "availableEnergyStructures", availableEnergyStructures.length)
    availableEnergyStructures = availableEnergyStructures.sort((a: any, b: any) => {
      let res = u.compareValues(priorities.indexOf(a.structureType), priorities.indexOf(b.structureType))
      if (res === 0) {
        let aFullEnough = 1
        if (a.store.energy >= creep.carryCapacity * 1.5) {
          aFullEnough = 0
        }
        let bFullEnough = 1
        if (b.store.energy >= creep.carryCapacity * 1.5) {
          bFullEnough = 0
        }
        res = u.compareValues(aFullEnough, bFullEnough)

        if (res === 0) {
          res = u.compareValues(creep.pos.getRangeTo(a), creep.pos.getRangeTo(b))
        }
      }
      return res;
    })

    // get from containers first
    if (availableEnergyStructures.length > 0) {
      // if (creep.name == "miningSiteTruck_1036414") {
      //   console.log(creep.name, "getting energy", availableEnergyStructures[0].structureType, availableEnergyStructures[0].pos)
      // }
      // console.log("mining site truck availableEnergyStructures[0]", creep.pos, availableEnergyStructures[0].structureType, availableEnergyStructures[0].pos)
      if (creep.pos.getRangeTo(availableEnergyStructures[0]) > 1) {
        // if (creep.name == "miningSiteTruck_1036414") {
        //   console.log(creep.name, "traveling to", availableEnergyStructures[0].structureType, availableEnergyStructures[0].pos)
        // }
        creep.task = Tasks.goTo(availableEnergyStructures[0])
        // creep.task = Tasks.chain([
        //   Tasks.goTo(availableEnergyStructures[0]),
        //   Tasks.withdraw(availableEnergyStructures[0])
        // ])

        global.pubSub.publish('ASSIGNED_ENERGY_TARGET', { creep: creep, target: availableEnergyStructures[0], log: false })
        // creep.travelTo(availableEnergyStructures[0])
      } else {
        // if (creep.name == "miningSiteTruck_1036414") {
        //   console.log(creep.name, "withdrawing from", availableEnergyStructures[0].structureType, availableEnergyStructures[0].pos)
        // }
        global.pubSub.publish('UNASSIGNED_ENERGY_TARGET', { creep: creep, target: availableEnergyStructures[0], log: false })
        creep.task = Tasks.withdraw(availableEnergyStructures[0])
      }
    }
  }

  // when creep is moving it checks for repair roads in remote rooms, if he does not found, he run the callback function
  public static whileCheckForRepairSite(creep: Creep, callback: () => any) {
    var structures = creep.pos.findInRange(FIND_STRUCTURES, 1).filter(s => { return s.hits / s.hitsMax < 0.8 });
    let found = false
    if (structures.length && creep.carry.energy > 0) {
      console.log(creep.name, 'found struct to repair at', structures[0].pos);
      creep.task = Tasks.repair(structures[0])
      found = true;
    }
    if (!found) {
      callback();
    }
  }
}
