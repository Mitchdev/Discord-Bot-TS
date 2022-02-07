/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Scheduled {
  public name: string;
  public interval: number;
  public runAtStart: boolean;
  public run: () => any;
  private timer: NodeJS.Timer;

  constructor(name: string, interval: number, runAtStart: boolean, run: () => any) {
    this.name = name;
    this.interval = interval;
    this.runAtStart = runAtStart;
    this.run = run;
  }

  public start() {
    console.log(`Started interval ${this.name} every ${this.interval}s`);
    if (this.runAtStart) this.run();
    this.timer = setInterval(this.run, this.interval * 1000);
  }

  public stop() {
    console.log(`Stopped interval ${this.name}`);
    clearInterval(this.timer);
  }
}
