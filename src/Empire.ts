import { TickRunner } from "TickRunner";
import { RoomCommander } from "RoomCommander";

export class Empire extends TickRunner {
  roomCommanders!: RoomCommander[];

  employees(): TickRunner[] { return this.roomCommanders; }

  // build memory data from creeps roles (including newly spawned)
  // build memory data from finished construction sites
  loadData(): void {
    this.roomCommanders = _.map(Game.rooms, room => {
      const roomCommander = new RoomCommander(room)
      return roomCommander
    });
    // do not forget
    super.loadData();
  }
}
