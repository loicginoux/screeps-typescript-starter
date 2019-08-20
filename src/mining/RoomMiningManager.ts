import { TickRunner } from "TickRunner";
import { MiningSite } from "mining/MiningSite";
import { RemoteMiningSite } from "mining/RemoteMiningSite";
import { SpawningRequest } from "spawner/SpawningRequest";
import { RoleBuilder } from "roles/RoleBuilder";
import { RoomDiscovery } from "utils/RoomDiscovery";

export class RoomMiningManager extends TickRunner {
  private miningSites: MiningSite[];
  // builders: Creep[] = [];
  memory: RoomMemory;
  // minBuilders = 2;

  constructor(private room: Room, private remote = false) {
    super()
    this.miningSites = [];
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

  // loadData() {
  //   this.initMemory()
  //   _.forEach(Game.creeps, creep => {
  //     if (creep.memory.roomTarget && creep.memory.roomTarget == this.room.name) {
  //       if (creep.name.includes('builder')) {
  //         this.builders.push(creep)
  //       }
  //     }
  //   })

  //   super.loadData();
  // }

  // preCheck(): number {
  //   if (this.roomBuildersNeeded()) {
  //     const roomDiscovery = new RoomDiscovery(this.room)
  //     const cityRoom = Game.rooms[roomDiscovery.memory.nearestCity.room]
  //     global.pubSub.publish('SPAWN_REQUEST', {
  //       role: 'builder',
  //       memory: {
  //         room: cityRoom.name,
  //         roomTarget: this.room.name
  //       },
  //       priority: 1,
  //       room: this.room
  //     } as SpawningRequest)
  //   }
  //   return OK
  // }

  // roomBuildersNeeded(): boolean {
  //   const constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES)
  //   return (this.minBuilders - this.builders.length) > 0 && constructionSites.length > 0;
  // }

  employees(): any[] { return this.miningSites; }

  // act(): void {
  //   _.forEach(this.builders, this.builderAction.bind(this))
  // }

  // builderAction(creep: Creep) {Z
  //   if (creep.isIdle) {
  //     RoleBuilder.newTask(creep, this.availableEnergySources);
  //   }
  //   creep.run()
  // }

}
