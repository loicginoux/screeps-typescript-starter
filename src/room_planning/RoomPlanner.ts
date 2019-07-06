import { roadPlanner } from 'room_planning/RoadPlanner'

export class RoomPlanner {
  constructor(public room: Room) {
  }

  run() {
    let firstSpawner = this.room.find(FIND_MY_STRUCTURES, {
      filter: i => i.structureType === STRUCTURE_SPAWN
    })
    if (firstSpawner) {
      const terrain = new Room.Terrain(this.room.name);
      let roads = roadPlanner(firstSpawner[0].pos)
      roads.buildings.road.pos.forEach(roadPos => {
        let terrainType = terrain.get(roadPos.x, roadPos.y)
        if (terrainType != TERRAIN_MASK_WALL) {
          this.room.createConstructionSite(roadPos.x, roadPos.y, STRUCTURE_ROAD)
        }
      });
    }
  }
}
