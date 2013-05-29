///<reference path="Entity.ts" />
///<reference path="EntityArray.ts" />
///<reference path="AssetManager.ts" />
///<reference path="EventManager.ts" />
///<reference path="Scene.ts" />
///<reference path="Timer.ts" />
///<reference path="../components/RenderComponent.ts" />
///<reference path="../components/PositionComponent.ts" />
///<reference path="../components/PhysicsComponent.ts" />
///<reference path="../components/AnimationComponent.ts" />
///<reference path="../components/AIMovementComponent.ts" />
///<reference path="../components/InputMovementComponent.ts" />
///<reference path="../components/MovementAnimationComponent.ts" />
///<reference path="../definitions/jaws.d.ts" />

class Game
{
    timer: Timer;
    assetManager: AssetManager;
    eventManager: EventManager;
    context: CanvasRenderingContext2D;
    scene: Scene;
    player: Entity;

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
        this.eventManager = new EventManager();
        this._canvas = canvas;
        this.context = canvas.getContext("2d");
        this._lastId = 0;

        this._componentMap = {};
        this._componentMap[Components.INPUT_MOVEMENT] = InputMovementComponent;
        this._componentMap[Components.AI_MOVEMENT] = AIMovementComponent;
        this._componentMap[Components.MOVEMENT_ANIMATION] = MovementAnimationComponent;
        this._componentMap[Components.PHYSICS] = PhysicsComponent;
        this._componentMap[Components.POSITION] = PositionComponent;
        this._componentMap[Components.ANIMATION] = AnimationComponent;
        this._componentMap[Components.RENDER] = RenderComponent;
    }

    private update()
    {
        //Update components
        for (var component in this._componentMap)
        {
            if (component === Components.RENDER)
                this.context.clearRect(0, 0, this._canvas.width, this._canvas.height);

            this.scene.getEntities().updateByComponent(component, this.timer.currentTime());
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
            return null;
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

            if (entityName === 'player') {
                this.player = entity;
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
        return this._lastId++;
    }
}
