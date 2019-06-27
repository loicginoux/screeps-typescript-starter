import { TickRunner } from "TickRunner";
import { MiningSite } from "mining/MiningSite";
export class MiningMinister extends TickRunner {
  private miningSites: MiningSite[];

  constructor(private room: Room) {
    super()
    this.room
    this.miningSites = [];
    var sources = this.room.find(FIND_SOURCES);
    for (var sourceIndex in sources) {
      var source = sources[sourceIndex];
      this.miningSites.push(new MiningSite(source));
    }
  }

  employees(): any[] {
    return this.miningSites;
  }
}
