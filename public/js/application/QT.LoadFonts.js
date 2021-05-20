QT.LoadFonts = function()
{
    var scope = this;
    var count = 0;
    var loader = new THREE.FontLoader();
    var fonts = [ "Arial_Black_Regular", "Arial_Bold", "Arial_Bold_Italic", "Arial_Italic", "Arial_Regular", "Impact_Regular", "PhagsPa_Regular",
        "Segoe_Print_Bold", "Segoe_Print_Regular", "Trebuchet_Regular", "Trebuchet_Bold", "Trebuchet_Bold_Italic" ];
    var progress = new scope.utils.Progress( { value: 0, limit: fonts.length } );

    fonts.forEach( ( font, index ) =>
    {
        loader.load( scope.config.url + `fonts/${ font }.json`, font => success( font, fonts[ index ] ) );
    } );

    function success( font, name )
    {
        scope.data.assets.fonts[ name ] =
        {
            name: font.data.familyName,
            type: font.type,
            font: font
        };

        count++;
        progress.update( { label: name, value: count } );

        if ( count === fonts.length )
        {
            let event = new Event( "fonts_loaded" );
            window.dispatchEvent( event );
        }
    }
};