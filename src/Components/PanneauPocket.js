const { ipcRenderer } = window.require('electron');

export default class PanneauPocket {
  constructor() {
    this.baseUrl = 'https://app.panneaupocket.com/embeded/';
    this.nextUrl = "";
    this.tiles = {};
    this.favoris = [];
    this.notify = [];
  }

  getNotifier() {
    return new Promise((resolve, reject) => {
      ipcRenderer.invoke("load", "notifier").then((res) => {
        if (res) {
          this.notify = res;
          resolve(this.notify);
        }
      });
    });
  }

  addNotifier(id) {
    if (this.notify.includes(id)) return;
    this.notify.push(id);
    ipcRenderer.send('save', 'notifier', [...this.notify]);
    return this.notify;
  }

  removeNotifier(id) {
    this.notify = this.notify.filter(n => n !== id);
    ipcRenderer.send('save', 'notifier', [...this.notify]);
    return this.notify;
  }

  clearNotifier() {
    this.notify = []
    ipcRenderer.send('save', 'notifier', []);
    return [];
  }

  isNotified(id) {
    return this.notify.includes(id);
  }

  getFavoris() {
    return new Promise((resolve, reject) => {
      ipcRenderer.invoke("load", "favoris").then((res) => {
        if (res) {
          this.favoris = JSON.parse(res);
          resolve(this.favoris);
        }
      });
    });
  }

  setFavoris(favoris) {
    this.favoris = favoris;
    ipcRenderer.send('save', 'favoris', JSON.stringify(this.favoris));
  }

  async getTiles(id) {
    let nextUrl = this.baseUrl + id;
    let tiles = [];
    while (nextUrl !== "") {
      await ipcRenderer.invoke('fetch', nextUrl)
        .then(res => {
          let page = document.createElement('html');
          page.innerHTML = res;
          let nextId = this.getTileIdByUrl(nextUrl);
          tiles.push(nextId);
          if (tiles.length === 2) {
            let previousUrl = page.querySelector('a.action[title="Précédent"]').href;
            let previousId = this.getTileIdByUrl(previousUrl);
            tiles[0] = previousId;
          }
          try {
            nextUrl = page.querySelector('a.action[title="Suivant"]').href;
          } catch (error) {
            nextUrl = "";
          }
        })
    }
    return tiles;
  }

  async updateCityTiles(id) {
    let tiles = await this.getTiles(id);
    this.tiles[id] = tiles;
    return tiles;
  }

  async checkNotifier() {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.notify.length; i++) {
        let tiles = await this.getTiles(this.notify[i]);
        if(!this.tiles[this.notify[i]] || !tiles) return;
        // TODO: améliorer la méthode de détection de nouvelles tiles
        // actuellement : trigger si modif du nb ou d'un id
        // idées :
        // - vérifier si maj d'un tuile
        // - séparer le nb de tuile (si + alors ajout, si - alors suppression)
        //    - calculer le delta pour savoir combien en - ou +
        if (this.tiles[this.notify[i]].join() !== tiles.join()) {
          this.updateCityTiles(this.notify[i]);
          resolve(this.favoris.filter(v => v.id === this.notify[i]));
        }
        resolve(false);
      }
    })
  }

  async getPageDom(url) {
    return new Promise((resolve, reject) => {
      ipcRenderer.invoke('fetch', this.baseUrl + url)
        .then(res => {
          var _page = document.createElement('html');
          _page.innerHTML = res;
          let page = document.createElement('html');
          try {
            page.innerHTML = _page.querySelectorAll('.infos')[0].innerHTML;
            page.innerHTML += _page.querySelectorAll('.sign-preview__content')[0].innerHTML;
            resolve(page);
          } catch (error) {
            reject("Impossible de récupérer les infos, la page n'existe pas.");
          }
        })
    })
  }

  getTileIdByUrl(url) {
    let id = url.replace(this.baseUrl, "");
    id = id.replace("?mode=widget", "");
    id = id.split("/");
    return id[1]
  }

  getCityIdByUrl(url) {
    let id = url.replace(this.baseUrl, "");
    id = id.replace("?mode=widget", "");
    id = id.split("/");
    return id[0]
  }
}

