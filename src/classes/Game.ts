///<reference path="Entity.ts" />
///<reference path="EntityArray.ts" />
///<reference path="AssetManager.ts" />
///<reference path="Scene.ts" />
///<reference path="Timer.ts" />
///<reference path="../components/RenderComponent.ts" />
///<reference path="../components/PositionComponent.ts" />
///<reference path="../components/AnimationComponent.ts" />
///<reference path="../definitions/jaws.d.ts" />

class Game
{
    timer: Timer;
    assetManager: AssetManager;
    context: CanvasRenderingContext2D;
    scene: Scene;

    private _lastId: number;
    private _canvas: HTMLCanvasElement;
    private _gameEntities: { [key: string]: Entity; };
    private _componentMap: { [key: string]: any; };

    constructor (canvas: HTMLCanvasElement)
    {
        var self = this;
        this._gameEntities = {};
        this.timer = new Timer({ fps: 60, tick: function () { self.update(); } });
        this.assetManager = new AssetManager();
        this._canvas = canvas;
        this.context = canvas.getContext("2d");
        this._lastId = 0;

        this._componentMap = {};
        this._componentMap[Components.RENDER] = RenderComponent;
        this._componentMap[Components.POSITION] = PositionComponent;
        this._componentMap[Components.ANIMATION] = AnimationComponent;
    }

    private update()
    {
        var components = [Components.POSITION, Components.ANIMATION, Components.RENDER];
        
        //Update components
        for (var i = 0; i < components.length; i++)
        {
            if (components[i] === Components.RENDER)
                this.context.clearRect(0, 0, this._canvas.width, this._canvas.height);

            this.scene.getEntities().updateByComponent(components[i], this.timer.currentTime());
        }
    }

    private loadEntities(callback: () => any)
    {
        var self = this;

        this.assetManager.loadJSON("/data/entities.json", function (ents)
        {
            self.parseEntities(ents);
            self.assetManager.loadJSON("/data/level1.json", function (level)
            {
                self.parseLevel(level);
                callback();
            });
        });
    }

    private parseEntities(ents)
    {
        for (var entity in ents)
        {
            if (entity !== "assets")
            {
                this._gameEntities[entity] = ents[entity];
            }
        }
    }

    private parseLevel(level)
    {
        this.scene = new Scene();

        this.scene.name = level["name"];
        this.addEntitiesToScene(level["entities"]);
    }

    private createEntity(entity: string, settings): Entity
    {
        var entityData = this._gameEntities[entity];

        if (!entityData)
        {
            Logger.error("Entity not found: " + entity);
            return;
        }

        $.extend(true, entityData, settings);
        var newEntity = new Entity(this.generateEntityId());

        for (var component in entityData)
        {
            var newComponent: IComponent = null;

            if (this._componentMap[component.toLowerCase()])
            {
                newComponent = new this._componentMap[component.toLowerCase()](this, newEntity);
                newComponent.initialize(entityData[component]);
                newEntity.addComponent(newComponent);
            }
            else
            {
                Logger.error("Component not found: " + component);
            }
        }

        this.scene.addEntity(newEntity);

        return newEntity;
    }

    private addEntitiesToScene(entities)
    {
        for (var i = 0; i < entities.length; i++)
        {
            var entityName = entities[i].entity;
            var entity = this.createEntity(entityName, entities[i].attributes);

            if (!entity)
            {
                Logger.error("Entity not loaded: " + entityName);
                continue;
            }

            this.scene.addEntity(entity);
        }
    }

    start()
    {
        var self = this;
        this.loadEntities(function ()
        {
            self.timer.start();
        });
    }

    generateEntityId(): number
    {
        return this._lastId;
    }
}
