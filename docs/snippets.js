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
Game.rooms.E17N41.createConstructionSite(21, 14, STRUCTURE_TOWER)
