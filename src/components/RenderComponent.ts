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
    private _flipped: bool;
    name: string = Components.RENDER;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
        this._flipped = false;
    }

    update(ticks: number)
    {
        var pos = (<PositionComponent>this._entity.getComponent(Components.POSITION)).getPosition();
        var animComponent = (<AnimationComponent>this._entity.getComponent(Components.ANIMATION));
        
        var sprite: HTMLCanvasElement;

        if (animComponent)
            sprite = animComponent.getFrame();
        else
            sprite = this._sprite;

        var context = this._game.context;
        context.save();
        context.translate(pos.x, pos.y);
        if (this._flipped) context.scale(-1, 1);
        context.translate(-(sprite.width * 0.5), -(sprite.height * 0.5));
        this._game.context.drawImage(sprite, 0, 0);
        context.restore();
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

    setFlipped(flipped: bool)
    {
        this._flipped = flipped;
    }
}