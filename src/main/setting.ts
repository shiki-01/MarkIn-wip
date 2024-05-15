import Store from 'electron-store';

export class Setting {
    private store = new Store();

    constructor() {
        this.store = new Store();

        // 初期値の設定
        if (!this.store.has('config')) {
            this.store.set('config', {
                theme: 'dark',
                language: 'jp',
                mainColor: 'light-blue',
            });
        }
    }

    // 設定の取得
    get config() {
        return this.store.get('config');
    }

    // 設定の更新
    set config(config) {
        this.store.set('config', config);
    }
}