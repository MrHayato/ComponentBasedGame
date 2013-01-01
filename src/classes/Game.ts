///<reference path="Entity.ts" />
///<reference path="EntityArray.ts" />
///<reference path="AssetManager.ts" />
///<reference path="Timer.ts" />
///<reference path="../components/RenderComponent.ts" />
///<reference path="../definitions/jaws.d.ts" />

module Game
{
    export var entities: EntityArray= new EntityArray();
    export var timer: Timer= new Timer({ fps: 60, tick: update });
    export var assetManager: AssetManager= new AssetManager();
    export var canvas: HTMLCanvasElement;
    export var context: CanvasRenderingContext2D;

    function update()
    {
        var components = [Components.RENDER];
        
        //Update components
        for (var i = 0; i < components.length; i++)
        {
            entities.updateByComponent(components[i]);
        }
    }

    function loadEntities(callback: () => any)
    {
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

        assetManager.loadJSON("/data/entities.json", function (ents)
        {
            parseEntities(ents);
            onLoaded();
        });
        assetManager.loadJSON("/data/level1.json", function (level)
        {
            parseLevel(level);
            onLoaded();
        });
    }

    function parseEntities(ents)
    {
        for (var entity in ents)
        {
            if (entity !== "assets")
            {
                var newEntity = new Entity();

                for (var component in ents[entity])
                {
                    var newComponent: IComponent = null;

                    switch (component.toLowerCase())
                    {
                        case Components.RENDER:
                            newComponent = new RenderComponent(newEntity);
                            break;
                        case Components.POSITION:
                            newComponent = new PositionComponent(newEntity);
                            break;
                    }

                    if (newComponent != null)
                        newComponent.initialize(ents[entity][component]);
                    newEntity.addComponent(newComponent);
                }

                entities.add(newEntity);
            }
        }
    }

    function parseLevel(level)
    {

    }

    export function setCanvas(canv: HTMLCanvasElement)
    {
        canvas = canv;
        context = canv.getContext("2d");
    }

    export function start()
    {
        loadEntities(function ()
        {
            timer.start();
        });
    }
}
