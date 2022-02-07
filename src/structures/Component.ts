import ComponentType from '../typings/Component';

export default class Component {
  constructor(componentOptions: ComponentType) {
    Object.assign(this, componentOptions);
  }
}
