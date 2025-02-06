interface Settings {
  apiKey?: string;
  modelName?: string;
  theme?: 'light' | 'dark';
}

const SETTINGS_KEY = 'chatbot_settings';

export class SettingsService {
  private static instance: SettingsService;
  private settings: Settings = {};

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  getApiKey(): string | undefined {
    return this.settings.apiKey;
  }

  setApiKey(apiKey: string) {
    this.settings.apiKey = apiKey;
    this.saveSettings();
  }

  clearApiKey() {
    delete this.settings.apiKey;
    this.saveSettings();
  }

  hasApiKey(): boolean {
    return !!this.settings.apiKey;
  }

  getAllSettings(): Settings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<Settings>) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    this.saveSettings();
  }
}
