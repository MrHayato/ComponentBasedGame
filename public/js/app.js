var Entity = (function () {
    function Entity() {
        this.components = {
        };
    }
    Entity.prototype.addComponent = function (component) {
        this.components[component.name] = component;
    };
    Entity.prototype.getComponent = function (componentName) {
        if(this.components[componentName]) {
            return this.components[componentName];
        } else {
            Logger.error("Component not found: " + componentName);
            return undefined;
        }
    };
    Entity.prototype.removeComponent = function (component) {
        this.components[component.name] = undefined;
    };
    return Entity;
})();
var ComponentEntityMap = (function () {
    function ComponentEntityMap() {
        this._map = {
        };
    }
    ComponentEntityMap.prototype.push = function (componentName, entity) {
        if(!this._map[componentName]) {
            this._map[componentName] = [];
        }
        this._map[componentName].push(entity);
    };
    ComponentEntityMap.prototype.get = function (componentName) {
        return this._map[componentName];
    };
    return ComponentEntityMap;
})();
var EntityArray = (function () {
    function EntityArray() {
        this._entities = [];
        this._componentMap = new ComponentEntityMap();
    }
    EntityArray.prototype.add = function (entity) {
        this._entities.push(entity);
        for(var component in entity.components) {
            this._componentMap.push(component, entity);
        }
    };
    EntityArray.prototype.getEntitiesByComponent = function (componentName) {
        return this._componentMap.get(componentName);
    };
    EntityArray.prototype.updateByComponent = function (componentName) {
        var entities = this.getEntitiesByComponent(componentName);
        if(!entities || entities.length === 0) {
            return;
        }
        for(var i = 0; i < entities.length; i++) {
            entities[i].getComponent(componentName).update();
        }
    };
    return EntityArray;
})();
var Keys;
(function (Keys) {
    Keys.LEFT = "left";
    Keys.RIGHT = "right";
    Keys.UP = "up";
    Keys.DOWN = "down";
    Keys.SHIFT = "shift";
    Keys.Z = "z";
    Keys.X = "x";
    Keys.C = "c";
    Keys.S = "s";
})(Keys || (Keys = {}));

var FileTypes;
(function (FileTypes) {
    FileTypes.UNKNOWN = "unknown";
    FileTypes.JSON = "json";
    FileTypes.IMAGE = "image";
    FileTypes.AUDIO = "audio";
})(FileTypes || (FileTypes = {}));

var Constants;
(function (Constants) {
    Constants.DEBUG = true;
    Constants.DEFAULT_FPS = 60;
    Constants.VIEWPORT_WIDTH = 900;
    Constants.VIEWPORT_HEIGHT = 500;
    Constants.FRICTION = 0.85;
    Constants.GRAVITY = 0.7;
    Constants.PLAYER_JUMP_HEIGHT = 10;
    Constants.PLAYER_WALK_SPEED_X = 2;
    Constants.PLAYER_WALK_SPEED_Y = 1.25;
    Constants.PLAYER_RUN_MULTIPLIER = 2.25;
    Constants.PLAYER_RUNNING_JUMP_MULTIPLIER = 1.25;
    Constants.PLAYER_LANDING_DELAY = 125;
})(Constants || (Constants = {}));

var Components;
(function (Components) {
    Components.RENDER = "sprite";
    Components.POSITION = "position";
})(Components || (Components = {}));

var Logger;
(function (Logger) {
    Logger.Levels = {
        TRACE: "Trace",
        WARNING: "Warning",
        ERROR: "Error"
    };
    function log(level, message) {
        if(!Constants.DEBUG) {
            return;
        }
        if(console && console.log) {
            console.log(level + ": " + message);
        }
    }
    Logger.log = log;
    function warning(message) {
        log(Logger.Levels.WARNING, message);
    }
    Logger.warning = warning;
    function error(message) {
        log(Logger.Levels.ERROR, message);
    }
    Logger.error = error;
    function trace(message) {
        log(Logger.Levels.TRACE, message);
    }
    Logger.trace = trace;
})(Logger || (Logger = {}));

var AssetManager = (function () {
    function AssetManager() {
        this._assets = {
        };
        this.loading = {
        };
        this.loaded = {
        };
    }
    AssetManager.prototype.get = function (key) {
        if(this._assets[key]) {
            return this._assets[key];
        } else {
            Logger.error("Asset Key not found: " + key);
            return undefined;
        }
    };
    AssetManager.prototype.getFileType = function (file) {
        var filename = file.toLowerCase();
        if(file.indexOf(".json") >= 0) {
            return FileTypes.JSON;
        } else {
            if(file.indexOf(".png") >= 0) {
                return FileTypes.IMAGE;
            } else {
                if(file.indexOf(".mp3") >= 0) {
                    return FileTypes.AUDIO;
                } else {
                    return FileTypes.UNKNOWN;
                }
            }
        }
    };
    AssetManager.prototype.loadAsset = function (file, key, callback) {
        var fileType = this.getFileType(file);
        var self = this;
        this.loading[key] = true;
        this.loaded[key] = false;
        switch(fileType) {
            case FileTypes.IMAGE: {
                var image = new Image();
                image.onload = function () {
                    self.processImage(key, image);
                    if($.isFunction(callback)) {
                        callback(image);
                    }
                };
                image.onerror = this.assetError;
                image.src = file;
                break;

            }
            case FileTypes.AUDIO: {
                var audio = new Audio();
                audio.addEventListener("canplay", function () {
                    self.processAudio(key, audio);
                    if($.isFunction(callback)) {
                        callback(audio);
                    }
                }, false);
                audio.addEventListener("error", this.assetError, false);
                audio.src = file;
                audio.load();
                break;

            }
        }
    };
    AssetManager.prototype.loadJSON = function (file, callback) {
        var self = this;
        $.ajax({
            url: file,
            dataType: "json",
            success: function (data) {
                if(data && data.assets) {
                    var assetsLoaded = 0;
                    var onAssetLoaded = function () {
                        assetsLoaded++;
                        if(assetsLoaded >= data.assets.length && $.isFunction(callback)) {
                            callback(data);
                        }
                    };
                    for(var i = 0; i < data.assets.length; i++) {
                        var asset = data.assets[i];
                        self.loadAsset(asset.src, asset.key, onAssetLoaded);
                    }
                }
            }
        });
    };
    AssetManager.prototype.processImage = function (key, asset) {
        this.loading[key] = false;
        this.loaded[key] = true;
        var canvas = document.createElement("canvas");
        canvas.width = asset.width;
        canvas.height = asset.height;
        var context = canvas.getContext("2d");
        context.drawImage(asset, 0, 0, asset.width, asset.height);
        this._assets[key] = canvas;
    };
    AssetManager.prototype.processAudio = function (key, asset) {
        this.loading[key] = false;
        this.loaded[key] = true;
        asset.removeEventListener("canplay", this.processAudio, false);
        this._assets[key] = asset;
    };
    AssetManager.prototype.assetError = function () {
        Logger.error("Oh Noes! The file failed to load!");
    };
    return AssetManager;
})();
var Timer = (function () {
    function Timer(settings) {
        this._settings = settings;
        this._timer = null;
        this._fps = settings.fps || Constants.DEFAULT_FPS;
        this._interval = Math.floor(1000 / this._fps);
        this._initialTime = null;
    }
    Timer.prototype.tick = function () {
        var self = this;
        this._settings.tick();
        this._initialTime += this._interval;
        this._timer = setTimeout(function () {
            self.tick();
        }, this._initialTime - new Date().getTime());
    };
    Timer.prototype.start = function () {
        if(this._timer === null) {
            this._initialTime = new Date().getTime();
            this.tick();
        }
    };
    Timer.prototype.stop = function () {
        clearTimeout(this._timer);
        this._timer = null;
    };
    return Timer;
})();
var PositionComponent = (function () {
    function PositionComponent(entity) {
        this.name = Components.POSITION;
        this._entity = entity;
        this._x = 0;
        this._y = 0;
    }
    PositionComponent.prototype.update = function () {
    };
    PositionComponent.prototype.initialize = function (settings) {
        this._x = settings.x;
        this._y = settings.y;
    };
    PositionComponent.prototype.getPosition = function () {
        return {
            x: this._x,
            y: this._y
        };
    };
    return PositionComponent;
})();
var RenderComponent = (function () {
    function RenderComponent(entity) {
        this.name = Components.RENDER;
        this._entity = entity;
    }
    RenderComponent.prototype.update = function () {
        var pos = (this._entity.getComponent(Components.POSITION)).getPosition();
        Game.context.drawImage(this._sprite, pos.x, pos.y);
    };
    RenderComponent.prototype.initialize = function (key) {
        var canvas = Game.assetManager.get(key);
        if(!canvas) {
            Logger.error("Asset not found: " + key);
        }
        this._sprite = canvas;
    };
    return RenderComponent;
})();
var Game;
(function (Game) {
    Game.entities = new EntityArray();
    Game.timer = new Timer({
        fps: 60,
        tick: update
    });
    Game.assetManager = new AssetManager();
    Game.canvas;
    Game.context;
    function update() {
        var components = [
            Components.RENDER
        ];
        for(var i = 0; i < components.length; i++) {
            Game.entities.updateByComponent(components[i]);
        }
    }
    function loadEntities(callback) {
        var numFiles = 2;
        var loaded = 0;
        var onLoaded = function () {
            loaded++;
            if(loaded >= numFiles && $.isFunction(callback)) {
                callback();
            }
        };
        Game.assetManager.loadJSON("/data/entities.json", function (ents) {
            parseEntities(ents);
            onLoaded();
        });
        Game.assetManager.loadJSON("/data/level1.json", function (level) {
            parseLevel(level);
            onLoaded();
        });
    }
    function parseEntities(ents) {
        for(var entity in ents) {
            if(entity !== "assets") {
                var newEntity = new Entity();
                for(var component in ents[entity]) {
                    var newComponent = null;
                    switch(component.toLowerCase()) {
                        case Components.RENDER: {
                            newComponent = new RenderComponent(newEntity);
                            break;

                        }
                        case Components.POSITION: {
                            newComponent = new PositionComponent(newEntity);
                            break;

                        }
                    }
                    if(newComponent != null) {
                        newComponent.initialize(ents[entity][component]);
                    }
                    newEntity.addComponent(newComponent);
                }
                Game.entities.add(newEntity);
            }
        }
    }
    function parseLevel(level) {
    }
    function setCanvas(canv) {
        Game.canvas = canv;
        Game.context = canv.getContext("2d");
    }
    Game.setCanvas = setCanvas;
    function start() {
        loadEntities(function () {
            Game.timer.start();
        });
    }
    Game.start = start;
})(Game || (Game = {}));

var App;
(function (App) {
    $(document).ready(function () {
        var canvas = $("#gameCanvas")[0];
        Game.setCanvas(canvas);
        Game.start();
    });
})(App || (App = {}));

