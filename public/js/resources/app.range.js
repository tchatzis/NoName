const Range = function()
{
    this.min = 0;
    this.max = 0;
    this.value = 1;

    this.get = function( array, key )
    {
        array.forEach( item =>
        {
            this.check( item[ key ] );
        } );
    };

    this.check = function( value )
    {
        if ( value < this.min )
            this.min = value;

        if ( value > this.max )
            this.max = value;

        this.value = this.max - this.min;
    };
};