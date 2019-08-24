import { TickRunner } from "TickRunner";
import { Architect } from "Architect";
import { RoomCommander } from "RoomCommander";
import { EnergyManager } from "EnergyManager";
import { SafeModeActivator } from "utils/SafeModeActivator";
import { u } from 'utils/Utils';

// import { SpawningRequest } from "spawner/SpawningRequest";
// import { RoleExplorer } from "roles/RoleExplorer";

export class Empire extends TickRunner {
  memory: Memory;
  roomCommanders!: RoomCommander[];
  architect: Architect;
  energyManager: EnergyManager;
  minExplorer = 1;
  explorers: Creep[] = [];

  constructor() {
    super()
    this.architect = new Architect()
    this.energyManager = new EnergyManager()
  }

  initMemory() {
    // if (!Memory.energyManager) { Memory.energyManager = {} }
    Memory.mainRooms = []
    this.memory = Memory;


  }

  employees(): TickRunner[] {
    let a: TickRunner[] = this.roomCommanders
    let b: TickRunner[] = [this.energyManager]
    return a.concat(b);
  }

  // build memory data from creeps roles (including newly spawned)
  // build memory data from finished construction sites
  loadData(): void {
    this.initMemory();
    this.roomCommanders = []
    _.forEach(Game.rooms, room => {
      let firstSpawner = room.find(FIND_MY_STRUCTURES, {
        filter: i => i.structureType === STRUCTURE_SPAWN
      }) as StructureSpawn[];
      if (firstSpawner[0]) {
        Memory.mainRooms.push(room.name)
        this.roomCommanders.push(new RoomCommander(room))
      }
    });
    // do not forget
    super.loadData();
  }

  preCheck() {
    super.preCheck()
    return OK;
  }

  act() {
    SafeModeActivator.activeSafeModeIfNecessary()

    super.act()
  }

  finalize() {
    u.displayVisualRoles();
    super.finalize()
  }
}
