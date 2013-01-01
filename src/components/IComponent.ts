interface IComponent
{
    name: string;

    update();
    initialize(settings: any);
}