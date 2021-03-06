var expect = require('chai').expect;
var Animation = require('../lib/animation');

describe('New animation', function(){
  it('should have reasonable defaults', function(){
    var animation = new Animation();
    expect(animation._framelength).to.not.equal(undefined);
    expect(animation.length).to.not.equal(undefined);
    expect(animation._buffer).to.not.equal(undefined);
    expect(animation._intensity).to.not.equal(undefined);
  });
});

describe('Creating a single frame animation', function(){
  var animation, LEDStripLength;

  before(function(){
    LEDStripLength = 60;
    animation = new Animation(LEDStripLength, 1);
  });

  it('should have _buffer length 3x LED strip length', function(){
    expect(animation._buffer.length).to.equal(LEDStripLength*3);
  });
});

describe('Creating a multi-frame animation', function(){
  var longAnimation, shortAnimation, LEDStripLength, shortFrames, longFrames;
  before(function(){
    LEDStripLength = 60;
    shortFrames = 5;
    longFrames = 100;
    longAnimation = new Animation(LEDStripLength, longFrames);
    shortAnimation = new Animation(LEDStripLength, shortFrames);
  });
  it('should have a correct _buffer length', function(){
    expect(shortAnimation._buffer.length).to.equal(shortFrames*LEDStripLength*3);
    expect(longAnimation._buffer.length).to.equal(longFrames*LEDStripLength*3);
  });
});

describe('animation.setAll', function(){
  var LEDStripLength = 60;
  describe('with one frame', function(){
    beforeEach(function(){
      
    });
    it('should set entire _buffer to the color', function(){

    });
  });
  describe('with multi-frame', function(){
    it('should set entire _buffer to the color', function(){

    });
  });
})
