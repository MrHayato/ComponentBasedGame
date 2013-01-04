class Scene
{
    name: string;
    private _entities: EntityArray;

    constructor ()
    {
        this._entities = new EntityArray();
    }

    getEntities(): EntityArray
    {
        return this._entities;
    }

    addEntity(entity: Entity)
    {
        this._entities.add(entity);
    }
}