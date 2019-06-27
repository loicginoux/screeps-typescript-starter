import * as subs from "./sub-spawners";

export class Spawner {
  constructor(private room: Room) { }

  spawn(type: string, spawningOptions: Object): Creep {
    let subSpawnerClass: any = new (subs as any)[`${type}Spawner`];
    let subSpawner = subSpawnerClass(spawningOptions)
    return subSpawner.spawn();
  }

  findUsableSpawner(): StructureSpawn | null {
    let firstSpawn = this.room.find(FIND_MY_STRUCTURES, {
      filter: i => i.structureType === "spawn"
    })[0] as StructureSpawn | null;
    return firstSpawn;
  }
}
