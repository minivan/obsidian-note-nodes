import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';
import { canvasIcon, canvasViewType } from 'src/CanvasView'

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

const defaultCanvasFrontmatter = [
  '---',
  '',
  'note-canvas-type: basic',
  '',
  '---',
  '',
  '',
].join('\n');


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerEvents()
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

  async newCanvas(folder?: TFolder) {
    const targetFolder = folder
      ? folder
      : this.app.fileManager.getNewFileParent(
          this.app.workspace.getActiveFile()?.path || ''
        );

    try {
			const path = `${targetFolder.path}/untitled canvas.md`
			const canvas: TFile = await this.app.vault.create(path, defaultCanvasFrontmatter)
 
      await this.app.workspace.activeLeaf.setViewState({
        type: canvasViewType,
        state: { file: canvas.path },
      });
    } catch (e) {
      console.error("Couldn't create canvas: ", e);
    }
  }

	registerEvents() {
		this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file: TFile) => {
        if (file instanceof TFolder) {
          menu.addItem((item) => {
            item
              .setTitle('New Note Canvas')
              .setIcon(canvasIcon)
              .onClick(() => this.newCanvas(file));
          });
        }
      }))
		}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
