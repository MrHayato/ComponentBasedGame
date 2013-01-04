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
    Components.ANIMATION = "animation";
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

var Entity = (function () {
    function Entity(id) {
        this.components = {
        };
        this._id = id;
    }
    Entity.prototype.addComponent = function (component) {
        this.components[component.name] = component;
    };
    Entity.prototype.getComponent = function (componentName) {
        if(this.components[componentName]) {
            return this.components[componentName];
        } else {
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
    EntityArray.prototype.updateByComponent = function (componentName, ticks) {
        var entities = this.getEntitiesByComponent(componentName);
        if(!entities || entities.length === 0) {
            return;
        }
        for(var i = 0; i < entities.length; i++) {
            entities[i].getComponent(componentName).update(ticks);
        }
    };
    return EntityArray;
})();
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
var Scene = (function () {
    function Scene() {
        this._entities = new EntityArray();
    }
    Scene.prototype.getEntities = function () {
        return this._entities;
    };
    Scene.prototype.addEntity = function (entity) {
        this._entities.add(entity);
    };
    return Scene;
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
    Timer.prototype.currentTime = function () {
        return this._initialTime;
    };
    return Timer;
})();
var PositionComponent = (function () {
    function PositionComponent(game, entity) {
        this.name = Components.POSITION;
        this._game = game;
        this._entity = entity;
        this._x = 0;
        this._y = 0;
    }
    PositionComponent.prototype.update = function (ticks) {
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
var AnimationComponent = (function () {
    function AnimationComponent(game, entity) {
        this.name = Components.ANIMATION;
        this._game = game;
        this._entity = entity;
    }
    AnimationComponent.prototype.update = function (ticks) {
        var anim = this._currentAnimation;
        if(!anim) {
            return;
        }
        if(ticks - this._frameStartTime > anim.duration) {
            this._frameStartTime = ticks;
            this._currentFrame++;
            if(this._currentFrame >= anim.frames.length) {
                if(anim.loop) {
                    this._currentFrame = 0;
                } else {
                    if(anim.onComplete) {
                        anim.onComplete();
                    }
                }
            }
        }
    };
    AnimationComponent.prototype.initialize = function (animationFrames) {
        var sprite = this.getSprite();
        var spriteSize = this.getSpriteDimensions(sprite);
        var frameWidth = animationFrames.width;
        var frameHeight = animationFrames.height;
        var cols = Math.floor(spriteSize[0] / frameWidth);
        var rows = Math.floor(spriteSize[1] / frameHeight);
        this._animations = {
        };
        for(var frameKey in animationFrames.frames) {
            var frame = animationFrames.frames[frameKey];
            var name = frameKey;
            var indexes = frame.indexes;
            var loop = frame.loop;
            var duration = frame.duration;
            var frames = [];
            if(indexes.length !== 2) {
                Logger.error("Invalid indexes for '" + name + "' animation specified.");
                continue;
            }
            for(var idx = indexes[0]; idx <= indexes[1]; idx++) {
                var row = Math.floor(idx / cols);
                var col = idx % cols;
                var animationFrame = this.cropImage(sprite, col * frameWidth, row * frameHeight, frameWidth, frameHeight);
                frames.push(animationFrame);
            }
            var animation = {
                loop: loop,
                duration: duration,
                frames: frames
            };
            this._animations[name] = animation;
        }
        if(animationFrames.startAnimation) {
            this.setAnimation(animationFrames.startAnimation);
        }
    };
    AnimationComponent.prototype.getSprite = function () {
        var renderComponent = this._entity.getComponent(Components.RENDER);
        return renderComponent.getSprite();
    };
    AnimationComponent.prototype.getSpriteDimensions = function (sprite) {
        var spriteWidth = sprite.width;
        var spriteHeight = sprite.height;
        return [
            spriteWidth, 
            spriteHeight
        ];
    };
    AnimationComponent.prototype.cropImage = function (sprite, x, y, width, height) {
        var crop = document.createElement("canvas");
        crop.width = width;
        crop.height = height;
        var ctx = crop.getContext("2d");
        ctx.drawImage(sprite, x, y, width, height, 0, 0, crop.width, crop.height);
        return crop;
    };
    AnimationComponent.prototype.getFrame = function () {
        if(this._currentFrame >= this._currentAnimation.frames.length) {
            this._currentFrame = this._currentAnimation.frames.length - 1;
        }
        return this._currentAnimation.frames[this._currentFrame];
    };
    AnimationComponent.prototype.setAnimation = function (animationName, onAnimationComplete) {
        var animation = this._animations[animationName];
        if(!animation) {
            Logger.error("Animation '" + animationName + "' not found.");
            return;
        }
        if(onAnimationComplete) {
            animation.onComplete = onAnimationComplete;
        } else {
            animation.onComplete = undefined;
        }
        this._currentAnimation = animation;
        this._currentFrame = 0;
        this._frameStartTime = this._game.timer.currentTime();
    };
    return AnimationComponent;
})();
var RenderComponent = (function () {
    function RenderComponent(game, entity) {
        this.name = Components.RENDER;
        this._game = game;
        this._entity = entity;
    }
    RenderComponent.prototype.update = function (ticks) {
        var pos = (this._entity.getComponent(Components.POSITION)).getPosition();
        var animComponent = (this._entity.getComponent(Components.ANIMATION));
        if(animComponent) {
            this._game.context.drawImage(animComponent.getFrame(), pos.x, pos.y);
        } else {
            this._game.context.drawImage(this._sprite, pos.x, pos.y);
        }
    };
    RenderComponent.prototype.initialize = function (key) {
        var canvas = this._game.assetManager.get(key);
        if(!canvas) {
            Logger.error("Asset not found: " + key);
        }
        this._sprite = canvas;
    };
    RenderComponent.prototype.getSprite = function () {
        return this._sprite;
    };
    return RenderComponent;
})();
var Game = (function () {
    function Game(canvas) {
        var self = this;
        this._gameEntities = {
        };
        this.timer = new Timer({
            fps: 60,
            tick: function () {
                self.update();
            }
        });
        this.assetManager = new AssetManager();
        this._canvas = canvas;
        this.context = canvas.getContext("2d");
        this._lastId = 0;
        this._componentMap = {
        };
        this._componentMap[Components.RENDER] = RenderComponent;
        this._componentMap[Components.POSITION] = PositionComponent;
        this._componentMap[Components.ANIMATION] = AnimationComponent;
    }
    Game.prototype.update = function () {
        var components = [
            Components.POSITION, 
            Components.ANIMATION, 
            Components.RENDER
        ];
        for(var i = 0; i < components.length; i++) {
            if(components[i] === Components.RENDER) {
                this.context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            }
            this.scene.getEntities().updateByComponent(components[i], this.timer.currentTime());
        }
    };
    Game.prototype.loadEntities = function (callback) {
        var self = this;
        this.assetManager.loadJSON("/data/entities.json", function (ents) {
            self.parseEntities(ents);
            self.assetManager.loadJSON("/data/level1.json", function (level) {
                self.parseLevel(level);
                callback();
            });
        });
    };
    Game.prototype.parseEntities = function (ents) {
        for(var entity in ents) {
            if(entity !== "assets") {
                this._gameEntities[entity] = ents[entity];
            }
        }
    };
    Game.prototype.parseLevel = function (level) {
        this.scene = new Scene();
        this.scene.name = level["name"];
        this.addEntitiesToScene(level["entities"]);
    };
    Game.prototype.createEntity = function (entity, settings) {
        var entityData = this._gameEntities[entity];
        if(!entityData) {
            Logger.error("Entity not found: " + entity);
            return;
        }
        $.extend(true, entityData, settings);
        var newEntity = new Entity(this.generateEntityId());
        for(var component in entityData) {
            var newComponent = null;
            if(this._componentMap[component.toLowerCase()]) {
                newComponent = new this._componentMap[component.toLowerCase()](this, newEntity);
                newComponent.initialize(entityData[component]);
                newEntity.addComponent(newComponent);
            } else {
                Logger.error("Component not found: " + component);
            }
        }
        this.scene.addEntity(newEntity);
        return newEntity;
    };
    Game.prototype.addEntitiesToScene = function (entities) {
        for(var i = 0; i < entities.length; i++) {
            var entityName = entities[i].entity;
            var entity = this.createEntity(entityName, entities[i].attributes);
            if(!entity) {
                Logger.error("Entity not loaded: " + entityName);
                continue;
            }
            this.scene.addEntity(entity);
        }
    };
    Game.prototype.start = function () {
        var self = this;
        this.loadEntities(function () {
            self.timer.start();
        });
    };
    Game.prototype.generateEntityId = function () {
        return this._lastId;
    };
    return Game;
})();
var App;
(function (App) {
    $(document).ready(function () {
        var canvas = $("#gameCanvas")[0];
        var game = new Game(canvas);
        game.start();
    });
})(App || (App = {}));

