import { TickRunner } from "TickRunner";
import { MiningSite } from "mining/MiningSite";
export class MiningMinister extends TickRunner {
  miningSites: MiningSite[];
  constructor(private room: Room) {
    super()
  }

  employees(): any[] {
    return this.miningSites;
  }
}
