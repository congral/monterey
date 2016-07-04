import {LogManager} from 'aurelia-framework';
import {AURELIACLI} from 'monterey-pal';

const logger = LogManager.getLogger('project-manager');

export class Run {
  failed = false;
  finished = false;

  async activate(model) {
    this.model = model;
    this.state = model.state;
    this.step = model.step;
    this.step.execute = () => this.execute();
    this.step.previous = () => this.previous();
  }

  async attached() {
    this.promise = new Promise(async (resolve, reject) => {
      this.finished = false;
      try {
        // aurelia cli can't handle circular structures so we remove the
        // workflow from the state we set in activities.js

        this.state.workflow = null;

        await AURELIACLI.create(this.state);
        this.finished = true;
        resolve();
      } catch (e) {
        alert('Error while scaffolding the application: ' + e.message);
        logger.error(e);
        this.failed = true;
        reject();
      }
    });
  }

  async execute() {
    return {
      goToNextStep: this.finished
    };
  }

  async previous() {
    alert('This is not possible at this point');
    return {
      goToPreviousStep: true
    };
  }
}
