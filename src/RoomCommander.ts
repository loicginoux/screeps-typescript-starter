import { Spawner } from "spawner/Spawner";
import { Architect } from "Architect";
import { MiningMinister } from "mining/MiningMinister";
import { TowersManager } from "TowersManager";
import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleUpgrader } from "roles/RoleUpgrader";

export class RoomCommander extends TickRunner {
  spawner: Spawner;
  architect: Architect;
  miningMinister: MiningMinister;
  towersManager: TowersManager;
  minUpgraders = 2;
  upgraders: Creep[];
  memory: RoomMemory;

  constructor(private room: Room) {
    super()
    this.memory = Memory.rooms[this.room.name];
    this.spawner = new Spawner(this.room)
    this.architect = new Architect(this.room)
    this.miningMinister = new MiningMinister(this.room)
    this.towersManager = new TowersManager(this.room)
  }

  loadData() {
    this.upgraders = []
    this.loadUpgraders()
    super.loadData();
  }

  employees(): any[] {
    return [this.spawner, this.miningMinister, this.towersManager];
  }

  preCheck(): number {
    if (this.upgradersNeeded() > 0) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'upgrader',
        priority: Game.gcl.level,
        room: this.room
      } as SpawningRequest)
    }
    super.preCheck()
    return OK;
  }

  act() {
    _.forEach(this.upgraders, creep => {
      if (creep.isIdle) {
        RoleUpgrader.newTask(creep);
      }
      creep.run()
    })
    super.act()
  }

  upgradersNeeded(): number {
    return this.minUpgraders - this.upgraders.length;
  }

  loadUpgraders(): void {
    let updatedUpgradersMemory: string[] = []
    if (this.memory) {
      _.forEach(this.memory.upgraders, i => {
        const creep = Game.getObjectById(i) as Creep
        if (creep) {
          this.upgraders.push(creep)
          updatedUpgradersMemory.push(creep.id)
        }
      });
      // dead creep are removed from memory
      Memory.rooms[this.room.name].upgraders = updatedUpgradersMemory
    }
  }
}
