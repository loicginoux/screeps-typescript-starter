type notifEvent =
  | "BUILD_CONTAINER_NEEDED"
  | "BUILD_ROAD_NEEDED"
  | "SPAWN_NEEDED"
  ;

interface InotifCallback {
  (...args: any): Creep | void;
}
interface IPubSubRegistry {
  [key: string]: (InotifCallback)[];
}

class PubSub {

  private registry: IPubSubRegistry

  constructor() {
    this.registry = {}
  }

  public subscribe(name: notifEvent, fn: InotifCallback) {
    if (!this.registry[name]) {
      this.registry[name] = [fn];
    } else {
      this.registry[name].push(fn);
    }
  }

  public publish(name: notifEvent, ...args: any) {
    if (!this.registry[name]) return;

    this.registry[name].forEach(x => {
      x.apply(null, args);
    });
  }
}

export const pubSub = new PubSub();
