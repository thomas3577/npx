var utils = require( './utils' ),
    _ = require( 'lodash' );

// Basically a _buffer with utilities
// This is how we will create animation frames and string them together
// It's best to save these in a variable or object for later use

// You can not currently pause during the middle of an animation
// Once it's sent it must run to completion.

function Animation( framelength, numberOfFrames, intensity ) {

    // Number of neopixels attached to Tessel
    this._framelength = framelength || 1;

    // Range of frames for looping purposes
    // Exposes frames.length which is also useful for animation creation
    this._frames = numberOfFrames ? _.range( numberOfFrames ) : _.range( 1 );

    // Initialize _buffer of appropriate length
    // We multiply by three since each pixel has an r, g, and b value
    // Expose _buffer to user
    this._buffer = new Buffer( this._framelength * this._frames.length * 3 );

    // Clear _buffer as new Buffer(length) initializes with random numbers
    this._buffer.fill( 0 );

    // Yet to be implemented, should control _intensity of the LEDs of all frames
    this._intensity = intensity || 1;

    // Helper function to set a single pixel's color
    this._setColor = function ( buffer, index, color ) {
        buffer[ index * 3 ] = color[ 0 ];
        buffer[ index * 3 + 1 ] = color[ 1 ];
        buffer[ index * 3 + 2 ] = color[ 2 ];
    }

}


// Sets single pixel to a color in a specific animation frame
// If no frame is specified it will set it for all frames
Animation.prototype.setPixel = function ( index, color, frame ) {
    var convertedColor = utils.convertToRGB( color ),
        setColor = this._setColor;

    if ( frame === undefined ) {
        _.each( this._frames, function ( frame ) {
            setColor( this._buffer, frame * this._framelength + index, convertedColor );
        }, this );
    }
    else {
        setColor( this._buffer, frame * this._framelength + index, convertedColor );
    }

    return this;
};

// Sets all pixels in one frame to a color
// If no frame is specified it will set it for all frames
Animation.prototype.setAll = function ( color, frame ) {
    var buffer = this._buffer,
        convertedColor = utils.convertToRGB( color ),
        setColor = this._setColor;

    if ( frame === undefined ) {
        _.each( _.range( this._framelength * this._frames.length ), function ( pixelIndex ) {
            setColor( buffer, pixelIndex, convertedColor );
        }, this );
    } else {
        _.each( _.range( this._framelength ), function ( pixelIndex ) {
            setColor( buffer, frame * this._framelength + pixelIndex, convertedColor );
        }, this );
    }

    return this;
};

// Sets a repeating pattern to the frame
// If no frame is specified it'll set the pattern to all frames
Animation.prototype.setPattern = function ( colors, frame ) {
    var pixels = _.range( this._framelength ),
        convertedColors = _.map( colors, utils.convertToRGB );

    if ( frame === undefined ) {
        _.forEach( pixels, function ( pixel, index ) {
            this.setPixel( index, convertedColors[ index % convertedColors.length ] );
        }, this );
    }
    else {
        _.forEach( pixels, function ( pixel, index ) {
            this.setPixel( pixels.length * frame + index, convertedColors[ index % convertedColors.length ], frame );
        }, this );
    }

    return this;
};

module.exports = Animation;