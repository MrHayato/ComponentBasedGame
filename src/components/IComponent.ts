interface IComponent
{
    name: string;

    update(ticks: number);
    initialize(settings: any);
}