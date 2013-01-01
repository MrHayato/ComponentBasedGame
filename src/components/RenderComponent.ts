///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PositionComponent.ts" />

class RenderComponent implements IComponent
{
    private _entity: Entity;
    private _sprite: HTMLCanvasElement;
    name: string = Components.RENDER;

    constructor(entity: Entity)
    {
        this._entity = entity;
    }

    update()
    {
        var pos = (<PositionComponent>this._entity.getComponent(Components.POSITION)).getPosition();
        Game.context.drawImage(this._sprite, pos.x, pos.y);
    }

    initialize(key: any)
    {
        var canvas = Game.assetManager.get(key);
        if (!canvas)
        {
            Logger.error("Asset not found: " + key);
        }
        this._sprite = canvas;
    }
}