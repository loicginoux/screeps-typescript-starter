import { Utils } from "./Utils";

type InotifCallback = (...args: any[]) => number;

interface IPubSubRegistry {
  [key: string]: InotifCallback[];
}

class PubSub {

  private registry: IPubSubRegistry

  constructor() {
    this.registry = {}
  }

  public subscribe(name: PubSubEventTypes, fn: InotifCallback) {
    if (!this.registry[name]) {
      this.registry[name] = [fn];
    } else {
      this.registry[name].push(fn);
    }
  }

  public publish(name: PubSubEventTypes, ...args: any[]) {
    Utils.log(name)
    if (!this.registry[name]) return;
    _.forEach(this.registry[name], x => {
      x.apply(null, args);
    });
  }
}

export const pubSub = new PubSub();
