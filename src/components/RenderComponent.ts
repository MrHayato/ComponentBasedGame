///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PositionComponent.ts" />
///<reference path="../components/AnimationComponent.ts" />

class RenderComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _sprite: HTMLCanvasElement;
    name: string = Components.RENDER;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
    }

    update(ticks: number)
    {
        var pos = (<PositionComponent>this._entity.getComponent(Components.POSITION)).getPosition();
        var animComponent = (<AnimationComponent>this._entity.getComponent(Components.ANIMATION));
        
        if (animComponent)
            this._game.context.drawImage(animComponent.getFrame(), pos.x, pos.y);
        else
            this._game.context.drawImage(this._sprite, pos.x, pos.y);
    }

    initialize(key: any)
    {
        var canvas = this._game.assetManager.get(key);
        if (!canvas)
        {
            Logger.error("Asset not found: " + key);
        }
        this._sprite = canvas;
    }

    getSprite(): HTMLCanvasElement
    {
        return this._sprite;
    }
}