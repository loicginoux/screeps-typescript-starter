import { Tasks } from 'creep-tasks/Tasks'
import { EnergyStructure } from 'creep-tasks/utilities/helpers';
import { Spawner } from 'spawner/Spawner';
import { u } from "utils/Utils";
import { EnergyManager } from "EnergyManager";


export class RoleMiningSiteTruck {
  public static newTask(creep: Creep, availableEnergyStructures: EnergyStructure[], neededEnergyStructures: EnergyStructure[]): void {
    // creep has no evergy, go to container 1 get some
    if (creep.carry.energy == 0) {
      u.whileCheckForDroppedEnergy(creep, () => {
        this.getEnergy(creep, availableEnergyStructures);
      })
    } else {
      let structure = this.transferEnergy(creep, neededEnergyStructures)
      // console.log(creep.name, "neededEnergyStructures[0]", structure)
      if (!structure) {
        // console.log(creep.name, " try building")
        u.tryBuilding(creep);
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
    //   return totalEnergyWillBeWithdraw + creep.carryCapacity <= i.store.energy
    // })
    // if (creep.name == "miningSiteTruck_1036414") {
    //   console.log(creep.name, "availableEnergyStructures", JSON.stringify(availableEnergyStructures))
    // }
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
        // if (creep.name == "miningSiteTruck_487040") {
        //   console.log("a.store", JSON.stringify(a.store), a.id, aFullEnough)
        //   console.log("b.store", JSON.stringify(b.store), b.id, bFullEnough)
        //   console.log("res", res, creep.carryCapacity)
        // }
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
        // creep.task = Tasks.goTo(availableEnergyStructures[0])
        // global.pubSub.publish('ASSIGNED_ENERGY_TARGET', { creep: creep, target: availableEnergyStructures[0] })
        creep.travelTo(availableEnergyStructures[0])
      } else {
        // if (creep.name == "miningSiteTruck_1036414") {
        //   console.log(creep.name, "withdrawing from", availableEnergyStructures[0].structureType, availableEnergyStructures[0].pos)
        // }
        // global.pubSub.publish('UNASSIGNED_ENERGY_TARGET', { creep: creep, target: availableEnergyStructures[0] })
        creep.task = Tasks.withdraw(availableEnergyStructures[0])
      }
      // } else {
      //   // else get from source directly
      //   let sources = creep.room.find(FIND_SOURCES_ACTIVE) as Source[]
      //   sources = _.sortBy(sources, s => creep.pos.getRangeTo(s))
      //   if (sources.length > 0) {
      //     if (creep.pos.getRangeTo(sources[0]) > 1) {
      //       // creep.task = Tasks.goTo(sources[0])
      //       creep.travelTo(sources[0])
      //     } else {
      //       creep.task = Tasks.harvest(sources[0])
      //     }
      //   }
    }
  }

  public static transferEnergy(creep: Creep, neededEnergyStructures: EnergyStructure[]) {
    const priorities = [
      STRUCTURE_STORAGE,
      STRUCTURE_TOWER,
      STRUCTURE_EXTENSION,
      STRUCTURE_SPAWN,
      STRUCTURE_LINK,
    ]

    // sort by priority and then range
    neededEnergyStructures = _.filter(neededEnergyStructures, i => _.includes(priorities, i.structureType))
    neededEnergyStructures = neededEnergyStructures.sort((a: any, b: any) => {
      let res = u.compareValues(priorities.indexOf(a.structureType), priorities.indexOf(b.structureType))
      return res === 0
        ? u.compareValues(creep.pos.getRangeTo(a), creep.pos.getRangeTo(b))
        : res;
    })

    // get from containers first
    if (neededEnergyStructures.length > 0) {
      // console.log("mining site truck neededEnergyStructures[0]", creep.pos, neededEnergyStructures[0].structureType, neededEnergyStructures[0].pos)
      if (creep.pos.getRangeTo(neededEnergyStructures[0]) > 1) {
        // creep.task = Tasks.goTo(neededEnergyStructures[0])
        creep.travelTo(neededEnergyStructures[0])
      } else {
        creep.task = Tasks.transfer(neededEnergyStructures[0])
      }
    }
    return neededEnergyStructures[0]
  }
}
