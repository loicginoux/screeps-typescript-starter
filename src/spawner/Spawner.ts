import * as subs from "./sub-spawners";
import { u } from "utils/Utils";
import { SpawningRequest } from "spawner/SpawningRequest";
import { TickRunner } from "TickRunner";


export class Spawner extends TickRunner {

  spawningRequests: SpawningRequest[];
  availableSpawner: StructureSpawn[] | null;

  constructor(private room: Room) {
    super()
    this.spawningRequests = []
    this.availableSpawner = []
    global.pubSub.subscribe('SPAWN_REQUEST', this.storeSpawnRequest.bind(this))
  }

  preCheck() {
    this.availableSpawner = this.room.find(FIND_MY_STRUCTURES, {
      filter: i => i.structureType === STRUCTURE_SPAWN && !i.spawning && i.energy > 0
    }) as StructureSpawn[] | null;

    // u.log('Spawner precheck', this.availableSpawner)

    if (!this.availableSpawner) {
      return ERR_NOT_FOUND
    }
    if (this.availableSpawner.length == 0) {
      return ERR_BUSY;
    }

    // spawner with less energy first
    this.availableSpawner = _.sortBy(this.availableSpawner, (spawner) => spawner.energy)

    return OK;
  }

  act() {
    // sort by desc priority
    this.spawningRequests = _.sortBy(this.spawningRequests, req => -1 * req.priority)
    // only process 1 request per spawner in room
    let processableRequests = _.take(this.spawningRequests, this.availableSpawner!.length)
    // u.log('Spawner act', processableRequests)
    // u.log("this.availableSpawner", this.availableSpawner)
    _.forEach(processableRequests, req => {
      req.spawner = this.availableSpawner!.pop();
      this.spawn(req)
    })
  }

  storeSpawnRequest(spawningRequest: SpawningRequest): number {
    this.spawningRequests.push(spawningRequest);
    return OK;
  }

  // build sub spawner
  getSpawnerFor(spawningRequest: SpawningRequest) {
    // upcase first letter to get class
    let className = `${u.capitalizeFirstLetter(spawningRequest.role)}Spawner`;
    let subSpawnerClass: any = (subs as any)[className]
    if (subSpawnerClass === undefined || subSpawnerClass === null) {
      throw new Error(`Class type of \'${className}\' is not a spawner`);
    }
    spawningRequest.room = this.room;
    return new subSpawnerClass(spawningRequest)
  }

  spawn(spawningRequest: SpawningRequest): Creep {
    u.log(`trying spawning ${spawningRequest.role}`)
    return this.getSpawnerFor(spawningRequest).spawn();
  }
}
