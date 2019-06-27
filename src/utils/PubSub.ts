export class PubSub {
  private registry: Object = {}

  constructor() {
    this.registry = {}
  }

  public subscribe(name: string, fn: any) {
    if (!this.registry[name]) {
      this.registry[name] = [fn];
    } else {
      this.registry[name].push(fn);
    }
  }

  public publish(name: string, ...args: any) {
    if (!this.registry[name]) return;

    this.registry[name].forEach(x => {
      x.apply(null, args);
    });
  }
}
