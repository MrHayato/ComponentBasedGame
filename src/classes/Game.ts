///<reference path="Entity.ts" />
///<reference path="EntityArray.ts" />
///<reference path="AssetManager.ts" />
///<reference path="Timer.ts" />
///<reference path="../components/RenderComponent.ts" />
///<reference path="../components/PositionComponent.ts" />
///<reference path="../components/AnimationComponent.ts" />
///<reference path="../definitions/jaws.d.ts" />

class Game
{
    entities: EntityArray;
    timer: Timer;
    assetManager: AssetManager;
    context: CanvasRenderingContext2D;

    private _lastId: number;
    private _canvas: HTMLCanvasElement;
    private _componentMap: { [key: string]: any; };

    constructor (canvas: HTMLCanvasElement)
    {
        var self = this;
        this.entities = new EntityArray();
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

            this.entities.updateByComponent(components[i], this.timer.currentTime());
        }
    }

    private loadEntities(callback: () => any)
    {
        var self = this;
        var numFiles = 2;
        var loaded = 0;
        var onLoaded = function ()
        {
            loaded++;

            if (loaded >= numFiles && $.isFunction(callback))
            {
                callback();
            }
        };

        this.assetManager.loadJSON("/data/entities.json", function (ents)
        {
            self.parseEntities(ents);
            onLoaded();
        });
        this.assetManager.loadJSON("/data/level1.json", function (level)
        {
            self.parseLevel(level);
            onLoaded();
        });
    }

    private parseEntities(ents)
    {
        for (var entity in ents)
        {
            if (entity !== "assets")
            {
                var newEntity = new Entity(this.generateEntityId());

                for (var component in ents[entity])
                {
                    var newComponent: IComponent = null;

                    if (this._componentMap[component.toLowerCase()])
                    {
                        newComponent = new this._componentMap[component.toLowerCase()](this, newEntity);
                        newComponent.initialize(ents[entity][component]);
                        newEntity.addComponent(newComponent);
                    }
                    else
                    {
                        Logger.error("Component not found: " + component);
                    }
                }

                this.entities.add(newEntity);
            }
        }
    }

    private parseLevel(level)
    {

    }

    start()
    {
        var self = this;
        this.loadEntities(function ()
        {
            self.timer.start();
        });
    }

    draw(image: HTMLElement, offsetX: number, offsetY: number, width?: number, height?: number, 
        canvasOffsetX?: number, canvasOffsetY?: number, canvasImageWidth?: number, canvasImageHeight?: number): void
    {
        this.context.drawImage(image, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, canvasImageWidth, canvasImageHeight);
    }

    generateEntityId(): number
    {
        return this._lastId;
    }
}
