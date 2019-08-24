import { TickRunner } from "TickRunner";
import { MiningSite } from "mining/MiningSite";
import { RemoteMiningSite } from "mining/RemoteMiningSite";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleDismantler } from "roles/RoleDismantler";
import { RoomDiscovery } from "utils/RoomDiscovery";
import { EnergyStructure } from "creep-tasks/utilities/helpers";

export class RoomMiningManager extends TickRunner {
  private miningSites: MiningSite[];
  dismantlers: Creep[] = [];
  memory: RoomMemory;
  minDismantlers = 1;
  neededEnergySources: EnergyStructure[];

  constructor(private room: Room, private remote = false) {
    super()
    this.miningSites = [];
    global.pubSub.subscribe('ENERGY_NEEDED', this.storeNeededEnergySources.bind(this))
    var sources = this.room.find(FIND_SOURCES);
    for (var sourceIndex in sources) {
      var source = sources[sourceIndex];
      let miningSite = (remote) ? new RemoteMiningSite(source) : new MiningSite(source)
      this.miningSites.push(miningSite);
    }
  }

  // initMemory() {
  //   this.memory = Memory.rooms[this.room.name];
  // }

  loadData() {
    // this.initMemory()
    _.forEach(Game.creeps, creep => {
      if (creep.memory.roomTarget && creep.memory.roomTarget == this.room.name) {
        if (creep.name.includes('dismantler')) {
          this.dismantlers.push(creep)
        }
      }
    })

    super.loadData();
  }

  preCheck(): number {
    if (this.roomDismantlersNeeded()) {
      const roomDiscovery = new RoomDiscovery(this.room)
      const cityRoom = Game.rooms[roomDiscovery.memory.nearestCity.room]
      global.pubSub.publish('SPAWN_REQUEST', {
        role: 'dismantler',
        memory: {
          room: cityRoom.name,
          roomTarget: this.room.name
        },
        priority: 1,
        room: this.room
      } as SpawningRequest)
    }
    super.preCheck()
    return OK
  }

  roomDismantlersNeeded(): boolean {
    const hostileStructures = this.room.find(FIND_HOSTILE_STRUCTURES)
    return (this.minDismantlers - this.dismantlers.length) > 0 && hostileStructures.length > 0;
  }

  employees(): any[] { return this.miningSites; }

  act(): void {
    _.forEach(this.dismantlers, this.dismantlerAction.bind(this))
    super.act();
  }

  dismantlerAction(creep: Creep) {
    if (creep.isIdle) {
      RoleDismantler.newTask(creep, this.neededEnergySources);
    }
    creep.run()
  }

  // only transfer energy to base rooms
  storeNeededEnergySources(...args: any[]) {
    this.neededEnergySources = _.filter(args[0].structures, (s) => _.indexOf(Memory.mainRooms, s.room.name) != -1)
  }
}
