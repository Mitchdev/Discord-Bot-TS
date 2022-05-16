import CloudConvert from 'cloudconvert';
import { JobEvent } from 'cloudconvert/built/lib/JobsResource';
import { TaskEventData } from 'cloudconvert/built/lib/TasksResource';
import events from 'events';

class CloudConvertClient {

  cloudconvert: CloudConvert;

  constructor() {
    this.cloudconvert = new CloudConvert(process.env.CLOUD_CONVERT_TOKEN);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async new(tasks: any): Promise<ConvertJob> {
    const job = await this.cloudconvert.jobs.create({ 'tasks': tasks, 'tag': 'jobbuilder' });
    return new ConvertJob(this.cloudconvert, job.id);
  }
}

declare interface ConvertJob {
  on(event: JobEvent, listener: (event: TaskEventData) => void): this
}

class ConvertJob extends events.EventEmitter {

  cloudconvert: CloudConvert;
  id: string;

  constructor(cloudconvert: CloudConvert, id: string) {
    super();
    this.cloudconvert = cloudconvert;
    this.id = id;
    this.events();
  }

  events() {
    this.cloudconvert.jobs.subscribeTaskEvent(this.id, 'created', (event: TaskEventData) => this.emit('created', event));
    this.cloudconvert.jobs.subscribeTaskEvent(this.id, 'updated', (event: TaskEventData) => this.emit('updated', event));
    this.cloudconvert.jobs.subscribeTaskEvent(this.id, 'finished', (event: TaskEventData) => this.emit('finished', event));
    this.cloudconvert.jobs.subscribeTaskEvent(this.id, 'failed', (event: TaskEventData) => this.emit('failed', event));
  }

  stop() {
    this.cloudconvert.closeSocket();
  }
}

export default CloudConvertClient;
