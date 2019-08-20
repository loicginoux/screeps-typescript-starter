import { SubSpawner } from "spawner/SubSpawner";
// do not forget to add new spawner to the list of spawners in spawner/index.ts
export default class RemoteMiningSiteTruckSpawner extends SubSpawner {
  bodyPartsTemplate(): any[] {
    const remoteTruck = [
      {
        bodyParts: [CARRY, MOVE],
        maxCount: 10,
      },
      {
        bodyParts: [WORK],
        maxCount: 3,
      }
    ]

    return remoteTruck

    // const buildingTruck = [
    //   {
    //     bodyParts: [WORK, CARRY, MOVE],
    //     maxCount: 4,
    //   }
    // ]
    // let constructionSites: any[] = [];

    // console.log("this.spawningRequest", JSON.stringify(this.spawningRequest))
    // if (this.spawningRequest.memory.miningSourceId) {
    //   const source: Source | null = Game.getObjectById(this.spawningRequest.memory.miningSourceId)
    //   if (source) {
    //     const remoteRoom = source.room
    //     constructionSites = remoteRoom.find(FIND_MY_CONSTRUCTION_SITES)
    //     console.log("this.spawningRequest.memory.miningSourceId", this.spawningRequest.memory.miningSourceId)
    //   }
    // }
    // console.log("constructionSites", constructionSites.length)
    // return (constructionSites.length > 0) ? buildingTruck : remoteTruck
  }
}
