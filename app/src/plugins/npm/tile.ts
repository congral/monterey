import {useView, autoinject} from 'aurelia-framework';
import {Main}                from '../../main/main';

@autoinject()
@useView('plugins/default-tile.html')
export class Tile {
  title: string;
  img: string;
  project;

  constructor(private main: Main) {
    this.title = 'NPM';
    this.img = 'images/npm-256-square.png';
  }

  activate(model) {
    this.project = model.project;
    Object.assign(this, model.model);
  }

  onClick() {
    this.main.activateScreen('plugins/npm/screen');
  }
}
