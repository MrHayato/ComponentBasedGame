class Vector
{
    constructor (public x: number, public y: number) { }

    length()
    {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    normalize()
    {
        var length = this.length();
        this.x = this.x / length;
        this.y = this.y / length;
    }

    dotProduct(v)
    {
        return (this.x * v.x + this.y * v.y);
    }
    
    setX(x: number)
    {
        this.x = x;
    }

    setY(y: number)
    {
        this.y = y;
    }

    setLength(length: number)
    {
        var r = length / this.length();
        this.x *= r;
        this.y *= r;
    }

    setVelocity(x: number, y: number)
    {
        this.setX(x);
        this.setY(y);
    }
}