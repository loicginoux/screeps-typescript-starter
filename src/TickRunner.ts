export abstract class TickRunner {

  constructor() { }

  public run(): void {
    this.loadData()
    this.preCheck()
    this.act()
    this.finalize()
  }

  employees(): any[] {
    return []
  }

  loadData(): void {
    this.employees().forEach(employee => {
      employee.loadData()
    });
  }

  preCheck(): void {
    this.employees().forEach(employee => {
      employee.preCheck()
    });
  }

  act(): void {
    this.employees().forEach(employee => {
      employee.act()
    });
  }

  finalize(): void {
    this.employees().forEach(employee => {
      employee.finalize()
    });
  }
}
