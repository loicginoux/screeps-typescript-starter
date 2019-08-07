import { Tasks } from 'creep-tasks/Tasks'
import { u } from "utils/Utils";
import { RoomDiscovery } from "utils/RoomDiscovery";
import { assertTSPropertySignature } from 'babel-types';

interface IExplorerMemory extends CreepMemory {
  selectedExit: RoomPosition | null;
  currentRoomName: string | null;
}

export class RoleExplorer {
  public static newTask(creep: Creep): void {
    const memory = creep.memory as IExplorerMemory;

    if (memory.selectedExit && memory.currentRoomName !== creep.room.name) {
      memory.selectedExit = null;
      memory.currentRoomName = null;
      console.log(creep.name, "checking room", creep.room.name)
      new RoomDiscovery(creep.room, creep).checkRoom()
    }

    if (!memory.selectedExit) {
      let nextRoom = this.findNextRoomToCheck(creep);

      const possibleExits = creep.room.find(nextRoom.exit);
      const selectedExit = possibleExits[_.random(0, possibleExits.length - 1)];

      memory.selectedExit = selectedExit;
      memory.currentRoomName = creep.room.name;
      // console.log("Explorer, selected exit:", selectedExit.x, selectedExit.y, selectedExit.roomName);
      console.log(creep.name, "current room", creep.room.name, "going to", nextRoom.room, JSON.stringify(memory.selectedExit));

    }

    creep.travelTo(new RoomPosition(memory.selectedExit.x, memory.selectedExit.y, memory.selectedExit.roomName));
  }

  static findNextRoomToCheck(creep: Creep): { exit: ExitConstant, room: string } {
    const exits = Game.map.describeExits(creep.room.name)
    const adjsRooms: string[] = _.values(exits)
    const findExits: string[] = _.keys(exits)
    const rand = _.random(0, adjsRooms.length - 1)
    let nextRoom = adjsRooms[rand]
    let nextExit = findExits[rand]
    return { exit: parseInt(nextExit) as ExitConstant, room: nextRoom }
  }

  exploreRoomsOfRange(range: number) {
    // loop through unknown room in memory of range range
    // // go to room
    // // // if entering new room
    // // // // check room
    // // // // if creep in danger
    // // // // // go back to previous room
    // // save/update room discovery
    // increase room range of creep memory
    // exploreRooms of range in creep memory
  }

  isRoomDangerous() {
    // has tower
    // or creep with attack body parts
    return false
  }

  isRoomGoodForHarvesting() {
    // is not highway
    // is not dangerous
    //
  }

  isRoomGoodForDeployingNewBase() {

  }
}
