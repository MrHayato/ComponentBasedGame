///<reference path="Logger.ts" />
///<reference path="Game.ts" />
///<reference path="../components/IComponent.ts" />

class Entity
{
    id: number;
    components: any;

    constructor(id: number)
    {
        this.components = {};
        this.id = id;
    }

    addComponent(component: IComponent)
    {
        this.components[component.name] = component;
    }

    getComponent(componentName: string): IComponent
    {
        if (this.components[componentName])
        {
            return this.components[componentName];
        }
        else
        {
            return undefined;
        }
    }

    removeComponent(component: IComponent)
    {
        this.components[component.name] = undefined;
    }
}