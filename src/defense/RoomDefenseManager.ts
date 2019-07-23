import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleSoldier } from "roles/RoleSoldier";

export class RoomDefenseManager extends TickRunner {
  memory: RoomDefenseManagerMemory;
  soldiers: Creep[] = [];

  constructor(private room: Room) {
    super()
    global.pubSub.subscribe('ROOM_ATTACKED', this.runDefenseMode.bind(this))
  }

  loadData() {
    this.initMemory()
    this.loadSoldiers()
    super.loadData();
  }

  initMemory() {
    if (!Memory.rooms[this.room.name].defenseManager) {
      Memory.rooms[this.room.name].defenseManager = {}
    }
    this.memory = Memory.rooms[this.room.name].defenseManager;
  }


  preCheck(): number {
    if (this.attackTerminated()) {
      this.memory.defenseMode = false;
    }

    if (this.defendersNeeded()) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'soldier',
        room: this.room,
        priority: 50
      } as SpawningRequest)
      // return OK, no need for trucks driver for harvester to start working
      // this.preCheckResult = ERR_NOT_ENOUGH_RESOURCES
    }
    return OK
  }

  runDefenseMode(): void {
    this.memory.defenseMode = true;
  }

  defendersNeeded(): boolean | undefined {
    return this.memory.defenseMode
  }

  attackTerminated(): boolean {
    let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    return hostiles.length == 0
  }

  loadSoldiers(): void {
    _.forEach(Game.creeps, creep => {
      if (creep.name.includes('soldier')) {
        this.soldiers.push(creep)
      }
    })
  }

  act(): void {
    _.forEach(this.soldiers, creep => {
      if (creep.isIdle) {
        RoleSoldier.newTask(creep, this.room);
      }
      creep.run()
    })
  }
}
