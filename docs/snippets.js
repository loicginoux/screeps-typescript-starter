// fake spawn something
Game.rooms.E17N41.find(FIND_MY_STRUCTURES, {
  filter: function (i) { return i.structureType === "spawn"; }
})[0].spawnCreep([WORK, CARRY, MOVE, WORK, CARRY, MOVE], 'hell', {
  dryRun: true
});


Game.rooms.sim.find(FIND_MY_STRUCTURES, {
  filter: i => {
    i.structureType === STRUCTURE_SPAWN
  }
})
