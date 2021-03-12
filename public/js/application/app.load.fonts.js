const LoadFonts = function()
{
    var app = this;
    var count = 0;

    const success = function( font, name )
    {
        app.assets.fonts[ name ] =
        {
            name: font.data.familyName,
            type: font.type,
            font: font
        };

        count++;
        progress.update( { label: name, value: count } );

        var event = new CustomEvent( "progress_font", { detail: { type: "font", label: name, value: count / fonts.length, limit: fonts.length } } );
        document.dispatchEvent( event );

        if ( count === fonts.length )
        {
            let event = new Event( "fonts_loaded" );
            document.dispatchEvent( event );
        }

    }.bind( this );

    var loader = new THREE.FontLoader();
    var fonts = [ "Arial_Black_Regular", "Arial_Bold", "Arial_Bold_Italic", "Arial_Italic", "Arial_Regular", "Impact_Regular", "PhagsPa_Regular",
        "Segoe_Print_Bold", "Segoe_Print_Regular", "Trebuchet_Regular", "Trebuchet_Bold", "Trebuchet_Bold_Italic" ];

    fonts.forEach( ( font, index ) =>
    {
        loader.load( app.url + `fonts/${ font }.json`, font => success( font, fonts[ index ] ) );
    } );

    var progress = new this.utils.Progress( { value: 0, limit: fonts.length } );
};