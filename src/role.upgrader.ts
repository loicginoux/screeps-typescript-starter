export class roleUpgrader {
  public static run(creep: Creep): void {
    if (creep.memory.working && creep.carry.energy == 0) {
      creep.memory.working = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
      creep.memory.working = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.working) {
      if (creep.room.controller && creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
    else {
      this.moveToClosestSource(creep)
      var sources = _.sortBy(creep.room.find(FIND_SOURCES), s => creep.pos.getRangeTo(s))

      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }

  public static moveToClosestSource(creep: Creep) {
    let goals = _.map(creep.room.find(FIND_SOURCES), function (source) {
      // We can't actually walk on sources-- set `range` to 1
      // so we path next to it.
      return { pos: source.pos, range: 1 };
    });

    let ret = PathFinder.search(creep.pos, goals,
      {
        // We need to set the defaults costs higher so that we
        // can set the road cost lower in `roomCallback`
        plainCost: 2,
        swampCost: 10,

        roomCallback: function (roomName) {

          let room = Game.rooms[roomName];
          // In this example `room` will always exist, but since
          // PathFinder supports searches which span multiple rooms
          // you should be careful!
          if (!room) return;
          let costs = new PathFinder.CostMatrix;

          room.find(FIND_STRUCTURES).forEach(function (struct) {
            if (struct.structureType === STRUCTURE_ROAD) {
              // Favor roads over plain tiles
              costs.set(struct.pos.x, struct.pos.y, 1);
            } else if (struct.structureType !== STRUCTURE_CONTAINER &&
              (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
              // Can't walk through non-walkable buildings
              costs.set(struct.pos.x, struct.pos.y, 0xff);
            }
          });

          // Avoid creeps in the room
          room.find(FIND_CREEPS).forEach(function (creep) {
            costs.set(creep.pos.x, creep.pos.y, 0xff);
          });

          return costs;
        },
      } as PathFinderOpts
    );

    let pos = ret.path[0];
    creep.move(creep.pos.getDirectionTo(pos));
  }
};
