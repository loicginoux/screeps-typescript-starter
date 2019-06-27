export abstract class TickRunner {
  protected preCheckRes: number = OK;

  constructor() {

  }

  public run(): void {
    // pre check for all first
    this.preCheck()
    // action for all
    this.act()
    this.finalize()
  }

  employees(): any[] {
    return []
  }


  preCheck(): number {
    this.employees().forEach(employee => {
      employee.preCheck()
    });
    return this.preCheckRes;
  }

  act(): void {
    this.employees().forEach(employee => {
      if (employee.preCheckRes == OK) {
        employee.act()
      }
    });
  }

  finalize(): void {
    this.employees().forEach(employee => {
      employee.finalize()
    });
  }
}
