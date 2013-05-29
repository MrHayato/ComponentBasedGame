var FileTypes;
(function (FileTypes) {
    FileTypes.UNKNOWN = "unknown";
    FileTypes.JSON = "json";
    FileTypes.IMAGE = "image";
    FileTypes.AUDIO = "audio";
})(FileTypes || (FileTypes = {}));
var Constants;
(function (Constants) {
    var ie = ((function () {
        var undef, v = 3, div = document.createElement('div');
        while(div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->' , div.getElementsByTagName('i')[0]) {
            ;
        }
        return v > 4 ? v : undef;
    })());
    Constants.IS_IE = !!ie;
    Constants.DEBUG = true;
    Constants.DEFAULT_FPS = 60;
    Constants.VIEWPORT_WIDTH = 900;
    Constants.VIEWPORT_HEIGHT = 500;
    Constants.FRICTION = 0.85;
    Constants.GRAVITY = 0.7;
    Constants.PLAYER_JUMP_HEIGHT = 10;
    Constants.PLAYER_WALK_SPEED_X = 1;
    Constants.PLAYER_WALK_SPEED_Y = 0.85;
    Constants.PLAYER_RUN_MULTIPLIER = 2.25;
    Constants.PLAYER_RUNNING_JUMP_MULTIPLIER = 1.25;
    Constants.PLAYER_LANDING_DELAY = 125;
})(Constants || (Constants = {}));
var Components;
(function (Components) {
    Components.RENDER = "sprite";
    Components.POSITION = "position";
    Components.ANIMATION = "animation";
    Components.AI_MOVEMENT = "ai_movement";
    Components.INPUT_MOVEMENT = "input_movement";
    Components.MOVEMENT_ANIMATION = "movement_animation";
    Components.PHYSICS = "physics";
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
        this.id = id;
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
        } else if(file.indexOf(".png") >= 0) {
            return FileTypes.IMAGE;
        } else if(file.indexOf(".mp3") >= 0) {
            return FileTypes.AUDIO;
        } else {
            return FileTypes.UNKNOWN;
        }
    };
    AssetManager.prototype.loadAsset = function (file, key, callback) {
        var fileType = this.getFileType(file);
        var self = this;
        this.loading[key] = true;
        this.loaded[key] = false;
        switch(fileType) {
            case FileTypes.IMAGE:
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
            case FileTypes.AUDIO:
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
var EventMessage = (function () {
    function EventMessage(source, message) {
        this.source = source;
        this.message = message;
    }
    return EventMessage;
})();
var EventManager = (function () {
    function EventManager() {
        this._events = {
        };
    }
    EventManager.prototype.listen = function (eventName, callback, context) {
        if(!this._events[eventName]) {
            this._events[eventName] = [];
        }
        this._events[eventName].push(function () {
            callback.apply(context, arguments);
        });
    };
    EventManager.prototype.send = function (eventName, message) {
        if(!this._events[eventName]) {
            return;
        }
        for(var i = 0; i < this._events[eventName].length; i++) {
            this._events[eventName][i](message);
        }
    };
    return EventManager;
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
        var self = this;
        window.addEventListener("blur", function () {
            self.stop();
        });
        window.addEventListener("focus", function () {
            self.start();
        });
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
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.distanceTo = function (target) {
        return Math.sqrt(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2));
    };
    return Point;
})();
var Vector = (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.length = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };
    Vector.prototype.normalize = function () {
        var length = this.length();
        this.x = this.x / length;
        this.y = this.y / length;
    };
    Vector.prototype.dotProduct = function (v) {
        return (this.x * v.x + this.y * v.y);
    };
    Vector.prototype.setX = function (x) {
        this.x = x;
    };
    Vector.prototype.setY = function (y) {
        this.y = y;
    };
    Vector.prototype.setLength = function (length) {
        var r = length / this.length();
        this.x *= r;
        this.y *= r;
    };
    Vector.prototype.setVelocity = function (x, y) {
        this.setX(x);
        this.setY(y);
    };
    return Vector;
})();
var PhysicsComponent = (function () {
    function PhysicsComponent(game, entity) {
        this.name = Components.PHYSICS;
        this._game = game;
        this._entity = entity;
        this._velocity = new Vector(0, 0);
    }
    PhysicsComponent.prototype.update = function (ticks) {
    };
    PhysicsComponent.prototype.initialize = function (settings) {
        this._velocity.setVelocity(settings.x, settings.y);
    };
    PhysicsComponent.prototype.getVelocity = function () {
        return this._velocity;
    };
    PhysicsComponent.prototype.setVelocity = function (x, y) {
        this._velocity.setVelocity(x, y);
    };
    return PhysicsComponent;
})();
var PositionComponent = (function () {
    function PositionComponent(game, entity) {
        this.name = Components.POSITION;
        this._game = game;
        this._entity = entity;
        this._position = new Point(0, 0);
        this.facing = 1;
    }
    PositionComponent.prototype.update = function (ticks) {
        var physComp = this._entity.getComponent(Components.PHYSICS);
        if(physComp) {
            var velocity = physComp.getVelocity();
            this._position.x += velocity.x;
            this._position.y += velocity.y;
            if(this._entity.id === 0) {
                this._game.eventManager.send("entity_moved", new EventMessage(this._entity, this._position));
            }
        }
    };
    PositionComponent.prototype.initialize = function (settings) {
        this._position = new Point(settings.x, settings.y);
    };
    PositionComponent.prototype.getPosition = function () {
        return this._position;
    };
    PositionComponent.prototype.setPosition = function (position) {
        this._position = position;
    };
    PositionComponent.prototype.setFacing = function (direction) {
        if(direction < 0) {
            this.facing = -1;
        } else if(direction > 0) {
            this.facing = 1;
        }
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
                } else if(anim.onComplete) {
                    anim.onComplete();
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
                name: name,
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
        var frame = this._currentAnimation.frames[this._currentFrame];
        return frame;
    };
    AnimationComponent.prototype.setAnimation = function (animationName, onAnimationComplete) {
        if(this._currentAnimation && this._currentAnimation.name === animationName) {
            return;
        }
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
        this._flipped = false;
    }
    RenderComponent.prototype.update = function (ticks) {
        var pos = (this._entity.getComponent(Components.POSITION)).getPosition();
        var animComponent = (this._entity.getComponent(Components.ANIMATION));
        var sprite;
        if(animComponent) {
            sprite = animComponent.getFrame();
        } else {
            sprite = this._sprite;
        }
        var context = this._game.context;
        context.save();
        context.translate(pos.x, pos.y);
        if(this._flipped) {
            context.scale(-1, 1);
        }
        context.translate(-(sprite.width * 0.5), -(sprite.height * 0.5));
        this._game.context.drawImage(sprite, 0, 0);
        context.restore();
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
    RenderComponent.prototype.setFlipped = function (flipped) {
        this._flipped = flipped;
    };
    return RenderComponent;
})();
var Input;
(function (Input) {
    (function (Keys) {
        ;
        var _keyLookup = {
        };
        Keys.LEFT = addKey(37, "left");
        Keys.RIGHT = addKey(39, "right");
        Keys.UP = addKey(38, "up");
        Keys.DOWN = addKey(40, "down");
        Keys.SHIFT = addKey(16, "shift");
        Keys.BACKSPACE = addKey(8, "backspace");
        Keys.TAB = addKey(9, "tab");
        Keys.ENTER = addKey(13, "enter");
        Keys.CTRL = addKey(17, "ctrl");
        Keys.ALT = addKey(18, "alt");
        Keys.PAUSE = addKey(19, "pause");
        Keys.CAPSLOCK = addKey(20, "capslock");
        Keys.ESCAPE = addKey(27, "esc");
        Keys.SPACE = addKey(32, "space");
        Keys.PAGEUP = addKey(33, "pageup");
        Keys.PAGEDOWN = addKey(34, "pagedown");
        Keys.END = addKey(35, "end");
        Keys.HOME = addKey(36, "home");
        Keys.INSERT = addKey(45, "insert");
        Keys.DELETE = addKey(46, "delete");
        Keys.SELECT_KEY = addKey(93, "selectkey");
        Keys.MULTIPLY = addKey(106, "multiply");
        Keys.ADD = addKey(107, "add");
        Keys.SUBTRACT = addKey(109, "subtract");
        Keys.DECIMAL = addKey(110, "decimalpoint");
        Keys.DIVIDE = addKey(111, "divide");
        Keys.NUMLOCK = addKey(144, "numlock");
        Keys.SCROLLLOCK = addKey(145, "scrollock");
        Keys.SEMICOLON = addKey(186, "semicolon");
        Keys.EQUALS = addKey(187, "equalsign");
        Keys.COMMA = addKey(188, "comma");
        Keys.DASH = addKey(189, "dash");
        Keys.PERIOD = addKey(190, "period");
        Keys.FORWARD_SLASH = addKey(191, "forwardslash");
        Keys.GRAVE_ACCENT = addKey(192, "graveaccent");
        Keys.OPEN_BRACKET = addKey(219, "openbracket");
        Keys.BACK_SLASH = addKey(220, "backslash");
        Keys.CLOSE_BRACKET = addKey(221, "closebracket");
        Keys.SINGLE_QUOTE = addKey(222, "singlequote");
        Keys.A = addKey(65, "a");
        Keys.B = addKey(66, "b");
        Keys.C = addKey(67, "c");
        Keys.D = addKey(68, "d");
        Keys.E = addKey(69, "e");
        Keys.F = addKey(70, "f");
        Keys.G = addKey(71, "g");
        Keys.H = addKey(72, "h");
        Keys.I = addKey(73, "i");
        Keys.J = addKey(74, "j");
        Keys.K = addKey(75, "k");
        Keys.L = addKey(76, "l");
        Keys.M = addKey(77, "m");
        Keys.N = addKey(78, "n");
        Keys.O = addKey(79, "o");
        Keys.P = addKey(80, "p");
        Keys.Q = addKey(81, "q");
        Keys.R = addKey(82, "r");
        Keys.S = addKey(83, "s");
        Keys.T = addKey(84, "t");
        Keys.U = addKey(85, "u");
        Keys.V = addKey(86, "v");
        Keys.W = addKey(87, "w");
        Keys.X = addKey(88, "x");
        Keys.Y = addKey(89, "y");
        Keys.Z = addKey(90, "z");
        Keys._0 = addKey(48, "0");
        Keys._1 = addKey(49, "1");
        Keys._2 = addKey(50, "2");
        Keys._3 = addKey(51, "3");
        Keys._4 = addKey(52, "4");
        Keys._5 = addKey(53, "5");
        Keys._6 = addKey(54, "6");
        Keys._7 = addKey(55, "7");
        Keys._8 = addKey(56, "8");
        Keys._9 = addKey(57, "9");
        Keys.NUMPAD0 = addKey(96, "numpad0");
        Keys.NUMPAD1 = addKey(97, "numpad1");
        Keys.NUMPAD2 = addKey(98, "numpad2");
        Keys.NUMPAD3 = addKey(99, "numpad3");
        Keys.NUMPAD4 = addKey(100, "numpad4");
        Keys.NUMPAD5 = addKey(101, "numpad5");
        Keys.NUMPAD6 = addKey(102, "numpad6");
        Keys.NUMPAD7 = addKey(103, "numpad7");
        Keys.NUMPAD8 = addKey(104, "numpad8");
        Keys.NUMPAD9 = addKey(105, "numpad9");
        function addKey(keyCode, keyName) {
            var key = {
                keyCode: keyCode,
                keyName: keyName
            };
            _keyLookup[keyCode] = key;
            return key;
        }
        function getKey(keyCode) {
            return _keyLookup[keyCode];
        }
        Keys.getKey = getKey;
    })(Input.Keys || (Input.Keys = {}));
    var Keys = Input.Keys;
    (function (Mouse) {
        ;
        var _buttonLookup = {
        };
        Mouse.MOUSE_LEFT = addButton((Constants.IS_IE ? 1 : 0), "mouse_left");
        Mouse.MOUSE_MIDDLE = addButton((Constants.IS_IE ? 4 : 1), "mouse_middle");
        Mouse.MOUSE_RIGHT = addButton(2, "mouse_right");
        function addButton(buttonCode, buttonName) {
            var button = {
                buttonCode: buttonCode,
                buttonName: buttonName
            };
            _buttonLookup[buttonCode] = button;
            return button;
        }
        function getButton(buttonCode) {
            return _buttonLookup[buttonCode];
        }
        Mouse.getButton = getButton;
    })(Input.Mouse || (Input.Mouse = {}));
    var Mouse = Input.Mouse;
    var _pressedKeys = {
    };
    var _preventKeys = [];
    var _keyUpHandlers = {
    };
    var _keyDownHandlers = {
    };
    var _mouseUpHandlers = {
    };
    var _mouseDownHandlers = {
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown, false);
    window.addEventListener("mouseup", handleMouseUp, false);
    window.addEventListener("blur", handleBlur, false);
    document.oncontextmenu = function () {
        return false;
    };
    function preventDefault(keys) {
        keys.forEach(function (key) {
            _preventKeys.push(key.keyCode);
        });
    }
    function allowDefault(keys) {
        keys.forEach(function (key) {
            var idx = _preventKeys.indexOf(key.keyCode);
            _preventKeys.splice(idx, 1);
        });
    }
    function handleBlur(e) {
        _pressedKeys = {
        };
    }
    function handleKeyUp(e) {
        e = e || window.event;
        var key = Keys.getKey(e.keyCode);
        if(!key) {
            return;
        }
        _pressedKeys[key.keyCode] = false;
        if(_keyUpHandlers[key.keyCode]) {
            _keyUpHandlers[key.keyCode](key);
        }
        if(_preventKeys[key.keyCode] && e.preventDefault) {
            e.preventDefault();
        }
    }
    function handleKeyDown(e) {
        e = e || window.event;
        var key = Keys.getKey(e.keyCode);
        if(!key) {
            return;
        }
        _pressedKeys[key.keyCode] = true;
        if(_keyDownHandlers[key.keyCode]) {
            _keyDownHandlers[key.keyCode](key);
        }
        if(_preventKeys[key.keyCode] && e.preventDefault) {
            e.preventDefault();
        }
    }
    function handleMouseUp(e) {
        e = e || window.event;
        var button = Mouse.getButton(e.button);
        if(!button) {
            return;
        }
        _pressedKeys[button.buttonCode] = false;
        if(_mouseUpHandlers[button.buttonCode]) {
            _mouseUpHandlers[button.buttonCode](button);
        }
    }
    function handleMouseDown(e) {
        e = e || window.event;
        var button = Mouse.getButton(e.button);
        if(!button) {
            return;
        }
        _pressedKeys[button.buttonCode] = false;
        if(_mouseDownHandlers[button.buttonCode]) {
            _mouseDownHandlers[button.buttonCode](button);
        }
    }
    function isKeyDown(key) {
        return !!_pressedKeys[key.keyCode];
    }
    Input.isKeyDown = isKeyDown;
    function onKeyDown(key, callback) {
        _keyDownHandlers[key.keyName] = callback;
    }
    Input.onKeyDown = onKeyDown;
    function onKeyUp(key, callback) {
        _keyUpHandlers[key.keyName] = callback;
    }
    Input.onKeyUp = onKeyUp;
    function onButtonDown(button, callback) {
        _mouseDownHandlers[button.buttonName] = callback;
    }
    Input.onButtonDown = onButtonDown;
    function onButtonUp(button, callback) {
        _mouseUpHandlers[button.buttonName] = callback;
    }
    Input.onButtonUp = onButtonUp;
})(Input || (Input = {}));
var AIMovementComponent = (function () {
    function AIMovementComponent(game, entity) {
        this.name = Components.AI_MOVEMENT;
        this._game = game;
        this._entity = entity;
        this._target = (game.player.getComponent(Components.POSITION)).getPosition();
    }
    AIMovementComponent.prototype.update = function (ticks) {
        var physComp = this._entity.getComponent(Components.PHYSICS);
        var positionComp = this._entity.getComponent(Components.POSITION);
        var playerPosComp = this._game.player.getComponent(Components.POSITION);
        var playerFacingMe = (playerPosComp.getPosition().x > positionComp.getPosition().x && playerPosComp.facing < 0) || (playerPosComp.getPosition().x < positionComp.getPosition().x && playerPosComp.facing > 0);
        var vx = 0;
        var vy = 0;
        if(this._target !== null && !playerFacingMe) {
            var position = positionComp.getPosition();
            if(Math.abs(position.distanceTo(this._target)) <= 550) {
                var dir = new Vector(this._target.x - position.x, this._target.y - position.y);
                dir.setLength(this._speed);
                vx = dir.x;
                vy = dir.y;
            }
        }
        physComp.setVelocity(vx, vy);
    };
    AIMovementComponent.prototype.initialize = function (key) {
        this._speed = key.speed;
    };
    return AIMovementComponent;
})();
var InputMovementComponent = (function () {
    function InputMovementComponent(game, entity) {
        this.name = Components.INPUT_MOVEMENT;
        this._game = game;
        this._entity = entity;
    }
    InputMovementComponent.prototype.update = function (ticks) {
        var physComp = this._entity.getComponent(Components.PHYSICS);
        var vx = 0;
        var vy = 0;
        if(Input.isKeyDown(Input.Keys.LEFT)) {
            vx -= Constants.PLAYER_WALK_SPEED_X;
        }
        if(Input.isKeyDown(Input.Keys.RIGHT)) {
            vx += Constants.PLAYER_WALK_SPEED_X;
        }
        if(Input.isKeyDown(Input.Keys.UP)) {
            vy -= Constants.PLAYER_WALK_SPEED_Y;
        }
        if(Input.isKeyDown(Input.Keys.DOWN)) {
            vy += Constants.PLAYER_WALK_SPEED_Y;
        }
        if(Input.isKeyDown(Input.Keys.SHIFT)) {
            vx *= Constants.PLAYER_RUN_MULTIPLIER;
            vy *= Constants.PLAYER_RUN_MULTIPLIER;
        }
        physComp.setVelocity(vx, vy);
    };
    InputMovementComponent.prototype.initialize = function (key) {
    };
    return InputMovementComponent;
})();
var MovementAnimationComponent = (function () {
    function MovementAnimationComponent(game, entity) {
        this.name = Components.MOVEMENT_ANIMATION;
        this._game = game;
        this._entity = entity;
        this._flipped = false;
    }
    MovementAnimationComponent.prototype.update = function (ticks) {
        var physComp = this._entity.getComponent(Components.PHYSICS);
        var animComp = this._entity.getComponent(Components.ANIMATION);
        var rendComp = this._entity.getComponent(Components.RENDER);
        var posComp = this._entity.getComponent(Components.POSITION);
        var velocity = physComp.getVelocity();
        var animation = "idle";
        if(Math.abs(velocity.x) >= Constants.PLAYER_WALK_SPEED_X * Constants.PLAYER_RUN_MULTIPLIER || Math.abs(velocity.y) >= Constants.PLAYER_WALK_SPEED_Y * Constants.PLAYER_RUN_MULTIPLIER) {
            animation = "run";
        } else if(Math.abs(velocity.x) > 0 || Math.abs(velocity.y) > 0) {
            animation = "walk";
        }
        if(velocity.x < 0) {
            this._flipped = true;
        } else if(velocity.x > 0) {
            this._flipped = false;
        }
        animComp.setAnimation(animation);
        rendComp.setFlipped(this._flipped);
        posComp.setFacing(velocity.x);
    };
    MovementAnimationComponent.prototype.initialize = function (key) {
    };
    return MovementAnimationComponent;
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
        this.eventManager = new EventManager();
        this._canvas = canvas;
        this.context = canvas.getContext("2d");
        this._lastId = 0;
        this._componentMap = {
        };
        this._componentMap[Components.INPUT_MOVEMENT] = InputMovementComponent;
        this._componentMap[Components.AI_MOVEMENT] = AIMovementComponent;
        this._componentMap[Components.MOVEMENT_ANIMATION] = MovementAnimationComponent;
        this._componentMap[Components.PHYSICS] = PhysicsComponent;
        this._componentMap[Components.POSITION] = PositionComponent;
        this._componentMap[Components.ANIMATION] = AnimationComponent;
        this._componentMap[Components.RENDER] = RenderComponent;
    }
    Game.prototype.update = function () {
        for(var component in this._componentMap) {
            if(component === Components.RENDER) {
                this.context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            }
            this.scene.getEntities().updateByComponent(component, this.timer.currentTime());
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
            return null;
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
            if(entityName === 'player') {
                this.player = entity;
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
        return this._lastId++;
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
