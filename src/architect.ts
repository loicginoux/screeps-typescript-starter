import { Utils } from "utils/utils";
import { pubSub } from "utils/PubSub";
import { MiningSite } from "mining/MiningSite";
export class Architect {
  constructor(private room: Room) {
    pubSub.subscribe('BUILD_CONTAINER_NEEDED', this.buildContainer)
    pubSub.subscribe('BUILD_ROAD_NEEDED', this.buildRoad)
  }

  buildContainer(miningSite: MiningSite) {

  }

  buildRoad() {

  }
}
