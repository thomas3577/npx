var hw = process.binding( 'hw' ), // Comment this and promisifyAnimation out to run tests
    util = require( 'util' ),
    events = require( 'events' ),
    Q = require( 'kew' ),
    Animation = require( './animation' );

function promisifyAnimation( animation, delay ) {

    // Return a function that returns a promise so make api cleaner
    return function () {
        var deferred = Q.defer();

        // Animation done, resolve promise and do next thing
        setTimeout( function () {
            // We pass this along just in case the next promise needs it.
            deferred.resolve( animation );
        }, delay );

        // Send animation
        hw.neopixel_animation_buffer( animation._framelength * 3, animation._buffer );

        // Return animation promise
        return deferred.promise;
    }
}

// One day this will also take in the GPIO pin as a parameter.
function Npx( totalPixels ) {
    this.totalPixels = totalPixels || 1;
    this.queue = [];
    this.running = false;
}

// Let Npx emit and respond to events.
util.inherits( Npx, events.EventEmitter );

// Create new animation object
Npx.prototype.newAnimation = function ( numberOfFrames, intensity ) {
    return new Animation( this.totalPixels, numberOfFrames, intensity );
};

// Play animation immediately
Npx.prototype.play = function ( animation, callback ) {
    this.animate( animation._framelength, animation._buffer, callback );

    return this;
};

// Queue an animation
Npx.prototype.enqueue = function ( animation, delay ) {
    this.queue.push( promisifyAnimation( animation, delay ) );

    return this;
};

// Run animations in queue
Npx.prototype.run = function () {
    var deferred = Q.defer();

    // Recursive run function passing along the index to optimize for long queues.
    var run = function ( index ) {
        if ( index === undefined ) {
            index = 0;
        }

        if ( this.queue.length > index && this.running ) {
            var animation = this.queue[ index ];

            // Instead of using unshift here we just inspect
            // This is an optimization for long queues
            animation().then( function () {
                run( ++index );
            } );
        } else {
            this.running = false;

            // Clear the queue since we're inspecting instead of unshift
            this.clear();
            deferred.resolve();
        }
    }.bind( this );

    // Execute all items in queue.
    this.running = true;
    run( 0 );
    return deferred.promise;
};

// Beta, not entirely stable
Npx.prototype.loop = function () {
    var run = function ( index ) {
        if ( this.running === true ) {
            if ( index >= this.queue.length ) {
                index = 0;
            }

            var animation = this.queue[ index ];

            // Instead of using unshift here we just inspect
            // This is an optimization for long queues
            animation().then( function () {
                run( ++index );
            } );
        } else {
            run = null;

            this.clear();
        }
    }.bind( this );

    // Execute all items in queue.
    this.running = true;
    run( 0 );
};

// Under development
Npx.prototype.stop = function () {
    this.running = false;
    this.clear();
};

Npx.prototype.clear = function () {

    this.queue.forEach( function ( animation ) {
        animation = null;
    } );

    this.queue = [];

};

// Advanced use
// Exposes original animate function written by https://github.com/johnnyman727
Npx.prototype.animate = function ( numberOfPixels, animationBuffer, callback ) {

    // When we finish sending the animation
    process.once( 'neopixel_animation_complete', function animationComplete() {

        // Emit an end event
        this.emit( 'done' );

        // If there is a callback
        if ( callback ) {
            // Call it
            callback();
        }
    }.bind( this ) );

    // Send the animation
    hw.neopixel_animation_buffer( numberOfPixels * 3, animationBuffer );
};

module.exports = Npx;