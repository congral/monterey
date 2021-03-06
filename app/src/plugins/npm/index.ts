import {autoinject}    from 'aurelia-framework';
import {PluginManager} from '../../shared/plugin-manager';
import {FS}            from 'monterey-pal';
import {BasePlugin}    from '../base-plugin';
import {Common}        from './common';

export function configure(aurelia) {
  let pluginManager = aurelia.container.get(PluginManager);

  pluginManager.registerPlugin(aurelia.container.get(Plugin));
}

@autoinject()
class Plugin extends BasePlugin {

  constructor(private common: Common) {
    super();
  }

  getTiles(project, showIrrelevant) {
    return [{
      viewModel: 'plugins/npm/tile'
    }];
  }

  async onProjectAdd(project) {
    if (project.installNPM) {
      this.common.installNPMDependencies(project);
    }
  }

  async evaluateProject(project) {
    let pathsToTry = [
      `${project.path}/package.json`,
      `${project.path}/src/skeleton/package.json`,
      `${project.path}/src/skeleton-navigation-esnext-vs/package.json`,
      `${project.path}/src/skeleton-navigation-typescript-vs/package.json`
    ];

    let found = false;
    for (let i = 0; i < pathsToTry.length; i++) {
      if (await this.tryLocatePackageJSON(project, pathsToTry[i])) {
        found = true;
      }
    }

    if (!found) {
      if (await this.manuallyLocatePackageJSON(project)) {
        found = true;
      }
    }

    return project;
  }

  async manuallyLocatePackageJSON(project) {
    alert('Unable to find package.json, please point Monterey to package.json');
    let paths = await FS.showOpenDialog({
      title: 'Please select your package.JSON file',
      properties: ['openFile'],
      defaultPath: project.path,
      filters: [
        {name: 'package', extensions: ['json']}
      ]
    });

    if (paths && paths.length > 0) {
      return await this.tryLocatePackageJSON(project, paths[0]);
    }

    return false;
  }

  async tryLocatePackageJSON(project, p) {
    if (await FS.fileExists(p)) {
      project.packageJSONPath = FS.normalize(p);

      let packageJSON = await this.getPackageJSON(project);

      // if the project already has a name then it has just been scaffolded
      if (project.name) {
        // check if the name of the project is equal to the name mentioned in package.json
        if (packageJSON.name !== project.name) {
          // if not, update package.json to use the project name and persist this to the filesystem
          packageJSON.name = project.name;
          await FS.writeFile(project.packageJSONPath, JSON.stringify(packageJSON, null, 4));
        }
      }

      project.name = packageJSON.name;
      return true;
    }

    return false;
  }

  async getPackageJSON(project) {
    return JSON.parse(await FS.readFile(project.packageJSONPath));
  }
}
