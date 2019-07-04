import { Spawner } from "spawner/Spawner";
import { Architect } from "Architect";
import { MiningMinister } from "mining/MiningMinister";
import { TowersManager } from "TowersManager";
import { TickRunner } from "TickRunner";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleUpgrader } from "roles/RoleUpgrader";
import { RoleBuilder } from "roles/RoleBuilder";

export class RoomCommander extends TickRunner {
  spawner: Spawner;
  architect: Architect;
  miningMinister: MiningMinister;
  towersManager: TowersManager;
  minUpgraders = 2;
  minBuilders = 2;
  upgraders: Creep[] = [];
  builders: Creep[] = [];
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
    this.instanciateObjectsFromMemory<Creep>(this.upgraders, 'upgraders')
    this.instanciateObjectsFromMemory<Creep>(this.builders, 'builders')
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

    if (!this.memory.ctrlRoads) {
      let controllerEnergeySources = _.sortBy(this.room.find(FIND_SOURCES_ACTIVE), s => this.room.controller!.pos.getRangeTo(s))
      if (controllerEnergeySources.length > 0) {
        global.pubSub.publish('BUILD_ROAD_NEEDED', {
          from: this.room.controller!.pos,
          to: controllerEnergeySources[0].pos
        })
      }
      this.memory.ctrlRoads = true
    }

    if (this.roomBuildersNeeded()) {
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'builder',
        priority: 1,
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

    _.forEach(this.builders, creep => {
      if (creep.isIdle) {
        RoleBuilder.newTask(creep);
      }
      creep.run()
    })

    super.act()
  }

  upgradersNeeded(): number {
    return this.minUpgraders - this.upgraders.length;
  }

  roomBuildersNeeded(): boolean {
    return !!this.memory.ctrlRoads && ((this.minBuilders - this.builders.length) > 0);
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

  instanciateObjectsFromMemory<T>(objects: T[], memoryKey: string): void {
    this.memory[memoryKey] = _.reduce(this.memory[memoryKey] as string[], (out: string[], id: string) => {
      const object = Game.getObjectById(id) as T
      if (object) {
        out.push(id);
        objects.push(object)
      }
      return out;
    }, []) as string[];
  }
}
