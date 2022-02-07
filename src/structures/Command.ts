import CommandType from '../typings/Command';

export default class Command {
  constructor(commandOptions: CommandType) {
    Object.assign(this, commandOptions);
  }
}
