///<reference path="../components/IComponent.ts" />

class Entity
{
    components: any;

    constructor()
    {
        this.components = {};
    }

    addComponent(component: IComponent)
    {
        this.components[component.name] = component;
    }

    getComponent(componentName: string): IComponent
    {
        if (this.components[componentName])
            return this.components[componentName];
        else
        {
            Logger.error("Component not found: " + componentName);
            return undefined;
        }
    }

    removeComponent(component: IComponent)
    {
        this.components[component.name] = undefined;
    }
}