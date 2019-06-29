import { Spawner } from "spawner/Spawner";
import { Architect } from "Architect";
import { MiningMinister } from "mining/MiningMinister";
import { TickRunner } from "TickRunner";
export class RoomCommander extends TickRunner {
  spawner: Spawner;
  architect: Architect;
  miningMinister: MiningMinister;

  constructor(private room: Room) {
    super()
    this.spawner = new Spawner(this.room)
    this.architect = new Architect(this.room)
    this.miningMinister = new MiningMinister(this.room)
    return this
  }

  employees(): any[] {
    return [this.spawner, this.miningMinister];
  }
}
