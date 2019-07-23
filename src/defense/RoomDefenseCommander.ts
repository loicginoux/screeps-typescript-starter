import { TickRunner } from "TickRunner";

export class RoomDefenseManager extends TickRunner {
  constructor(private room: Room) {
    super()
  }
}
