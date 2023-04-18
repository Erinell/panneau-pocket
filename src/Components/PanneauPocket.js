const { ipcRenderer } = window.require('electron');

export default class PanneauPocket {
    constructor() {
        this.baseUrl = 'https://app.panneaupocket.com/embeded/';
        this.nextUrl = "";
        this.tilesId = [];
    }
    get cityId() {
        return this.cityId;
    }
  
    async getTiles(url){
        this.nextUrl = url;
        this.tilesId = [];
        while (this.nextUrl !== "") {
            await ipcRenderer.invoke('fetch', this.nextUrl)
            .then(res => {
                var page = document.createElement('html');
                page.innerHTML = res;
                let nextId = this.getTileIdByUrl(this.nextUrl);
                this.tilesId.push(nextId);
                if(this.tilesId.length === 2) {
                    let previousUrl = page.querySelector('a.action[title="Précédent"]').href;
                    let previousid = this.getTileIdByUrl(previousUrl);
                    this.tilesId[0] = previousid;
                }
                try {
                    this.nextUrl = page.querySelector('a.action[title="Suivant"]').href;
                } catch (error) {
                    this.nextUrl = "";
                }
            })
        }
        return this.tilesId;
    }

    async getPageDom(url) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('fetch', url)
            .then(res => {
                var _page = document.createElement('html');
                _page.innerHTML = res;
                let page = document.createElement('html');;
                page.innerHTML = _page.querySelectorAll('.infos')[0].innerHTML;
                page.innerHTML += _page.querySelectorAll('.sign-preview__content')[0].innerHTML;
                resolve(page)
            })
        })
    }
    
    getTileIdByUrl(url){
        let id = url.replace(this.baseUrl, "");
        id = id.replace("?mode=widget", "");
        id = id.split("/");
        return id[1]
    }

    getCityIdByUrl(url){
        let id = url.replace(this.baseUrl, "");
        id = id.replace("?mode=widget", "");
        id = id.split("/");
        return id[0]
    }
  }

  