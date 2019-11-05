import {Store, Unsubscribe} from 'redux';

module.exports = class IOQueue {

    protected RStore:Store;

    protected StoreListener:Unsubscribe|null = null;

    protected LastState:any;

    protected Timer:NodeJS.Timeout|null = null;

    protected Filename:string|null = null;

    protected FS:any = null;

    protected Saving:boolean = false;

    protected Paused:boolean = true;

    constructor(store:Store, path:string) {
        this.saveStore = this.saveStore.bind(this);
        this.SaveNext = this.SaveNext.bind(this);
        this.Save = this.Save.bind(this);
        this.Pause = this.Pause.bind(this);
        this.Start = this.Start.bind(this);

        this.RStore = store;
        this.Filename = path;
        this.FS = require('fs');
    }

    protected async saveStore() {
        this.LastState = this.RStore.getState();
    }

    protected async SaveNext() {
        if(this.LastState && !this.Paused && !this.Saving) {
            await this.Save();
        }
    }

    protected async Save() : Promise<boolean> {
        return new Promise(async (res, rej) => {
            this.Saving = true;
            try {
                let data:string = JSON.stringify(this.LastState, null, 4);
                // eslint-disable-next-line
                let js = JSON.parse(data);
                let response = await this.FS.promises.writeFile(this.Filename, data);
                if(response === undefined) {
                    this.LastState = null;
                    this.Saving = false;
                    res(true);
                }
            } catch(er) {
                this.Saving = false;
                this.Paused = true;
                res(false);
            }
        });
    }

    async Start() : Promise<boolean> {
        this.Paused = false;
        this.StoreListener = this.RStore.subscribe(this.saveStore);
        try {
            if(this.Timer !== null)
                clearInterval(this.Timer);
        } catch(er) {

        } finally {
            this.Timer = setInterval(this.Save, 100);
            return new Promise(async (res) => {res(true);});
        }
    }

    Pause() {
        this.Paused = true;
        if(this.StoreListener)
            this.StoreListener();
    }
}