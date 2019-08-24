// fake spawn something
Game.rooms.E17N41.find(FIND_MY_STRUCTURES, {
  filter: function (i) { return i.structureType === "spawn"; }
})[0].spawnCreep([WORK, CARRY, MOVE, WORK, CARRY, MOVE], 'hell', {
  dryRun: true
});


// find spawns in room
Game.rooms.sim.find(FIND_MY_STRUCTURES, {
  filter: i => {
    return i.structureType === STRUCTURE_SPAWN
  }
})

// find construction sites
_.each(Game.rooms.E17N41.find(FIND_MY_CONSTRUCTION_SITES, {
  filter: i => {
    return i.structureType == STRUCTURE_ROAD
  }
}), (r) => r.remove())


// find available terrains near point
_.find(Game.rooms.E17N41.lookForAtArea(LOOK_TERRAIN, 4 - 1, 21 - 1, 4 + 1, 21 + 1, true), function (t) { return t.terrain == 'plain' })


// closest construction site or source
var constructionSite = _.sortBy(creep.room.find(FIND_CONSTRUCTION_SITES), s => creep.pos.getRangeTo(s))
var sources = _.sortBy(creep.room.find(FIND_SOURCES_ACTIVE), s => creep.pos.getRangeTo(s))

// create construction site
Game.rooms.W11N11.createConstructionSite(28, 19, STRUCTURE_SPAWN)
Game.rooms.E17N41.createConstructionSite(22, 13, STRUCTURE_CONTAINER)
Game.rooms.E17N41.createConstructionSite(45, 37, STRUCTURE_RAMPART);
Game.rooms.E17N41.createConstructionSite(47, 37, STRUCTURE_WALL);
Game.rooms.E17N41.createConstructionSite(44, 37, STRUCTURE_WALL);
Game.rooms.W9N16.createConstructionSite(32, 22, STRUCTURE_ROAD);
Game.rooms.E17N41.createConstructionSite(24, 16, STRUCTURE_EXTENSION);
Game.rooms.E17N41.createConstructionSite(23, 9, STRUCTURE_LINK);
Game.rooms.E17N41.createConstructionSite(24, 35, STRUCTURE_LINK);


JSON.stringify(mainRoom.room.findPath((new RoomPosition(12, 17, mainRoom.room.name)), (new RoomPosition(17, 16, mainRoom.room.name)), {
  ignoreCreeps: true,
  maxRooms: 1
}))


  (new RoomPosition(10, 10, "E17N40")).room.findExitTo((new RoomPosition(10, 10, "E17N41")).room)

_.forEach(Memory.roomExploration, function (roomMemo) {
  roomMemo.nearestCity = { room: "E1N35", range: Game.map.findRoute(roomMemo.name, 'E1N35').length };
  Memory.roomExploration[roomMemo.name] = roomMemo;
});
