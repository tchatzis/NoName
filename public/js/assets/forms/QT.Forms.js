QT.Forms = function()
{
    this.init = async function( args )
    {
        const url = `assets/forms/display/${ args.name }.js`;
        const { default: Form } = await this.methods.import( args.name, url );
        let form = new Form();
            form.display[ args.name ].call( this, args );
    };
};