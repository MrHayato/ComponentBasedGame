///<reference path="Entity.ts" />

class ComponentEntityMap
{
    _map = {};

    push(componentName: string, entity: Entity)
    {
        if (!this._map[componentName])
            this._map[componentName] = [];

        this._map[componentName].push(entity);
    }

    get(componentName: string): Entity[]
    {
        return this._map[componentName];
    }
}

class EntityArray
{
    _entities: Entity[];
    _componentMap: ComponentEntityMap;

    constructor ()
    {
        this._entities = [];
        this._componentMap = new ComponentEntityMap();
    }

    add(entity: Entity)
    {
        this._entities.push(entity);

        for (var component in entity.components)
        {
            this._componentMap.push(component, entity);
        }
    }

    getEntitiesByComponent(componentName: string): Entity[]
    {
        return this._componentMap.get(componentName);
    }

    updateByComponent(componentName: string)
    {
        var entities = this.getEntitiesByComponent(componentName);
        if (!entities || entities.length === 0)
            return;

        for (var i = 0; i < entities.length; i++)
        {
            entities[i].getComponent(componentName).update();
        }
    }
}