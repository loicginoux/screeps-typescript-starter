import { u } from "./Utils";

type InotifCallback = (...args: any[]) => number;

interface IPubSubRegistry {
  [key: string]: InotifCallback[];
}

export class PubSub {

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
    // console.log("subscribe to", name, this.registry[name].length)

  }

  public publish(name: PubSubEventTypes, ...args: any[]) {
    console.log(name, JSON.stringify(args))
    if (!this.registry[name]) return;
    _.forEach(this.registry[name], x => {
      x.apply(null, args);
    });
  }
}
