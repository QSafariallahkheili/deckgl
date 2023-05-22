var Mapbox3DTiles = (function (exports) {
	'use strict';

	// Polyfills
	if ( Number.EPSILON === undefined ) {Number.EPSILON = Math.pow( 2, - 52 );}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
	if ( Number.isInteger === undefined ) {
		Number.isInteger = function ( value ) {
			return typeof value === 'number' && isFinite( value ) && Math.floor( value ) === value;
		};
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
	if ( Math.sign === undefined ) {
		Math.sign = function ( x ) {
			return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : + x;
		};
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
	if ( 'name' in Function.prototype === false ) {
		Object.defineProperty( Function.prototype, 'name', {
			get: function () {
				return this.toString().match( /^\s*function\s*([^\(\s]*)/ )[ 1 ];
			}
		} );
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	if ( Object.assign === undefined ) {
		Object.assign = function ( target ) {
			if ( target === undefined || target === null ) {
				throw new TypeError( 'Cannot convert undefined or null to object' );
			}

			const output = Object( target );
			for ( let index = 1; index < arguments.length; index ++ ) {
				const source = arguments[ index ];
				if ( source !== undefined && source !== null ) {
					for ( const nextKey in source ) {
						if ( Object.prototype.hasOwnProperty.call( source, nextKey ) ) {
							output[ nextKey ] = source[ nextKey ];
						}
					}
				}
			}
			return output;
		};
	}

	const REVISION = '120';
	const CullFaceNone = 0;const CullFaceBack = 1;const CullFaceFront = 2;const PCFShadowMap = 1;
	const PCFSoftShadowMap = 2;const VSMShadowMap = 3;const FrontSide = 0;const BackSide = 1;const DoubleSide = 2;
	const FlatShading = 1;const NoBlending = 0;const NormalBlending = 1;const AdditiveBlending = 2;const SubtractiveBlending = 3;const MultiplyBlending = 4;
	const CustomBlending = 5;const AddEquation = 100;const SubtractEquation = 101;const ReverseSubtractEquation = 102;
	const MinEquation = 103;const MaxEquation = 104;const ZeroFactor = 200;const OneFactor = 201;const SrcColorFactor = 202;
	const OneMinusSrcColorFactor = 203;const SrcAlphaFactor = 204;const OneMinusSrcAlphaFactor = 205;
	const DstAlphaFactor = 206;const OneMinusDstAlphaFactor = 207;const DstColorFactor = 208;const OneMinusDstColorFactor = 209;
	const SrcAlphaSaturateFactor = 210;const NeverDepth = 0;const AlwaysDepth = 1;
	const LessDepth = 2;
	const LessEqualDepth = 3;
	const EqualDepth = 4;
	const GreaterEqualDepth = 5;
	const GreaterDepth = 6;
	const NotEqualDepth = 7;
	const MultiplyOperation = 0;
	const MixOperation = 1;
	const AddOperation = 2;
	const NoToneMapping = 0;
	const LinearToneMapping = 1;
	const ReinhardToneMapping = 2;
	const CineonToneMapping = 3;
	const ACESFilmicToneMapping = 4;
	const CustomToneMapping = 5;

	const UVMapping = 300;
	const CubeReflectionMapping = 301;
	const CubeRefractionMapping = 302;
	const EquirectangularReflectionMapping = 303;
	const EquirectangularRefractionMapping = 304;
	const CubeUVReflectionMapping = 306;
	const CubeUVRefractionMapping = 307;
	const RepeatWrapping = 1000;
	const ClampToEdgeWrapping = 1001;
	const MirroredRepeatWrapping = 1002;
	const NearestFilter = 1003;
	const NearestMipmapNearestFilter = 1004;
	const NearestMipmapLinearFilter = 1005;
	const LinearFilter = 1006;
	const LinearMipmapNearestFilter = 1007;
	const LinearMipmapLinearFilter = 1008;
	const UnsignedByteType = 1009;
	const ByteType = 1010;
	const ShortType = 1011;
	const UnsignedShortType = 1012;
	const IntType = 1013;
	const UnsignedIntType = 1014;
	const FloatType = 1015;
	const HalfFloatType = 1016;
	const UnsignedShort4444Type = 1017;
	const UnsignedShort5551Type = 1018;
	const UnsignedShort565Type = 1019;
	const UnsignedInt248Type = 1020;
	const AlphaFormat = 1021;
	const RGBFormat = 1022;
	const RGBAFormat = 1023;
	const LuminanceFormat = 1024;
	const LuminanceAlphaFormat = 1025;
	const DepthFormat = 1026;
	const DepthStencilFormat = 1027;
	const RedFormat = 1028;
	const RedIntegerFormat = 1029;
	const RGFormat = 1030;
	const RGIntegerFormat = 1031;
	const RGBIntegerFormat = 1032;
	const RGBAIntegerFormat = 1033;

	const RGB_S3TC_DXT1_Format = 33776;
	const RGBA_S3TC_DXT1_Format = 33777;
	const RGBA_S3TC_DXT3_Format = 33778;
	const RGBA_S3TC_DXT5_Format = 33779;
	const RGB_PVRTC_4BPPV1_Format = 35840;
	const RGB_PVRTC_2BPPV1_Format = 35841;
	const RGBA_PVRTC_4BPPV1_Format = 35842;
	const RGBA_PVRTC_2BPPV1_Format = 35843;
	const RGB_ETC1_Format = 36196;
	const RGB_ETC2_Format = 37492;
	const RGBA_ETC2_EAC_Format = 37496;
	const RGBA_ASTC_4x4_Format = 37808;
	const RGBA_ASTC_5x4_Format = 37809;
	const RGBA_ASTC_5x5_Format = 37810;
	const RGBA_ASTC_6x5_Format = 37811;
	const RGBA_ASTC_6x6_Format = 37812;
	const RGBA_ASTC_8x5_Format = 37813;
	const RGBA_ASTC_8x6_Format = 37814;
	const RGBA_ASTC_8x8_Format = 37815;
	const RGBA_ASTC_10x5_Format = 37816;
	const RGBA_ASTC_10x6_Format = 37817;
	const RGBA_ASTC_10x8_Format = 37818;
	const RGBA_ASTC_10x10_Format = 37819;
	const RGBA_ASTC_12x10_Format = 37820;
	const RGBA_ASTC_12x12_Format = 37821;
	const RGBA_BPTC_Format = 36492;
	const SRGB8_ALPHA8_ASTC_4x4_Format = 37840;
	const SRGB8_ALPHA8_ASTC_5x4_Format = 37841;
	const SRGB8_ALPHA8_ASTC_5x5_Format = 37842;
	const SRGB8_ALPHA8_ASTC_6x5_Format = 37843;
	const SRGB8_ALPHA8_ASTC_6x6_Format = 37844;
	const SRGB8_ALPHA8_ASTC_8x5_Format = 37845;
	const SRGB8_ALPHA8_ASTC_8x6_Format = 37846;
	const SRGB8_ALPHA8_ASTC_8x8_Format = 37847;
	const SRGB8_ALPHA8_ASTC_10x5_Format = 37848;
	const SRGB8_ALPHA8_ASTC_10x6_Format = 37849;
	const SRGB8_ALPHA8_ASTC_10x8_Format = 37850;
	const SRGB8_ALPHA8_ASTC_10x10_Format = 37851;
	const SRGB8_ALPHA8_ASTC_12x10_Format = 37852;
	const SRGB8_ALPHA8_ASTC_12x12_Format = 37853;
	const InterpolateDiscrete = 2300;
	const InterpolateLinear = 2301;
	const TriangleStripDrawMode = 1;
	const TriangleFanDrawMode = 2;
	const LinearEncoding = 3000;
	const sRGBEncoding = 3001;
	const GammaEncoding = 3007;
	const RGBEEncoding = 3002;
	const LogLuvEncoding = 3003;
	const RGBM7Encoding = 3004;
	const RGBM16Encoding = 3005;
	const RGBDEncoding = 3006;
	const TangentSpaceNormalMap = 0;
	const ObjectSpaceNormalMap = 1;
	const KeepStencilOp = 7680;
	const AlwaysStencilFunc = 519;

	const StaticDrawUsage = 35044;
	const DynamicDrawUsage = 35048;
	const GLSL3 = "300 es";

        var wallColor="#f2f2f2";
        var roofColor="#ff5c4d";
        var bridgeColor="#999999";
	/**
	 * https://github.com/mrdoob/eventdispatcher.js/
	 */

	function EventDispatcher() {}

	Object.assign( EventDispatcher.prototype, {

		addEventListener: function ( type, listener ) {
			if ( this._listeners === undefined ) this._listeners = {};
			const listeners = this._listeners;
			if ( listeners[ type ] === undefined ) {listeners[ type ] = [];}
			if ( listeners[ type ].indexOf( listener ) === - 1 ) {listeners[ type ].push( listener );}
		},

		hasEventListener: function ( type, listener ) {
			if ( this._listeners === undefined ) return false;
			const listeners = this._listeners;
			return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;
		},

		removeEventListener: function ( type, listener ) {
			if ( this._listeners === undefined ) return;
			const listeners = this._listeners;
			const listenerArray = listeners[ type ];
			if ( listenerArray !== undefined ) {
				const index = listenerArray.indexOf( listener );
				if ( index !== - 1 ) {
					listenerArray.splice( index, 1 );
				}
			}
		},

		dispatchEvent: function ( event ) {

			if ( this._listeners === undefined ) return;

			const listeners = this._listeners;
			const listenerArray = listeners[ event.type ];

			if ( listenerArray !== undefined ) {
				event.target = this;
				// Make a copy, in case listeners are removed while iterating.
				const array = listenerArray.slice( 0 );
				for ( let i = 0, l = array.length; i < l; i ++ ) {
					array[ i ].call( this, event );
				}
			}
		}
	} );

	const _lut = [];

	for ( let i = 0; i < 256; i ++ ) {
		_lut[ i ] = ( i < 16 ? '0' : '' ) + ( i ).toString( 16 );
	}

	let _seed = 1234567;

	const MathUtils = {

		DEG2RAD: Math.PI / 180,
		RAD2DEG: 180 / Math.PI,

		generateUUID: function () {

			// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136

			const d0 = Math.random() * 0xffffffff | 0;
			const d1 = Math.random() * 0xffffffff | 0;
			const d2 = Math.random() * 0xffffffff | 0;
			const d3 = Math.random() * 0xffffffff | 0;
			const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] + '-' +
				_lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + '-' + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] + '-' +
				_lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + '-' + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
				_lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];

			// .toUpperCase() here flattens concatenated strings to save heap memory space.
			return uuid.toUpperCase();

		},

		clamp: function ( value, min, max ) {return Math.max( min, Math.min( max, value ) );},

		euclideanModulo: function ( n, m ) {return ( ( n % m ) + m ) % m;},

		lerp: function ( x, y, t ) {return ( 1 - t ) * x + t * y;},

		radToDeg: function ( radians ) {return radians * MathUtils.RAD2DEG;},

		isPowerOfTwo: function ( value ) {return ( value & ( value - 1 ) ) === 0 && value !== 0;},

		ceilPowerOfTwo: function ( value ) {return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );},

		floorPowerOfTwo: function ( value ) {return Math.pow( 2, Math.floor( Math.log( value ) / Math.LN2 ) );}

	};

	class Vector2 {

		constructor( x = 0, y = 0 ) {
			Object.defineProperty( this, 'isVector2', { value: true } );
			this.x = x;
			this.y = y;
		}

		set( x, y ) {
			this.x = x;
			this.y = y;
			return this;
		}

		clone() {return new this.constructor( this.x, this.y );}

		copy(v) {this.x = v.x;this.y = v.y;return this;}

		addScalar( s ) {
			this.x += s;
			this.y += s;
			return this;
		}

		sub( v, w ) {
			if ( w !== undefined ) {
				console.warn( 'THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
				return this.subVectors( v, w );
			}

			this.x -= v.x;
			this.y -= v.y;
			return this;
		}

		subVectors( a, b ) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			return this;
		}

		multiply( v ) {
			this.x *= v.x;
			this.y *= v.y;
			return this;
		}

		multiplyScalar( scalar ) {
			this.x *= scalar;
			this.y *= scalar;
			return this;
		}

		applyMatrix3( m ) {
			const x = this.x, y = this.y;
			const e = m.elements;
			this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ];
			this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ];
			return this;
		}

		clamp( min, max ) {
			this.x = Math.max( min.x, Math.min( max.x, this.x ) );
			this.y = Math.max( min.y, Math.min( max.y, this.y ) );
			return this;
		}

		length() {return Math.sqrt( this.x * this.x + this.y * this.y );}

		fromArray( array, offset ) {
			if ( offset === undefined ) offset = 0;
			this.x = array[ offset ];
			this.y = array[ offset + 1 ];
			return this;
		}

		fromBufferAttribute( attribute, index, offset ) {
			if ( offset !== undefined ) {
				console.warn( 'THREE.Vector2: offset has been removed from .fromBufferAttribute().' );
			}

			this.x = attribute.getX( index );
			this.y = attribute.getY( index );
			return this;
		}
	}

	class Matrix3 {

		constructor() {
			Object.defineProperty( this, 'isMatrix3', { value: true } );
			this.elements = [1, 0, 0,0, 1, 0,0, 0, 1];

			if ( arguments.length > 0 ) {console.error( 'THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.' );}
		}

		clone() {return new this.constructor().fromArray( this.elements );}

		copy( m ) {
			const te = this.elements;
			const me = m.elements;

			te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
			te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
			te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];
			return this;
		}

		set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {
			const te = this.elements;
			te[ 0 ] = n11; te[ 1 ] = n21; te[ 2 ] = n31;
			te[ 3 ] = n12; te[ 4 ] = n22; te[ 5 ] = n32;
			te[ 6 ] = n13; te[ 7 ] = n23; te[ 8 ] = n33;
			return this;
		}

		setFromMatrix4( m ) {
			const me = m.elements;
			this.set(me[ 0 ], me[ 4 ], me[ 8 ],	me[ 1 ], me[ 5 ], me[ 9 ],me[ 2 ], me[ 6 ], me[ 10 ]);
			return this;
		}

		getInverse( matrix, throwOnDegenerate ) {
			if ( throwOnDegenerate !== undefined ) {console.warn( "THREE.Matrix3: .getInverse() can no longer be configured to throw on degenerate." );}

			const me = matrix.elements,
				te = this.elements,
				n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ],
				n12 = me[ 3 ], n22 = me[ 4 ], n32 = me[ 5 ],
				n13 = me[ 6 ], n23 = me[ 7 ], n33 = me[ 8 ],
				t11 = n33 * n22 - n32 * n23,
				t12 = n32 * n13 - n33 * n12,
				t13 = n23 * n12 - n22 * n13,
				det = n11 * t11 + n21 * t12 + n31 * t13;

			if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );

			const detInv = 1 / det;

			te[ 0 ] = t11 * detInv;
			te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
			te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;
			te[ 3 ] = t12 * detInv;
			te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
			te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;
			te[ 6 ] = t13 * detInv;
			te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
			te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;
			return this;
		}

		transpose() {
			let tmp;
			const m = this.elements;
			tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
			tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
			tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;
			return this;
		}

		getNormalMatrix( matrix4 ) {return this.setFromMatrix4( matrix4 ).getInverse( this ).transpose();}

		fromArray( array, offset ) {
			if ( offset === undefined ) offset = 0;

			for ( let i = 0; i < 9; i ++ ) {
				this.elements[ i ] = array[ i + offset ];
			}
			return this;
		}
	}

	let _canvas;


	let textureId = 0;

	function Texture( image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding ) {
		Object.defineProperty( this, 'id', { value: textureId ++ } );
		this.uuid = MathUtils.generateUUID();
		this.name = '';
		this.image = image !== undefined ? image : Texture.DEFAULT_IMAGE;
		this.mipmaps = [];
		this.mapping = mapping !== undefined ? mapping : Texture.DEFAULT_MAPPING;
		this.wrapS = wrapS !== undefined ? wrapS : ClampToEdgeWrapping;
		this.wrapT = wrapT !== undefined ? wrapT : ClampToEdgeWrapping;
		this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;
		this.minFilter = minFilter !== undefined ? minFilter : LinearMipmapLinearFilter;
		this.anisotropy = anisotropy !== undefined ? anisotropy : 1;
		this.format = format !== undefined ? format : RGBAFormat;
		this.internalFormat = null;
		this.type = type !== undefined ? type : UnsignedByteType;
		this.offset = new Vector2( 0, 0 );
		this.repeat = new Vector2( 1, 1 );
		this.center = new Vector2( 0, 0 );
		this.rotation = 0;
		this.matrixAutoUpdate = true;
		this.matrix = new Matrix3();
		this.generateMipmaps = true;
		this.premultiplyAlpha = false;
		this.flipY = true;
		this.unpackAlignment = 4;	// valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

		// Values of encoding !== THREE.LinearEncoding only supported on map, envMap and emissiveMap.
		//
		// Also changing the encoding after already used by a Material will not automatically make the Material
		// update. You need to explicitly call Material.needsUpdate to trigger it to recompile.
		this.encoding = encoding !== undefined ? encoding : LinearEncoding;
		this.version = 0;
		this.onUpdate = null;
	}

	Texture.DEFAULT_IMAGE = undefined;
	Texture.DEFAULT_MAPPING = UVMapping;

	Texture.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {
		constructor: Texture,
		isTexture: true,

		clone: function () {
			return new this.constructor().copy( this );
		},

		copy: function ( source ) {
			this.name = source.name;
			this.image = source.image;
			this.mipmaps = source.mipmaps.slice( 0 );
			this.mapping = source.mapping;
			this.wrapS = source.wrapS;
			this.wrapT = source.wrapT;
			this.magFilter = source.magFilter;
			this.minFilter = source.minFilter;
			this.anisotropy = source.anisotropy;
			this.format = source.format;
			this.internalFormat = source.internalFormat;
			this.type = source.type;
			this.offset.copy( source.offset );
			this.repeat.copy( source.repeat );
			this.center.copy( source.center );
			this.rotation = source.rotation;
			this.matrixAutoUpdate = source.matrixAutoUpdate;
			this.matrix.copy( source.matrix );
			this.generateMipmaps = source.generateMipmaps;
			this.premultiplyAlpha = source.premultiplyAlpha;
			this.flipY = source.flipY;
			this.unpackAlignment = source.unpackAlignment;
			this.encoding = source.encoding;
			return this;
		}

	} );

	Object.defineProperty( Texture.prototype, "needsUpdate", {

		set: function ( value ) {

			if ( value === true ) this.version ++;

		}

	} );

	class Vector4 {

		constructor( x = 0, y = 0, z = 0, w = 1 ) {
			Object.defineProperty( this, 'isVector4', { value: true } );
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}

		set( x, y, z, w ) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		}

		getComponent( index ) {

			switch ( index ) {
				case 0: return this.x;
				case 1: return this.y;
				case 2: return this.z;
				case 3: return this.w;
				default: throw new Error( 'index is out of range: ' + index );
			}
		}

		clone() {return new this.constructor( this.x, this.y, this.z, this.w );}

		copy( v ) {
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			this.w = ( v.w !== undefined ) ? v.w : 1;
			return this;
		}

		subVectors( a, b ) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			this.w = a.w - b.w;
			return this;
		}

		multiplyScalar( scalar ) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			this.w *= scalar;
			return this;
		}

		applyMatrix4( m ) {
			const x = this.x, y = this.y, z = this.z, w = this.w;
			const e = m.elements;
			this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] * w;
			this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] * w;
			this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] * w;
			this.w = e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] * w;
			return this;
		}

		divideScalar( scalar ) {return this.multiplyScalar( 1 / scalar );}

		floor() {
			this.x = Math.floor( this.x );
			this.y = Math.floor( this.y );
			this.z = Math.floor( this.z );
			this.w = Math.floor( this.w );
			return this;
		}

		manhattanLength() {return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z ) + Math.abs( this.w );}

		equals( v ) {return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) && ( v.w === this.w ) );}

		fromArray( array, offset ) {
			if ( offset === undefined ) offset = 0;
			this.x = array[ offset ];
			this.y = array[ offset + 1 ];
			this.z = array[ offset + 2 ];
			this.w = array[ offset + 3 ];
			return this;
		}

		fromBufferAttribute( attribute, index, offset ) {
			if ( offset !== undefined ) {console.warn( 'THREE.Vector4: offset has been removed from .fromBufferAttribute().' );}

			this.x = attribute.getX( index );
			this.y = attribute.getY( index );
			this.z = attribute.getZ( index );
			this.w = attribute.getW( index );
			return this;
		}

	}

	/*
	 In options, we can specify:
	 * Texture parameters for an auto-generated target texture
	 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
	*/
	function WebGLRenderTarget( width, height, options ) {

		this.width = width;
		this.height = height;
		this.scissor = new Vector4( 0, 0, width, height );
		this.scissorTest = false;
		this.viewport = new Vector4( 0, 0, width, height );
		options = options || {};
		this.texture = new Texture( undefined, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.encoding );
		this.texture.image = {};
		this.texture.image.width = width;
		this.texture.image.height = height;
		this.texture.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : false;
		this.texture.minFilter = options.minFilter !== undefined ? options.minFilter : LinearFilter;
		this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
		this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : false;
		this.depthTexture = options.depthTexture !== undefined ? options.depthTexture : null;

	}

	WebGLRenderTarget.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {
		constructor: WebGLRenderTarget,
		isWebGLRenderTarget: true,

		clone: function () {return new this.constructor().copy( this );},

		copy: function ( source ) {
			this.width = source.width;
			this.height = source.height;
			this.viewport.copy( source.viewport );
			this.texture = source.texture.clone();
			this.depthBuffer = source.depthBuffer;
			this.stencilBuffer = source.stencilBuffer;
			this.depthTexture = source.depthTexture;
			return this;
		}
	} );


	class Quaternion {
		constructor( x = 0, y = 0, z = 0, w = 1 ) {
			Object.defineProperty( this, 'isQuaternion', { value: true } );
			this._x = x;
			this._y = y;
			this._z = z;
			this._w = w;
		}

		static slerpFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t ) {
			// fuzz-free, array-based Quaternion SLERP operation
			let x0 = src0[ srcOffset0 + 0 ],
				y0 = src0[ srcOffset0 + 1 ],
				z0 = src0[ srcOffset0 + 2 ],
				w0 = src0[ srcOffset0 + 3 ];

			const x1 = src1[ srcOffset1 + 0 ],
				y1 = src1[ srcOffset1 + 1 ],
				z1 = src1[ srcOffset1 + 2 ],
				w1 = src1[ srcOffset1 + 3 ];

			if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {
				let s = 1 - t;
				const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
					dir = ( cos >= 0 ? 1 : - 1 ),
					sqrSin = 1 - cos * cos;

				// Skip the Slerp for tiny steps to avoid numeric problems:
				if ( sqrSin > Number.EPSILON ) {
					const sin = Math.sqrt( sqrSin ),len = Math.atan2( sin, cos * dir );
					s = Math.sin( s * len ) / sin;
					t = Math.sin( t * len ) / sin;

				}

				const tDir = t * dir;
				x0 = x0 * s + x1 * tDir;
				y0 = y0 * s + y1 * tDir;
				z0 = z0 * s + z1 * tDir;
				w0 = w0 * s + w1 * tDir;

				// Normalize in case we just did a lerp:
				if ( s === 1 - t ) {
					const f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );
					x0 *= f;
					y0 *= f;
					z0 *= f;
					w0 *= f;
				}
			}

			dst[ dstOffset ] = x0;
			dst[ dstOffset + 1 ] = y0;
			dst[ dstOffset + 2 ] = z0;
			dst[ dstOffset + 3 ] = w0;
		}

		static multiplyQuaternionsFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1 ) {
			const x0 = src0[ srcOffset0 ];
			const y0 = src0[ srcOffset0 + 1 ];
			const z0 = src0[ srcOffset0 + 2 ];
			const w0 = src0[ srcOffset0 + 3 ];

			const x1 = src1[ srcOffset1 ];
			const y1 = src1[ srcOffset1 + 1 ];
			const z1 = src1[ srcOffset1 + 2 ];
			const w1 = src1[ srcOffset1 + 3 ];

			dst[ dstOffset ] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
			dst[ dstOffset + 1 ] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
			dst[ dstOffset + 2 ] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
			dst[ dstOffset + 3 ] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

			return dst;
		}

		set( x, y, z, w ) {

			this._x = x;
			this._y = y;
			this._z = z;
			this._w = w;

			this._onChangeCallback();

			return this;

		}

		clone() {return new this.constructor( this._x, this._y, this._z, this._w );}

		copy( quaternion ) {
			this._x = quaternion.x;
			this._y = quaternion.y;
			this._z = quaternion.z;
			this._w = quaternion.w;
			this._onChangeCallback();
			return this;
		}

		setFromEuler( euler, update ) {
			if ( ! ( euler && euler.isEuler ) ) {throw new Error( 'THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.' );	}

			const x = euler._x, y = euler._y, z = euler._z, order = euler._order;

			// http://www.mathworks.com/matlabcentral/fileexchange/
			// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
			//	content/SpinCalc.m

			const cos = Math.cos;
			const sin = Math.sin;
			const c1 = cos( x / 2 );
			const c2 = cos( y / 2 );
			const c3 = cos( z / 2 );
			const s1 = sin( x / 2 );
			const s2 = sin( y / 2 );
			const s3 = sin( z / 2 );

			switch ( order ) {
				case 'XYZ':
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;
					break;

				case 'YXZ':
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
					break;

				case 'ZXY':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;
					break;

				case 'ZYX':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
					break;

				case 'YZX':
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;
					break;

				case 'XZY':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
					break;

				default:console.warn( 'THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order );
			}

			if ( update !== false ) this._onChangeCallback();
			return this;
		}

		setFromAxisAngle( axis, angle ) {
			// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

			// assumes axis is normalized
			const halfAngle = angle / 2, s = Math.sin( halfAngle );

			this._x = axis.x * s;
			this._y = axis.y * s;
			this._z = axis.z * s;
			this._w = Math.cos( halfAngle );

			this._onChangeCallback();
			return this;
		}

		setFromRotationMatrix( m ) {

			// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

			// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

			const te = m.elements,

				m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
				m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
				m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

				trace = m11 + m22 + m33;

			if ( trace > 0 ) {

				const s = 0.5 / Math.sqrt( trace + 1.0 );

				this._w = 0.25 / s;
				this._x = ( m32 - m23 ) * s;
				this._y = ( m13 - m31 ) * s;
				this._z = ( m21 - m12 ) * s;

			} else if ( m11 > m22 && m11 > m33 ) {

				const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

				this._w = ( m32 - m23 ) / s;
				this._x = 0.25 * s;
				this._y = ( m12 + m21 ) / s;
				this._z = ( m13 + m31 ) / s;

			} else if ( m22 > m33 ) {

				const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

				this._w = ( m13 - m31 ) / s;
				this._x = ( m12 + m21 ) / s;
				this._y = 0.25 * s;
				this._z = ( m23 + m32 ) / s;

			} else {

				const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

				this._w = ( m21 - m12 ) / s;
				this._x = ( m13 + m31 ) / s;
				this._y = ( m23 + m32 ) / s;
				this._z = 0.25 * s;

			}

			this._onChangeCallback();

			return this;

		}

		inverse() {return this.conjugate();}

		conjugate() {
			this._x *= - 1;
			this._y *= - 1;
			this._z *= - 1;
			this._onChangeCallback();
			return this;
		}

		length() {return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );}

		normalize() {
			let l = this.length();
			if ( l === 0 ) {
				this._x = 0;
				this._y = 0;
				this._z = 0;
				this._w = 1;
			} else {
				l = 1 / l;
				this._x = this._x * l;
				this._y = this._y * l;
				this._z = this._z * l;
				this._w = this._w * l;
			}

			this._onChangeCallback();
			return this;
		}

		fromArray( array, offset ) {

			if ( offset === undefined ) offset = 0;

			this._x = array[ offset ];
			this._y = array[ offset + 1 ];
			this._z = array[ offset + 2 ];
			this._w = array[ offset + 3 ];

			this._onChangeCallback();

			return this;

		}

		toArray( array, offset ) {

			if ( array === undefined ) array = [];
			if ( offset === undefined ) offset = 0;

			array[ offset ] = this._x;
			array[ offset + 1 ] = this._y;
			array[ offset + 2 ] = this._z;
			array[ offset + 3 ] = this._w;

			return array;

		}

		_onChange( callback ) {

			this._onChangeCallback = callback;

			return this;

		}

	}

	class Vector3 {

		constructor( x = 0, y = 0, z = 0 ) {
			Object.defineProperty( this, 'isVector3', { value: true } );
			this.x = x;
			this.y = y;
			this.z = z;
		}

		set( x, y, z ) {
			if ( z === undefined ) z = this.z; // sprite.scale.set(x,y)
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		setX( x ) {this.x = x;return this;}

		setY( y ) {this.y = y;return this;}

		setZ( z ) {this.z = z;return this;}

		clone() {return new this.constructor( this.x, this.y, this.z );}

		copy( v ) {
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			return this;
		}

		add( v, w ) {
			if ( w !== undefined ) {
				console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
				return this.addVectors( v, w );
			}

			this.x += v.x;
			this.y += v.y;
			this.z += v.z;
			return this;
		}


		addVectors( a, b ) {
			this.x = a.x + b.x;
			this.y = a.y + b.y;
			this.z = a.z + b.z;
			return this;
		}

		addScaledVector( v, s ) {
			this.x += v.x * s;
			this.y += v.y * s;
			this.z += v.z * s;
			return this;
		}

		sub( v, w ) {
			if ( w !== undefined ) {
				console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
				return this.subVectors( v, w );
			}

			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;
			return this;
		}

		subVectors( a, b ) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			return this;
		}

		multiplyScalar( scalar ) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			return this;
		}

		applyMatrix3( m ) {
			const x = this.x, y = this.y, z = this.z;
			const e = m.elements;

			this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
			this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
			this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;
			return this;
		}

		applyNormalMatrix( m ) {return this.applyMatrix3( m ).normalize();}

		applyMatrix4( m ) {
			const x = this.x, y = this.y, z = this.z;
			const e = m.elements;

			const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );
			this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
			this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
			this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;
			return this;
		}

		applyQuaternion( q ) {
			const x = this.x, y = this.y, z = this.z;
			const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

			const ix = qw * x + qy * z - qz * y;
			const iy = qw * y + qz * x - qx * z;
			const iz = qw * z + qx * y - qy * x;
			const iw = - qx * x - qy * y - qz * z;

			this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
			this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
			this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;
			return this;

		}

		unproject( camera ) {return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );	}

		transformDirection( m ) {
			const x = this.x, y = this.y, z = this.z;
			const e = m.elements;

			this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
			this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
			this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;
			return this.normalize();
		}

		divideScalar( scalar ) {return this.multiplyScalar( 1 / scalar );}


		min( v ) {
			this.x = Math.min( this.x, v.x );
			this.y = Math.min( this.y, v.y );
			this.z = Math.min( this.z, v.z );
			return this;
		}

		max( v ) {
			this.x = Math.max( this.x, v.x );
			this.y = Math.max( this.y, v.y );
			this.z = Math.max( this.z, v.z );
			return this;
		}

		clamp( min, max ) {
			this.x = Math.max( min.x, Math.min( max.x, this.x ) );
			this.y = Math.max( min.y, Math.min( max.y, this.y ) );
			this.z = Math.max( min.z, Math.min( max.z, this.z ) );
			return this;
		}

		dot( v ) {return this.x * v.x + this.y * v.y + this.z * v.z;}

		// TODO lengthSquared?

		lengthSq() {return this.x * this.x + this.y * this.y + this.z * this.z;}

		length() {return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );}

		normalize() {return this.divideScalar( this.length() || 1 );}


		lerp( v, alpha ) {
			this.x += ( v.x - this.x ) * alpha;
			this.y += ( v.y - this.y ) * alpha;
			this.z += ( v.z - this.z ) * alpha;
			return this;
		}


		cross( v, w ) {
			if ( w !== undefined ) {
				console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
				return this.crossVectors( v, w );
			}

			return this.crossVectors( this, v );
		}

		crossVectors( a, b ) {
			const ax = a.x, ay = a.y, az = a.z;
			const bx = b.x, by = b.y, bz = b.z;
			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;
			return this;

		}


		distanceTo( v ) {return Math.sqrt( this.distanceToSquared( v ) );}

		distanceToSquared( v ) {
			const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
			return dx * dx + dy * dy + dz * dz;
		}

		setFromMatrixPosition( m ) {
			const e = m.elements;
			this.x = e[ 12 ];
			this.y = e[ 13 ];
			this.z = e[ 14 ];
			return this;
		}

		setFromMatrixScale( m ) {
			const sx = this.setFromMatrixColumn( m, 0 ).length();
			const sy = this.setFromMatrixColumn( m, 1 ).length();
			const sz = this.setFromMatrixColumn( m, 2 ).length();

			this.x = sx;
			this.y = sy;
			this.z = sz;
			return this;
		}

		setFromMatrixColumn( m, index ) {return this.fromArray( m.elements, index * 4 );}


		equals( v ) {return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );}

		fromArray( array, offset ) {
			if ( offset === undefined ) offset = 0;

			this.x = array[ offset ];
			this.y = array[ offset + 1 ];
			this.z = array[ offset + 2 ];
			return this;
		}

		toArray( array, offset ) {
			if ( array === undefined ) array = [];
			if ( offset === undefined ) offset = 0;

			array[ offset ] = this.x;
			array[ offset + 1 ] = this.y;
			array[ offset + 2 ] = this.z;
			return array;

		}

		fromBufferAttribute( attribute, index, offset ) {
			if ( offset !== undefined ) {
				console.warn( 'THREE.Vector3: offset has been removed from .fromBufferAttribute().' );
			}

			this.x = attribute.getX( index );
			this.y = attribute.getY( index );
			this.z = attribute.getZ( index );
			return this;

		}
	}

	const _vector = new Vector3();
	const _quaternion = new Quaternion();

	class Box3 {

		constructor( min, max ) {

			Object.defineProperty( this, 'isBox3', { value: true } );

			this.min = ( min !== undefined ) ? min : new Vector3( + Infinity, + Infinity, + Infinity );
			this.max = ( max !== undefined ) ? max : new Vector3( - Infinity, - Infinity, - Infinity );

		}

		set( min, max ) {

			this.min.copy( min );
			this.max.copy( max );

			return this;

		}

		setFromBufferAttribute( attribute ) {

			let minX = + Infinity;
			let minY = + Infinity;
			let minZ = + Infinity;

			let maxX = - Infinity;
			let maxY = - Infinity;
			let maxZ = - Infinity;

			for ( let i = 0, l = attribute.count; i < l; i ++ ) {

				const x = attribute.getX( i );
				const y = attribute.getY( i );
				const z = attribute.getZ( i );

				if ( x < minX ) minX = x;
				if ( y < minY ) minY = y;
				if ( z < minZ ) minZ = z;

				if ( x > maxX ) maxX = x;
				if ( y > maxY ) maxY = y;
				if ( z > maxZ ) maxZ = z;

			}

			this.min.set( minX, minY, minZ );
			this.max.set( maxX, maxY, maxZ );

			return this;

		}

		setFromPoints( points ) {
			this.makeEmpty();
			for ( let i = 0, il = points.length; i < il; i ++ ) {
				this.expandByPoint( points[ i ] );
			}
			return this;

		}


		setFromObject( object ) {
			this.makeEmpty();
			return this.expandByObject( object );
		}

		clone() {return new this.constructor().copy( this );}

		copy( box ) {
			this.min.copy( box.min );
			this.max.copy( box.max );
			return this;
		}

		makeEmpty() {
			this.min.x = this.min.y = this.min.z = + Infinity;
			this.max.x = this.max.y = this.max.z = - Infinity;
			return this;
		}

		isEmpty() {
			// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
			return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y ) || ( this.max.z < this.min.z );
		}

		getCenter( target ) {
			if ( target === undefined ) {
				console.warn( 'THREE.Box3: .getCenter() target is now required' );
				target = new Vector3();
			}
			return this.isEmpty() ? target.set( 0, 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );
		}

		getSize( target ) {
			if ( target === undefined ) {
				console.warn( 'THREE.Box3: .getSize() target is now required' );
				target = new Vector3();
			}
			return this.isEmpty() ? target.set( 0, 0, 0 ) : target.subVectors( this.max, this.min );

		}

		expandByPoint( point ) {
			this.min.min( point );
			this.max.max( point );
			return this;
		}

		expandByVector( vector ) {
			this.min.sub( vector );
			this.max.add( vector );
			return this;
		}

		expandByObject( object ) {
			// Computes the world-axis-aligned bounding box of an object (including its children),
			// accounting for both the object's, and children's, world transforms
			object.updateWorldMatrix( false, false );

			const geometry = object.geometry;

			if ( geometry !== undefined ) {
				if ( geometry.boundingBox === null ) {
					geometry.computeBoundingBox();
				}

				_box.copy( geometry.boundingBox );
				_box.applyMatrix4( object.matrixWorld );
				this.union( _box );
			}

			const children = object.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {
				this.expandByObject( children[ i ] );
			}
			return this;

		}


		intersectsBox( box ) {
			// using 6 splitting planes to rule out intersections.
			return box.max.x < this.min.x || box.min.x > this.max.x ||
				box.max.y < this.min.y || box.min.y > this.max.y ||
				box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
		}
		intersectsSphere( sphere ) {

			// Find the point on the AABB closest to the sphere center.
			this.clampPoint( sphere.center, _vector$1 );

			// If that point is inside the sphere, the AABB and sphere intersect.
			return _vector$1.distanceToSquared( sphere.center ) <= ( sphere.radius * sphere.radius );

		}

		distanceToPoint( point ) {
			const clampedPoint = _vector$1.copy( point ).clamp( this.min, this.max );
			return clampedPoint.sub( point ).length();
		}

		union( box ) {
			this.min.min( box.min );
			this.max.max( box.max );
			return this;
		}

		applyMatrix4( matrix ) {
			// transform of empty box is an empty box.
			if ( this.isEmpty() ) return this;

			// NOTE: I am using a binary pattern to specify all 2^3 combinations below
			_points[ 0 ].set( this.min.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 000
			_points[ 1 ].set( this.min.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 001
			_points[ 2 ].set( this.min.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 010
			_points[ 3 ].set( this.min.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 011
			_points[ 4 ].set( this.max.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 100
			_points[ 5 ].set( this.max.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 101
			_points[ 6 ].set( this.max.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 110
			_points[ 7 ].set( this.max.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 111

			this.setFromPoints( _points );
			return this;
		}
	}

	const _points = [
		new Vector3(),
		new Vector3(),
		new Vector3(),
		new Vector3(),
		new Vector3(),
		new Vector3(),
		new Vector3(),
		new Vector3()
	];

	const _vector$1 = new Vector3();

	const _box = new Box3();

	// triangle centered vertices

	const _v0 = new Vector3();
	const _v1 = new Vector3();
	const _v2 = new Vector3();

	// triangle edge vectors

	const _f0 = new Vector3();
	const _f1 = new Vector3();
	const _f2 = new Vector3();

	const _center = new Vector3();
	const _extents = new Vector3();
	const _triangleNormal = new Vector3();
	const _testAxis = new Vector3();

	const _box$1 = new Box3();

	class Sphere {

		constructor( center, radius ) {
			this.center = ( center !== undefined ) ? center : new Vector3();
			this.radius = ( radius !== undefined ) ? radius : - 1;
		}

		set( center, radius ) {
			this.center.copy( center );
			this.radius = radius;
			return this;
		}

		setFromPoints( points, optionalCenter ) {
			const center = this.center;

			if ( optionalCenter !== undefined ) {
				center.copy( optionalCenter );
			} else {
				_box$1.setFromPoints( points ).getCenter( center );
			}

			let maxRadiusSq = 0;

			for ( let i = 0, il = points.length; i < il; i ++ ) {
				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( points[ i ] ) );
			}

			this.radius = Math.sqrt( maxRadiusSq );

			return this;

		}

		intersectsSphere( sphere ) {

			const radiusSum = this.radius + sphere.radius;

			return sphere.center.distanceToSquared( this.center ) <= ( radiusSum * radiusSum );

		}

		intersectsBox( box ) {

			return box.intersectsSphere( this );

		}

		clone() {return new this.constructor().copy( this );}

		copy( sphere ) {
			this.center.copy( sphere.center );
			this.radius = sphere.radius;
			return this;
		}

		isEmpty() {return ( this.radius < 0 );}

		applyMatrix4( matrix ) {
			this.center.applyMatrix4( matrix );
			this.radius = this.radius * matrix.getMaxScaleOnAxis();
			return this;
		}
	}

	const _vector$2 = new Vector3();
	const _segCenter = new Vector3();
	const _segDir = new Vector3();
	const _diff = new Vector3();

	const _edge1 = new Vector3();
	const _edge2 = new Vector3();
	const _normal = new Vector3();

	class Ray {

		constructor( origin, direction ) {
			this.origin = ( origin !== undefined ) ? origin : new Vector3();
			this.direction = ( direction !== undefined ) ? direction : new Vector3( 0, 0, - 1 );
		}

		clone() {return new this.constructor().copy( this );}

		copy( ray ) {
			this.origin.copy( ray.origin );
			this.direction.copy( ray.direction );
			return this;
		}

		at( t, target ) {
			if ( target === undefined ) {
				console.warn( 'THREE.Ray: .at() target is now required' );
				target = new Vector3();
			}
			return target.copy( this.direction ).multiplyScalar( t ).add( this.origin );
		}

		closestPointToPoint( point, target ) {

			if ( target === undefined ) {
				console.warn( 'THREE.Ray: .closestPointToPoint() target is now required' );
				target = new Vector3();
			}

			target.subVectors( point, this.origin );

			const directionDistance = target.dot( this.direction );

			if ( directionDistance < 0 ) {
				return target.copy( this.origin );
			}
			return target.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );
		}
		intersectsSphere( sphere ) {

			return this.distanceSqToPoint( sphere.center ) <= ( sphere.radius * sphere.radius );

		}
		distanceToPoint( point ) {
			return Math.sqrt( this.distanceSqToPoint( point ) );
		}

		distanceSqToPoint( point ) {
			const directionDistance = _vector$2.subVectors( point, this.origin ).dot( this.direction );
			// point behind the ray

			if ( directionDistance < 0 ) {
				return this.origin.distanceToSquared( point );
			}

			_vector$2.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );
			return _vector$2.distanceToSquared( point );
		}

		distanceSqToSegment( v0, v1, optionalPointOnRay, optionalPointOnSegment ) {

			// from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteDistRaySegment.h
			// It returns the min distance between the ray and the segment
			// defined by v0 and v1
			// It can also set two optional targets :
			// - The closest point on the ray
			// - The closest point on the segment

			_segCenter.copy( v0 ).add( v1 ).multiplyScalar( 0.5 );
			_segDir.copy( v1 ).sub( v0 ).normalize();
			_diff.copy( this.origin ).sub( _segCenter );

			const segExtent = v0.distanceTo( v1 ) * 0.5;
			const a01 = - this.direction.dot( _segDir );
			const b0 = _diff.dot( this.direction );
			const b1 = - _diff.dot( _segDir );
			const c = _diff.lengthSq();
			const det = Math.abs( 1 - a01 * a01 );
			let s0, s1, sqrDist, extDet;

			if ( det > 0 ) {

				// The ray and segment are not parallel.

				s0 = a01 * b1 - b0;
				s1 = a01 * b0 - b1;
				extDet = segExtent * det;

				if ( s0 >= 0 ) {

					if ( s1 >= - extDet ) {

						if ( s1 <= extDet ) {

							// region 0
							// Minimum at interior points of ray and segment.

							const invDet = 1 / det;
							s0 *= invDet;
							s1 *= invDet;
							sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

						} else {
							// region 1
							s1 = segExtent;
							s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
							sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;
						}
					} else {
						// region 5
						s1 = - segExtent;
						s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
						sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;
					}
				} else {
					if ( s1 <= - extDet ) {
						// region 4
						s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
						s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
						sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;
					} else if ( s1 <= extDet ) {
						// region 3
						s0 = 0;
						s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
						sqrDist = s1 * ( s1 + 2 * b1 ) + c;
					} else {
						// region 2
						s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
						s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
						sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;
					}
				}

			} else {
				// Ray and segment are parallel.
				s1 = ( a01 > 0 ) ? - segExtent : segExtent;
				s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
				sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

			}

			if ( optionalPointOnRay ) {optionalPointOnRay.copy( this.direction ).multiplyScalar( s0 ).add( this.origin );}

			if ( optionalPointOnSegment ) {optionalPointOnSegment.copy( _segDir ).multiplyScalar( s1 ).add( _segCenter );}

			return sqrDist;

		}

		intersectBox( box, target ) {
			let tmin, tmax, tymin, tymax, tzmin, tzmax;
			const invdirx = 1 / this.direction.x,
				invdiry = 1 / this.direction.y,
				invdirz = 1 / this.direction.z;
			const origin = this.origin;

			if ( invdirx >= 0 ) {
				tmin = ( box.min.x - origin.x ) * invdirx;
				tmax = ( box.max.x - origin.x ) * invdirx;
			} else {
				tmin = ( box.max.x - origin.x ) * invdirx;
				tmax = ( box.min.x - origin.x ) * invdirx;
			}

			if ( invdiry >= 0 ) {
				tymin = ( box.min.y - origin.y ) * invdiry;
				tymax = ( box.max.y - origin.y ) * invdiry;
			} else {
				tymin = ( box.max.y - origin.y ) * invdiry;
				tymax = ( box.min.y - origin.y ) * invdiry;
			}

			if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

			// These lines also handle the case where tmin or tmax is NaN
			// (result of 0 * Infinity). x !== x returns true if x is NaN

			if ( tymin > tmin || tmin !== tmin ) tmin = tymin;

			if ( tymax < tmax || tmax !== tmax ) tmax = tymax;

			if ( invdirz >= 0 ) {
				tzmin = ( box.min.z - origin.z ) * invdirz;
				tzmax = ( box.max.z - origin.z ) * invdirz;
			} else {
				tzmin = ( box.max.z - origin.z ) * invdirz;
				tzmax = ( box.min.z - origin.z ) * invdirz;
			}

			if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

			if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

			if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

			//return point closest to the ray (positive side)

			if ( tmax < 0 ) return null;

			return this.at( tmin >= 0 ? tmin : tmax, target );
		}

		intersectsBox( box ) {return this.intersectBox( box, _vector$2 ) !== null;}

		intersectTriangle( a, b, c, backfaceCulling, target ) {

			// Compute the offset origin, edges, and normal.

			// from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

			_edge1.subVectors( b, a );
			_edge2.subVectors( c, a );
			_normal.crossVectors( _edge1, _edge2 );

			// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
			// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
			//   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
			//   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
			//   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
			let DdN = this.direction.dot( _normal );
			let sign;

			if ( DdN > 0 ) {

				if ( backfaceCulling ) return null;
				sign = 1;

			} else if ( DdN < 0 ) {

				sign = - 1;
				DdN = - DdN;

			} else {

				return null;

			}

			_diff.subVectors( this.origin, a );
			const DdQxE2 = sign * this.direction.dot( _edge2.crossVectors( _diff, _edge2 ) );

			// b1 < 0, no intersection
			if ( DdQxE2 < 0 ) {

				return null;

			}

			const DdE1xQ = sign * this.direction.dot( _edge1.cross( _diff ) );

			// b2 < 0, no intersection
			if ( DdE1xQ < 0 ) {

				return null;

			}

			// b1+b2 > 1, no intersection
			if ( DdQxE2 + DdE1xQ > DdN ) {

				return null;

			}

			// Line intersects triangle, check if ray does.
			const QdN = - sign * _diff.dot( _normal );

			// t < 0, no intersection
			if ( QdN < 0 ) {

				return null;

			}

			// Ray intersects triangle.
			return this.at( QdN / DdN, target );

		}

		applyMatrix4( matrix4 ) {
			this.origin.applyMatrix4( matrix4 );
			this.direction.transformDirection( matrix4 );
			return this;
		}

	}

	class Matrix4 {

		constructor() {
			Object.defineProperty( this, 'isMatrix4', { value: true } );

			this.elements = [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			];

			if ( arguments.length > 0 ) {console.error( 'THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.' );}

		}

		set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {
			const te = this.elements;

			te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
			te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
			te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
			te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;
			return this;
		}

		identity() {
			this.set(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			);
			return this;
		}

		clone() {return new Matrix4().fromArray( this.elements );}

		copy( m ) {
			const te = this.elements;
			const me = m.elements;

			te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ]; te[ 3 ] = me[ 3 ];
			te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ]; te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ];
			te[ 8 ] = me[ 8 ]; te[ 9 ] = me[ 9 ]; te[ 10 ] = me[ 10 ]; te[ 11 ] = me[ 11 ];
			te[ 12 ] = me[ 12 ]; te[ 13 ] = me[ 13 ]; te[ 14 ] = me[ 14 ]; te[ 15 ] = me[ 15 ];

			return this;
		}

		extractRotation( m ) {
			// this method does not support reflection matrices

			const te = this.elements;
			const me = m.elements;

			const scaleX = 1 / _v1$1.setFromMatrixColumn( m, 0 ).length();
			const scaleY = 1 / _v1$1.setFromMatrixColumn( m, 1 ).length();
			const scaleZ = 1 / _v1$1.setFromMatrixColumn( m, 2 ).length();

			te[ 0 ] = me[ 0 ] * scaleX;
			te[ 1 ] = me[ 1 ] * scaleX;
			te[ 2 ] = me[ 2 ] * scaleX;
			te[ 3 ] = 0;

			te[ 4 ] = me[ 4 ] * scaleY;
			te[ 5 ] = me[ 5 ] * scaleY;
			te[ 6 ] = me[ 6 ] * scaleY;
			te[ 7 ] = 0;

			te[ 8 ] = me[ 8 ] * scaleZ;
			te[ 9 ] = me[ 9 ] * scaleZ;
			te[ 10 ] = me[ 10 ] * scaleZ;
			te[ 11 ] = 0;

			te[ 12 ] = 0;
			te[ 13 ] = 0;
			te[ 14 ] = 0;
			te[ 15 ] = 1;

			return this;
		}


		makeRotationFromQuaternion( q ) {return this.compose( _zero, q, _one );}

		lookAt( eye, target, up ) {
			const te = this.elements;
			_z.subVectors( eye, target );

			if ( _z.lengthSq() === 0 ) {
				// eye and target are in the same position
				_z.z = 1;
			}

			_z.normalize();
			_x.crossVectors( up, _z );

			if ( _x.lengthSq() === 0 ) {
				// up and z are parallel
				if ( Math.abs( up.z ) === 1 ) {
					_z.x += 0.0001;
				} else {
					_z.z += 0.0001;
				}

				_z.normalize();
				_x.crossVectors( up, _z );
			}

			_x.normalize();
			_y.crossVectors( _z, _x );

			te[ 0 ] = _x.x; te[ 4 ] = _y.x; te[ 8 ] = _z.x;
			te[ 1 ] = _x.y; te[ 5 ] = _y.y; te[ 9 ] = _z.y;
			te[ 2 ] = _x.z; te[ 6 ] = _y.z; te[ 10 ] = _z.z;

			return this;
		}

		multiply( m, n ) {

			if ( n !== undefined ) {

				console.warn( 'THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.' );
				return this.multiplyMatrices( m, n );

			}

			return this.multiplyMatrices( this, m );

		}
		premultiply( m ) {return this.multiplyMatrices( m, this );}

		multiplyMatrices( a, b ) {
			const ae = a.elements;
			const be = b.elements;
			const te = this.elements;

			const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
			const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
			const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
			const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

			const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
			const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
			const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
			const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

			te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
			te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
			te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
			te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

			te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
			te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
			te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
			te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

			te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
			te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
			te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
			te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

			te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
			te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
			te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
			te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

			return this;
		}

		determinant() {
			const te = this.elements;

			const n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
			const n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
			const n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
			const n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];

			//TODO: make this more efficient
			//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

			return (
				n41 * (
					+ n14 * n23 * n32
					 - n13 * n24 * n32
					 - n14 * n22 * n33
					 + n12 * n24 * n33
					 + n13 * n22 * n34
					 - n12 * n23 * n34
				) +
				n42 * (
					+ n11 * n23 * n34
					 - n11 * n24 * n33
					 + n14 * n21 * n33
					 - n13 * n21 * n34
					 + n13 * n24 * n31
					 - n14 * n23 * n31
				) +
				n43 * (
					+ n11 * n24 * n32
					 - n11 * n22 * n34
					 - n14 * n21 * n32
					 + n12 * n21 * n34
					 + n14 * n22 * n31
					 - n12 * n24 * n31
				) +
				n44 * (
					- n13 * n22 * n31
					 - n11 * n23 * n32
					 + n11 * n22 * n33
					 + n13 * n21 * n32
					 - n12 * n21 * n33
					 + n12 * n23 * n31
				)

			);

		}

		getInverse( m, throwOnDegenerate ) {
			if ( throwOnDegenerate !== undefined ) {
				console.warn( "THREE.Matrix4: .getInverse() can no longer be configured to throw on degenerate." );
			}

			// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
			const te = this.elements,
				me = m.elements,

				n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ], n41 = me[ 3 ],
				n12 = me[ 4 ], n22 = me[ 5 ], n32 = me[ 6 ], n42 = me[ 7 ],
				n13 = me[ 8 ], n23 = me[ 9 ], n33 = me[ 10 ], n43 = me[ 11 ],
				n14 = me[ 12 ], n24 = me[ 13 ], n34 = me[ 14 ], n44 = me[ 15 ],

				t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
				t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
				t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
				t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

			const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

			if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

			const detInv = 1 / det;

			te[ 0 ] = t11 * detInv;
			te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
			te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
			te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

			te[ 4 ] = t12 * detInv;
			te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
			te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
			te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

			te[ 8 ] = t13 * detInv;
			te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
			te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
			te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

			te[ 12 ] = t14 * detInv;
			te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
			te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
			te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

			return this;

		}

		makeTranslation( x, y, z ) {
			this.set(
				1, 0, 0, x,
				0, 1, 0, y,
				0, 0, 1, z,
				0, 0, 0, 1
			);
			return this;
		}

		makeRotationX( theta ) {
			const c = Math.cos( theta ), s = Math.sin( theta );
			this.set(
				1, 0, 0, 0,
				0, c, - s, 0,
				0, s, c, 0,
				0, 0, 0, 1
			);
			return this;
		}

		makeRotationY( theta ) {
			const c = Math.cos( theta ), s = Math.sin( theta );

			this.set(
				 c, 0, s, 0,
				 0, 1, 0, 0,
				- s, 0, c, 0,
				 0, 0, 0, 1
			);
			return this;
		}

		makeRotationZ( theta ) {
			const c = Math.cos( theta ), s = Math.sin( theta );

			this.set(
				c, - s, 0, 0,
				s, c, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			);
			return this;
		}

		makeRotationAxis( axis, angle ) {
			// Based on http://www.gamedev.net/reference/articles/article1199.asp

			const c = Math.cos( angle );
			const s = Math.sin( angle );
			const t = 1 - c;
			const x = axis.x, y = axis.y, z = axis.z;
			const tx = t * x, ty = t * y;

			this.set(
				tx * x + c, tx * y - s * z, tx * z + s * y, 0,
				tx * y + s * z, ty * y + c, ty * z - s * x, 0,
				tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
				0, 0, 0, 1
			);
			return this;
		}

		makeScale( x, y, z ) {
			this.set(
				x, 0, 0, 0,
				0, y, 0, 0,
				0, 0, z, 0,
				0, 0, 0, 1
			);
			return this;
		}


		getMaxScaleOnAxis() {

			const te = this.elements;

			const scaleXSq = te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ];
			const scaleYSq = te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ];
			const scaleZSq = te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ];

			return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );

		}

		compose( position, quaternion, scale ) {
			const te = this.elements;
			const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
			const x2 = x + x,	y2 = y + y, z2 = z + z;
			const xx = x * x2, xy = x * y2, xz = x * z2;
			const yy = y * y2, yz = y * z2, zz = z * z2;
			const wx = w * x2, wy = w * y2, wz = w * z2;

			const sx = scale.x, sy = scale.y, sz = scale.z;

			te[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
			te[ 1 ] = ( xy + wz ) * sx;
			te[ 2 ] = ( xz - wy ) * sx;
			te[ 3 ] = 0;

			te[ 4 ] = ( xy - wz ) * sy;
			te[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
			te[ 6 ] = ( yz + wx ) * sy;
			te[ 7 ] = 0;

			te[ 8 ] = ( xz + wy ) * sz;
			te[ 9 ] = ( yz - wx ) * sz;
			te[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
			te[ 11 ] = 0;

			te[ 12 ] = position.x;
			te[ 13 ] = position.y;
			te[ 14 ] = position.z;
			te[ 15 ] = 1;

			return this;
		}

		decompose( position, quaternion, scale ) {
			const te = this.elements;
			let sx = _v1$1.set( te[ 0 ], te[ 1 ], te[ 2 ] ).length();
			const sy = _v1$1.set( te[ 4 ], te[ 5 ], te[ 6 ] ).length();
			const sz = _v1$1.set( te[ 8 ], te[ 9 ], te[ 10 ] ).length();

			// if determine is negative, we need to invert one scale
			const det = this.determinant();
			if ( det < 0 ) sx = - sx;

			position.x = te[ 12 ];
			position.y = te[ 13 ];
			position.z = te[ 14 ];

			// scale the rotation part
			_m1.copy( this );

			const invSX = 1 / sx;
			const invSY = 1 / sy;
			const invSZ = 1 / sz;

			_m1.elements[ 0 ] *= invSX;
			_m1.elements[ 1 ] *= invSX;
			_m1.elements[ 2 ] *= invSX;

			_m1.elements[ 4 ] *= invSY;
			_m1.elements[ 5 ] *= invSY;
			_m1.elements[ 6 ] *= invSY;

			_m1.elements[ 8 ] *= invSZ;
			_m1.elements[ 9 ] *= invSZ;
			_m1.elements[ 10 ] *= invSZ;

			quaternion.setFromRotationMatrix( _m1 );

			scale.x = sx;
			scale.y = sy;
			scale.z = sz;

			return this;
		}

		makePerspective( left, right, top, bottom, near, far ) {

			if ( far === undefined ) {

				console.warn( 'THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.' );

			}

			const te = this.elements;
			const x = 2 * near / ( right - left );
			const y = 2 * near / ( top - bottom );

			const a = ( right + left ) / ( right - left );
			const b = ( top + bottom ) / ( top - bottom );
			const c = - ( far + near ) / ( far - near );
			const d = - 2 * far * near / ( far - near );

			te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
			te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
			te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c;	te[ 14 ] = d;
			te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

			return this;
		}

		makeOrthographic( left, right, top, bottom, near, far ) {

			const te = this.elements;
			const w = 1.0 / ( right - left );
			const h = 1.0 / ( top - bottom );
			const p = 1.0 / ( far - near );

			const x = ( right + left ) * w;
			const y = ( top + bottom ) * h;
			const z = ( far + near ) * p;

			te[ 0 ] = 2 * w;	te[ 4 ] = 0;	te[ 8 ] = 0;	te[ 12 ] = - x;
			te[ 1 ] = 0;	te[ 5 ] = 2 * h;	te[ 9 ] = 0;	te[ 13 ] = - y;
			te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = - 2 * p;	te[ 14 ] = - z;
			te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = 0;	te[ 15 ] = 1;

			return this;
		}

		fromArray( array, offset ) {
			if ( offset === undefined ) offset = 0;

			for ( let i = 0; i < 16; i ++ ) {
				this.elements[ i ] = array[ i + offset ];
			}
			return this;
		}

		toArray( array, offset ) {

			if ( array === undefined ) array = [];
			if ( offset === undefined ) offset = 0;

			const te = this.elements;

			array[ offset ] = te[ 0 ];
			array[ offset + 1 ] = te[ 1 ];
			array[ offset + 2 ] = te[ 2 ];
			array[ offset + 3 ] = te[ 3 ];

			array[ offset + 4 ] = te[ 4 ];
			array[ offset + 5 ] = te[ 5 ];
			array[ offset + 6 ] = te[ 6 ];
			array[ offset + 7 ] = te[ 7 ];

			array[ offset + 8 ] = te[ 8 ];
			array[ offset + 9 ] = te[ 9 ];
			array[ offset + 10 ] = te[ 10 ];
			array[ offset + 11 ] = te[ 11 ];

			array[ offset + 12 ] = te[ 12 ];
			array[ offset + 13 ] = te[ 13 ];
			array[ offset + 14 ] = te[ 14 ];
			array[ offset + 15 ] = te[ 15 ];

			return array;
		}

	}

	const _v1$1 = new Vector3();
	const _m1 = new Matrix4();
	const _zero = new Vector3( 0, 0, 0 );
	const _one = new Vector3( 1, 1, 1 );
	const _x = new Vector3();
	const _y = new Vector3();
	const _z = new Vector3();

	class Euler {

		constructor( x = 0, y = 0, z = 0, order = Euler.DefaultOrder ) {

			Object.defineProperty( this, 'isEuler', { value: true } );

			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order;

		}

		set( x, y, z, order ) {
			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order || this._order;

			this._onChangeCallback();
			return this;

		}

		clone() {return new this.constructor( this._x, this._y, this._z, this._order );}

		copy( euler ) {
			this._x = euler._x;
			this._y = euler._y;
			this._z = euler._z;
			this._order = euler._order;
			this._onChangeCallback();
			return this;
		}

		setFromRotationMatrix( m, order, update ) {
			const clamp = MathUtils.clamp;

			// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
			const te = m.elements;
			const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
			const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
			const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

			order = order || this._order;

			switch ( order ) {
				case 'XYZ':
					this._y = Math.asin( clamp( m13, - 1, 1 ) );

					if ( Math.abs( m13 ) < 0.9999999 ) {
						this._x = Math.atan2( - m23, m33 );
						this._z = Math.atan2( - m12, m11 );
					} else {
						this._x = Math.atan2( m32, m22 );
						this._z = 0;
					}

					break;

				case 'YXZ':
					this._x = Math.asin( - clamp( m23, - 1, 1 ) );

					if ( Math.abs( m23 ) < 0.9999999 ) {
						this._y = Math.atan2( m13, m33 );
						this._z = Math.atan2( m21, m22 );
					} else {
						this._y = Math.atan2( - m31, m11 );
						this._z = 0;
					}
					break;

				case 'ZXY':
					this._x = Math.asin( clamp( m32, - 1, 1 ) );

					if ( Math.abs( m32 ) < 0.9999999 ) {
						this._y = Math.atan2( - m31, m33 );
						this._z = Math.atan2( - m12, m22 );
					} else {
						this._y = 0;
						this._z = Math.atan2( m21, m11 );
					}
					break;

				case 'ZYX':
					this._y = Math.asin( - clamp( m31, - 1, 1 ) );

					if ( Math.abs( m31 ) < 0.9999999 ) {
						this._x = Math.atan2( m32, m33 );
						this._z = Math.atan2( m21, m11 );
					} else {
						this._x = 0;
						this._z = Math.atan2( - m12, m22 );
					}
					break;

				case 'YZX':
					this._z = Math.asin( clamp( m21, - 1, 1 ) );

					if ( Math.abs( m21 ) < 0.9999999 ) {
						this._x = Math.atan2( - m23, m22 );
						this._y = Math.atan2( - m31, m11 );
					} else {
						this._x = 0;
						this._y = Math.atan2( m13, m33 );
					}
					break;

				case 'XZY':
					this._z = Math.asin( - clamp( m12, - 1, 1 ) );

					if ( Math.abs( m12 ) < 0.9999999 ) {
						this._x = Math.atan2( m32, m22 );
						this._y = Math.atan2( m13, m11 );
					} else {
						this._x = Math.atan2( - m23, m33 );
						this._y = 0;
					}
					break;
				default:console.warn( 'THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );
			}

			this._order = order;

			if ( update !== false ) this._onChangeCallback();
			return this;
		}

		setFromQuaternion( q, order, update ) {
			_matrix.makeRotationFromQuaternion( q );
			return this.setFromRotationMatrix( _matrix, order, update );
		}


		_onChange( callback ) {

			this._onChangeCallback = callback;

			return this;

		}

		_onChangeCallback() {}

	}

	Euler.DefaultOrder = 'XYZ';
	Euler.RotationOrders = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ];

	const _matrix = new Matrix4();
	const _quaternion$1 = new Quaternion();

	class Layers {

		constructor() {this.mask = 1 | 0;}

		set( channel ) {this.mask = 1 << channel | 0;}

		enable( channel ) {this.mask |= 1 << channel | 0;}

		disable( channel ) {this.mask &= ~ ( 1 << channel | 0 );}

		test( layers ) {return ( this.mask & layers.mask ) !== 0;
		}

	}

	let _object3DId = 0;

	const _v1$2 = new Vector3();
	const _q1 = new Quaternion();
	const _m1$1 = new Matrix4();
	const _target = new Vector3();

	const _position = new Vector3();
	const _scale = new Vector3();
	const _quaternion$2 = new Quaternion();

	const _xAxis = new Vector3( 1, 0, 0 );
	const _yAxis = new Vector3( 0, 1, 0 );
	const _zAxis = new Vector3( 0, 0, 1 );

	const _addedEvent = { type: 'added' };
	const _removedEvent = { type: 'removed' };

	function Object3D() {

		Object.defineProperty( this, 'id', { value: _object3DId ++ } );

		this.uuid = MathUtils.generateUUID();

		this.name = '';
		this.type = 'Object3D';

		this.parent = null;
		this.children = [];

		this.up = Object3D.DefaultUp.clone();

		const position = new Vector3();
		const rotation = new Euler();
		const quaternion = new Quaternion();
		const scale = new Vector3( 1, 1, 1 );

		function onRotationChange() {

			quaternion.setFromEuler( rotation, false );

		}

		function onQuaternionChange() {

			rotation.setFromQuaternion( quaternion, undefined, false );

		}

		rotation._onChange( onRotationChange );
		quaternion._onChange( onQuaternionChange );

		Object.defineProperties( this, {
			position: {
				configurable: true,
				enumerable: true,
				value: position
			},
			rotation: {
				configurable: true,
				enumerable: true,
				value: rotation
			},
			quaternion: {
				configurable: true,
				enumerable: true,
				value: quaternion
			},
			scale: {
				configurable: true,
				enumerable: true,
				value: scale
			},
			modelViewMatrix: {
				value: new Matrix4()
			},
			normalMatrix: {
				value: new Matrix3()
			}
		} );

		this.matrix = new Matrix4();
		this.matrixWorld = new Matrix4();

		this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
		this.matrixWorldNeedsUpdate = false;

		this.layers = new Layers();
		this.visible = true;

		this.castShadow = false;
		this.receiveShadow = false;

		this.frustumCulled = true;
		this.renderOrder = 0;

		this.userData = {};

	}

	Object3D.DefaultUp = new Vector3( 0, 1, 0 );
	Object3D.DefaultMatrixAutoUpdate = true;

	Object3D.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

		constructor: Object3D,

		isObject3D: true,

		onBeforeRender: function () {},
		onAfterRender: function () {},

		applyMatrix4: function ( matrix ) {

			if ( this.matrixAutoUpdate ) this.updateMatrix();
			this.matrix.premultiply( matrix );
			this.matrix.decompose( this.position, this.quaternion, this.scale );
		},

		add: function ( object ) {

			if ( arguments.length > 1 ) {
				for ( let i = 0; i < arguments.length; i ++ ) {
					this.add( arguments[ i ] );
				}
				return this;
			}

			if ( object === this ) {
				console.error( "THREE.Object3D.add: object can't be added as a child of itself.", object );
				return this;
			}

			if ( ( object && object.isObject3D ) ) {
				if ( object.parent !== null ) {
					object.parent.remove( object );
				}

				object.parent = this;
				this.children.push( object );

				object.dispatchEvent( _addedEvent );
			} else {
				console.error( "THREE.Object3D.add: object not an instance of THREE.Object3D.", object );
			}
			return this;
		},

		remove: function ( object ) {
			if ( arguments.length > 1 ) {
				for ( let i = 0; i < arguments.length; i ++ ) {
					this.remove( arguments[ i ] );
				}
				return this;
			}

			const index = this.children.indexOf( object );

			if ( index !== - 1 ) {
				object.parent = null;
				this.children.splice( index, 1 );
				object.dispatchEvent( _removedEvent );
			}

			return this;
		},

		raycast: function () {},

		traverse: function ( callback ) {

			callback( this );

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {
				children[ i ].traverse( callback );
			}

		},

		traverseVisible: function ( callback ) {

			if ( this.visible === false ) return;
			callback( this );
			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {
				children[ i ].traverseVisible( callback );
			}
		},

		traverseAncestors: function ( callback ) {

			const parent = this.parent;

			if ( parent !== null ) {
				callback( parent );
				parent.traverseAncestors( callback );
			}

		},

		updateMatrix: function () {
			this.matrix.compose( this.position, this.quaternion, this.scale );
			this.matrixWorldNeedsUpdate = true;
		},

		updateMatrixWorld: function ( force ) {

			if ( this.matrixAutoUpdate ) this.updateMatrix();

			if ( this.matrixWorldNeedsUpdate || force ) {
				if ( this.parent === null ) {
					this.matrixWorld.copy( this.matrix );
				} else {
					this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );
				}

				this.matrixWorldNeedsUpdate = false;
				force = true;

			}

			// update children

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {
				children[ i ].updateMatrixWorld( force );
			}
		},

		updateWorldMatrix: function ( updateParents, updateChildren ) {

			const parent = this.parent;

			if ( updateParents === true && parent !== null ) {
				parent.updateWorldMatrix( true, false );
			}

			if ( this.matrixAutoUpdate ) this.updateMatrix();
			if ( this.parent === null ) {
				this.matrixWorld.copy( this.matrix );
			} else {
				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );
			}

			// update children
			if ( updateChildren === true ) {
				const children = this.children;

				for ( let i = 0, l = children.length; i < l; i ++ ) {
					children[ i ].updateWorldMatrix( false, true );
				}
			}
		},
	
		clone: function ( recursive ) {return new this.constructor().copy( this, recursive );},

		copy: function ( source, recursive ) {
			if ( recursive === undefined ) recursive = true;
			this.name = source.name;
			this.up.copy( source.up );
			this.position.copy( source.position );
			this.rotation.order = source.rotation.order;
			this.quaternion.copy( source.quaternion );
			this.scale.copy( source.scale );

			this.matrix.copy( source.matrix );
			this.matrixWorld.copy( source.matrixWorld );

			this.matrixAutoUpdate = source.matrixAutoUpdate;
			this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

			this.layers.mask = source.layers.mask;
			this.visible = source.visible;

			this.castShadow = source.castShadow;
			this.receiveShadow = source.receiveShadow;

			this.frustumCulled = source.frustumCulled;
			this.renderOrder = source.renderOrder;

			this.userData = JSON.parse( JSON.stringify( source.userData ) );

			if ( recursive === true ) {
				for ( let i = 0; i < source.children.length; i ++ ) {
					const child = source.children[ i ];
					this.add( child.clone() );
				}
			}
			return this;
		}
	} );

	const _vector1 = new Vector3();
	const _vector2 = new Vector3();
	const _normalMatrix = new Matrix3();

	class Plane {

		constructor( normal, constant ) {
			Object.defineProperty( this, 'isPlane', { value: true } );

			// normal is assumed to be normalized
			this.normal = ( normal !== undefined ) ? normal : new Vector3( 1, 0, 0 );
			this.constant = ( constant !== undefined ) ? constant : 0;
		}

		set( normal, constant ) {
			this.normal.copy( normal );
			this.constant = constant;
			return this;
		}

		setComponents( x, y, z, w ) {
			this.normal.set( x, y, z );
			this.constant = w;
			return this;
		}


		clone() {return new this.constructor().copy( this );}

		copy( plane ) {
			this.normal.copy( plane.normal );
			this.constant = plane.constant;
			return this;
		}

		normalize() {
			const inverseNormalLength = 1.0 / this.normal.length();
			this.normal.multiplyScalar( inverseNormalLength );
			this.constant *= inverseNormalLength;
			return this;
		}

		distanceToPoint( point ) {return this.normal.dot( point ) + this.constant;}

		intersectsBox( box ) {return box.intersectsPlane( this );}

		coplanarPoint( target ) {
			if ( target === undefined ) {
				console.warn( 'THREE.Plane: .coplanarPoint() target is now required' );
				target = new Vector3();
			}
			return target.copy( this.normal ).multiplyScalar( - this.constant );
		}

		applyMatrix4( matrix, optionalNormalMatrix ) {
			const normalMatrix = optionalNormalMatrix || _normalMatrix.getNormalMatrix( matrix );
			const referencePoint = this.coplanarPoint( _vector1 ).applyMatrix4( matrix );
			const normal = this.normal.applyMatrix3( normalMatrix ).normalize();
			this.constant = - referencePoint.dot( normal );
			return this;
		}
	}

	const _v0$1 = new Vector3();
	const _v1$3 = new Vector3();
	const _v2$1 = new Vector3();
	const _v3 = new Vector3();

	const _vab = new Vector3();
	const _vac = new Vector3();
	const _vbc = new Vector3();
	const _vap = new Vector3();
	const _vbp = new Vector3();
	const _vcp = new Vector3();

	class Triangle {

		constructor( a, b, c ) {
			this.a = ( a !== undefined ) ? a : new Vector3();
			this.b = ( b !== undefined ) ? b : new Vector3();
			this.c = ( c !== undefined ) ? c : new Vector3();
		}

		static getNormal( a, b, c, target ) {

			if ( target === undefined ) {
				console.warn( 'THREE.Triangle: .getNormal() target is now required' );
				target = new Vector3();
			}

			target.subVectors( c, b );
			_v0$1.subVectors( a, b );
			target.cross( _v0$1 );

			const targetLengthSq = target.lengthSq();
			if ( targetLengthSq > 0 ) {
				return target.multiplyScalar( 1 / Math.sqrt( targetLengthSq ) );
			}

			return target.set( 0, 0, 0 );

		}

		// static/instance method to calculate barycentric coordinates
		// based on: http://www.blackpawn.com/texts/pointinpoly/default.html
		static getBarycoord( point, a, b, c, target ) {

			_v0$1.subVectors( c, a );
			_v1$3.subVectors( b, a );
			_v2$1.subVectors( point, a );

			const dot00 = _v0$1.dot( _v0$1 );
			const dot01 = _v0$1.dot( _v1$3 );
			const dot02 = _v0$1.dot( _v2$1 );
			const dot11 = _v1$3.dot( _v1$3 );
			const dot12 = _v1$3.dot( _v2$1 );

			const denom = ( dot00 * dot11 - dot01 * dot01 );

			if ( target === undefined ) {
				console.warn( 'THREE.Triangle: .getBarycoord() target is now required' );
				target = new Vector3();
			}

			// collinear or singular triangle
			if ( denom === 0 ) {
				// arbitrary location outside of triangle?
				// not sure if this is the best idea, maybe should be returning undefined
				return target.set( - 2, - 1, - 1 );
			}

			const invDenom = 1 / denom;
			const u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
			const v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			// barycentric coordinates must always sum to 1
			return target.set( 1 - u - v, v, u );

		}

		static containsPoint( point, a, b, c ) {

			this.getBarycoord( point, a, b, c, _v3 );

			return ( _v3.x >= 0 ) && ( _v3.y >= 0 ) && ( ( _v3.x + _v3.y ) <= 1 );

		}

		set( a, b, c ) {
			this.a.copy( a );
			this.b.copy( b );
			this.c.copy( c );

			return this;
		}

		clone() {return new this.constructor().copy( this );}

		copy( triangle ) {
			this.a.copy( triangle.a );
			this.b.copy( triangle.b );
			this.c.copy( triangle.c );
			return this;
		}

		intersectsBox( box ) {return box.intersectsTriangle( this );}
	}

	const _hslA = { h: 0, s: 0, l: 0 };
	const _hslB = { h: 0, s: 0, l: 0 };

	function hue2rgb( p, q, t ) {

		if ( t < 0 ) t += 1;
		if ( t > 1 ) t -= 1;
		if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
		if ( t < 1 / 2 ) return q;
		if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
		return p;

	}

	class Color {

		constructor( r, g, b ) {
			Object.defineProperty( this, 'isColor', { value: true } );

			if ( g === undefined && b === undefined ) {
				// r is THREE.Color, hex or string
				return this.set( r );
			}
			return this.setRGB( r, g, b );

		}

		set( value ) {
			if ( value && value.isColor ) {
				this.copy( value );
			} else if ( typeof value === 'number' ) {
				this.setHex( value );
			} 
			return this;
		}

		setHex( hex ) {
			hex = Math.floor( hex );
			this.r = ( hex >> 16 & 255 ) / 255;
			this.g = ( hex >> 8 & 255 ) / 255;
			this.b = ( hex & 255 ) / 255;
			return this;
		}

		setRGB( r, g, b ) {
			this.r = r;
			this.g = g;
			this.b = b;

			return this;
		}


		setHSL( h, s, l ) {
			// h,s,l ranges are in 0.0 - 1.0
			h = MathUtils.euclideanModulo( h, 1 );
			s = MathUtils.clamp( s, 0, 1 );
			l = MathUtils.clamp( l, 0, 1 );

			if ( s === 0 ) {
				this.r = this.g = this.b = l;
			} else {
				const p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
				const q = ( 2 * l ) - p;
				this.r = hue2rgb( q, p, h + 1 / 3 );
				this.g = hue2rgb( q, p, h );
				this.b = hue2rgb( q, p, h - 1 / 3 );
			}

			return this;
		}

		clone() {return new this.constructor( this.r, this.g, this.b );}

		copy( color ) {
			this.r = color.r;
			this.g = color.g;
			this.b = color.b;
			return this;
		}

		getHex() {return ( this.r * 255 ) << 16 ^ ( this.g * 255 ) << 8 ^ ( this.b * 255 ) << 0;}
		
		getStyle() {return 'rgb(' + ( ( this.r * 255 ) | 0 ) + ',' + ( ( this.g * 255 ) | 0 ) + ',' + ( ( this.b * 255 ) | 0 ) + ')';}

		add( color ) {
			this.r += color.r;
			this.g += color.g;
			this.b += color.b;
			return this;
		}

		addColors( color1, color2 ) {
			this.r = color1.r + color2.r;
			this.g = color1.g + color2.g;
			this.b = color1.b + color2.b;
			return this;
		}

		addScalar( s ) {
			this.r += s;
			this.g += s;
			this.b += s;
			return this;
		}


		multiply( color ) {
			this.r *= color.r;
			this.g *= color.g;
			this.b *= color.b;
			return this;
		}

		multiplyScalar( s ) {
			this.r *= s;
			this.g *= s;
			this.b *= s;
			return this;

		}

		fromArray( array, offset ) {

			if ( offset === undefined ) offset = 0;
			this.r = array[ offset ];
			this.g = array[ offset + 1 ];
			this.b = array[ offset + 2 ];
			return this;

		}

		toArray( array, offset ) {

			if ( array === undefined ) array = [];
			if ( offset === undefined ) offset = 0;
			array[ offset ] = this.r;
			array[ offset + 1 ] = this.g;
			array[ offset + 2 ] = this.b;
			return array;
		}

		fromBufferAttribute( attribute, index ) {
			this.r = attribute.getX( index );
			this.g = attribute.getY( index );
			this.b = attribute.getZ( index );

			if ( attribute.normalized === true ) {
				this.r /= 255;
				this.g /= 255;
				this.b /= 255;
			}
			return this;
		}
	}

	Color.prototype.r = 1;
	Color.prototype.g = 1;
	Color.prototype.b = 1;

	class Face3 {

		constructor( a, b, c, normal, color, materialIndex ) {

			this.a = a;
			this.b = b;
			this.c = c;

			this.normal = ( normal && normal.isVector3 ) ? normal : new Vector3();
			this.vertexNormals = Array.isArray( normal ) ? normal : [];
			this.color = ( color && color.isColor ) ? color : new Color();
			this.vertexColors = Array.isArray( color ) ? color : [];

			this.materialIndex = materialIndex !== undefined ? materialIndex : 0;

		}

		clone() {return new this.constructor().copy( this );		}

		copy( source ) {
			this.a = source.a;
			this.b = source.b;
			this.c = source.c;

			this.normal.copy( source.normal );
			this.color.copy( source.color );
			this.materialIndex = source.materialIndex;

			for ( let i = 0, il = source.vertexNormals.length; i < il; i ++ ) {
				this.vertexNormals[ i ] = source.vertexNormals[ i ].clone();
			}

			for ( let i = 0, il = source.vertexColors.length; i < il; i ++ ) {
				this.vertexColors[ i ] = source.vertexColors[ i ].clone();
			}
			return this;
		}
	}

	let materialId = 0;

	function Material() {

		Object.defineProperty( this, 'id', { value: materialId ++ } );

		this.uuid = MathUtils.generateUUID();

		this.name = '';
		this.type = 'Material';

		this.fog = true;

		this.blending = NormalBlending;
		this.side = FrontSide;
		this.flatShading = false;
		this.vertexColors = false;

		this.opacity = 1;
		this.transparent = false;

		this.blendSrc = SrcAlphaFactor;
		this.blendDst = OneMinusSrcAlphaFactor;
		this.blendEquation = AddEquation;
		this.blendSrcAlpha = null;
		this.blendDstAlpha = null;
		this.blendEquationAlpha = null;

		this.depthFunc = LessEqualDepth;
		this.depthTest = true;
		this.depthWrite = true;

		this.stencilWriteMask = 0xff;
		this.stencilFunc = AlwaysStencilFunc;
		this.stencilRef = 0;
		this.stencilFuncMask = 0xff;
		this.stencilFail = KeepStencilOp;
		this.stencilZFail = KeepStencilOp;
		this.stencilZPass = KeepStencilOp;
		this.stencilWrite = false;

		this.clippingPlanes = null;
		this.clipIntersection = false;
		this.clipShadows = false;

		this.shadowSide = null;

		this.colorWrite = true;

		this.precision = null; // override the renderer's default precision for this material

		this.polygonOffset = false;
		this.polygonOffsetFactor = 0;
		this.polygonOffsetUnits = 0;

		this.dithering = false;

		this.alphaTest = 0;
		this.premultipliedAlpha = false;

		this.visible = true;

		this.toneMapped = true;

		this.userData = {};

		this.version = 0;

	}

	Material.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

		constructor: Material,

		isMaterial: true,

		onBeforeCompile: function ( /* shaderobject, renderer */ ) {},

		customProgramCacheKey: function () {

			return this.onBeforeCompile.toString();

		},

		setValues: function ( values ) {

			if ( values === undefined ) return;

			for ( const key in values ) {

				const newValue = values[ key ];

				if ( newValue === undefined ) {

					console.warn( "THREE.Material: '" + key + "' parameter is undefined." );
					continue;

				}

				// for backward compatability if shading is set in the constructor
				if ( key === 'shading' ) {

					console.warn( 'THREE.' + this.type + ': .shading has been removed. Use the boolean .flatShading instead.' );
					this.flatShading = ( newValue === FlatShading ) ? true : false;
					continue;

				}

				const currentValue = this[ key ];

				if ( currentValue === undefined ) {

					console.warn( "THREE." + this.type + ": '" + key + "' is not a property of this material." );
					continue;

				}

				if ( currentValue && currentValue.isColor ) {

					currentValue.set( newValue );

				} else if ( ( currentValue && currentValue.isVector3 ) && ( newValue && newValue.isVector3 ) ) {

					currentValue.copy( newValue );

				} else {

					this[ key ] = newValue;

				}

			}

		},


		clone: function () {return new this.constructor().copy( this );	},

		copy: function ( source ) {
			this.name = source.name;

			this.fog = source.fog;

			this.blending = source.blending;
			this.side = source.side;
			this.flatShading = source.flatShading;
			this.vertexColors = source.vertexColors;

			this.opacity = source.opacity;
			this.transparent = source.transparent;

			this.blendSrc = source.blendSrc;
			this.blendDst = source.blendDst;
			this.blendEquation = source.blendEquation;
			this.blendSrcAlpha = source.blendSrcAlpha;
			this.blendDstAlpha = source.blendDstAlpha;
			this.blendEquationAlpha = source.blendEquationAlpha;

			this.depthFunc = source.depthFunc;
			this.depthTest = source.depthTest;
			this.depthWrite = source.depthWrite;

			this.stencilWriteMask = source.stencilWriteMask;
			this.stencilFunc = source.stencilFunc;
			this.stencilRef = source.stencilRef;
			this.stencilFuncMask = source.stencilFuncMask;
			this.stencilFail = source.stencilFail;
			this.stencilZFail = source.stencilZFail;
			this.stencilZPass = source.stencilZPass;
			this.stencilWrite = source.stencilWrite;

			const srcPlanes = source.clippingPlanes;
			let dstPlanes = null;

			if ( srcPlanes !== null ) {

				const n = srcPlanes.length;
				dstPlanes = new Array( n );

				for ( let i = 0; i !== n; ++ i ) {

					dstPlanes[ i ] = srcPlanes[ i ].clone();

				}

			}

			this.clippingPlanes = dstPlanes;
			this.clipIntersection = source.clipIntersection;
			this.clipShadows = source.clipShadows;

			this.shadowSide = source.shadowSide;

			this.colorWrite = source.colorWrite;

			this.precision = source.precision;

			this.polygonOffset = source.polygonOffset;
			this.polygonOffsetFactor = source.polygonOffsetFactor;
			this.polygonOffsetUnits = source.polygonOffsetUnits;

			this.dithering = source.dithering;

			this.alphaTest = source.alphaTest;
			this.premultipliedAlpha = source.premultipliedAlpha;

			this.visible = source.visible;

			this.toneMapped = source.toneMapped;

			this.userData = JSON.parse( JSON.stringify( source.userData ) );

			return this;
		},

		dispose: function () {this.dispatchEvent( { type: 'dispose' } );}

	} );

	Object.defineProperty( Material.prototype, 'needsUpdate', {
		set: function ( value ) {
			if ( value === true ) this.version ++;
		}
	} );

	function MeshBasicMaterial( parameters ) {

		Material.call( this );
		this.type = 'MeshBasicMaterial';

		this.color = new Color( 0xffffff ); // emissive

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.specularMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.combine = MultiplyOperation;
		this.reflectivity = 1;
		this.refractionRatio = 0.98;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.skinning = false;
		this.morphTargets = false;

		this.setValues( parameters );

	}

	MeshBasicMaterial.prototype = Object.create( Material.prototype );
	MeshBasicMaterial.prototype.constructor = MeshBasicMaterial;

	MeshBasicMaterial.prototype.isMeshBasicMaterial = true;

	MeshBasicMaterial.prototype.copy = function ( source ) {

		Material.prototype.copy.call( this, source );
		this.color.copy( source.color );
		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.specularMap = source.specularMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.combine = source.combine;
		this.reflectivity = source.reflectivity;
		this.refractionRatio = source.refractionRatio;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.skinning = source.skinning;
		this.morphTargets = source.morphTargets;

		return this;

	};

	const _vector$3 = new Vector3();
	const _vector2$1 = new Vector2();

	function BufferAttribute( array, itemSize, normalized ) {

		if ( Array.isArray( array ) ) {

			throw new TypeError( 'THREE.BufferAttribute: array should be a Typed Array.' );

		}

		this.name = '';

		this.array = array;
		this.itemSize = itemSize;
		this.count = array !== undefined ? array.length / itemSize : 0;
		this.normalized = normalized === true;

		this.usage = StaticDrawUsage;
		this.updateRange = { offset: 0, count: - 1 };

		this.version = 0;

	}

	Object.defineProperty( BufferAttribute.prototype, 'needsUpdate', {
		set: function ( value ) {if ( value === true ) this.version ++;	}
	} );

	Object.assign( BufferAttribute.prototype, {

		isBufferAttribute: true,

		onUploadCallback: function () {},

		setUsage: function ( value ) {
			this.usage = value;
			return this;
		},

		copy: function ( source ) {
			this.name = source.name;
			this.array = new source.array.constructor( source.array );
			this.itemSize = source.itemSize;
			this.count = source.count;
			this.normalized = source.normalized;

			this.usage = source.usage;
			return this;
		},

		copyAt: function ( index1, attribute, index2 ) {
			index1 *= this.itemSize;
			index2 *= attribute.itemSize;

			for ( let i = 0, l = this.itemSize; i < l; i ++ ) {
				this.array[ index1 + i ] = attribute.array[ index2 + i ];
			}
			return this;
		},

		copyArray: function ( array ) {
			this.array.set( array );
			return this;
		},

		copyColorsArray: function ( colors ) {
			const array = this.array;
			let offset = 0;

			for ( let i = 0, l = colors.length; i < l; i ++ ) {
				let color = colors[ i ];

				if ( color === undefined ) {
					console.warn( 'THREE.BufferAttribute.copyColorsArray(): color is undefined', i );
					color = new Color();
				}

				array[ offset ++ ] = color.r;
				array[ offset ++ ] = color.g;
				array[ offset ++ ] = color.b;

			}
			return this;
		},

		copyVector2sArray: function ( vectors ) {

			const array = this.array;
			let offset = 0;

			for ( let i = 0, l = vectors.length; i < l; i ++ ) {
				let vector = vectors[ i ];

				if ( vector === undefined ) {
					console.warn( 'THREE.BufferAttribute.copyVector2sArray(): vector is undefined', i );
					vector = new Vector2();
				}

				array[ offset ++ ] = vector.x;
				array[ offset ++ ] = vector.y;

			}
			return this;
		},

		copyVector3sArray: function ( vectors ) {
			const array = this.array;
			let offset = 0;

			for ( let i = 0, l = vectors.length; i < l; i ++ ) {

				let vector = vectors[ i ];

				if ( vector === undefined ) {
					console.warn( 'THREE.BufferAttribute.copyVector3sArray(): vector is undefined', i );
					vector = new Vector3();
				}

				array[ offset ++ ] = vector.x;
				array[ offset ++ ] = vector.y;
				array[ offset ++ ] = vector.z;
			}
			return this;
		},

		copyVector4sArray: function ( vectors ) {

			const array = this.array;
			let offset = 0;

			for ( let i = 0, l = vectors.length; i < l; i ++ ) {
				let vector = vectors[ i ];

				if ( vector === undefined ) {
					console.warn( 'THREE.BufferAttribute.copyVector4sArray(): vector is undefined', i );
					vector = new Vector4();
				}

				array[ offset ++ ] = vector.x;
				array[ offset ++ ] = vector.y;
				array[ offset ++ ] = vector.z;
				array[ offset ++ ] = vector.w;
			}
			return this;
		},

		applyMatrix3: function ( m ) {

			if ( this.itemSize === 2 ) {

				for ( let i = 0, l = this.count; i < l; i ++ ) {
					_vector2$1.fromBufferAttribute( this, i );
					_vector2$1.applyMatrix3( m );
					this.setXY( i, _vector2$1.x, _vector2$1.y );
				}
			} else if ( this.itemSize === 3 ) {
				for ( let i = 0, l = this.count; i < l; i ++ ) {
					_vector$3.fromBufferAttribute( this, i );
					_vector$3.applyMatrix3( m );
					this.setXYZ( i, _vector$3.x, _vector$3.y, _vector$3.z );
				}
			}
			return this;
		},

		applyMatrix4: function ( m ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector$3.x = this.getX( i );
				_vector$3.y = this.getY( i );
				_vector$3.z = this.getZ( i );
				_vector$3.applyMatrix4( m );
				this.setXYZ( i, _vector$3.x, _vector$3.y, _vector$3.z );
			}
			return this;
		},

		applyNormalMatrix: function ( m ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector$3.x = this.getX( i );
				_vector$3.y = this.getY( i );
				_vector$3.z = this.getZ( i );

				_vector$3.applyNormalMatrix( m );

				this.setXYZ( i, _vector$3.x, _vector$3.y, _vector$3.z );

			}

			return this;

		},

		transformDirection: function ( m ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector$3.x = this.getX( i );
				_vector$3.y = this.getY( i );
				_vector$3.z = this.getZ( i );

				_vector$3.transformDirection( m );

				this.setXYZ( i, _vector$3.x, _vector$3.y, _vector$3.z );

			}

			return this;

		},

		set: function ( value, offset ) {

			if ( offset === undefined ) offset = 0;

			this.array.set( value, offset );

			return this;

		},

		getX: function ( index ) {return this.array[ index * this.itemSize ];},

		setX: function ( index, x ) {
			this.array[ index * this.itemSize ] = x;
			return this;
		},

		getY: function ( index ) {return this.array[ index * this.itemSize + 1 ];},

		setY: function ( index, y ) {
			this.array[ index * this.itemSize + 1 ] = y;
			return this;
		},

		getZ: function ( index ) {return this.array[ index * this.itemSize + 2 ];},

		setZ: function ( index, z ) {
			this.array[ index * this.itemSize + 2 ] = z;
			return this;
		},

		getW: function ( index ) {return this.array[ index * this.itemSize + 3 ];},

		setW: function ( index, w ) {
			this.array[ index * this.itemSize + 3 ] = w;
			return this;
		},

		setXY: function ( index, x, y ) {
			index *= this.itemSize;
			this.array[ index + 0 ] = x;
			this.array[ index + 1 ] = y;
			return this;
		},

		setXYZ: function ( index, x, y, z ) {
			index *= this.itemSize;
			this.array[ index + 0 ] = x;
			this.array[ index + 1 ] = y;
			this.array[ index + 2 ] = z;

			return this;
		},

		setXYZW: function ( index, x, y, z, w ) {
			index *= this.itemSize;
			this.array[ index + 0 ] = x;
			this.array[ index + 1 ] = y;
			this.array[ index + 2 ] = z;
			this.array[ index + 3 ] = w;
			return this;
		},

		onUpload: function ( callback ) {
			this.onUploadCallback = callback;
			return this;
		},

		clone: function () {return new this.constructor( this.array, this.itemSize ).copy( this );},
	} );

	//

	function Int8BufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Int8Array( array ), itemSize, normalized );
	}

	Int8BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Int8BufferAttribute.prototype.constructor = Int8BufferAttribute;


	function Uint8BufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Uint8Array( array ), itemSize, normalized );
	}

	Uint8BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Uint8BufferAttribute.prototype.constructor = Uint8BufferAttribute;


	function Uint8ClampedBufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Uint8ClampedArray( array ), itemSize, normalized );
	}

	Uint8ClampedBufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Uint8ClampedBufferAttribute.prototype.constructor = Uint8ClampedBufferAttribute;


	function Int16BufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Int16Array( array ), itemSize, normalized );
	}

	Int16BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Int16BufferAttribute.prototype.constructor = Int16BufferAttribute;


	function Uint16BufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Uint16Array( array ), itemSize, normalized );
	}

	Uint16BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Uint16BufferAttribute.prototype.constructor = Uint16BufferAttribute;


	function Int32BufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Int32Array( array ), itemSize, normalized );
	}

	Int32BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Int32BufferAttribute.prototype.constructor = Int32BufferAttribute;


	function Uint32BufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Uint32Array( array ), itemSize, normalized );
	}

	Uint32BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Uint32BufferAttribute.prototype.constructor = Uint32BufferAttribute;


	function Float32BufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Float32Array( array ), itemSize, normalized );
	}

	Float32BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Float32BufferAttribute.prototype.constructor = Float32BufferAttribute;


	function Float64BufferAttribute( array, itemSize, normalized ) {
		BufferAttribute.call( this, new Float64Array( array ), itemSize, normalized );
	}

	Float64BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
	Float64BufferAttribute.prototype.constructor = Float64BufferAttribute;


	function arrayMax( array ) {

		if ( array.length === 0 ) return - Infinity;

		let max = array[ 0 ];

		for ( let i = 1, l = array.length; i < l; ++ i ) {

			if ( array[ i ] > max ) max = array[ i ];

		}

		return max;

	}

	let _bufferGeometryId = 1; // BufferGeometry uses odd numbers as Id

	const _m1$2 = new Matrix4();
	const _obj = new Object3D();
	const _offset = new Vector3();
	const _box$2 = new Box3();
	const _boxMorphTargets = new Box3();
	const _vector$4 = new Vector3();

	function BufferGeometry() {

		Object.defineProperty( this, 'id', { value: _bufferGeometryId += 2 } );

		this.uuid = MathUtils.generateUUID();

		this.name = '';
		this.type = 'BufferGeometry';

		this.index = null;
		this.attributes = {};

		this.morphAttributes = {};
		this.morphTargetsRelative = false;

		this.groups = [];

		this.boundingBox = null;
		this.boundingSphere = null;

		this.drawRange = { start: 0, count: Infinity };

		this.userData = {};

	}

	BufferGeometry.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

		constructor: BufferGeometry,

		isBufferGeometry: true,

		setIndex: function ( index ) {
			if ( Array.isArray( index ) ) {
				this.index = new ( arrayMax( index ) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute )( index, 1 );
			} else {
				this.index = index;
			}
		},

		getAttribute: function ( name ) {return this.attributes[ name ];},

		setAttribute: function ( name, attribute ) {
			this.attributes[ name ] = attribute;
			return this;
		},

		addGroup: function ( start, count, materialIndex ) {

			this.groups.push( {

				start: start,
				count: count,
				materialIndex: materialIndex !== undefined ? materialIndex : 0

			} );

		},

		applyMatrix4: function ( matrix ) {
			const position = this.attributes.position;

			if ( position !== undefined ) {
				position.applyMatrix4( matrix );
				position.needsUpdate = true;
			}

			const normal = this.attributes.normal;

			if ( normal !== undefined ) {
				const normalMatrix = new Matrix3().getNormalMatrix( matrix );
				normal.applyNormalMatrix( normalMatrix );
				normal.needsUpdate = true;
			}

			const tangent = this.attributes.tangent;

			if ( tangent !== undefined ) {
				tangent.transformDirection( matrix );
				tangent.needsUpdate = true;
			}
			return this;
		},

		translate: function ( x, y, z ) {

			// translate geometry

			_m1$2.makeTranslation( x, y, z );

			this.applyMatrix4( _m1$2 );

			return this;

		},


		computeBoundingBox: function () {

			if ( this.boundingBox === null ) {

				this.boundingBox = new Box3();

			}

			const position = this.attributes.position;
			const morphAttributesPosition = this.morphAttributes.position;

			if ( position && position.isGLBufferAttribute ) {

				console.error( 'THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".', this );

				this.boundingBox.set(
					new Vector3( - Infinity, - Infinity, - Infinity ),
					new Vector3( + Infinity, + Infinity, + Infinity )
				);

				return;

			}

			if ( position !== undefined ) {

				this.boundingBox.setFromBufferAttribute( position );

				// process morph attributes if present

				if ( morphAttributesPosition ) {

					for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

						const morphAttribute = morphAttributesPosition[ i ];
						_box$2.setFromBufferAttribute( morphAttribute );

						if ( this.morphTargetsRelative ) {

							_vector$4.addVectors( this.boundingBox.min, _box$2.min );
							this.boundingBox.expandByPoint( _vector$4 );

							_vector$4.addVectors( this.boundingBox.max, _box$2.max );
							this.boundingBox.expandByPoint( _vector$4 );

						} else {

							this.boundingBox.expandByPoint( _box$2.min );
							this.boundingBox.expandByPoint( _box$2.max );

						}

					}

				}

			} else {

				this.boundingBox.makeEmpty();

			}

			if ( isNaN( this.boundingBox.min.x ) || isNaN( this.boundingBox.min.y ) || isNaN( this.boundingBox.min.z ) ) {

				console.error( 'THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this );

			}

		},

		computeBoundingSphere: function () {

			if ( this.boundingSphere === null ) {

				this.boundingSphere = new Sphere();

			}

			const position = this.attributes.position;
			const morphAttributesPosition = this.morphAttributes.position;

			if ( position && position.isGLBufferAttribute ) {

				console.error( 'THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".', this );

				this.boundingSphere.set( new Vector3(), Infinity );

				return;

			}

			if ( position ) {

				// first, find the center of the bounding sphere

				const center = this.boundingSphere.center;

				_box$2.setFromBufferAttribute( position );

				// process morph attributes if present

				if ( morphAttributesPosition ) {

					for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

						const morphAttribute = morphAttributesPosition[ i ];
						_boxMorphTargets.setFromBufferAttribute( morphAttribute );

						if ( this.morphTargetsRelative ) {

							_vector$4.addVectors( _box$2.min, _boxMorphTargets.min );
							_box$2.expandByPoint( _vector$4 );

							_vector$4.addVectors( _box$2.max, _boxMorphTargets.max );
							_box$2.expandByPoint( _vector$4 );

						} else {

							_box$2.expandByPoint( _boxMorphTargets.min );
							_box$2.expandByPoint( _boxMorphTargets.max );

						}

					}

				}

				_box$2.getCenter( center );

				// second, try to find a boundingSphere with a radius smaller than the
				// boundingSphere of the boundingBox: sqrt(3) smaller in the best case

				let maxRadiusSq = 0;

				for ( let i = 0, il = position.count; i < il; i ++ ) {

					_vector$4.fromBufferAttribute( position, i );

					maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector$4 ) );

				}

				// process morph attributes if present

				if ( morphAttributesPosition ) {

					for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

						const morphAttribute = morphAttributesPosition[ i ];
						const morphTargetsRelative = this.morphTargetsRelative;

						for ( let j = 0, jl = morphAttribute.count; j < jl; j ++ ) {

							_vector$4.fromBufferAttribute( morphAttribute, j );

							if ( morphTargetsRelative ) {

								_offset.fromBufferAttribute( position, j );
								_vector$4.add( _offset );

							}

							maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector$4 ) );

						}

					}

				}

				this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

				if ( isNaN( this.boundingSphere.radius ) ) {

					console.error( 'THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this );

				}

			}

		},

		
		clone: function () {return new BufferGeometry().copy( this );},

		copy: function ( source ) {

			// reset
			this.index = null;
			this.attributes = {};
			this.morphAttributes = {};
			this.groups = [];
			this.boundingBox = null;
			this.boundingSphere = null;

			const data = {};
			this.name = source.name;
			const index = source.index;

			if ( index !== null ) {this.setIndex( index.clone( data ) );}

			// attributes
			const attributes = source.attributes;

			for ( const name in attributes ) {
				const attribute = attributes[ name ];
				this.setAttribute( name, attribute.clone( data ) );
			}

			// morph attributes
			const morphAttributes = source.morphAttributes;

			for ( const name in morphAttributes ) {
				const array = [];
				const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

				for ( let i = 0, l = morphAttribute.length; i < l; i ++ ) {
					array.push( morphAttribute[ i ].clone( data ) );
				}

				this.morphAttributes[ name ] = array;
			}

			this.morphTargetsRelative = source.morphTargetsRelative;

			// groups
			const groups = source.groups;

			for ( let i = 0, l = groups.length; i < l; i ++ ) {
				const group = groups[ i ];
				this.addGroup( group.start, group.count, group.materialIndex );
			}

			// bounding box
			const boundingBox = source.boundingBox;

			if ( boundingBox !== null ) {
				this.boundingBox = boundingBox.clone();
			}

			// bounding sphere
			const boundingSphere = source.boundingSphere;

			if ( boundingSphere !== null ) {
				this.boundingSphere = boundingSphere.clone();
			}

			// draw range
			this.drawRange.start = source.drawRange.start;
			this.drawRange.count = source.drawRange.count;

			// user data
			this.userData = source.userData;
			return this;

		},

		dispose: function () {this.dispatchEvent( { type: 'dispose' } );}

	} );

	const _inverseMatrix = new Matrix4();
	const _ray = new Ray();
	const _sphere = new Sphere();

	const _vA = new Vector3();
	const _vB = new Vector3();
	const _vC = new Vector3();

	const _tempA = new Vector3();
	const _tempB = new Vector3();
	const _tempC = new Vector3();

	const _morphA = new Vector3();
	const _morphB = new Vector3();
	const _morphC = new Vector3();

	const _uvA = new Vector2();
	const _uvB = new Vector2();
	const _uvC = new Vector2();

	const _intersectionPoint = new Vector3();
	const _intersectionPointWorld = new Vector3();

	function Mesh( geometry, material ) {

		Object3D.call( this );
                let r=material.color.r*255;
                let g=material.color.g*255;
                let b=material.color.b*255;
                let materialHex="#" + ((1 << 24) +(r << 16) + (g << 8) + b).toString(16).slice(1);
                materialHex=materialHex.split(".")[0]
                let hex="#000000"
                if(materialHex=="#f2f2f2"||materialHex=="#f1f1f1"){hex=wallColor;} //wall
                if(materialHex=="#ff5c4d"){hex=roofColor;} //roof
                if(materialHex=="#999999"){hex=bridgeColor;} //bridge

		material.color.r=parseInt(hex[1]+hex[2],16)/255;
                material.color.g=parseInt(hex[3]+hex[4],16)/255;
		material.color.b=parseInt(hex[5]+hex[6],16)/255;
		this.type = 'Mesh';
		this.geometry = geometry !== undefined ? geometry : new BufferGeometry();
		this.material = material !== undefined ? material : new MeshBasicMaterial();

		this.updateMorphTargets();

	}

	Mesh.prototype = Object.assign( Object.create( Object3D.prototype ), {

		constructor: Mesh,

		isMesh: true,

		copy: function ( source ) {

			Object3D.prototype.copy.call( this, source );

			if ( source.morphTargetInfluences !== undefined ) {

				this.morphTargetInfluences = source.morphTargetInfluences.slice();

			}

			if ( source.morphTargetDictionary !== undefined ) {

				this.morphTargetDictionary = Object.assign( {}, source.morphTargetDictionary );

			}

			this.material = source.material;
			this.geometry = source.geometry;

			return this;

		},

		updateMorphTargets: function () {

			const geometry = this.geometry;

			if ( geometry.isBufferGeometry ) {

				const morphAttributes = geometry.morphAttributes;
				const keys = Object.keys( morphAttributes );

				if ( keys.length > 0 ) {

					const morphAttribute = morphAttributes[ keys[ 0 ] ];

					if ( morphAttribute !== undefined ) {

						this.morphTargetInfluences = [];
						this.morphTargetDictionary = {};

						for ( let m = 0, ml = morphAttribute.length; m < ml; m ++ ) {

							const name = morphAttribute[ m ].name || String( m );

							this.morphTargetInfluences.push( 0 );
							this.morphTargetDictionary[ name ] = m;

						}

					}

				}

			} else {

				const morphTargets = geometry.morphTargets;

				if ( morphTargets !== undefined && morphTargets.length > 0 ) {

					console.error( 'THREE.Mesh.updateMorphTargets() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.' );

				}

			}

		},

		raycast: function ( raycaster, intersects ) {

			const geometry = this.geometry;
			const material = this.material;
			const matrixWorld = this.matrixWorld;

			if ( material === undefined ) return;

			// Checking boundingSphere distance to ray

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			_sphere.copy( geometry.boundingSphere );
			_sphere.applyMatrix4( matrixWorld );

			if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

			//

			_inverseMatrix.getInverse( matrixWorld );
			_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

			// Check boundingBox before continuing

			if ( geometry.boundingBox !== null ) {

				if ( _ray.intersectsBox( geometry.boundingBox ) === false ) return;

			}

			let intersection;

			if ( geometry.isBufferGeometry ) {

				const index = geometry.index;
				const position = geometry.attributes.position;
				const morphPosition = geometry.morphAttributes.position;
				const morphTargetsRelative = geometry.morphTargetsRelative;
				const uv = geometry.attributes.uv;
				const uv2 = geometry.attributes.uv2;
				const groups = geometry.groups;
				const drawRange = geometry.drawRange;

				if ( index !== null ) {

					// indexed buffer geometry

					if ( Array.isArray( material ) ) {

						for ( let i = 0, il = groups.length; i < il; i ++ ) {

							const group = groups[ i ];
							const groupMaterial = material[ group.materialIndex ];

							const start = Math.max( group.start, drawRange.start );
							const end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );

							for ( let j = start, jl = end; j < jl; j += 3 ) {

								const a = index.getX( j );
								const b = index.getX( j + 1 );
								const c = index.getX( j + 2 );

								intersection = checkBufferGeometryIntersection( this, groupMaterial, raycaster, _ray, position, morphPosition, morphTargetsRelative, uv, uv2, a, b, c );

								if ( intersection ) {

									intersection.faceIndex = Math.floor( j / 3 ); // triangle number in indexed buffer semantics
									intersection.face.materialIndex = group.materialIndex;
									intersects.push( intersection );

								}

							}

						}

					} else {

						const start = Math.max( 0, drawRange.start );
						const end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

						for ( let i = start, il = end; i < il; i += 3 ) {

							const a = index.getX( i );
							const b = index.getX( i + 1 );
							const c = index.getX( i + 2 );

							intersection = checkBufferGeometryIntersection( this, material, raycaster, _ray, position, morphPosition, morphTargetsRelative, uv, uv2, a, b, c );

							if ( intersection ) {

								intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indexed buffer semantics
								intersects.push( intersection );

							}

						}

					}

				} else if ( position !== undefined ) {

					// non-indexed buffer geometry

					if ( Array.isArray( material ) ) {

						for ( let i = 0, il = groups.length; i < il; i ++ ) {

							const group = groups[ i ];
							const groupMaterial = material[ group.materialIndex ];

							const start = Math.max( group.start, drawRange.start );
							const end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );

							for ( let j = start, jl = end; j < jl; j += 3 ) {

								const a = j;
								const b = j + 1;
								const c = j + 2;

								intersection = checkBufferGeometryIntersection( this, groupMaterial, raycaster, _ray, position, morphPosition, morphTargetsRelative, uv, uv2, a, b, c );

								if ( intersection ) {

									intersection.faceIndex = Math.floor( j / 3 ); // triangle number in non-indexed buffer semantics
									intersection.face.materialIndex = group.materialIndex;
									intersects.push( intersection );

								}

							}

						}

					} else {

						const start = Math.max( 0, drawRange.start );
						const end = Math.min( position.count, ( drawRange.start + drawRange.count ) );

						for ( let i = start, il = end; i < il; i += 3 ) {

							const a = i;
							const b = i + 1;
							const c = i + 2;

							intersection = checkBufferGeometryIntersection( this, material, raycaster, _ray, position, morphPosition, morphTargetsRelative, uv, uv2, a, b, c );

							if ( intersection ) {

								intersection.faceIndex = Math.floor( i / 3 ); // triangle number in non-indexed buffer semantics
								intersects.push( intersection );

							}

						}

					}

				}

			} else if ( geometry.isGeometry ) {

				const isMultiMaterial = Array.isArray( material );

				const vertices = geometry.vertices;
				const faces = geometry.faces;
				let uvs;

				const faceVertexUvs = geometry.faceVertexUvs[ 0 ];
				if ( faceVertexUvs.length > 0 ) uvs = faceVertexUvs;

				for ( let f = 0, fl = faces.length; f < fl; f ++ ) {

					const face = faces[ f ];
					const faceMaterial = isMultiMaterial ? material[ face.materialIndex ] : material;

					if ( faceMaterial === undefined ) continue;

					const fvA = vertices[ face.a ];
					const fvB = vertices[ face.b ];
					const fvC = vertices[ face.c ];

					intersection = checkIntersection( this, faceMaterial, raycaster, _ray, fvA, fvB, fvC, _intersectionPoint );

					if ( intersection ) {

						if ( uvs && uvs[ f ] ) {

							const uvs_f = uvs[ f ];
							_uvA.copy( uvs_f[ 0 ] );
							_uvB.copy( uvs_f[ 1 ] );
							_uvC.copy( uvs_f[ 2 ] );

							intersection.uv = Triangle.getUV( _intersectionPoint, fvA, fvB, fvC, _uvA, _uvB, _uvC, new Vector2() );

						}

						intersection.face = face;
						intersection.faceIndex = f;
						intersects.push( intersection );

					}

				}

			}

		}

	} );

	function checkIntersection( object, material, raycaster, ray, pA, pB, pC, point ) {

		let intersect;

		if ( material.side === BackSide ) {

			intersect = ray.intersectTriangle( pC, pB, pA, true, point );

		} else {

			intersect = ray.intersectTriangle( pA, pB, pC, material.side !== DoubleSide, point );

		}

		if ( intersect === null ) return null;

		_intersectionPointWorld.copy( point );
		_intersectionPointWorld.applyMatrix4( object.matrixWorld );

		const distance = raycaster.ray.origin.distanceTo( _intersectionPointWorld );

		if ( distance < raycaster.near || distance > raycaster.far ) return null;

		return {
			distance: distance,
			point: _intersectionPointWorld.clone(),
			object: object
		};

	}

	function checkBufferGeometryIntersection( object, material, raycaster, ray, position, morphPosition, morphTargetsRelative, uv, uv2, a, b, c ) {

		_vA.fromBufferAttribute( position, a );
		_vB.fromBufferAttribute( position, b );
		_vC.fromBufferAttribute( position, c );

		const morphInfluences = object.morphTargetInfluences;

		if ( material.morphTargets && morphPosition && morphInfluences ) {

			_morphA.set( 0, 0, 0 );
			_morphB.set( 0, 0, 0 );
			_morphC.set( 0, 0, 0 );

			for ( let i = 0, il = morphPosition.length; i < il; i ++ ) {

				const influence = morphInfluences[ i ];
				const morphAttribute = morphPosition[ i ];

				if ( influence === 0 ) continue;

				_tempA.fromBufferAttribute( morphAttribute, a );
				_tempB.fromBufferAttribute( morphAttribute, b );
				_tempC.fromBufferAttribute( morphAttribute, c );

				if ( morphTargetsRelative ) {

					_morphA.addScaledVector( _tempA, influence );
					_morphB.addScaledVector( _tempB, influence );
					_morphC.addScaledVector( _tempC, influence );

				} else {

					_morphA.addScaledVector( _tempA.sub( _vA ), influence );
					_morphB.addScaledVector( _tempB.sub( _vB ), influence );
					_morphC.addScaledVector( _tempC.sub( _vC ), influence );

				}

			}

			_vA.add( _morphA );
			_vB.add( _morphB );
			_vC.add( _morphC );

		}


		const intersection = checkIntersection( object, material, raycaster, ray, _vA, _vB, _vC, _intersectionPoint );

		if ( intersection ) {

			if ( uv ) {

				_uvA.fromBufferAttribute( uv, a );
				_uvB.fromBufferAttribute( uv, b );
				_uvC.fromBufferAttribute( uv, c );

				intersection.uv = Triangle.getUV( _intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2() );

			}

			if ( uv2 ) {

				_uvA.fromBufferAttribute( uv2, a );
				_uvB.fromBufferAttribute( uv2, b );
				_uvC.fromBufferAttribute( uv2, c );

				intersection.uv2 = Triangle.getUV( _intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2() );

			}

			const face = new Face3( a, b, c );
			Triangle.getNormal( _vA, _vB, _vC, face.normal );

			intersection.face = face;

		}

		return intersection;

	}

	let _geometryId = 0; // Geometry uses even numbers as Id
	const _m1$3 = new Matrix4();
	const _obj$1 = new Object3D();
	const _offset$1 = new Vector3();

	function Geometry() {

		Object.defineProperty( this, 'id', { value: _geometryId += 2 } );

		this.uuid = MathUtils.generateUUID();

		this.name = '';
		this.type = 'Geometry';

		this.vertices = [];
		this.colors = [];
		this.faces = [];
		this.faceVertexUvs = [[]];

		this.morphTargets = [];
		this.morphNormals = [];

		this.skinWeights = [];
		this.skinIndices = [];

		this.lineDistances = [];

		this.boundingBox = null;
		this.boundingSphere = null;

		// update flags

		this.elementsNeedUpdate = false;
		this.verticesNeedUpdate = false;
		this.uvsNeedUpdate = false;
		this.normalsNeedUpdate = false;
		this.colorsNeedUpdate = false;
		this.lineDistancesNeedUpdate = false;
		this.groupsNeedUpdate = false;

	}

	Geometry.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

		constructor: Geometry,

		isGeometry: true,

		applyMatrix4: function ( matrix ) {

			const normalMatrix = new Matrix3().getNormalMatrix( matrix );

			for ( let i = 0, il = this.vertices.length; i < il; i ++ ) {
				const vertex = this.vertices[ i ];
				vertex.applyMatrix4( matrix );
			}

			for ( let i = 0, il = this.faces.length; i < il; i ++ ) {
				const face = this.faces[ i ];
				face.normal.applyMatrix3( normalMatrix ).normalize();

				for ( let j = 0, jl = face.vertexNormals.length; j < jl; j ++ ) {
					face.vertexNormals[ j ].applyMatrix3( normalMatrix ).normalize();
				}
			}

			if ( this.boundingBox !== null ) {
				this.computeBoundingBox();
			}

			if ( this.boundingSphere !== null ) {
				this.computeBoundingSphere();
			}

			this.verticesNeedUpdate = true;
			this.normalsNeedUpdate = true;

			return this;
		},

		translate: function ( x, y, z ) {
			// translate geometry
			_m1$3.makeTranslation( x, y, z );
			this.applyMatrix4( _m1$3 );
			return this;
		},

		fromBufferGeometry: function ( geometry ) {

			const scope = this;

			const index = geometry.index !== null ? geometry.index : undefined;
			const attributes = geometry.attributes;

			if ( attributes.position === undefined ) {

				console.error( 'THREE.Geometry.fromBufferGeometry(): Position attribute required for conversion.' );
				return this;

			}
			const position = attributes.position;
			const normal = attributes.normal;
			const color = attributes.color;
			const uv = attributes.uv;
			const uv2 = attributes.uv2;

			if ( uv2 !== undefined ) this.faceVertexUvs[ 1 ] = [];

			for ( let i = 0; i < position.count; i ++ ) {

				scope.vertices.push( new Vector3().fromBufferAttribute( position, i ) );

				if ( color !== undefined ) {

					scope.colors.push( new Color().fromBufferAttribute( color, i ) );

				}

			}

			function addFace( a, b, c, materialIndex ) {

				const vertexColors = ( color === undefined ) ? [] : [
					scope.colors[ a ].clone(),
					scope.colors[ b ].clone(),
					scope.colors[ c ].clone()
				];

				const vertexNormals = ( normal === undefined ) ? [] : [
					new Vector3().fromBufferAttribute( normal, a ),
					new Vector3().fromBufferAttribute( normal, b ),
					new Vector3().fromBufferAttribute( normal, c )
				];

				const face = new Face3( a, b, c, vertexNormals, vertexColors, materialIndex );

				scope.faces.push( face );

				if ( uv !== undefined ) {

					scope.faceVertexUvs[ 0 ].push( [
						new Vector2().fromBufferAttribute( uv, a ),
						new Vector2().fromBufferAttribute( uv, b ),
						new Vector2().fromBufferAttribute( uv, c )
					] );

				}

				if ( uv2 !== undefined ) {

					scope.faceVertexUvs[ 1 ].push( [
						new Vector2().fromBufferAttribute( uv2, a ),
						new Vector2().fromBufferAttribute( uv2, b ),
						new Vector2().fromBufferAttribute( uv2, c )
					] );

				}

			}

			const groups = geometry.groups;

			if ( groups.length > 0 ) {

				for ( let i = 0; i < groups.length; i ++ ) {

					const group = groups[ i ];

					const start = group.start;
					const count = group.count;

					for ( let j = start, jl = start + count; j < jl; j += 3 ) {

						if ( index !== undefined ) {

							addFace( index.getX( j ), index.getX( j + 1 ), index.getX( j + 2 ), group.materialIndex );

						} else {

							addFace( j, j + 1, j + 2, group.materialIndex );

						}

					}

				}

			} else {

				if ( index !== undefined ) {

					for ( let i = 0; i < index.count; i += 3 ) {

						addFace( index.getX( i ), index.getX( i + 1 ), index.getX( i + 2 ) );

					}

				} else {

					for ( let i = 0; i < position.count; i += 3 ) {

						addFace( i, i + 1, i + 2 );

					}

				}

			}

			this.computeFaceNormals();

			if ( geometry.boundingBox !== null ) {

				this.boundingBox = geometry.boundingBox.clone();

			}

			if ( geometry.boundingSphere !== null ) {

				this.boundingSphere = geometry.boundingSphere.clone();

			}

			return this;

		},


		computeFaceNormals: function () {

			const cb = new Vector3(), ab = new Vector3();

			for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

				const face = this.faces[ f ];

				const vA = this.vertices[ face.a ];
				const vB = this.vertices[ face.b ];
				const vC = this.vertices[ face.c ];

				cb.subVectors( vC, vB );
				ab.subVectors( vA, vB );
				cb.cross( ab );

				cb.normalize();

				face.normal.copy( cb );

			}

		},

		computeVertexNormals: function ( areaWeighted ) {

			if ( areaWeighted === undefined ) areaWeighted = true;

			const vertices = new Array( this.vertices.length );

			for ( let v = 0, vl = this.vertices.length; v < vl; v ++ ) {

				vertices[ v ] = new Vector3();

			}

			if ( areaWeighted ) {

				// vertex normals weighted by triangle areas
				// http://www.iquilezles.org/www/articles/normals/normals.htm

				const cb = new Vector3(), ab = new Vector3();

				for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

					const face = this.faces[ f ];

					const vA = this.vertices[ face.a ];
					const vB = this.vertices[ face.b ];
					const vC = this.vertices[ face.c ];

					cb.subVectors( vC, vB );
					ab.subVectors( vA, vB );
					cb.cross( ab );

					vertices[ face.a ].add( cb );
					vertices[ face.b ].add( cb );
					vertices[ face.c ].add( cb );

				}

			} else {

				this.computeFaceNormals();

				for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

					const face = this.faces[ f ];

					vertices[ face.a ].add( face.normal );
					vertices[ face.b ].add( face.normal );
					vertices[ face.c ].add( face.normal );

				}

			}

			for ( let v = 0, vl = this.vertices.length; v < vl; v ++ ) {

				vertices[ v ].normalize();

			}

			for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

				const face = this.faces[ f ];

				const vertexNormals = face.vertexNormals;

				if ( vertexNormals.length === 3 ) {

					vertexNormals[ 0 ].copy( vertices[ face.a ] );
					vertexNormals[ 1 ].copy( vertices[ face.b ] );
					vertexNormals[ 2 ].copy( vertices[ face.c ] );

				} else {

					vertexNormals[ 0 ] = vertices[ face.a ].clone();
					vertexNormals[ 1 ] = vertices[ face.b ].clone();
					vertexNormals[ 2 ] = vertices[ face.c ].clone();

				}

			}

			if ( this.faces.length > 0 ) {

				this.normalsNeedUpdate = true;

			}

		},

		computeFlatVertexNormals: function () {

			this.computeFaceNormals();

			for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

				const face = this.faces[ f ];

				const vertexNormals = face.vertexNormals;

				if ( vertexNormals.length === 3 ) {

					vertexNormals[ 0 ].copy( face.normal );
					vertexNormals[ 1 ].copy( face.normal );
					vertexNormals[ 2 ].copy( face.normal );

				} else {

					vertexNormals[ 0 ] = face.normal.clone();
					vertexNormals[ 1 ] = face.normal.clone();
					vertexNormals[ 2 ] = face.normal.clone();

				}

			}

			if ( this.faces.length > 0 ) {

				this.normalsNeedUpdate = true;

			}

		},

		computeMorphNormals: function () {

			// save original normals
			// - create temp variables on first access
			//   otherwise just copy (for faster repeated calls)

			for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

				const face = this.faces[ f ];

				if ( ! face.__originalFaceNormal ) {

					face.__originalFaceNormal = face.normal.clone();

				} else {

					face.__originalFaceNormal.copy( face.normal );

				}

				if ( ! face.__originalVertexNormals ) face.__originalVertexNormals = [];

				for ( let i = 0, il = face.vertexNormals.length; i < il; i ++ ) {

					if ( ! face.__originalVertexNormals[ i ] ) {

						face.__originalVertexNormals[ i ] = face.vertexNormals[ i ].clone();

					} else {

						face.__originalVertexNormals[ i ].copy( face.vertexNormals[ i ] );

					}

				}

			}

			// use temp geometry to compute face and vertex normals for each morph

			const tmpGeo = new Geometry();
			tmpGeo.faces = this.faces;

			for ( let i = 0, il = this.morphTargets.length; i < il; i ++ ) {

				// create on first access

				if ( ! this.morphNormals[ i ] ) {

					this.morphNormals[ i ] = {};
					this.morphNormals[ i ].faceNormals = [];
					this.morphNormals[ i ].vertexNormals = [];

					const dstNormalsFace = this.morphNormals[ i ].faceNormals;
					const dstNormalsVertex = this.morphNormals[ i ].vertexNormals;

					for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

						const faceNormal = new Vector3();
						const vertexNormals = { a: new Vector3(), b: new Vector3(), c: new Vector3() };

						dstNormalsFace.push( faceNormal );
						dstNormalsVertex.push( vertexNormals );

					}

				}

				const morphNormals = this.morphNormals[ i ];

				// set vertices to morph target

				tmpGeo.vertices = this.morphTargets[ i ].vertices;

				// compute morph normals

				tmpGeo.computeFaceNormals();
				tmpGeo.computeVertexNormals();

				// store morph normals

				for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

					const face = this.faces[ f ];

					const faceNormal = morphNormals.faceNormals[ f ];
					const vertexNormals = morphNormals.vertexNormals[ f ];

					faceNormal.copy( face.normal );

					vertexNormals.a.copy( face.vertexNormals[ 0 ] );
					vertexNormals.b.copy( face.vertexNormals[ 1 ] );
					vertexNormals.c.copy( face.vertexNormals[ 2 ] );

				}

			}

			// restore original normals

			for ( let f = 0, fl = this.faces.length; f < fl; f ++ ) {

				const face = this.faces[ f ];

				face.normal = face.__originalFaceNormal;
				face.vertexNormals = face.__originalVertexNormals;

			}

		},

		/*
		 * Checks for duplicate vertices with hashmap.
		 * Duplicated vertices are removed
		 * and faces' vertices are updated.
		 */

		mergeVertices: function () {

			const verticesMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
			const unique = [], changes = [];

			const precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
			const precision = Math.pow( 10, precisionPoints );

			for ( let i = 0, il = this.vertices.length; i < il; i ++ ) {

				const v = this.vertices[ i ];
				const key = Math.round( v.x * precision ) + '_' + Math.round( v.y * precision ) + '_' + Math.round( v.z * precision );

				if ( verticesMap[ key ] === undefined ) {

					verticesMap[ key ] = i;
					unique.push( this.vertices[ i ] );
					changes[ i ] = unique.length - 1;

				} else {

					//console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
					changes[ i ] = changes[ verticesMap[ key ] ];

				}

			}


			// if faces are completely degenerate after merging vertices, we
			// have to remove them from the geometry.
			const faceIndicesToRemove = [];

			for ( let i = 0, il = this.faces.length; i < il; i ++ ) {

				const face = this.faces[ i ];

				face.a = changes[ face.a ];
				face.b = changes[ face.b ];
				face.c = changes[ face.c ];

				const indices = [ face.a, face.b, face.c ];

				// if any duplicate vertices are found in a Face3
				// we have to remove the face as nothing can be saved
				for ( let n = 0; n < 3; n ++ ) {

					if ( indices[ n ] === indices[ ( n + 1 ) % 3 ] ) {

						faceIndicesToRemove.push( i );
						break;

					}

				}

			}

			for ( let i = faceIndicesToRemove.length - 1; i >= 0; i -- ) {

				const idx = faceIndicesToRemove[ i ];

				this.faces.splice( idx, 1 );

				for ( let j = 0, jl = this.faceVertexUvs.length; j < jl; j ++ ) {

					this.faceVertexUvs[ j ].splice( idx, 1 );

				}

			}

			// Use unique set of vertices

			const diff = this.vertices.length - unique.length;
			this.vertices = unique;
			return diff;

		},

		clone: function () {return new Geometry().copy( this );		},

		copy: function ( source ) {
			// reset
			this.vertices = [];
			this.colors = [];
			this.faces = [];
			this.faceVertexUvs = [[]];
			this.morphTargets = [];
			this.morphNormals = [];
			this.skinWeights = [];
			this.skinIndices = [];
			this.lineDistances = [];
			this.boundingBox = null;
			this.boundingSphere = null;

			this.name = source.name;
			const vertices = source.vertices;

			for ( let i = 0, il = vertices.length; i < il; i ++ ) {
				this.vertices.push( vertices[ i ].clone() );
			}

			const colors = source.colors;

			for ( let i = 0, il = colors.length; i < il; i ++ ) {
				this.colors.push( colors[ i ].clone() );
			}

			const faces = source.faces;

			for ( let i = 0, il = faces.length; i < il; i ++ ) {
				this.faces.push( faces[ i ].clone() );
			}

			for ( let i = 0, il = source.faceVertexUvs.length; i < il; i ++ ) {
				const faceVertexUvs = source.faceVertexUvs[ i ];

				if ( this.faceVertexUvs[ i ] === undefined ) {
					this.faceVertexUvs[ i ] = [];
				}

				for ( let j = 0, jl = faceVertexUvs.length; j < jl; j ++ ) {

					const uvs = faceVertexUvs[ j ], uvsCopy = [];

					for ( let k = 0, kl = uvs.length; k < kl; k ++ ) {

						const uv = uvs[ k ];

						uvsCopy.push( uv.clone() );

					}

					this.faceVertexUvs[ i ].push( uvsCopy );

				}

			}

			// morph targets

			const morphTargets = source.morphTargets;

			for ( let i = 0, il = morphTargets.length; i < il; i ++ ) {

				const morphTarget = {};
				morphTarget.name = morphTargets[ i ].name;

				// vertices

				if ( morphTargets[ i ].vertices !== undefined ) {

					morphTarget.vertices = [];

					for ( let j = 0, jl = morphTargets[ i ].vertices.length; j < jl; j ++ ) {

						morphTarget.vertices.push( morphTargets[ i ].vertices[ j ].clone() );

					}

				}

				// normals

				if ( morphTargets[ i ].normals !== undefined ) {

					morphTarget.normals = [];

					for ( let j = 0, jl = morphTargets[ i ].normals.length; j < jl; j ++ ) {

						morphTarget.normals.push( morphTargets[ i ].normals[ j ].clone() );

					}

				}

				this.morphTargets.push( morphTarget );

			}

			// morph normals

			const morphNormals = source.morphNormals;

			for ( let i = 0, il = morphNormals.length; i < il; i ++ ) {

				const morphNormal = {};

				// vertex normals

				if ( morphNormals[ i ].vertexNormals !== undefined ) {

					morphNormal.vertexNormals = [];

					for ( let j = 0, jl = morphNormals[ i ].vertexNormals.length; j < jl; j ++ ) {

						const srcVertexNormal = morphNormals[ i ].vertexNormals[ j ];
						const destVertexNormal = {};

						destVertexNormal.a = srcVertexNormal.a.clone();
						destVertexNormal.b = srcVertexNormal.b.clone();
						destVertexNormal.c = srcVertexNormal.c.clone();

						morphNormal.vertexNormals.push( destVertexNormal );

					}

				}

				// face normals

				if ( morphNormals[ i ].faceNormals !== undefined ) {

					morphNormal.faceNormals = [];

					for ( let j = 0, jl = morphNormals[ i ].faceNormals.length; j < jl; j ++ ) {

						morphNormal.faceNormals.push( morphNormals[ i ].faceNormals[ j ].clone() );

					}

				}

				this.morphNormals.push( morphNormal );

			}

			// skin weights

			const skinWeights = source.skinWeights;

			for ( let i = 0, il = skinWeights.length; i < il; i ++ ) {

				this.skinWeights.push( skinWeights[ i ].clone() );

			}

			// skin indices

			const skinIndices = source.skinIndices;

			for ( let i = 0, il = skinIndices.length; i < il; i ++ ) {

				this.skinIndices.push( skinIndices[ i ].clone() );

			}

			// line distances

			const lineDistances = source.lineDistances;

			for ( let i = 0, il = lineDistances.length; i < il; i ++ ) {

				this.lineDistances.push( lineDistances[ i ] );

			}

			// bounding box

			const boundingBox = source.boundingBox;

			if ( boundingBox !== null ) {

				this.boundingBox = boundingBox.clone();

			}

			// bounding sphere

			const boundingSphere = source.boundingSphere;

			if ( boundingSphere !== null ) {

				this.boundingSphere = boundingSphere.clone();

			}

			// update flags

			this.elementsNeedUpdate = source.elementsNeedUpdate;
			this.verticesNeedUpdate = source.verticesNeedUpdate;
			this.uvsNeedUpdate = source.uvsNeedUpdate;
			this.normalsNeedUpdate = source.normalsNeedUpdate;
			this.colorsNeedUpdate = source.colorsNeedUpdate;
			this.lineDistancesNeedUpdate = source.lineDistancesNeedUpdate;
			this.groupsNeedUpdate = source.groupsNeedUpdate;

			return this;

		},

		dispose: function () {

			this.dispatchEvent( { type: 'dispose' } );

		}

	} );


	/**
	 * Uniform Utilities
	 */

	function cloneUniforms( src ) {
		const dst = {};
		for ( const u in src ) {
			dst[ u ] = {};

			for ( const p in src[ u ] ) {
				const property = src[ u ][ p ];

				if ( property && ( property.isColor ||
					property.isMatrix3 || property.isMatrix4 ||
					property.isVector2 || property.isVector3 || property.isVector4 ||
					property.isTexture ) ) {
					dst[ u ][ p ] = property.clone();
				} else if ( Array.isArray( property ) ) {
					dst[ u ][ p ] = property.slice();
				} else {
					dst[ u ][ p ] = property;
				}
			}
		}
		return dst;
	}

	function mergeUniforms( uniforms ) {

		const merged = {};

		for ( let u = 0; u < uniforms.length; u ++ ) {
			const tmp = cloneUniforms( uniforms[ u ] );

			for ( const p in tmp ) {
				merged[ p ] = tmp[ p ];
			}
		}
		return merged;
	}

	// Legacy

	const UniformsUtils = { clone: cloneUniforms, merge: mergeUniforms };

	var default_vertex = "void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

	var default_fragment = "void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}";

	function ShaderMaterial( parameters ) {

		Material.call( this );

		this.type = 'ShaderMaterial';

		this.defines = {};
		this.uniforms = {};

		this.vertexShader = default_vertex;
		this.fragmentShader = default_fragment;

		this.linewidth = 1;

		this.wireframe = false;
		this.wireframeLinewidth = 1;

		this.fog = false; // set to use scene fog
		this.lights = false; // set to use scene lights
		this.clipping = false; // set to use user-defined clipping planes

		this.skinning = false; // set to use skinning attribute streams
		this.morphTargets = false; // set to use morph targets
		this.morphNormals = false; // set to use morph normals

		this.extensions = {
			derivatives: false, // set to use derivatives
			fragDepth: false, // set to use fragment depth values
			drawBuffers: false, // set to use draw buffers
			shaderTextureLOD: false // set to use shader texture LOD
		};

		// When rendered geometry doesn't include these attributes but the material does,
		// use these default values in WebGL. This avoids errors when buffer data is missing.
		this.defaultAttributeValues = {
			'color': [ 1, 1, 1 ],
			'uv': [ 0, 0 ],
			'uv2': [ 0, 0 ]
		};

		this.index0AttributeName = undefined;
		this.uniformsNeedUpdate = false;

		this.glslVersion = null;

		if ( parameters !== undefined ) {

			if ( parameters.attributes !== undefined ) {

				console.error( 'THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead.' );

			}

			this.setValues( parameters );

		}

	}

	ShaderMaterial.prototype = Object.create( Material.prototype );
	ShaderMaterial.prototype.constructor = ShaderMaterial;

	ShaderMaterial.prototype.isShaderMaterial = true;

	ShaderMaterial.prototype.copy = function ( source ) {

		Material.prototype.copy.call( this, source );

		this.fragmentShader = source.fragmentShader;
		this.vertexShader = source.vertexShader;

		this.uniforms = cloneUniforms( source.uniforms );

		this.defines = Object.assign( {}, source.defines );

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;

		this.lights = source.lights;
		this.clipping = source.clipping;

		this.skinning = source.skinning;

		this.morphTargets = source.morphTargets;
		this.morphNormals = source.morphNormals;

		this.extensions = Object.assign( {}, source.extensions );

		this.glslVersion = source.glslVersion;

		return this;

	};

	ShaderMaterial.prototype.toJSON = function ( meta ) {

		const data = Material.prototype.toJSON.call( this, meta );

		data.glslVersion = this.glslVersion;
		data.uniforms = {};

		for ( const name in this.uniforms ) {

			const uniform = this.uniforms[ name ];
			const value = uniform.value;

			if ( value && value.isTexture ) {

				data.uniforms[ name ] = {
					type: 't',
					value: value.toJSON( meta ).uuid
				};

			} else if ( value && value.isColor ) {

				data.uniforms[ name ] = {
					type: 'c',
					value: value.getHex()
				};

			} else if ( value && value.isVector2 ) {

				data.uniforms[ name ] = {
					type: 'v2',
					value: value.toArray()
				};

			} else if ( value && value.isVector3 ) {

				data.uniforms[ name ] = {
					type: 'v3',
					value: value.toArray()
				};

			} else if ( value && value.isVector4 ) {

				data.uniforms[ name ] = {
					type: 'v4',
					value: value.toArray()
				};

			} else if ( value && value.isMatrix3 ) {

				data.uniforms[ name ] = {
					type: 'm3',
					value: value.toArray()
				};

			} else if ( value && value.isMatrix4 ) {

				data.uniforms[ name ] = {
					type: 'm4',
					value: value.toArray()
				};

			} else {

				data.uniforms[ name ] = {
					value: value
				};

				// note: the array variants v2v, v3v, v4v, m4v and tv are not supported so far

			}

		}

		if ( Object.keys( this.defines ).length > 0 ) data.defines = this.defines;

		data.vertexShader = this.vertexShader;
		data.fragmentShader = this.fragmentShader;

		const extensions = {};

		for ( const key in this.extensions ) {
			if ( this.extensions[ key ] === true ) extensions[ key ] = true;
		}

		if ( Object.keys( extensions ).length > 0 ) data.extensions = extensions;
		return data;
	};

	function Camera() {
		Object3D.call( this );
		this.type = 'Camera';
		this.matrixWorldInverse = new Matrix4();
		this.projectionMatrix = new Matrix4();
		this.projectionMatrixInverse = new Matrix4();
	}

	Camera.prototype = Object.assign( Object.create( Object3D.prototype ), {
		constructor: Camera,
		isCamera: true,

		copy: function ( source, recursive ) {
			Object3D.prototype.copy.call( this, source, recursive );
			this.matrixWorldInverse.copy( source.matrixWorldInverse );
			this.projectionMatrix.copy( source.projectionMatrix );
			this.projectionMatrixInverse.copy( source.projectionMatrixInverse );
			return this;
		},

		getWorldDirection: function ( target ) {

			if ( target === undefined ) {
				console.warn( 'THREE.Camera: .getWorldDirection() target is now required' );
				target = new Vector3();
			}

			this.updateMatrixWorld( true );
			const e = this.matrixWorld.elements;
			return target.set( - e[ 8 ], - e[ 9 ], - e[ 10 ] ).normalize();
		},

		updateMatrixWorld: function ( force ) {
			Object3D.prototype.updateMatrixWorld.call( this, force );
			this.matrixWorldInverse.getInverse( this.matrixWorld );
		},

		updateWorldMatrix: function ( updateParents, updateChildren ) {
			Object3D.prototype.updateWorldMatrix.call( this, updateParents, updateChildren );
			this.matrixWorldInverse.getInverse( this.matrixWorld );
		},

		clone: function () {return new this.constructor().copy( this );}

	} );

	function PerspectiveCamera( fov, aspect, near, far ) {

		Camera.call( this );

		this.type = 'PerspectiveCamera';

		this.fov = fov !== undefined ? fov : 50;
		this.zoom = 1;

		this.near = near !== undefined ? near : 0.1;
		this.far = far !== undefined ? far : 2000;
		this.focus = 10;

		this.aspect = aspect !== undefined ? aspect : 1;
		this.view = null;

		this.filmGauge = 35;	// width of the film (default in millimeters)
		this.filmOffset = 0;	// horizontal film offset (same unit as gauge)

		this.updateProjectionMatrix();

	}

	PerspectiveCamera.prototype = Object.assign( Object.create( Camera.prototype ), {

		constructor: PerspectiveCamera,

		isPerspectiveCamera: true,

		copy: function ( source, recursive ) {
			Camera.prototype.copy.call( this, source, recursive );

			this.fov = source.fov;
			this.zoom = source.zoom;

			this.near = source.near;
			this.far = source.far;
			this.focus = source.focus;

			this.aspect = source.aspect;
			this.view = source.view === null ? null : Object.assign( {}, source.view );

			this.filmGauge = source.filmGauge;
			this.filmOffset = source.filmOffset;

			return this;
		},


		getFilmWidth: function () {
			// film not completely covered in portrait format (aspect < 1)
			return this.filmGauge * Math.min( this.aspect, 1 );
		},

		updateProjectionMatrix: function () {

			const near = this.near;
			let top = near * Math.tan( MathUtils.DEG2RAD * 0.5 * this.fov ) / this.zoom;
			let height = 2 * top;
			let width = this.aspect * height;
			let left = - 0.5 * width;
			const view = this.view;

			if ( this.view !== null && this.view.enabled ) {

				const fullWidth = view.fullWidth,
					fullHeight = view.fullHeight;

				left += view.offsetX * width / fullWidth;
				top -= view.offsetY * height / fullHeight;
				width *= view.width / fullWidth;
				height *= view.height / fullHeight;

			}

			const skew = this.filmOffset;
			if ( skew !== 0 ) left += near * skew / this.getFilmWidth();

			this.projectionMatrix.makePerspective( left, left + width, top, top - height, near, this.far );

			this.projectionMatrixInverse.getInverse( this.projectionMatrix );

		}

	} );

	const fov = 90, aspect = 1;


	function WebGLCubeRenderTarget( size, options, dummy ) {

		if ( Number.isInteger( options ) ) {

			console.warn( 'THREE.WebGLCubeRenderTarget: constructor signature is now WebGLCubeRenderTarget( size, options )' );

			options = dummy;

		}

		WebGLRenderTarget.call( this, size, size, options );

		this.texture.isWebGLCubeRenderTargetTexture = true; // HACK Why is texture not a CubeTexture?

	}

	WebGLCubeRenderTarget.prototype = Object.create( WebGLRenderTarget.prototype );
	WebGLCubeRenderTarget.prototype.constructor = WebGLCubeRenderTarget;

	WebGLCubeRenderTarget.prototype.isWebGLCubeRenderTarget = true;


	function DataTexture( data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding ) {

		Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

		this.image = { data: data || null, width: width || 1, height: height || 1 };

		this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
		this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

		this.needsUpdate = true;

	}

	DataTexture.prototype = Object.create( Texture.prototype );
	DataTexture.prototype.constructor = DataTexture;

	DataTexture.prototype.isDataTexture = true;

	const _sphere$1 = new Sphere();
	const _vector$5 = new Vector3();

	class Frustum {

		constructor( p0, p1, p2, p3, p4, p5 ) {
			this.planes = [
				( p0 !== undefined ) ? p0 : new Plane(),
				( p1 !== undefined ) ? p1 : new Plane(),
				( p2 !== undefined ) ? p2 : new Plane(),
				( p3 !== undefined ) ? p3 : new Plane(),
				( p4 !== undefined ) ? p4 : new Plane(),
				( p5 !== undefined ) ? p5 : new Plane()
			];
		}

		set( p0, p1, p2, p3, p4, p5 ) {
			const planes = this.planes;
			planes[ 0 ].copy( p0 );
			planes[ 1 ].copy( p1 );
			planes[ 2 ].copy( p2 );
			planes[ 3 ].copy( p3 );
			planes[ 4 ].copy( p4 );
			planes[ 5 ].copy( p5 );
			return this;
		}

		clone() {return new this.constructor().copy( this );}

		copy( frustum ) {
			const planes = this.planes;
			for ( let i = 0; i < 6; i ++ ) {
				planes[ i ].copy( frustum.planes[ i ] );
			}
			return this;
		}

		setFromProjectionMatrix( m ) {

			const planes = this.planes;
			const me = m.elements;
			const me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
			const me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
			const me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
			const me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

			planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
			planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
			planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
			planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();
			planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize();
			planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 ).normalize();

			return this;

		}

		intersectsObject( object ) {

			const geometry = object.geometry;

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			_sphere$1.copy( geometry.boundingSphere ).applyMatrix4( object.matrixWorld );

			return this.intersectsSphere( _sphere$1 );

		}

		intersectsSprite( sprite ) {

			_sphere$1.center.set( 0, 0, 0 );
			_sphere$1.radius = 0.7071067811865476;
			_sphere$1.applyMatrix4( sprite.matrixWorld );

			return this.intersectsSphere( _sphere$1 );

		}

		intersectsSphere( sphere ) {

			const planes = this.planes;
			const center = sphere.center;
			const negRadius = - sphere.radius;

			for ( let i = 0; i < 6; i ++ ) {

				const distance = planes[ i ].distanceToPoint( center );

				if ( distance < negRadius ) {

					return false;

				}

			}

			return true;

		}

		intersectsBox( box ) {

			const planes = this.planes;

			for ( let i = 0; i < 6; i ++ ) {

				const plane = planes[ i ];

				// corner at max distance

				_vector$5.x = plane.normal.x > 0 ? box.max.x : box.min.x;
				_vector$5.y = plane.normal.y > 0 ? box.max.y : box.min.y;
				_vector$5.z = plane.normal.z > 0 ? box.max.z : box.min.z;

				if ( plane.distanceToPoint( _vector$5 ) < 0 ) {

					return false;

				}

			}

			return true;

		}
	}

	function WebGLAttributes( gl, capabilities ) {

		const isWebGL2 = capabilities.isWebGL2;

		const buffers = new WeakMap();

		function createBuffer( attribute, bufferType ) {

			const array = attribute.array;
			const usage = attribute.usage;

			const buffer = gl.createBuffer();

			gl.bindBuffer( bufferType, buffer );
			gl.bufferData( bufferType, array, usage );

			attribute.onUploadCallback();

			let type = 5126;

			if ( array instanceof Float32Array ) {

				type = 5126;

			} else if ( array instanceof Float64Array ) {

				console.warn( 'THREE.WebGLAttributes: Unsupported data buffer format: Float64Array.' );

			} else if ( array instanceof Uint16Array ) {

				type = 5123;

			} else if ( array instanceof Int16Array ) {

				type = 5122;

			} else if ( array instanceof Uint32Array ) {

				type = 5125;

			} else if ( array instanceof Int32Array ) {

				type = 5124;

			} else if ( array instanceof Int8Array ) {

				type = 5120;

			} else if ( array instanceof Uint8Array ) {

				type = 5121;

			}

			return {
				buffer: buffer,
				type: type,
				bytesPerElement: array.BYTES_PER_ELEMENT,
				version: attribute.version
			};

		}

		function updateBuffer( buffer, attribute, bufferType ) {

			const array = attribute.array;
			const updateRange = attribute.updateRange;

			gl.bindBuffer( bufferType, buffer );

			if ( updateRange.count === - 1 ) {

				// Not using update ranges

				gl.bufferSubData( bufferType, 0, array );

			} else {

				if ( isWebGL2 ) {

					gl.bufferSubData( bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
						array, updateRange.offset, updateRange.count );

				} else {

					gl.bufferSubData( bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
						array.subarray( updateRange.offset, updateRange.offset + updateRange.count ) );

				}

				updateRange.count = - 1; // reset range

			}

		}

		//

		function get( attribute ) {

			if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

			return buffers.get( attribute );

		}

		function remove( attribute ) {

			if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

			const data = buffers.get( attribute );

			if ( data ) {

				gl.deleteBuffer( data.buffer );

				buffers.delete( attribute );

			}

		}

		function update( attribute, bufferType ) {

			if ( attribute.isGLBufferAttribute ) {

				var cached = buffers.get( attribute );

				if ( ! cached || cached.version < attribute.version ) {

					buffers.set( attribute, {
						buffer: attribute.buffer,
						type: attribute.type,
						bytesPerElement: attribute.elementSize,
						version: attribute.version
					} );

				}

				return;

			}

			if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

			const data = buffers.get( attribute );

			if ( data === undefined ) {

				buffers.set( attribute, createBuffer( attribute, bufferType ) );

			} else if ( data.version < attribute.version ) {

				updateBuffer( data.buffer, attribute, bufferType );

				data.version = attribute.version;

			}

		}

		return {

			get: get,
			remove: remove,
			update: update

		};

	}


	// PlaneGeometry

	class PlaneGeometry extends Geometry {

		constructor( width, height, widthSegments, heightSegments ) {

			super();

			this.type = 'PlaneGeometry';

			this.parameters = {
				width: width,
				height: height,
				widthSegments: widthSegments,
				heightSegments: heightSegments
			};

			this.fromBufferGeometry( new PlaneBufferGeometry( width, height, widthSegments, heightSegments ) );
			this.mergeVertices();

		}

	}

	// PlaneBufferGeometry

	class PlaneBufferGeometry extends BufferGeometry {

		constructor( width, height, widthSegments, heightSegments ) {

			super();
			this.type = 'PlaneBufferGeometry';

			this.parameters = {
				width: width,
				height: height,
				widthSegments: widthSegments,
				heightSegments: heightSegments
			};

			width = width || 1;
			height = height || 1;

			const width_half = width / 2;
			const height_half = height / 2;

			const gridX = Math.floor( widthSegments ) || 1;
			const gridY = Math.floor( heightSegments ) || 1;

			const gridX1 = gridX + 1;
			const gridY1 = gridY + 1;

			const segment_width = width / gridX;
			const segment_height = height / gridY;

			// buffers

			const indices = [];
			const vertices = [];
			const normals = [];
			const uvs = [];

			// generate vertices, normals and uvs

			for ( let iy = 0; iy < gridY1; iy ++ ) {

				const y = iy * segment_height - height_half;

				for ( let ix = 0; ix < gridX1; ix ++ ) {

					const x = ix * segment_width - width_half;

					vertices.push( x, - y, 0 );

					normals.push( 0, 0, 1 );

					uvs.push( ix / gridX );
					uvs.push( 1 - ( iy / gridY ) );

				}

			}

			// indices

			for ( let iy = 0; iy < gridY; iy ++ ) {

				for ( let ix = 0; ix < gridX; ix ++ ) {

					const a = ix + gridX1 * iy;
					const b = ix + gridX1 * ( iy + 1 );
					const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
					const d = ( ix + 1 ) + gridX1 * iy;

					// faces

					indices.push( a, b, d );
					indices.push( b, c, d );

				}

			}

			// build geometry

			this.setIndex( indices );
			this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
			this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
			this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

		}

	}

	var alphamap_fragment = "#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, vUv ).g;\n#endif";
	var alphamap_pars_fragment = "#ifdef USE_ALPHAMAP\n\tuniform sampler2D alphaMap;\n#endif";
	var alphatest_fragment = "#ifdef ALPHATEST\n\tif ( diffuseColor.a < ALPHATEST ) discard;\n#endif";
	var aomap_fragment = "#ifdef USE_AOMAP\n\tfloat ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;\n\treflectedLight.indirectDiffuse *= ambientOcclusion;\n\t#if defined( USE_ENVMAP ) && defined( STANDARD )\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\treflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );\n\t#endif\n#endif";
	var aomap_pars_fragment = "#ifdef USE_AOMAP\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n#endif";
	var begin_vertex = "vec3 transformed = vec3( position );";
	var beginnormal_vertex = "vec3 objectNormal = vec3( normal );\n#ifdef USE_TANGENT\n\tvec3 objectTangent = vec3( tangent.xyz );\n#endif";
	var bsdfs = "vec2 integrateSpecularBRDF( const in float dotNV, const in float roughness ) {\n\tconst vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n\tconst vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n\tvec4 r = roughness * c0 + c1;\n\tfloat a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n\treturn vec2( -1.04, 1.04 ) * a004 + r.zw;\n}\nfloat punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n#if defined ( PHYSICALLY_CORRECT_LIGHTS )\n\tfloat distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n\tif( cutoffDistance > 0.0 ) {\n\t\tdistanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n\t}\n\treturn distanceFalloff;\n#else\n\tif( cutoffDistance > 0.0 && decayExponent > 0.0 ) {\n\t\treturn pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );\n\t}\n\treturn 1.0;\n#endif\n}\nvec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {\n\treturn RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {\n\tfloat fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );\n\treturn ( 1.0 - specularColor ) * fresnel + specularColor;\n}\nvec3 F_Schlick_RoughnessDependent( const in vec3 F0, const in float dotNV, const in float roughness ) {\n\tfloat fresnel = exp2( ( -5.55473 * dotNV - 6.98316 ) * dotNV );\n\tvec3 Fr = max( vec3( 1.0 - roughness ), F0 ) - F0;\n\treturn Fr * fresnel + F0;\n}\nfloat G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\tfloat gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\treturn 1.0 / ( gl * gv );\n}\nfloat G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\tfloat gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\treturn 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n\tfloat a2 = pow2( alpha );\n\tfloat denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n\treturn RECIPROCAL_PI * a2 / pow2( denom );\n}\nvec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {\n\tfloat alpha = pow2( roughness );\n\tvec3 halfDir = normalize( incidentLight.direction + viewDir );\n\tfloat dotNL = saturate( dot( normal, incidentLight.direction ) );\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\tfloat dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n\tfloat D = D_GGX( alpha, dotNH );\n\treturn F * ( G * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n\tconst float LUT_SIZE = 64.0;\n\tconst float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n\tconst float LUT_BIAS = 0.5 / LUT_SIZE;\n\tfloat dotNV = saturate( dot( N, V ) );\n\tvec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );\n\tuv = uv * LUT_SCALE + LUT_BIAS;\n\treturn uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n\tfloat l = length( f );\n\treturn max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n\tfloat x = dot( v1, v2 );\n\tfloat y = abs( x );\n\tfloat a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;\n\tfloat b = 3.4175940 + ( 4.1616724 + y ) * y;\n\tfloat v = a / b;\n\tfloat theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;\n\treturn cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n\tvec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n\tvec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n\tvec3 lightNormal = cross( v1, v2 );\n\tif( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n\tvec3 T1, T2;\n\tT1 = normalize( V - N * dot( V, N ) );\n\tT2 = - cross( N, T1 );\n\tmat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );\n\tvec3 coords[ 4 ];\n\tcoords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n\tcoords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n\tcoords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n\tcoords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n\tcoords[ 0 ] = normalize( coords[ 0 ] );\n\tcoords[ 1 ] = normalize( coords[ 1 ] );\n\tcoords[ 2 ] = normalize( coords[ 2 ] );\n\tcoords[ 3 ] = normalize( coords[ 3 ] );\n\tvec3 vectorFormFactor = vec3( 0.0 );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n\tfloat result = LTC_ClippedSphereFormFactor( vectorFormFactor );\n\treturn vec3( result );\n}\nvec3 BRDF_Specular_GGX_Environment( const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tvec2 brdf = integrateSpecularBRDF( dotNV, roughness );\n\treturn specularColor * brdf.x + brdf.y;\n}\nvoid BRDF_Specular_Multiscattering_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {\n\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\tvec3 F = F_Schlick_RoughnessDependent( specularColor, dotNV, roughness );\n\tvec2 brdf = integrateSpecularBRDF( dotNV, roughness );\n\tvec3 FssEss = F * brdf.x + brdf.y;\n\tfloat Ess = brdf.x + brdf.y;\n\tfloat Ems = 1.0 - Ess;\n\tvec3 Favg = specularColor + ( 1.0 - specularColor ) * 0.047619;\tvec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );\n\tsingleScatter += FssEss;\n\tmultiScatter += Fms * Ems;\n}\nfloat G_BlinnPhong_Implicit( ) {\n\treturn 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n\treturn RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {\n\tvec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n\tfloat dotNH = saturate( dot( geometry.normal, halfDir ) );\n\tfloat dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_BlinnPhong_Implicit( );\n\tfloat D = D_BlinnPhong( shininess, dotNH );\n\treturn F * ( G * D );\n}\nfloat GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {\n\treturn ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );\n}\nfloat BlinnExponentToGGXRoughness( const in float blinnExponent ) {\n\treturn sqrt( 2.0 / ( blinnExponent + 2.0 ) );\n}\n#if defined( USE_SHEEN )\nfloat D_Charlie(float roughness, float NoH) {\n\tfloat invAlpha = 1.0 / roughness;\n\tfloat cos2h = NoH * NoH;\n\tfloat sin2h = max(1.0 - cos2h, 0.0078125);\treturn (2.0 + invAlpha) * pow(sin2h, invAlpha * 0.5) / (2.0 * PI);\n}\nfloat V_Neubelt(float NoV, float NoL) {\n\treturn saturate(1.0 / (4.0 * (NoL + NoV - NoL * NoV)));\n}\nvec3 BRDF_Specular_Sheen( const in float roughness, const in vec3 L, const in GeometricContext geometry, vec3 specularColor ) {\n\tvec3 N = geometry.normal;\n\tvec3 V = geometry.viewDir;\n\tvec3 H = normalize( V + L );\n\tfloat dotNH = saturate( dot( N, H ) );\n\treturn specularColor * D_Charlie( roughness, dotNH ) * V_Neubelt( dot(N, V), dot(N, L) );\n}\n#endif";
	var bumpmap_pars_fragment = "#ifdef USE_BUMPMAP\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\tvec2 dHdxy_fwd() {\n\t\tvec2 dSTdx = dFdx( vUv );\n\t\tvec2 dSTdy = dFdy( vUv );\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\t\treturn vec2( dBx, dBy );\n\t}\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n\t\tvec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );\n\t\tvec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\t\tfloat fDet = dot( vSigmaX, R1 );\n\t\tfDet *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\t}\n#endif";
	var clipping_planes_fragment = "#if NUM_CLIPPING_PLANES > 0\n\tvec4 plane;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n\t\tplane = clippingPlanes[ i ];\n\t\tif ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;\n\t}\n\t#pragma unroll_loop_end\n\t#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n\t\tbool clipped = true;\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n\t\t\tplane = clippingPlanes[ i ];\n\t\t\tclipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t\tif ( clipped ) discard;\n\t#endif\n#endif";
	var clipping_planes_pars_fragment = "#if NUM_CLIPPING_PLANES > 0\n\tvarying vec3 vClipPosition;\n\tuniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif";
	var clipping_planes_pars_vertex = "#if NUM_CLIPPING_PLANES > 0\n\tvarying vec3 vClipPosition;\n#endif";
	var clipping_planes_vertex = "#if NUM_CLIPPING_PLANES > 0\n\tvClipPosition = - mvPosition.xyz;\n#endif";
	var color_fragment = "#ifdef USE_COLOR\n\tdiffuseColor.rgb *= vColor;\n#endif";
	var color_pars_fragment = "#ifdef USE_COLOR\n\tvarying vec3 vColor;\n#endif";
	var color_pars_vertex = "#if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n\tvarying vec3 vColor;\n#endif";
	var color_vertex = "#if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n\tvColor = vec3( 1.0 );\n#endif\n#ifdef USE_COLOR\n\tvColor.xyz *= color.xyz;\n#endif\n#ifdef USE_INSTANCING_COLOR\n\tvColor.xyz *= instanceColor.xyz;\n#endif";
	var common = "#define PI 3.141592653589793\n#define PI2 6.283185307179586\n#define PI_HALF 1.5707963267948966\n#define RECIPROCAL_PI 0.3183098861837907\n#define RECIPROCAL_PI2 0.15915494309189535\n#define EPSILON 1e-6\n#ifndef saturate\n#define saturate(a) clamp( a, 0.0, 1.0 )\n#endif\n#define whiteComplement(a) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }\nhighp float rand( const in vec2 uv ) {\n\tconst highp float a = 12.9898, b = 78.233, c = 43758.5453;\n\thighp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n\treturn fract(sin(sn) * c);\n}\n#ifdef HIGH_PRECISION\n\tfloat precisionSafeLength( vec3 v ) { return length( v ); }\n#else\n\tfloat max3( vec3 v ) { return max( max( v.x, v.y ), v.z ); }\n\tfloat precisionSafeLength( vec3 v ) {\n\t\tfloat maxComponent = max3( abs( v ) );\n\t\treturn length( v / maxComponent ) * maxComponent;\n\t}\n#endif\nstruct IncidentLight {\n\tvec3 color;\n\tvec3 direction;\n\tbool visible;\n};\nstruct ReflectedLight {\n\tvec3 directDiffuse;\n\tvec3 directSpecular;\n\tvec3 indirectDiffuse;\n\tvec3 indirectSpecular;\n};\nstruct GeometricContext {\n\tvec3 position;\n\tvec3 normal;\n\tvec3 viewDir;\n#ifdef CLEARCOAT\n\tvec3 clearcoatNormal;\n#endif\n};\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\tfloat distance = dot( planeNormal, point - pointOnPlane );\n\treturn - distance * planeNormal + point;\n}\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn sign( dot( point - pointOnPlane, planeNormal ) );\n}\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;\n}\nmat3 transposeMat3( const in mat3 m ) {\n\tmat3 tmp;\n\ttmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );\n\ttmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );\n\ttmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );\n\treturn tmp;\n}\nfloat linearToRelativeLuminance( const in vec3 color ) {\n\tvec3 weights = vec3( 0.2126, 0.7152, 0.0722 );\n\treturn dot( weights, color.rgb );\n}\nbool isPerspectiveMatrix( mat4 m ) {\n\treturn m[ 2 ][ 3 ] == - 1.0;\n}\nvec2 equirectUv( in vec3 dir ) {\n\tfloat u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;\n\tfloat v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\treturn vec2( u, v );\n}";
	var cube_uv_reflection_fragment = "#ifdef ENVMAP_TYPE_CUBE_UV\n\t#define cubeUV_maxMipLevel 8.0\n\t#define cubeUV_minMipLevel 4.0\n\t#define cubeUV_maxTileSize 256.0\n\t#define cubeUV_minTileSize 16.0\n\tfloat getFace( vec3 direction ) {\n\t\tvec3 absDirection = abs( direction );\n\t\tfloat face = - 1.0;\n\t\tif ( absDirection.x > absDirection.z ) {\n\t\t\tif ( absDirection.x > absDirection.y )\n\t\t\t\tface = direction.x > 0.0 ? 0.0 : 3.0;\n\t\t\telse\n\t\t\t\tface = direction.y > 0.0 ? 1.0 : 4.0;\n\t\t} else {\n\t\t\tif ( absDirection.z > absDirection.y )\n\t\t\t\tface = direction.z > 0.0 ? 2.0 : 5.0;\n\t\t\telse\n\t\t\t\tface = direction.y > 0.0 ? 1.0 : 4.0;\n\t\t}\n\t\treturn face;\n\t}\n\tvec2 getUV( vec3 direction, float face ) {\n\t\tvec2 uv;\n\t\tif ( face == 0.0 ) {\n\t\t\tuv = vec2( direction.z, direction.y ) / abs( direction.x );\n\t\t} else if ( face == 1.0 ) {\n\t\t\tuv = vec2( - direction.x, - direction.z ) / abs( direction.y );\n\t\t} else if ( face == 2.0 ) {\n\t\t\tuv = vec2( - direction.x, direction.y ) / abs( direction.z );\n\t\t} else if ( face == 3.0 ) {\n\t\t\tuv = vec2( - direction.z, direction.y ) / abs( direction.x );\n\t\t} else if ( face == 4.0 ) {\n\t\t\tuv = vec2( - direction.x, direction.z ) / abs( direction.y );\n\t\t} else {\n\t\t\tuv = vec2( direction.x, direction.y ) / abs( direction.z );\n\t\t}\n\t\treturn 0.5 * ( uv + 1.0 );\n\t}\n\tvec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {\n\t\tfloat face = getFace( direction );\n\t\tfloat filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );\n\t\tmipInt = max( mipInt, cubeUV_minMipLevel );\n\t\tfloat faceSize = exp2( mipInt );\n\t\tfloat texelSize = 1.0 / ( 3.0 * cubeUV_maxTileSize );\n\t\tvec2 uv = getUV( direction, face ) * ( faceSize - 1.0 );\n\t\tvec2 f = fract( uv );\n\t\tuv += 0.5 - f;\n\t\tif ( face > 2.0 ) {\n\t\t\tuv.y += faceSize;\n\t\t\tface -= 3.0;\n\t\t}\n\t\tuv.x += face * faceSize;\n\t\tif ( mipInt < cubeUV_maxMipLevel ) {\n\t\t\tuv.y += 2.0 * cubeUV_maxTileSize;\n\t\t}\n\t\tuv.y += filterInt * 2.0 * cubeUV_minTileSize;\n\t\tuv.x += 3.0 * max( 0.0, cubeUV_maxTileSize - 2.0 * faceSize );\n\t\tuv *= texelSize;\n\t\tvec3 tl = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;\n\t\tuv.x += texelSize;\n\t\tvec3 tr = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;\n\t\tuv.y += texelSize;\n\t\tvec3 br = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;\n\t\tuv.x -= texelSize;\n\t\tvec3 bl = envMapTexelToLinear( texture2D( envMap, uv ) ).rgb;\n\t\tvec3 tm = mix( tl, tr, f.x );\n\t\tvec3 bm = mix( bl, br, f.x );\n\t\treturn mix( tm, bm, f.y );\n\t}\n\t#define r0 1.0\n\t#define v0 0.339\n\t#define m0 - 2.0\n\t#define r1 0.8\n\t#define v1 0.276\n\t#define m1 - 1.0\n\t#define r4 0.4\n\t#define v4 0.046\n\t#define m4 2.0\n\t#define r5 0.305\n\t#define v5 0.016\n\t#define m5 3.0\n\t#define r6 0.21\n\t#define v6 0.0038\n\t#define m6 4.0\n\tfloat roughnessToMip( float roughness ) {\n\t\tfloat mip = 0.0;\n\t\tif ( roughness >= r1 ) {\n\t\t\tmip = ( r0 - roughness ) * ( m1 - m0 ) / ( r0 - r1 ) + m0;\n\t\t} else if ( roughness >= r4 ) {\n\t\t\tmip = ( r1 - roughness ) * ( m4 - m1 ) / ( r1 - r4 ) + m1;\n\t\t} else if ( roughness >= r5 ) {\n\t\t\tmip = ( r4 - roughness ) * ( m5 - m4 ) / ( r4 - r5 ) + m4;\n\t\t} else if ( roughness >= r6 ) {\n\t\t\tmip = ( r5 - roughness ) * ( m6 - m5 ) / ( r5 - r6 ) + m5;\n\t\t} else {\n\t\t\tmip = - 2.0 * log2( 1.16 * roughness );\t\t}\n\t\treturn mip;\n\t}\n\tvec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {\n\t\tfloat mip = clamp( roughnessToMip( roughness ), m0, cubeUV_maxMipLevel );\n\t\tfloat mipF = fract( mip );\n\t\tfloat mipInt = floor( mip );\n\t\tvec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );\n\t\tif ( mipF == 0.0 ) {\n\t\t\treturn vec4( color0, 1.0 );\n\t\t} else {\n\t\t\tvec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );\n\t\t\treturn vec4( mix( color0, color1, mipF ), 1.0 );\n\t\t}\n\t}\n#endif";
	var defaultnormal_vertex = "vec3 transformedNormal = objectNormal;\n#ifdef USE_INSTANCING\n\tmat3 m = mat3( instanceMatrix );\n\ttransformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );\n\ttransformedNormal = m * transformedNormal;\n#endif\ntransformedNormal = normalMatrix * transformedNormal;\n#ifdef FLIP_SIDED\n\ttransformedNormal = - transformedNormal;\n#endif\n#ifdef USE_TANGENT\n\tvec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n\t#ifdef FLIP_SIDED\n\t\ttransformedTangent = - transformedTangent;\n\t#endif\n#endif";
	var displacementmap_pars_vertex = "#ifdef USE_DISPLACEMENTMAP\n\tuniform sampler2D displacementMap;\n\tuniform float displacementScale;\n\tuniform float displacementBias;\n#endif";
	var displacementmap_vertex = "#ifdef USE_DISPLACEMENTMAP\n\ttransformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );\n#endif";
	var emissivemap_fragment = "#ifdef USE_EMISSIVEMAP\n\tvec4 emissiveColor = texture2D( emissiveMap, vUv );\n\temissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;\n\ttotalEmissiveRadiance *= emissiveColor.rgb;\n#endif";
	var emissivemap_pars_fragment = "#ifdef USE_EMISSIVEMAP\n\tuniform sampler2D emissiveMap;\n#endif";
	var encodings_fragment = "gl_FragColor = linearToOutputTexel( gl_FragColor );";
	var encodings_pars_fragment = "\nvec4 LinearToLinear( in vec4 value ) {\n\treturn value;\n}\nvec4 GammaToLinear( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.rgb, vec3( gammaFactor ) ), value.a );\n}\nvec4 LinearToGamma( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.rgb, vec3( 1.0 / gammaFactor ) ), value.a );\n}\nvec4 sRGBToLinear( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );\n}\nvec4 LinearTosRGB( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );\n}\nvec4 RGBEToLinear( in vec4 value ) {\n\treturn vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\n}\nvec4 LinearToRGBE( in vec4 value ) {\n\tfloat maxComponent = max( max( value.r, value.g ), value.b );\n\tfloat fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );\n\treturn vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );\n}\nvec4 RGBMToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.rgb * value.a * maxRange, 1.0 );\n}\nvec4 LinearToRGBM( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.r, max( value.g, value.b ) );\n\tfloat M = clamp( maxRGB / maxRange, 0.0, 1.0 );\n\tM = ceil( M * 255.0 ) / 255.0;\n\treturn vec4( value.rgb / ( M * maxRange ), M );\n}\nvec4 RGBDToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );\n}\nvec4 LinearToRGBD( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.r, max( value.g, value.b ) );\n\tfloat D = max( maxRange / maxRGB, 1.0 );\n\tD = clamp( floor( D ) / 255.0, 0.0, 1.0 );\n\treturn vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );\n}\nconst mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );\nvec4 LinearToLogLuv( in vec4 value ) {\n\tvec3 Xp_Y_XYZp = cLogLuvM * value.rgb;\n\tXp_Y_XYZp = max( Xp_Y_XYZp, vec3( 1e-6, 1e-6, 1e-6 ) );\n\tvec4 vResult;\n\tvResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;\n\tfloat Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;\n\tvResult.w = fract( Le );\n\tvResult.z = ( Le - ( floor( vResult.w * 255.0 ) ) / 255.0 ) / 255.0;\n\treturn vResult;\n}\nconst mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );\nvec4 LogLuvToLinear( in vec4 value ) {\n\tfloat Le = value.z * 255.0 + value.w;\n\tvec3 Xp_Y_XYZp;\n\tXp_Y_XYZp.y = exp2( ( Le - 127.0 ) / 2.0 );\n\tXp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;\n\tXp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;\n\tvec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;\n\treturn vec4( max( vRGB, 0.0 ), 1.0 );\n}";
	var envmap_fragment = "#ifdef USE_ENVMAP\n\t#ifdef ENV_WORLDPOS\n\t\tvec3 cameraToFrag;\n\t\tif ( isOrthographic ) {\n\t\t\tcameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n\t\t} else {\n\t\t\tcameraToFrag = normalize( vWorldPosition - cameraPosition );\n\t\t}\n\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( cameraToFrag, worldNormal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );\n\t\t#endif\n\t#else\n\t\tvec3 reflectVec = vReflect;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\tvec4 envColor = textureCubeUV( envMap, reflectVec, 0.0 );\n\t#else\n\t\tvec4 envColor = vec4( 0.0 );\n\t#endif\n\t#ifndef ENVMAP_TYPE_CUBE_UV\n\t\tenvColor = envMapTexelToLinear( envColor );\n\t#endif\n\t#ifdef ENVMAP_BLENDING_MULTIPLY\n\t\toutgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\t\toutgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\t\toutgoingLight += envColor.xyz * specularStrength * reflectivity;\n\t#endif\n#endif";
	var envmap_common_pars_fragment = "#ifdef USE_ENVMAP\n\tuniform float envMapIntensity;\n\tuniform float flipEnvMap;\n\tuniform int maxMipLevel;\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tuniform samplerCube envMap;\n\t#else\n\t\tuniform sampler2D envMap;\n\t#endif\n\t\n#endif";
	var envmap_pars_fragment = "#ifdef USE_ENVMAP\n\tuniform float reflectivity;\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\t#define ENV_WORLDPOS\n\t#endif\n\t#ifdef ENV_WORLDPOS\n\t\tvarying vec3 vWorldPosition;\n\t\tuniform float refractionRatio;\n\t#else\n\t\tvarying vec3 vReflect;\n\t#endif\n#endif";
	var envmap_pars_vertex = "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) ||defined( PHONG )\n\t\t#define ENV_WORLDPOS\n\t#endif\n\t#ifdef ENV_WORLDPOS\n\t\t\n\t\tvarying vec3 vWorldPosition;\n\t#else\n\t\tvarying vec3 vReflect;\n\t\tuniform float refractionRatio;\n\t#endif\n#endif";
	var envmap_vertex = "#ifdef USE_ENVMAP\n\t#ifdef ENV_WORLDPOS\n\t\tvWorldPosition = worldPosition.xyz;\n\t#else\n\t\tvec3 cameraToVertex;\n\t\tif ( isOrthographic ) {\n\t\t\tcameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n\t\t} else {\n\t\t\tcameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\t\t}\n\t\tvec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvReflect = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#endif\n#endif";
	var fog_vertex = "#ifdef USE_FOG\n\tfogDepth = - mvPosition.z;\n#endif";
	var fog_pars_vertex = "#ifdef USE_FOG\n\tvarying float fogDepth;\n#endif";
	var fog_fragment = "#ifdef USE_FOG\n\t#ifdef FOG_EXP2\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogDensity * fogDepth * fogDepth );\n\t#else\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, fogDepth );\n\t#endif\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif";
	var fog_pars_fragment = "#ifdef USE_FOG\n\tuniform vec3 fogColor;\n\tvarying float fogDepth;\n\t#ifdef FOG_EXP2\n\t\tuniform float fogDensity;\n\t#else\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n#endif";
	var lightmap_pars_fragment = "#ifdef USE_LIGHTMAP\n\tuniform sampler2D lightMap;\n\tuniform float lightMapIntensity;\n#endif";
	var lights_pars_begin = "uniform bool receiveShadow;\nuniform vec3 ambientLightColor;\nuniform vec3 lightProbe[ 9 ];\nvec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {\n\tfloat x = normal.x, y = normal.y, z = normal.z;\n\tvec3 result = shCoefficients[ 0 ] * 0.886227;\n\tresult += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;\n\tresult += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;\n\tresult += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;\n\tresult += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;\n\tresult += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;\n\tresult += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );\n\tresult += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;\n\tresult += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );\n\treturn result;\n}\nvec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in GeometricContext geometry ) {\n\tvec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );\n\tvec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );\n\treturn irradiance;\n}\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n\tvec3 irradiance = ambientLightColor;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\treturn irradiance;\n}\n#if NUM_DIR_LIGHTS > 0\n\tstruct DirectionalLight {\n\t\tvec3 direction;\n\t\tvec3 color;\n\t};\n\tuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\tvoid getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tdirectLight.color = directionalLight.color;\n\t\tdirectLight.direction = directionalLight.direction;\n\t\tdirectLight.visible = true;\n\t}\n#endif\n#if NUM_POINT_LIGHTS > 0\n\tstruct PointLight {\n\t\tvec3 position;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t};\n\tuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n\tvoid getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tvec3 lVector = pointLight.position - geometry.position;\n\t\tdirectLight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tdirectLight.color = pointLight.color;\n\t\tdirectLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );\n\t\tdirectLight.visible = ( directLight.color != vec3( 0.0 ) );\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tstruct SpotLight {\n\t\tvec3 position;\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tfloat coneCos;\n\t\tfloat penumbraCos;\n\t};\n\tuniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n\tvoid getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tvec3 lVector = spotLight.position - geometry.position;\n\t\tdirectLight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tfloat angleCos = dot( directLight.direction, spotLight.direction );\n\t\tif ( angleCos > spotLight.coneCos ) {\n\t\t\tfloat spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n\t\t\tdirectLight.color = spotLight.color;\n\t\t\tdirectLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );\n\t\t\tdirectLight.visible = true;\n\t\t} else {\n\t\t\tdirectLight.color = vec3( 0.0 );\n\t\t\tdirectLight.visible = false;\n\t\t}\n\t}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n\tstruct RectAreaLight {\n\t\tvec3 color;\n\t\tvec3 position;\n\t\tvec3 halfWidth;\n\t\tvec3 halfHeight;\n\t};\n\tuniform sampler2D ltc_1;\tuniform sampler2D ltc_2;\n\tuniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tstruct HemisphereLight {\n\t\tvec3 direction;\n\t\tvec3 skyColor;\n\t\tvec3 groundColor;\n\t};\n\tuniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n\tvec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {\n\t\tfloat dotNL = dot( geometry.normal, hemiLight.direction );\n\t\tfloat hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n\t\tvec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tirradiance *= PI;\n\t\t#endif\n\t\treturn irradiance;\n\t}\n#endif";
	var envmap_physical_pars_fragment = "#if defined( USE_ENVMAP )\n\t#ifdef ENVMAP_MODE_REFRACTION\n\t\tuniform float refractionRatio;\n\t#endif\n\tvec3 getLightProbeIndirectIrradiance( const in GeometricContext geometry, const in int maxMIPLevel ) {\n\t\tvec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );\n\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\tvec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );\n\t\t#else\n\t\t\tvec4 envMapColor = vec4( 0.0 );\n\t\t#endif\n\t\treturn PI * envMapColor.rgb * envMapIntensity;\n\t}\n\tfloat getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {\n\t\tfloat maxMIPLevelScalar = float( maxMIPLevel );\n\t\tfloat sigma = PI * roughness * roughness / ( 1.0 + roughness );\n\t\tfloat desiredMIPLevel = maxMIPLevelScalar + log2( sigma );\n\t\treturn clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );\n\t}\n\tvec3 getLightProbeIndirectRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( -viewDir, normal );\n\t\t\treflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( -viewDir, normal, refractionRatio );\n\t\t#endif\n\t\treflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n\t\tfloat specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );\n\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\tvec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );\n\t\t#endif\n\t\treturn envMapColor.rgb * envMapIntensity;\n\t}\n#endif";
	var lights_physical_fragment = "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nvec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\nmaterial.specularRoughness = max( roughnessFactor, 0.0525 );material.specularRoughness += geometryRoughness;\nmaterial.specularRoughness = min( material.specularRoughness, 1.0 );\n#ifdef REFLECTIVITY\n\tmaterial.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );\n#else\n\tmaterial.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );\n#endif\n#ifdef CLEARCOAT\n\tmaterial.clearcoat = clearcoat;\n\tmaterial.clearcoatRoughness = clearcoatRoughness;\n\t#ifdef USE_CLEARCOATMAP\n\t\tmaterial.clearcoat *= texture2D( clearcoatMap, vUv ).x;\n\t#endif\n\t#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\t\tmaterial.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;\n\t#endif\n\tmaterial.clearcoat = saturate( material.clearcoat );\tmaterial.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );\n\tmaterial.clearcoatRoughness += geometryRoughness;\n\tmaterial.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\n#endif\n#ifdef USE_SHEEN\n\tmaterial.sheenColor = sheen;\n#endif";
	var lights_physical_pars_fragment = "struct PhysicalMaterial {\n\tvec3 diffuseColor;\n\tfloat specularRoughness;\n\tvec3 specularColor;\n#ifdef CLEARCOAT\n\tfloat clearcoat;\n\tfloat clearcoatRoughness;\n#endif\n#ifdef USE_SHEEN\n\tvec3 sheenColor;\n#endif\n};\n#define MAXIMUM_SPECULAR_COEFFICIENT 0.16\n#define DEFAULT_SPECULAR_COEFFICIENT 0.04\nfloat clearcoatDHRApprox( const in float roughness, const in float dotNL ) {\n\treturn DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n\tvoid RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t\tvec3 normal = geometry.normal;\n\t\tvec3 viewDir = geometry.viewDir;\n\t\tvec3 position = geometry.position;\n\t\tvec3 lightPos = rectAreaLight.position;\n\t\tvec3 halfWidth = rectAreaLight.halfWidth;\n\t\tvec3 halfHeight = rectAreaLight.halfHeight;\n\t\tvec3 lightColor = rectAreaLight.color;\n\t\tfloat roughness = material.specularRoughness;\n\t\tvec3 rectCoords[ 4 ];\n\t\trectCoords[ 0 ] = lightPos + halfWidth - halfHeight;\t\trectCoords[ 1 ] = lightPos - halfWidth - halfHeight;\n\t\trectCoords[ 2 ] = lightPos - halfWidth + halfHeight;\n\t\trectCoords[ 3 ] = lightPos + halfWidth + halfHeight;\n\t\tvec2 uv = LTC_Uv( normal, viewDir, roughness );\n\t\tvec4 t1 = texture2D( ltc_1, uv );\n\t\tvec4 t2 = texture2D( ltc_2, uv );\n\t\tmat3 mInv = mat3(\n\t\t\tvec3( t1.x, 0, t1.y ),\n\t\t\tvec3(    0, 1,    0 ),\n\t\t\tvec3( t1.z, 0, t1.w )\n\t\t);\n\t\tvec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );\n\t\treflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n\t\treflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );\n\t}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\t#ifdef CLEARCOAT\n\t\tfloat ccDotNL = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );\n\t\tvec3 ccIrradiance = ccDotNL * directLight.color;\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tccIrradiance *= PI;\n\t\t#endif\n\t\tfloat clearcoatDHR = material.clearcoat * clearcoatDHRApprox( material.clearcoatRoughness, ccDotNL );\n\t\treflectedLight.directSpecular += ccIrradiance * material.clearcoat * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.clearcoatNormal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearcoatRoughness );\n\t#else\n\t\tfloat clearcoatDHR = 0.0;\n\t#endif\n\t#ifdef USE_SHEEN\n\t\treflectedLight.directSpecular += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Specular_Sheen(\n\t\t\tmaterial.specularRoughness,\n\t\t\tdirectLight.direction,\n\t\t\tgeometry,\n\t\t\tmaterial.sheenColor\n\t\t);\n\t#else\n\t\treflectedLight.directSpecular += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry.viewDir, geometry.normal, material.specularColor, material.specularRoughness);\n\t#endif\n\treflectedLight.directDiffuse += ( 1.0 - clearcoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {\n\t#ifdef CLEARCOAT\n\t\tfloat ccDotNV = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );\n\t\treflectedLight.indirectSpecular += clearcoatRadiance * material.clearcoat * BRDF_Specular_GGX_Environment( geometry.viewDir, geometry.clearcoatNormal, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearcoatRoughness );\n\t\tfloat ccDotNL = ccDotNV;\n\t\tfloat clearcoatDHR = material.clearcoat * clearcoatDHRApprox( material.clearcoatRoughness, ccDotNL );\n\t#else\n\t\tfloat clearcoatDHR = 0.0;\n\t#endif\n\tfloat clearcoatInv = 1.0 - clearcoatDHR;\n\tvec3 singleScattering = vec3( 0.0 );\n\tvec3 multiScattering = vec3( 0.0 );\n\tvec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;\n\tBRDF_Specular_Multiscattering_Environment( geometry, material.specularColor, material.specularRoughness, singleScattering, multiScattering );\n\tvec3 diffuse = material.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );\n\treflectedLight.indirectSpecular += clearcoatInv * radiance * singleScattering;\n\treflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;\n\treflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;\n}\n#define RE_Direct\t\t\t\tRE_Direct_Physical\n#define RE_Direct_RectArea\t\tRE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular\t\tRE_IndirectSpecular_Physical\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n\treturn saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}";
	var lights_fragment_begin = "\nGeometricContext geometry;\ngeometry.position = - vViewPosition;\ngeometry.normal = normal;\ngeometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\n#ifdef CLEARCOAT\n\tgeometry.clearcoatNormal = clearcoatNormal;\n#endif\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\tPointLight pointLight;\n\t#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n\tPointLightShadow pointLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tgetPointDirectLightIrradiance( pointLight, geometry, directLight );\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )\n\t\tpointLightShadow = pointLightShadows[ i ];\n\t\tdirectLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\tSpotLight spotLight;\n\t#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n\tSpotLightShadow spotLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tgetSpotDirectLightIrradiance( spotLight, geometry, directLight );\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n\t\tspotLightShadow = spotLightShadows[ i ];\n\t\tdirectLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\tDirectionalLight directionalLight;\n\t#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n\tDirectionalLightShadow directionalLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tgetDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n\t\tdirectionalLightShadow = directionalLightShadows[ i ];\n\t\tdirectLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\tRectAreaLight rectAreaLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\t\trectAreaLight = rectAreaLights[ i ];\n\t\tRE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if defined( RE_IndirectDiffuse )\n\tvec3 iblIrradiance = vec3( 0.0 );\n\tvec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\tirradiance += getLightProbeIrradiance( lightProbe, geometry );\n\t#if ( NUM_HEMI_LIGHTS > 0 )\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\t\tirradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n#endif\n#if defined( RE_IndirectSpecular )\n\tvec3 radiance = vec3( 0.0 );\n\tvec3 clearcoatRadiance = vec3( 0.0 );\n#endif";
	var lights_fragment_maps = "#if defined( RE_IndirectDiffuse )\n\t#ifdef USE_LIGHTMAP\n\t\tvec4 lightMapTexel= texture2D( lightMap, vUv2 );\n\t\tvec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tlightMapIrradiance *= PI;\n\t\t#endif\n\t\tirradiance += lightMapIrradiance;\n\t#endif\n\t#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )\n\t\tiblIrradiance += getLightProbeIndirectIrradiance( geometry, maxMipLevel );\n\t#endif\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n\tradiance += getLightProbeIndirectRadiance( geometry.viewDir, geometry.normal, material.specularRoughness, maxMipLevel );\n\t#ifdef CLEARCOAT\n\t\tclearcoatRadiance += getLightProbeIndirectRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness, maxMipLevel );\n\t#endif\n#endif";
	var lights_fragment_end = "#if defined( RE_IndirectDiffuse )\n\tRE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );\n#endif\n#if defined( RE_IndirectSpecular )\n\tRE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );\n#endif";
	var logdepthbuf_fragment = "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tgl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif";
	var logdepthbuf_pars_fragment = "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tuniform float logDepthBufFC;\n\tvarying float vFragDepth;\n\tvarying float vIsPerspective;\n#endif";
	var logdepthbuf_pars_vertex = "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t\tvarying float vIsPerspective;\n\t#else\n\t\tuniform float logDepthBufFC;\n\t#endif\n#endif";
	var logdepthbuf_vertex = "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvFragDepth = 1.0 + gl_Position.w;\n\t\tvIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );\n\t#else\n\t\tif ( isPerspectiveMatrix( projectionMatrix ) ) {\n\t\t\tgl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;\n\t\t\tgl_Position.z *= gl_Position.w;\n\t\t}\n\t#endif\n#endif";
	var map_fragment = "#ifdef USE_MAP\n\tvec4 texelColor = texture2D( map, vUv );\n\ttexelColor = mapTexelToLinear( texelColor );\n\tdiffuseColor *= texelColor;\n#endif";
	var map_pars_fragment = "#ifdef USE_MAP\n\tuniform sampler2D map;\n#endif";
	var metalnessmap_fragment = "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n\tvec4 texelMetalness = texture2D( metalnessMap, vUv );\n\tmetalnessFactor *= texelMetalness.b;\n#endif";
	var metalnessmap_pars_fragment = "#ifdef USE_METALNESSMAP\n\tuniform sampler2D metalnessMap;\n#endif";
	var morphnormal_vertex = "#ifdef USE_MORPHNORMALS\n\tobjectNormal *= morphTargetBaseInfluence;\n\tobjectNormal += morphNormal0 * morphTargetInfluences[ 0 ];\n\tobjectNormal += morphNormal1 * morphTargetInfluences[ 1 ];\n\tobjectNormal += morphNormal2 * morphTargetInfluences[ 2 ];\n\tobjectNormal += morphNormal3 * morphTargetInfluences[ 3 ];\n#endif";
	var morphtarget_pars_vertex = "#ifdef USE_MORPHTARGETS\n\tuniform float morphTargetBaseInfluence;\n\t#ifndef USE_MORPHNORMALS\n\t\tuniform float morphTargetInfluences[ 8 ];\n\t#else\n\t\tuniform float morphTargetInfluences[ 4 ];\n\t#endif\n#endif";
	var morphtarget_vertex = "#ifdef USE_MORPHTARGETS\n\ttransformed *= morphTargetBaseInfluence;\n\ttransformed += morphTarget0 * morphTargetInfluences[ 0 ];\n\ttransformed += morphTarget1 * morphTargetInfluences[ 1 ];\n\ttransformed += morphTarget2 * morphTargetInfluences[ 2 ];\n\ttransformed += morphTarget3 * morphTargetInfluences[ 3 ];\n\t#ifndef USE_MORPHNORMALS\n\t\ttransformed += morphTarget4 * morphTargetInfluences[ 4 ];\n\t\ttransformed += morphTarget5 * morphTargetInfluences[ 5 ];\n\t\ttransformed += morphTarget6 * morphTargetInfluences[ 6 ];\n\t\ttransformed += morphTarget7 * morphTargetInfluences[ 7 ];\n\t#endif\n#endif";
	var normal_fragment_begin = "#ifdef FLAT_SHADED\n\tvec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );\n\tvec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n#else\n\tvec3 normal = normalize( vNormal );\n\t#ifdef DOUBLE_SIDED\n\t\tnormal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t#endif\n\t#ifdef USE_TANGENT\n\t\tvec3 tangent = normalize( vTangent );\n\t\tvec3 bitangent = normalize( vBitangent );\n\t\t#ifdef DOUBLE_SIDED\n\t\t\ttangent = tangent * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t\t\tbitangent = bitangent * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t\t#endif\n\t\t#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )\n\t\t\tmat3 vTBN = mat3( tangent, bitangent, normal );\n\t\t#endif\n\t#endif\n#endif\nvec3 geometryNormal = normal;";
	var normal_fragment_maps = "#ifdef OBJECTSPACE_NORMALMAP\n\tnormal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\t#ifdef FLIP_SIDED\n\t\tnormal = - normal;\n\t#endif\n\t#ifdef DOUBLE_SIDED\n\t\tnormal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t#endif\n\tnormal = normalize( normalMatrix * normal );\n#elif defined( TANGENTSPACE_NORMALMAP )\n\tvec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\tmapN.xy *= normalScale;\n\t#ifdef USE_TANGENT\n\t\tnormal = normalize( vTBN * mapN );\n\t#else\n\t\tnormal = perturbNormal2Arb( -vViewPosition, normal, mapN );\n\t#endif\n#elif defined( USE_BUMPMAP )\n\tnormal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n#endif";
	var normalmap_pars_fragment = "#ifdef USE_NORMALMAP\n\tuniform sampler2D normalMap;\n\tuniform vec2 normalScale;\n#endif\n#ifdef OBJECTSPACE_NORMALMAP\n\tuniform mat3 normalMatrix;\n#endif\n#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )\n\tvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN ) {\n\t\tvec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n\t\tvec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n\t\tvec2 st0 = dFdx( vUv.st );\n\t\tvec2 st1 = dFdy( vUv.st );\n\t\tfloat scale = sign( st1.t * st0.s - st0.t * st1.s );\n\t\tvec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );\n\t\tvec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );\n\t\tvec3 N = normalize( surf_norm );\n\t\tmat3 tsn = mat3( S, T, N );\n\t\tmapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t\treturn normalize( tsn * mapN );\n\t}\n#endif";
	var clearcoat_normal_fragment_begin = "#ifdef CLEARCOAT\n\tvec3 clearcoatNormal = geometryNormal;\n#endif";
	var clearcoat_normal_fragment_maps = "#ifdef USE_CLEARCOAT_NORMALMAP\n\tvec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;\n\tclearcoatMapN.xy *= clearcoatNormalScale;\n\t#ifdef USE_TANGENT\n\t\tclearcoatNormal = normalize( vTBN * clearcoatMapN );\n\t#else\n\t\tclearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN );\n\t#endif\n#endif";
	var clearcoat_pars_fragment = "#ifdef USE_CLEARCOATMAP\n\tuniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\tuniform sampler2D clearcoatRoughnessMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tuniform sampler2D clearcoatNormalMap;\n\tuniform vec2 clearcoatNormalScale;\n#endif";
	var packing = "vec3 packNormalToRGB( const in vec3 normal ) {\n\treturn normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n\treturn 2.0 * rgb.xyz - 1.0;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n\tvec4 r = vec4( fract( v * PackFactors ), v );\n\tr.yzw -= r.xyz * ShiftRight8;\treturn r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n\treturn dot( v, UnpackFactors );\n}\nvec4 pack2HalfToRGBA( vec2 v ) {\n\tvec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ));\n\treturn vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w);\n}\nvec2 unpackRGBATo2Half( vec4 v ) {\n\treturn vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {\n\treturn linearClipZ * ( near - far ) - near;\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn (( near + viewZ ) * far ) / (( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {\n\treturn ( near * far ) / ( ( far - near ) * invClipZ - far );\n}";
	var premultiplied_alpha_fragment = "#ifdef PREMULTIPLIED_ALPHA\n\tgl_FragColor.rgb *= gl_FragColor.a;\n#endif";
	var project_vertex = "vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_INSTANCING\n\tmvPosition = instanceMatrix * mvPosition;\n#endif\nmvPosition = modelViewMatrix * mvPosition;\ngl_Position = projectionMatrix * mvPosition;";
	var dithering_fragment = "#ifdef DITHERING\n\tgl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif";
	var dithering_pars_fragment = "#ifdef DITHERING\n\tvec3 dithering( vec3 color ) {\n\t\tfloat grid_position = rand( gl_FragCoord.xy );\n\t\tvec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n\t\tdither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n\t\treturn color + dither_shift_RGB;\n\t}\n#endif";
	var roughnessmap_fragment = "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n\tvec4 texelRoughness = texture2D( roughnessMap, vUv );\n\troughnessFactor *= texelRoughness.g;\n#endif";
	var roughnessmap_pars_fragment = "#ifdef USE_ROUGHNESSMAP\n\tuniform sampler2D roughnessMap;\n#endif";
	var shadowmap_pars_fragment = "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tstruct DirectionalLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tstruct SpotLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tstruct PointLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n\t#endif\n\tfloat texture2DCompare( sampler2D depths, vec2 uv, float compare ) {\n\t\treturn step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\n\t}\n\tvec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {\n\t\treturn unpackRGBATo2Half( texture2D( shadow, uv ) );\n\t}\n\tfloat VSMShadow (sampler2D shadow, vec2 uv, float compare ){\n\t\tfloat occlusion = 1.0;\n\t\tvec2 distribution = texture2DDistribution( shadow, uv );\n\t\tfloat hard_shadow = step( compare , distribution.x );\n\t\tif (hard_shadow != 1.0 ) {\n\t\t\tfloat distance = compare - distribution.x ;\n\t\t\tfloat variance = max( 0.00000, distribution.y * distribution.y );\n\t\t\tfloat softness_probability = variance / (variance + distance * distance );\t\t\tsoftness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );\t\t\tocclusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );\n\t\t}\n\t\treturn occlusion;\n\t}\n\tfloat getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n\t\tfloat shadow = 1.0;\n\t\tshadowCoord.xyz /= shadowCoord.w;\n\t\tshadowCoord.z += shadowBias;\n\t\tbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n\t\tbool inFrustum = all( inFrustumVec );\n\t\tbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\t\tbool frustumTest = all( frustumTestVec );\n\t\tif ( frustumTest ) {\n\t\t#if defined( SHADOWMAP_TYPE_PCF )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tfloat dx2 = dx0 / 2.0;\n\t\t\tfloat dy2 = dy0 / 2.0;\n\t\t\tfloat dx3 = dx1 / 2.0;\n\t\t\tfloat dy3 = dy1 / 2.0;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 17.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx = texelSize.x;\n\t\t\tfloat dy = texelSize.y;\n\t\t\tvec2 uv = shadowCoord.xy;\n\t\t\tvec2 f = fract( uv * shadowMapSize + 0.5 );\n\t\t\tuv -= f * texelSize;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, uv, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ), \n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),\n\t\t\t\t\t f.x ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ), \n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),\n\t\t\t\t\t f.x ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ), \n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t f.y ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ), \n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t f.y ) +\n\t\t\t\tmix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ), \n\t\t\t\t\t\t  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),\n\t\t\t\t\t\t  f.x ),\n\t\t\t\t\t mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ), \n\t\t\t\t\t\t  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t\t  f.x ),\n\t\t\t\t\t f.y )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_VSM )\n\t\t\tshadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#else\n\t\t\tshadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#endif\n\t\t}\n\t\treturn shadow;\n\t}\n\tvec2 cubeToUV( vec3 v, float texelSizeY ) {\n\t\tvec3 absV = abs( v );\n\t\tfloat scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n\t\tabsV *= scaleToCube;\n\t\tv *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n\t\tvec2 planar = v.xy;\n\t\tfloat almostATexel = 1.5 * texelSizeY;\n\t\tfloat almostOne = 1.0 - almostATexel;\n\t\tif ( absV.z >= almostOne ) {\n\t\t\tif ( v.z > 0.0 )\n\t\t\t\tplanar.x = 4.0 - v.x;\n\t\t} else if ( absV.x >= almostOne ) {\n\t\t\tfloat signX = sign( v.x );\n\t\t\tplanar.x = v.z * signX + 2.0 * signX;\n\t\t} else if ( absV.y >= almostOne ) {\n\t\t\tfloat signY = sign( v.y );\n\t\t\tplanar.x = v.x + 2.0 * signY + 2.0;\n\t\t\tplanar.y = v.z * signY - 2.0;\n\t\t}\n\t\treturn vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n\t}\n\tfloat getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n\t\tvec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\n\t\tvec3 lightToPosition = shadowCoord.xyz;\n\t\tfloat dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );\t\tdp += shadowBias;\n\t\tvec3 bd3D = normalize( lightToPosition );\n\t\t#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )\n\t\t\tvec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\n\t\t\treturn (\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\treturn texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\n\t\t#endif\n\t}\n#endif";
	var shadowmap_pars_vertex = "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t\tuniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tstruct DirectionalLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\t\tuniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tstruct SpotLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t\tuniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tstruct PointLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n\t#endif\n#endif";
	var shadowmap_vertex = "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SPOT_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0\n\t\tvec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\t\tvec4 shadowWorldPosition;\n\t#endif\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n\t\tshadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );\n\t\tvDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n\t\tshadowWorldPosition = worldPosition + vec4( shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias, 0 );\n\t\tvSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * shadowWorldPosition;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n\t\tshadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );\n\t\tvPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n#endif";
	var shadowmask_pars_fragment = "float getShadowMask() {\n\tfloat shadow = 1.0;\n\t#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\tDirectionalLightShadow directionalLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n\t\tdirectionalLight = directionalLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\tSpotLightShadow spotLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n\t\tspotLight = spotLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\tPointLightShadow pointLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n\t\tpointLight = pointLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#endif\n\treturn shadow;\n}";
	var skinbase_vertex = "#ifdef USE_SKINNING\n\tmat4 boneMatX = getBoneMatrix( skinIndex.x );\n\tmat4 boneMatY = getBoneMatrix( skinIndex.y );\n\tmat4 boneMatZ = getBoneMatrix( skinIndex.z );\n\tmat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif";
	var skinning_pars_vertex = "#ifdef USE_SKINNING\n\tuniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n\t#ifdef BONE_TEXTURE\n\t\tuniform highp sampler2D boneTexture;\n\t\tuniform int boneTextureSize;\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tfloat j = i * 4.0;\n\t\t\tfloat x = mod( j, float( boneTextureSize ) );\n\t\t\tfloat y = floor( j / float( boneTextureSize ) );\n\t\t\tfloat dx = 1.0 / float( boneTextureSize );\n\t\t\tfloat dy = 1.0 / float( boneTextureSize );\n\t\t\ty = dy * ( y + 0.5 );\n\t\t\tvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n\t\t\tvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n\t\t\tvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n\t\t\tvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\t\t\tmat4 bone = mat4( v1, v2, v3, v4 );\n\t\t\treturn bone;\n\t\t}\n\t#else\n\t\tuniform mat4 boneMatrices[ MAX_BONES ];\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tmat4 bone = boneMatrices[ int(i) ];\n\t\t\treturn bone;\n\t\t}\n\t#endif\n#endif";
	var skinning_vertex = "#ifdef USE_SKINNING\n\tvec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n\tvec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\ttransformed = ( bindMatrixInverse * skinned ).xyz;\n#endif";
	var skinnormal_vertex = "#ifdef USE_SKINNING\n\tmat4 skinMatrix = mat4( 0.0 );\n\tskinMatrix += skinWeight.x * boneMatX;\n\tskinMatrix += skinWeight.y * boneMatY;\n\tskinMatrix += skinWeight.z * boneMatZ;\n\tskinMatrix += skinWeight.w * boneMatW;\n\tskinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n\tobjectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n\t#ifdef USE_TANGENT\n\t\tobjectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n\t#endif\n#endif";
	var specularmap_fragment = "float specularStrength;\n#ifdef USE_SPECULARMAP\n\tvec4 texelSpecular = texture2D( specularMap, vUv );\n\tspecularStrength = texelSpecular.r;\n#else\n\tspecularStrength = 1.0;\n#endif";
	var specularmap_pars_fragment = "#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif";
	var tonemapping_fragment = "#if defined( TONE_MAPPING )\n\tgl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif";
	var tonemapping_pars_fragment = "#ifndef saturate\n#define saturate(a) clamp( a, 0.0, 1.0 )\n#endif\nuniform float toneMappingExposure;\nvec3 LinearToneMapping( vec3 color ) {\n\treturn toneMappingExposure * color;\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( color / ( vec3( 1.0 ) + color ) );\n}\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\tcolor = max( vec3( 0.0 ), color - 0.004 );\n\treturn pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\nvec3 RRTAndODTFit( vec3 v ) {\n\tvec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n\tvec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n\treturn a / b;\n}\nvec3 ACESFilmicToneMapping( vec3 color ) {\n\tconst mat3 ACESInputMat = mat3(\n\t\tvec3( 0.59719, 0.07600, 0.02840 ),\t\tvec3( 0.35458, 0.90834, 0.13383 ),\n\t\tvec3( 0.04823, 0.01566, 0.83777 )\n\t);\n\tconst mat3 ACESOutputMat = mat3(\n\t\tvec3(  1.60475, -0.10208, -0.00327 ),\t\tvec3( -0.53108,  1.10813, -0.07276 ),\n\t\tvec3( -0.07367, -0.00605,  1.07602 )\n\t);\n\tcolor *= toneMappingExposure / 0.6;\n\tcolor = ACESInputMat * color;\n\tcolor = RRTAndODTFit( color );\n\tcolor = ACESOutputMat * color;\n\treturn saturate( color );\n}\nvec3 CustomToneMapping( vec3 color ) { return color; }";
	var transmissionmap_fragment = "#ifdef USE_TRANSMISSIONMAP\n\ttotalTransmission *= texture2D( transmissionMap, vUv ).r;\n#endif";
	var transmissionmap_pars_fragment = "#ifdef USE_TRANSMISSIONMAP\n\tuniform sampler2D transmissionMap;\n#endif";
	var uv_pars_fragment = "#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )\n\tvarying vec2 vUv;\n#endif";
	var uv_pars_vertex = "#ifdef USE_UV\n\t#ifdef UVS_VERTEX_ONLY\n\t\tvec2 vUv;\n\t#else\n\t\tvarying vec2 vUv;\n\t#endif\n\tuniform mat3 uvTransform;\n#endif";
	var uv_vertex = "#ifdef USE_UV\n\tvUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n#endif";
	var uv2_pars_fragment = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvarying vec2 vUv2;\n#endif";
	var uv2_pars_vertex = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tattribute vec2 uv2;\n\tvarying vec2 vUv2;\n\tuniform mat3 uv2Transform;\n#endif";
	var uv2_vertex = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;\n#endif";

	var worldpos_vertex = "#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )\n\tvec4 worldPosition = vec4( transformed, 1.0 );\n\t#ifdef USE_INSTANCING\n\t\tworldPosition = instanceMatrix * worldPosition;\n\t#endif\n\tworldPosition = modelMatrix * worldPosition;\n#endif";

	var background_frag = "uniform sampler2D t2D;\nvarying vec2 vUv;\nvoid main() {\n\tvec4 texColor = texture2D( t2D, vUv );\n\tgl_FragColor = mapTexelToLinear( texColor );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n}";
	var background_vert = "varying vec2 vUv;\nuniform mat3 uvTransform;\nvoid main() {\n\tvUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n\tgl_Position = vec4( position.xy, 1.0, 1.0 );\n}";
	var meshbasic_frag = "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <cube_uv_reflection_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t#ifdef USE_LIGHTMAP\n\t\n\t\tvec4 lightMapTexel= texture2D( lightMap, vUv2 );\n\t\treflectedLight.indirectDiffuse += lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;\n\t#else\n\t\treflectedLight.indirectDiffuse += vec3( 1.0 );\n\t#endif\n\t#include <aomap_fragment>\n\treflectedLight.indirectDiffuse *= diffuseColor.rgb;\n\tvec3 outgoingLight = reflectedLight.indirectDiffuse;\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}";
	var meshbasic_vert = "#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_ENVMAP\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <envmap_vertex>\n\t#include <fog_vertex>\n}";
	var meshphysical_frag = "#define STANDARD\n#ifdef PHYSICAL\n\t#define REFLECTIVITY\n\t#define CLEARCOAT\n\t#define TRANSMISSION\n#endif\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifdef TRANSMISSION\n\tuniform float transmission;\n#endif\n#ifdef REFLECTIVITY\n\tuniform float reflectivity;\n#endif\n#ifdef CLEARCOAT\n\tuniform float clearcoat;\n\tuniform float clearcoatRoughness;\n#endif\n#ifdef USE_SHEEN\n\tuniform vec3 sheen;\n#endif\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n\t#ifdef USE_TANGENT\n\t\tvarying vec3 vTangent;\n\t\tvarying vec3 vBitangent;\n\t#endif\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <transmissionmap_pars_fragment>\n#include <bsdfs>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <lights_pars_begin>\n#include <lights_physical_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <clearcoat_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#ifdef TRANSMISSION\n\t\tfloat totalTransmission = transmission;\n\t#endif\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <roughnessmap_fragment>\n\t#include <metalnessmap_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <clearcoat_normal_fragment_begin>\n\t#include <clearcoat_normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <transmissionmap_fragment>\n\t#include <lights_physical_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\t#ifdef TRANSMISSION\n\t\tdiffuseColor.a *= saturate( 1. - totalTransmission + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) );\n\t#endif\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}";
	var meshphysical_vert = "#define STANDARD\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n\t#ifdef USE_TANGENT\n\t\tvarying vec3 vTangent;\n\t\tvarying vec3 vBitangent;\n\t#endif\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n\t#ifdef USE_TANGENT\n\t\tvTangent = normalize( transformedTangent );\n\t\tvBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );\n\t#endif\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}";
	var shadow_frag = "uniform vec3 color;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n\tgl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}";
	var shadow_vert = "#include <common>\n#include <fog_pars_vertex>\n#include <shadowmap_pars_vertex>\nvoid main() {\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}";

	const ShaderChunk = {
		alphamap_fragment: alphamap_fragment,
		alphamap_pars_fragment: alphamap_pars_fragment,
		alphatest_fragment: alphatest_fragment,
		aomap_fragment: aomap_fragment,
		aomap_pars_fragment: aomap_pars_fragment,
		begin_vertex: begin_vertex,
		beginnormal_vertex: beginnormal_vertex,
		bsdfs: bsdfs,
		bumpmap_pars_fragment: bumpmap_pars_fragment,
		clipping_planes_fragment: clipping_planes_fragment,
		clipping_planes_pars_fragment: clipping_planes_pars_fragment,
		clipping_planes_pars_vertex: clipping_planes_pars_vertex,
		clipping_planes_vertex: clipping_planes_vertex,
		color_fragment: color_fragment,
		color_pars_fragment: color_pars_fragment,
		color_pars_vertex: color_pars_vertex,
		color_vertex: color_vertex,
		common: common,
		cube_uv_reflection_fragment: cube_uv_reflection_fragment,
		defaultnormal_vertex: defaultnormal_vertex,
		displacementmap_pars_vertex: displacementmap_pars_vertex,
		displacementmap_vertex: displacementmap_vertex,
		emissivemap_fragment: emissivemap_fragment,
		emissivemap_pars_fragment: emissivemap_pars_fragment,
		encodings_fragment: encodings_fragment,
		encodings_pars_fragment: encodings_pars_fragment,
		envmap_fragment: envmap_fragment,
		envmap_common_pars_fragment: envmap_common_pars_fragment,
		envmap_pars_fragment: envmap_pars_fragment,
		envmap_pars_vertex: envmap_pars_vertex,
		envmap_physical_pars_fragment: envmap_physical_pars_fragment,
		envmap_vertex: envmap_vertex,
		fog_vertex: fog_vertex,
		fog_pars_vertex: fog_pars_vertex,
		fog_fragment: fog_fragment,
		fog_pars_fragment: fog_pars_fragment,
		lightmap_pars_fragment: lightmap_pars_fragment,
		lights_pars_begin: lights_pars_begin,
		lights_physical_fragment: lights_physical_fragment,
		lights_physical_pars_fragment: lights_physical_pars_fragment,
		lights_fragment_begin: lights_fragment_begin,
		lights_fragment_maps: lights_fragment_maps,
		lights_fragment_end: lights_fragment_end,
		logdepthbuf_fragment: logdepthbuf_fragment,
		logdepthbuf_pars_fragment: logdepthbuf_pars_fragment,
		logdepthbuf_pars_vertex: logdepthbuf_pars_vertex,
		logdepthbuf_vertex: logdepthbuf_vertex,
		map_fragment: map_fragment,
		map_pars_fragment: map_pars_fragment,
		metalnessmap_fragment: metalnessmap_fragment,
		metalnessmap_pars_fragment: metalnessmap_pars_fragment,
		morphnormal_vertex: morphnormal_vertex,
		morphtarget_pars_vertex: morphtarget_pars_vertex,
		morphtarget_vertex: morphtarget_vertex,
		normal_fragment_begin: normal_fragment_begin,
		normal_fragment_maps: normal_fragment_maps,
		normalmap_pars_fragment: normalmap_pars_fragment,
		clearcoat_normal_fragment_begin: clearcoat_normal_fragment_begin,
		clearcoat_normal_fragment_maps: clearcoat_normal_fragment_maps,
		clearcoat_pars_fragment: clearcoat_pars_fragment,
		packing: packing,
		premultiplied_alpha_fragment: premultiplied_alpha_fragment,
		project_vertex: project_vertex,
		dithering_fragment: dithering_fragment,
		dithering_pars_fragment: dithering_pars_fragment,
		roughnessmap_fragment: roughnessmap_fragment,
		roughnessmap_pars_fragment: roughnessmap_pars_fragment,
		shadowmap_pars_fragment: shadowmap_pars_fragment,
		shadowmap_pars_vertex: shadowmap_pars_vertex,
		shadowmap_vertex: shadowmap_vertex,
		shadowmask_pars_fragment: shadowmask_pars_fragment,
		skinbase_vertex: skinbase_vertex,
		skinning_pars_vertex: skinning_pars_vertex,
		skinning_vertex: skinning_vertex,
		skinnormal_vertex: skinnormal_vertex,
		specularmap_fragment: specularmap_fragment,
		specularmap_pars_fragment: specularmap_pars_fragment,
		tonemapping_fragment: tonemapping_fragment,
		tonemapping_pars_fragment: tonemapping_pars_fragment,
		transmissionmap_fragment: transmissionmap_fragment,
		transmissionmap_pars_fragment: transmissionmap_pars_fragment,
		uv_pars_fragment: uv_pars_fragment,
		uv_pars_vertex: uv_pars_vertex,
		uv_vertex: uv_vertex,
		uv2_pars_fragment: uv2_pars_fragment,
		uv2_pars_vertex: uv2_pars_vertex,
		uv2_vertex: uv2_vertex,
		worldpos_vertex: worldpos_vertex,

		background_frag: background_frag,
		background_vert: background_vert,
		meshbasic_frag: meshbasic_frag,
		meshbasic_vert: meshbasic_vert,
		meshphysical_frag: meshphysical_frag,
		meshphysical_vert: meshphysical_vert,
		shadow_frag: shadow_frag,
		shadow_vert: shadow_vert,
	};

	/**
	 * Uniforms library for shared webgl shaders
	 */

	const UniformsLib = {
		common: {
			diffuse: { value: new Color( 0xeeeeee ) },
			opacity: { value: 1.0 },
			map: { value: null },
			uvTransform: { value: new Matrix3() },
			uv2Transform: { value: new Matrix3() },
			alphaMap: { value: null },
		},

		specularmap: {specularMap: { value: null },},

		envmap: {
			envMap: { value: null },
			flipEnvMap: { value: - 1 },
			reflectivity: { value: 1.0 },
			refractionRatio: { value: 0.98 },
			maxMipLevel: { value: 0 }
		},

		aomap: {
			aoMap: { value: null },
			aoMapIntensity: { value: 1 }
		},

		lightmap: {
			lightMap: { value: null },
			lightMapIntensity: { value: 1 }
		},

		emissivemap: {emissiveMap: { value: null }},

		bumpmap: {
			bumpMap: { value: null },
			bumpScale: { value: 1 }
		},

		normalmap: {
			normalMap: { value: null },
			normalScale: { value: new Vector2( 1, 1 ) }
		},

		displacementmap: {
			displacementMap: { value: null },
			displacementScale: { value: 1 },
			displacementBias: { value: 0 }
		},

		roughnessmap: {roughnessMap: { value: null }},

		metalnessmap: {metalnessMap: { value: null }},

		gradientmap: {gradientMap: { value: null }},

		fog: {
			fogDensity: { value: 0.00025 },
			fogNear: { value: 1 },
			fogFar: { value: 2000 },
			fogColor: { value: new Color( 0xffffff ) }
		},

		lights: {
			ambientLightColor: { value: [] },
			lightProbe: { value: [] },
			directionalLights: { value: [], properties: {
				direction: {},
				color: {}
			} },

			directionalLightShadows: { value: [], properties: {
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			} },

			directionalShadowMap: { value: [] },
			directionalShadowMatrix: { value: [] },

			spotLights: { value: [], properties: {
				color: {},
				position: {},
				direction: {},
				distance: {},
				coneCos: {},
				penumbraCos: {},
				decay: {}
			} },

			spotLightShadows: { value: [], properties: {
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {}
			} },

			spotShadowMap: { value: [] },
			spotShadowMatrix: { value: [] },

			pointLights: { value: [], properties: {
				color: {},
				position: {},
				decay: {},
				distance: {}
			} },

			pointLightShadows: { value: [], properties: {
				shadowBias: {},
				shadowNormalBias: {},
				shadowRadius: {},
				shadowMapSize: {},
				shadowCameraNear: {},
				shadowCameraFar: {}
			} },

			pointShadowMap: { value: [] },
			pointShadowMatrix: { value: [] },

			hemisphereLights: { value: [], properties: {
				direction: {},
				skyColor: {},
				groundColor: {}
			} },

			// TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
			rectAreaLights: { value: [], properties: {
				color: {},
				position: {},
				width: {},
				height: {}
			} },

			ltc_1: { value: null },
			ltc_2: { value: null }

		},

		points: {
			diffuse: { value: new Color( 0xeeeeee ) },
			opacity: { value: 1.0 },
			size: { value: 1.0 },
			scale: { value: 1.0 },
			map: { value: null },
			alphaMap: { value: null },
			uvTransform: { value: new Matrix3() }
		},

		sprite: {
			diffuse: { value: new Color( 0xeeeeee ) },
			opacity: { value: 1.0 },
			center: { value: new Vector2( 0.5, 0.5 ) },
			rotation: { value: 0.0 },
			map: { value: null },
			alphaMap: { value: null },
			uvTransform: { value: new Matrix3() }
		}
	};

	const ShaderLib = {
		standard: {

			uniforms: mergeUniforms( [
				UniformsLib.common,
				UniformsLib.envmap,
				UniformsLib.aomap,
				UniformsLib.lightmap,
				UniformsLib.emissivemap,
				UniformsLib.bumpmap,
				UniformsLib.normalmap,
				UniformsLib.displacementmap,
				UniformsLib.roughnessmap,
				UniformsLib.metalnessmap,
				UniformsLib.fog,
				UniformsLib.lights,
				{
					emissive: { value: new Color( 0x000000 ) },
					roughness: { value: 1.0 },
					metalness: { value: 0.0 },
					envMapIntensity: { value: 1 } // temporary
				}
			] ),

			vertexShader: ShaderChunk.meshphysical_vert,
			fragmentShader: ShaderChunk.meshphysical_frag

		},

		normal: {
			uniforms: mergeUniforms( [
				UniformsLib.common,
				UniformsLib.bumpmap,
				UniformsLib.normalmap,
				UniformsLib.displacementmap,
				{
					opacity: { value: 1.0 }
				}
			] ),

			vertexShader: ShaderChunk.normal_vert,
			fragmentShader: ShaderChunk.normal_frag
		},


		background: {
			uniforms: {
				uvTransform: { value: new Matrix3() },
				t2D: { value: null },
			},

			vertexShader: ShaderChunk.background_vert,
			fragmentShader: ShaderChunk.background_frag
		},
	

		shadow: {
			uniforms: mergeUniforms( [
				UniformsLib.lights,
				UniformsLib.fog,
				{
					color: { value: new Color( 0x00000 ) },
					opacity: { value: 1.0 }
				},
			] ),

			vertexShader: ShaderChunk.shadow_vert,
			fragmentShader: ShaderChunk.shadow_frag
		}

	};

	ShaderLib.physical = {
		uniforms: mergeUniforms( [
			ShaderLib.standard.uniforms,
			{
				clearcoat: { value: 0 },
				clearcoatMap: { value: null },
				clearcoatRoughness: { value: 0 },
				clearcoatRoughnessMap: { value: null },
				clearcoatNormalScale: { value: new Vector2( 1, 1 ) },
				clearcoatNormalMap: { value: null },
				sheen: { value: new Color( 0x000000 ) },
				transmission: { value: 0 },
				transmissionMap: { value: null },
			}
		] ),

		vertexShader: ShaderChunk.meshphysical_vert,
		fragmentShader: ShaderChunk.meshphysical_frag
	};

	function WebGLBackground( renderer, cubemaps, state, objects, premultipliedAlpha ) {
		const clearColor = new Color( 0x000000 );
		let clearAlpha = 0;

		let planeMesh;
		let boxMesh;
		let currentBackground = null;
		let currentBackgroundVersion = 0;
		let currentTonemapping = null;

		function render( renderList, scene, camera, forceClear ) {
			let background = scene.isScene === true ? scene.background : null;

			if ( background && background.isTexture ) {
				background = cubemaps.get( background );
			}

			const xr = renderer.xr;
			const session = xr.getSession && xr.getSession();

			if ( session && session.environmentBlendMode === 'additive' ) {

				background = null;

			}

			if ( background === null ) {

				setClear( clearColor, clearAlpha );

			} else if ( background && background.isColor ) {

				setClear( background, 1 );
				forceClear = true;

			}

			if ( renderer.autoClear || forceClear ) {

				renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );

			}

		}

		function setClear( color, alpha ) {

			state.buffers.color.setClear( color.r, color.g, color.b, alpha, premultipliedAlpha );

		}

		return {
			getClearColor: function () {
				return clearColor;
			},
			setClearColor: function ( color, alpha ) {
				clearColor.set( color );
				clearAlpha = alpha !== undefined ? alpha : 1;
				setClear( clearColor, clearAlpha );
			},
			getClearAlpha: function () {
				return clearAlpha;
			},
			setClearAlpha: function ( alpha ) {
				clearAlpha = alpha;
				setClear( clearColor, clearAlpha );
			},
			render: render
		};

	}

	function WebGLBindingStates( gl, extensions, attributes, capabilities ) {

		const maxVertexAttributes = gl.getParameter( 34921 );

		const extension = capabilities.isWebGL2 ? null : extensions.get( 'OES_vertex_array_object' );
		const vaoAvailable = capabilities.isWebGL2 || extension !== null;

		const bindingStates = {};

		const defaultState = createBindingState( null );
		let currentState = defaultState;

		function setup( object, material, program, geometry, index ) {
			let updateBuffers = false;

			if ( vaoAvailable ) {
				const state = getBindingState( geometry, program, material );

				if ( currentState !== state ) {
					currentState = state;
					bindVertexArrayObject( currentState.object );
				}

				updateBuffers = needsUpdate( geometry, index );

				if ( updateBuffers ) saveCache( geometry, index );

			} else {
				const wireframe = ( material.wireframe === true );

				if ( currentState.geometry !== geometry.id ||
					currentState.program !== program.id ||
					currentState.wireframe !== wireframe ) {

					currentState.geometry = geometry.id;
					currentState.program = program.id;
					currentState.wireframe = wireframe;

					updateBuffers = true;
				}
			}

			if ( index !== null ) {
				attributes.update( index, 34963 );
			}

			if ( updateBuffers ) {
				setupVertexAttributes( object, material, program, geometry );

				if ( index !== null ) {
					gl.bindBuffer( 34963, attributes.get( index ).buffer );
				}
			}
		}

		function createVertexArrayObject() {

			if ( capabilities.isWebGL2 ) return gl.createVertexArray();

			return extension.createVertexArrayOES();

		}

		function bindVertexArrayObject( vao ) {

			if ( capabilities.isWebGL2 ) return gl.bindVertexArray( vao );

			return extension.bindVertexArrayOES( vao );

		}

		function deleteVertexArrayObject( vao ) {

			if ( capabilities.isWebGL2 ) return gl.deleteVertexArray( vao );

			return extension.deleteVertexArrayOES( vao );

		}

		function getBindingState( geometry, program, material ) {

			const wireframe = ( material.wireframe === true );

			let programMap = bindingStates[ geometry.id ];

			if ( programMap === undefined ) {

				programMap = {};
				bindingStates[ geometry.id ] = programMap;

			}

			let stateMap = programMap[ program.id ];

			if ( stateMap === undefined ) {

				stateMap = {};
				programMap[ program.id ] = stateMap;

			}

			let state = stateMap[ wireframe ];

			if ( state === undefined ) {

				state = createBindingState( createVertexArrayObject() );
				stateMap[ wireframe ] = state;

			}

			return state;

		}

		function createBindingState( vao ) {

			const newAttributes = [];
			const enabledAttributes = [];
			const attributeDivisors = [];

			for ( let i = 0; i < maxVertexAttributes; i ++ ) {

				newAttributes[ i ] = 0;
				enabledAttributes[ i ] = 0;
				attributeDivisors[ i ] = 0;

			}

			return {

				// for backward compatibility on non-VAO support browser
				geometry: null,
				program: null,
				wireframe: false,

				newAttributes: newAttributes,
				enabledAttributes: enabledAttributes,
				attributeDivisors: attributeDivisors,
				object: vao,
				attributes: {},
				index: null

			};

		}

		function needsUpdate( geometry, index ) {

			const cachedAttributes = currentState.attributes;
			const geometryAttributes = geometry.attributes;

			if ( Object.keys( cachedAttributes ).length !== Object.keys( geometryAttributes ).length ) return true;

			for ( const key in geometryAttributes ) {

				const cachedAttribute = cachedAttributes[ key ];
				const geometryAttribute = geometryAttributes[ key ];

				if ( cachedAttribute === undefined ) return true;

				if ( cachedAttribute.attribute !== geometryAttribute ) return true;

				if ( cachedAttribute.data !== geometryAttribute.data ) return true;

			}

			if ( currentState.index !== index ) return true;

			return false;

		}

		function saveCache( geometry, index ) {

			const cache = {};
			const attributes = geometry.attributes;

			for ( const key in attributes ) {

				const attribute = attributes[ key ];

				const data = {};
				data.attribute = attribute;

				if ( attribute.data ) {

					data.data = attribute.data;

				}

				cache[ key ] = data;

			}

			currentState.attributes = cache;

			currentState.index = index;

		}

		function initAttributes() {

			const newAttributes = currentState.newAttributes;

			for ( let i = 0, il = newAttributes.length; i < il; i ++ ) {

				newAttributes[ i ] = 0;

			}

		}

		function enableAttribute( attribute ) {

			enableAttributeAndDivisor( attribute, 0 );

		}

		function enableAttributeAndDivisor( attribute, meshPerAttribute ) {

			const newAttributes = currentState.newAttributes;
			const enabledAttributes = currentState.enabledAttributes;
			const attributeDivisors = currentState.attributeDivisors;

			newAttributes[ attribute ] = 1;

			if ( enabledAttributes[ attribute ] === 0 ) {

				gl.enableVertexAttribArray( attribute );
				enabledAttributes[ attribute ] = 1;

			}

			if ( attributeDivisors[ attribute ] !== meshPerAttribute ) {

				const extension = capabilities.isWebGL2 ? gl : extensions.get( 'ANGLE_instanced_arrays' );

				extension[ capabilities.isWebGL2 ? 'vertexAttribDivisor' : 'vertexAttribDivisorANGLE' ]( attribute, meshPerAttribute );
				attributeDivisors[ attribute ] = meshPerAttribute;

			}

		}

		function disableUnusedAttributes() {

			const newAttributes = currentState.newAttributes;
			const enabledAttributes = currentState.enabledAttributes;

			for ( let i = 0, il = enabledAttributes.length; i < il; i ++ ) {

				if ( enabledAttributes[ i ] !== newAttributes[ i ] ) {

					gl.disableVertexAttribArray( i );
					enabledAttributes[ i ] = 0;

				}

			}

		}

		function vertexAttribPointer( index, size, type, normalized, stride, offset ) {

			if ( capabilities.isWebGL2 === true && ( type === 5124 || type === 5125 ) ) {

				gl.vertexAttribIPointer( index, size, type, stride, offset );

			} else {

				gl.vertexAttribPointer( index, size, type, normalized, stride, offset );

			}

		}

		function setupVertexAttributes( object, material, program, geometry ) {

			if ( capabilities.isWebGL2 === false && ( geometry.isInstancedBufferGeometry ) ) {

				if ( extensions.get( 'ANGLE_instanced_arrays' ) === null ) return;

			}

			initAttributes();

			const geometryAttributes = geometry.attributes;

			const programAttributes = program.getAttributes();

			const materialDefaultAttributeValues = material.defaultAttributeValues;

			for ( const name in programAttributes ) {

				const programAttribute = programAttributes[ name ];

				if ( programAttribute >= 0 ) {

					const geometryAttribute = geometryAttributes[ name ];

					if ( geometryAttribute !== undefined ) {

						const normalized = geometryAttribute.normalized;
						const size = geometryAttribute.itemSize;

						const attribute = attributes.get( geometryAttribute );

						// TODO Attribute may not be available on context restore

						if ( attribute === undefined ) continue;

						const buffer = attribute.buffer;
						const type = attribute.type;
						const bytesPerElement = attribute.bytesPerElement;

						if ( geometryAttribute.isInterleavedBufferAttribute ) {

							const data = geometryAttribute.data;
							const stride = data.stride;
							const offset = geometryAttribute.offset;

							enableAttribute( programAttribute );

							gl.bindBuffer( 34962, buffer );
							vertexAttribPointer( programAttribute, size, type, normalized, stride * bytesPerElement, offset * bytesPerElement );

						} else {

							if ( geometryAttribute.isInstancedBufferAttribute ) {

								enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute );

								if ( geometry._maxInstanceCount === undefined ) {

									geometry._maxInstanceCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

								}

							} else {

								enableAttribute( programAttribute );

							}

							gl.bindBuffer( 34962, buffer );
							vertexAttribPointer( programAttribute, size, type, normalized, 0, 0 );

						}

					} else if ( name === 'instanceMatrix' ) {

						const attribute = attributes.get( object.instanceMatrix );

						// TODO Attribute may not be available on context restore

						if ( attribute === undefined ) continue;

						const buffer = attribute.buffer;
						const type = attribute.type;

						enableAttributeAndDivisor( programAttribute + 0, 1 );
						enableAttributeAndDivisor( programAttribute + 1, 1 );
						enableAttributeAndDivisor( programAttribute + 2, 1 );
						enableAttributeAndDivisor( programAttribute + 3, 1 );

						gl.bindBuffer( 34962, buffer );

						gl.vertexAttribPointer( programAttribute + 0, 4, type, false, 64, 0 );
						gl.vertexAttribPointer( programAttribute + 1, 4, type, false, 64, 16 );
						gl.vertexAttribPointer( programAttribute + 2, 4, type, false, 64, 32 );
						gl.vertexAttribPointer( programAttribute + 3, 4, type, false, 64, 48 );

					} else if ( name === 'instanceColor' ) {

						const attribute = attributes.get( object.instanceColor );

						// TODO Attribute may not be available on context restore

						if ( attribute === undefined ) continue;

						const buffer = attribute.buffer;
						const type = attribute.type;

						enableAttributeAndDivisor( programAttribute, 1 );

						gl.bindBuffer( 34962, buffer );

						gl.vertexAttribPointer( programAttribute, 3, type, false, 12, 0 );

					} else if ( materialDefaultAttributeValues !== undefined ) {

						const value = materialDefaultAttributeValues[ name ];

						if ( value !== undefined ) {

							switch ( value.length ) {

								case 2:
									gl.vertexAttrib2fv( programAttribute, value );
									break;

								case 3:
									gl.vertexAttrib3fv( programAttribute, value );
									break;

								case 4:
									gl.vertexAttrib4fv( programAttribute, value );
									break;

								default:
									gl.vertexAttrib1fv( programAttribute, value );

							}

						}

					}

				}

			}

			disableUnusedAttributes();

		}

		function dispose() {

			reset();

			for ( const geometryId in bindingStates ) {

				const programMap = bindingStates[ geometryId ];

				for ( const programId in programMap ) {

					const stateMap = programMap[ programId ];

					for ( const wireframe in stateMap ) {

						deleteVertexArrayObject( stateMap[ wireframe ].object );

						delete stateMap[ wireframe ];

					}

					delete programMap[ programId ];

				}

				delete bindingStates[ geometryId ];

			}

		}

		function releaseStatesOfGeometry( geometry ) {

			if ( bindingStates[ geometry.id ] === undefined ) return;

			const programMap = bindingStates[ geometry.id ];

			for ( const programId in programMap ) {

				const stateMap = programMap[ programId ];

				for ( const wireframe in stateMap ) {

					deleteVertexArrayObject( stateMap[ wireframe ].object );

					delete stateMap[ wireframe ];

				}

				delete programMap[ programId ];

			}

			delete bindingStates[ geometry.id ];

		}

		function releaseStatesOfProgram( program ) {

			for ( const geometryId in bindingStates ) {

				const programMap = bindingStates[ geometryId ];

				if ( programMap[ program.id ] === undefined ) continue;

				const stateMap = programMap[ program.id ];

				for ( const wireframe in stateMap ) {

					deleteVertexArrayObject( stateMap[ wireframe ].object );

					delete stateMap[ wireframe ];

				}

				delete programMap[ program.id ];

			}

		}

		function reset() {

			resetDefaultState();

			if ( currentState === defaultState ) return;

			currentState = defaultState;
			bindVertexArrayObject( currentState.object );

		}

		// for backward-compatilibity

		function resetDefaultState() {

			defaultState.geometry = null;
			defaultState.program = null;
			defaultState.wireframe = false;

		}

		return {

			setup: setup,
			reset: reset,
			resetDefaultState: resetDefaultState,
			dispose: dispose,
			releaseStatesOfGeometry: releaseStatesOfGeometry,
			releaseStatesOfProgram: releaseStatesOfProgram,

			initAttributes: initAttributes,
			enableAttribute: enableAttribute,
			disableUnusedAttributes: disableUnusedAttributes

		};

	}

	function WebGLBufferRenderer( gl, extensions, info, capabilities ) {

		const isWebGL2 = capabilities.isWebGL2;

		let mode;

		function setMode( value ) {mode = value;}

		function render( start, count ) {
			gl.drawArrays( mode, start, count );
			info.update( count, mode, 1 );
		}

		function renderInstances( start, count, primcount ) {
			if ( primcount === 0 ) return;
			let extension, methodName;

			if ( isWebGL2 ) {
				extension = gl;
				methodName = 'drawArraysInstanced';
			} else {
				extension = extensions.get( 'ANGLE_instanced_arrays' );
				methodName = 'drawArraysInstancedANGLE';

				if ( extension === null ) {
					console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
					return;
				}

			}

			extension[ methodName ]( mode, start, count, primcount );
			info.update( count, mode, primcount );

		}

		this.setMode = setMode;
		this.render = render;
		this.renderInstances = renderInstances;

	}

	function WebGLCapabilities( gl, extensions, parameters ) {

		let maxAnisotropy;

		function getMaxAnisotropy() {

			if ( maxAnisotropy !== undefined ) return maxAnisotropy;

			const extension = extensions.get( 'EXT_texture_filter_anisotropic' );

			if ( extension !== null ) {
				maxAnisotropy = gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );
			} else {
				maxAnisotropy = 0;
			}

			return maxAnisotropy;

		}

		function getMaxPrecision( precision ) {

			if ( precision === 'highp' ) {
				if ( gl.getShaderPrecisionFormat( 35633, 36338 ).precision > 0 &&
					gl.getShaderPrecisionFormat( 35632, 36338 ).precision > 0 ) {
					return 'highp';
				}
				precision = 'mediump';
			}

			if ( precision === 'mediump' ) {
				if ( gl.getShaderPrecisionFormat( 35633, 36337 ).precision > 0 &&
					gl.getShaderPrecisionFormat( 35632, 36337 ).precision > 0 ) {
					return 'mediump';
				}
			}
			return 'lowp';
		}

		/* eslint-disable no-undef */
		const isWebGL2 = ( typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext ) ||
			( typeof WebGL2ComputeRenderingContext !== 'undefined' && gl instanceof WebGL2ComputeRenderingContext );
		/* eslint-enable no-undef */

		let precision = parameters.precision !== undefined ? parameters.precision : 'highp';
		const maxPrecision = getMaxPrecision( precision );

		if ( maxPrecision !== precision ) {
			console.warn( 'THREE.WebGLRenderer:', precision, 'not supported, using', maxPrecision, 'instead.' );
			precision = maxPrecision;
		}

		const logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;

		const maxTextures = gl.getParameter( 34930 );
		const maxVertexTextures = gl.getParameter( 35660 );
		const maxTextureSize = gl.getParameter( 3379 );
		const maxCubemapSize = gl.getParameter( 34076 );

		const maxAttributes = gl.getParameter( 34921 );
		const maxVertexUniforms = gl.getParameter( 36347 );
		const maxVaryings = gl.getParameter( 36348 );
		const maxFragmentUniforms = gl.getParameter( 36349 );

		const vertexTextures = maxVertexTextures > 0;
		const floatFragmentTextures = isWebGL2 || !! extensions.get( 'OES_texture_float' );
		const floatVertexTextures = vertexTextures && floatFragmentTextures;

		const maxSamples = isWebGL2 ? gl.getParameter( 36183 ) : 0;

		return {
			isWebGL2: isWebGL2,
			getMaxAnisotropy: getMaxAnisotropy,
			getMaxPrecision: getMaxPrecision,
			precision: precision,
			logarithmicDepthBuffer: logarithmicDepthBuffer,
			maxTextures: maxTextures,
			maxVertexTextures: maxVertexTextures,
			maxTextureSize: maxTextureSize,
			maxCubemapSize: maxCubemapSize,
			maxAttributes: maxAttributes,
			maxVertexUniforms: maxVertexUniforms,
			maxVaryings: maxVaryings,
			maxFragmentUniforms: maxFragmentUniforms,
			vertexTextures: vertexTextures,
			floatFragmentTextures: floatFragmentTextures,
			floatVertexTextures: floatVertexTextures,
			maxSamples: maxSamples
		};

	}

	function WebGLClipping( properties ) {

		const scope = this;

		let globalState = null,
			numGlobalPlanes = 0,
			localClippingEnabled = false,
			renderingShadows = false;

		const plane = new Plane(),
			viewNormalMatrix = new Matrix3(),

			uniform = { value: null, needsUpdate: false };

		this.uniform = uniform;
		this.numPlanes = 0;
		this.numIntersection = 0;

		this.init = function ( planes, enableLocalClipping, camera ) {

			const enabled =
				planes.length !== 0 ||
				enableLocalClipping ||
				// enable state of previous frame - the clipping code has to
				// run another frame in order to reset the state:
				numGlobalPlanes !== 0 ||
				localClippingEnabled;

			localClippingEnabled = enableLocalClipping;

			globalState = projectPlanes( planes, camera, 0 );
			numGlobalPlanes = planes.length;

			return enabled;

		};

		this.beginShadows = function () {

			renderingShadows = true;
			projectPlanes( null );

		};

		this.endShadows = function () {

			renderingShadows = false;
			resetGlobalState();

		};

		this.setState = function ( material, camera, useCache ) {

			const planes = material.clippingPlanes,
				clipIntersection = material.clipIntersection,
				clipShadows = material.clipShadows;

			const materialProperties = properties.get( material );

			if ( ! localClippingEnabled || planes === null || planes.length === 0 || renderingShadows && ! clipShadows ) {

				// there's no local clipping

				if ( renderingShadows ) {

					// there's no global clipping

					projectPlanes( null );

				} else {

					resetGlobalState();

				}

			} else {

				const nGlobal = renderingShadows ? 0 : numGlobalPlanes,
					lGlobal = nGlobal * 4;

				let dstArray = materialProperties.clippingState || null;

				uniform.value = dstArray; // ensure unique state

				dstArray = projectPlanes( planes, camera, lGlobal, useCache );

				for ( let i = 0; i !== lGlobal; ++ i ) {

					dstArray[ i ] = globalState[ i ];

				}

				materialProperties.clippingState = dstArray;
				this.numIntersection = clipIntersection ? this.numPlanes : 0;
				this.numPlanes += nGlobal;

			}


		};

		function resetGlobalState() {

			if ( uniform.value !== globalState ) {

				uniform.value = globalState;
				uniform.needsUpdate = numGlobalPlanes > 0;

			}

			scope.numPlanes = numGlobalPlanes;
			scope.numIntersection = 0;

		}

		function projectPlanes( planes, camera, dstOffset, skipTransform ) {

			const nPlanes = planes !== null ? planes.length : 0;
			let dstArray = null;

			if ( nPlanes !== 0 ) {

				dstArray = uniform.value;

				if ( skipTransform !== true || dstArray === null ) {

					const flatSize = dstOffset + nPlanes * 4,
						viewMatrix = camera.matrixWorldInverse;

					viewNormalMatrix.getNormalMatrix( viewMatrix );

					if ( dstArray === null || dstArray.length < flatSize ) {

						dstArray = new Float32Array( flatSize );

					}

					for ( let i = 0, i4 = dstOffset; i !== nPlanes; ++ i, i4 += 4 ) {

						plane.copy( planes[ i ] ).applyMatrix4( viewMatrix, viewNormalMatrix );

						plane.normal.toArray( dstArray, i4 );
						dstArray[ i4 + 3 ] = plane.constant;

					}

				}

				uniform.value = dstArray;
				uniform.needsUpdate = true;

			}

			scope.numPlanes = nPlanes;
			scope.numIntersection = 0;

			return dstArray;

		}

	}

	function WebGLCubeMaps( renderer ) {

		let cubemaps = new WeakMap();

		function mapTextureMapping( texture, mapping ) {
			if ( mapping === EquirectangularReflectionMapping ) {
				texture.mapping = CubeReflectionMapping;
			} else if ( mapping === EquirectangularRefractionMapping ) {
				texture.mapping = CubeRefractionMapping;
			}
			return texture;
		}

		function get( texture ) {

			if ( texture && texture.isTexture ) {
				const mapping = texture.mapping;
				if ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) {
					if ( cubemaps.has( texture ) ) {
						const cubemap = cubemaps.get( texture ).texture;
						return mapTextureMapping( cubemap, texture.mapping );
					} else {
						const image = texture.image;

						if ( image && image.height > 0 ) {
							const currentRenderList = renderer.getRenderList();
							const currentRenderTarget = renderer.getRenderTarget();
							const currentRenderState = renderer.getRenderState();
							const renderTarget = new WebGLCubeRenderTarget( image.height / 2 );
							renderTarget.fromEquirectangularTexture( renderer, texture );
							cubemaps.set( texture, renderTarget );
							renderer.setRenderTarget( currentRenderTarget );
							renderer.setRenderList( currentRenderList );
							renderer.setRenderState( currentRenderState );
							return mapTextureMapping( renderTarget.texture, texture.mapping );
						} else {
							// image not yet ready. try the conversion next frame
							return null;
						}
					}
				}
			}
			return texture;
		}

		function dispose() {
			cubemaps = new WeakMap();
		}

		return {
			get: get,
			dispose: dispose
		};

	}

	function WebGLExtensions( gl ) {

		const extensions = {};

		return {
			has: function ( name ) {

				if ( extensions[ name ] !== undefined ) {
					return extensions[ name ] !== null;
				}

				let extension;
				switch ( name ) {
					case 'WEBGL_depth_texture':
						extension = gl.getExtension( 'WEBGL_depth_texture' ) || gl.getExtension( 'MOZ_WEBGL_depth_texture' ) || gl.getExtension( 'WEBKIT_WEBGL_depth_texture' );
						break;
					case 'EXT_texture_filter_anisotropic':
						extension = gl.getExtension( 'EXT_texture_filter_anisotropic' ) || gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );
						break;
					case 'WEBGL_compressed_texture_s3tc':
						extension = gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) || gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' );
						break;
					case 'WEBGL_compressed_texture_pvrtc':
						extension = gl.getExtension( 'WEBGL_compressed_texture_pvrtc' ) || gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_pvrtc' );
						break;
					default:
						extension = gl.getExtension( name );

				}

				extensions[ name ] = extension;

				return extension !== null;

			},

			get: function ( name ) {
				if ( ! this.has( name ) ) {
					console.warn( 'THREE.WebGLRenderer: ' + name + ' extension not supported.' );
				}
				return extensions[ name ];
			}
		};
	}

	function WebGLGeometries( gl, attributes, info, bindingStates ) {

		const geometries = new WeakMap();
		const wireframeAttributes = new WeakMap();

		function onGeometryDispose( event ) {

			const geometry = event.target;
			const buffergeometry = geometries.get( geometry );

			if ( buffergeometry.index !== null ) {

				attributes.remove( buffergeometry.index );

			}

			for ( const name in buffergeometry.attributes ) {

				attributes.remove( buffergeometry.attributes[ name ] );

			}

			geometry.removeEventListener( 'dispose', onGeometryDispose );

			geometries.delete( geometry );

			const attribute = wireframeAttributes.get( buffergeometry );

			if ( attribute ) {

				attributes.remove( attribute );
				wireframeAttributes.delete( buffergeometry );

			}

			bindingStates.releaseStatesOfGeometry( geometry );

			if ( geometry.isInstancedBufferGeometry === true ) {

				delete geometry._maxInstanceCount;

			}

			//

			info.memory.geometries --;

		}

		function get( object, geometry ) {

			let buffergeometry = geometries.get( geometry );

			if ( buffergeometry ) return buffergeometry;

			geometry.addEventListener( 'dispose', onGeometryDispose );

			if ( geometry.isBufferGeometry ) {

				buffergeometry = geometry;

			} else if ( geometry.isGeometry ) {

				if ( geometry._bufferGeometry === undefined ) {

					geometry._bufferGeometry = new BufferGeometry().setFromObject( object );

				}

				buffergeometry = geometry._bufferGeometry;

			}

			geometries.set( geometry, buffergeometry );

			info.memory.geometries ++;

			return buffergeometry;

		}

		function update( geometry ) {

			const geometryAttributes = geometry.attributes;

			// Updating index buffer in VAO now. See WebGLBindingStates.

			for ( const name in geometryAttributes ) {

				attributes.update( geometryAttributes[ name ], 34962 );

			}

			// morph targets

			const morphAttributes = geometry.morphAttributes;

			for ( const name in morphAttributes ) {

				const array = morphAttributes[ name ];

				for ( let i = 0, l = array.length; i < l; i ++ ) {

					attributes.update( array[ i ], 34962 );

				}

			}

		}

		function updateWireframeAttribute( geometry ) {

			const indices = [];

			const geometryIndex = geometry.index;
			const geometryPosition = geometry.attributes.position;
			let version = 0;

			if ( geometryIndex !== null ) {

				const array = geometryIndex.array;
				version = geometryIndex.version;

				for ( let i = 0, l = array.length; i < l; i += 3 ) {

					const a = array[ i + 0 ];
					const b = array[ i + 1 ];
					const c = array[ i + 2 ];

					indices.push( a, b, b, c, c, a );

				}

			} else {

				const array = geometryPosition.array;
				version = geometryPosition.version;

				for ( let i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

					const a = i + 0;
					const b = i + 1;
					const c = i + 2;

					indices.push( a, b, b, c, c, a );

				}

			}

			const attribute = new ( arrayMax( indices ) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute )( indices, 1 );
			attribute.version = version;

			// Updating index buffer in VAO now. See WebGLBindingStates

			//

			const previousAttribute = wireframeAttributes.get( geometry );

			if ( previousAttribute ) attributes.remove( previousAttribute );

			//

			wireframeAttributes.set( geometry, attribute );

		}

		function getWireframeAttribute( geometry ) {

			const currentAttribute = wireframeAttributes.get( geometry );

			if ( currentAttribute ) {

				const geometryIndex = geometry.index;

				if ( geometryIndex !== null ) {

					// if the attribute is obsolete, create a new one

					if ( currentAttribute.version < geometryIndex.version ) {

						updateWireframeAttribute( geometry );

					}

				}

			} else {

				updateWireframeAttribute( geometry );

			}

			return wireframeAttributes.get( geometry );

		}

		return {

			get: get,
			update: update,

			getWireframeAttribute: getWireframeAttribute

		};

	}

	function WebGLIndexedBufferRenderer( gl, extensions, info, capabilities ) {

		const isWebGL2 = capabilities.isWebGL2;

		let mode;

		function setMode( value ) {

			mode = value;

		}

		let type, bytesPerElement;

		function setIndex( value ) {

			type = value.type;
			bytesPerElement = value.bytesPerElement;

		}

		function render( start, count ) {

			gl.drawElements( mode, count, type, start * bytesPerElement );

			info.update( count, mode, 1 );

		}

		function renderInstances( start, count, primcount ) {

			if ( primcount === 0 ) return;

			let extension, methodName;

			if ( isWebGL2 ) {

				extension = gl;
				methodName = 'drawElementsInstanced';

			} else {

				extension = extensions.get( 'ANGLE_instanced_arrays' );
				methodName = 'drawElementsInstancedANGLE';

				if ( extension === null ) {

					console.error( 'THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
					return;

				}

			}

			extension[ methodName ]( mode, count, type, start * bytesPerElement, primcount );

			info.update( count, mode, primcount );

		}

		//

		this.setMode = setMode;
		this.setIndex = setIndex;
		this.render = render;
		this.renderInstances = renderInstances;

	}

	function WebGLInfo( gl ) {

		const memory = {
			geometries: 0,
			textures: 0
		};

		const render = {
			frame: 0,
			calls: 0,
			triangles: 0,
			points: 0,
			lines: 0
		};

		function update( count, mode, instanceCount ) {

			render.calls ++;

			switch ( mode ) {

				case 4:
					render.triangles += instanceCount * ( count / 3 );
					break;

				case 1:
					render.lines += instanceCount * ( count / 2 );
					break;

				case 3:
					render.lines += instanceCount * ( count - 1 );
					break;

				case 2:
					render.lines += instanceCount * count;
					break;

				case 0:
					render.points += instanceCount * count;
					break;

				default:
					console.error( 'THREE.WebGLInfo: Unknown draw mode:', mode );
					break;

			}

		}

		function reset() {

			render.frame ++;
			render.calls = 0;
			render.triangles = 0;
			render.points = 0;
			render.lines = 0;

		}

		return {
			memory: memory,
			render: render,
			programs: null,
			autoReset: true,
			reset: reset,
			update: update
		};

	}

	function numericalSort( a, b ) {

		return a[ 0 ] - b[ 0 ];

	}

	function absNumericalSort( a, b ) {

		return Math.abs( b[ 1 ] ) - Math.abs( a[ 1 ] );

	}

	function WebGLMorphtargets( gl ) {

		const influencesList = {};
		const morphInfluences = new Float32Array( 8 );

		const workInfluences = [];

		for ( let i = 0; i < 8; i ++ ) {

			workInfluences[ i ] = [ i, 0 ];

		}

		function update( object, geometry, material, program ) {

			const objectInfluences = object.morphTargetInfluences;

			// When object doesn't have morph target influences defined, we treat it as a 0-length array
			// This is important to make sure we set up morphTargetBaseInfluence / morphTargetInfluences

			const length = objectInfluences === undefined ? 0 : objectInfluences.length;

			let influences = influencesList[ geometry.id ];

			if ( influences === undefined ) {

				// initialise list

				influences = [];

				for ( let i = 0; i < length; i ++ ) {

					influences[ i ] = [ i, 0 ];

				}

				influencesList[ geometry.id ] = influences;

			}

			// Collect influences

			for ( let i = 0; i < length; i ++ ) {

				const influence = influences[ i ];

				influence[ 0 ] = i;
				influence[ 1 ] = objectInfluences[ i ];

			}

			influences.sort( absNumericalSort );

			for ( let i = 0; i < 8; i ++ ) {

				if ( i < length && influences[ i ][ 1 ] ) {

					workInfluences[ i ][ 0 ] = influences[ i ][ 0 ];
					workInfluences[ i ][ 1 ] = influences[ i ][ 1 ];

				} else {

					workInfluences[ i ][ 0 ] = Number.MAX_SAFE_INTEGER;
					workInfluences[ i ][ 1 ] = 0;

				}

			}

			workInfluences.sort( numericalSort );

			const morphTargets = material.morphTargets && geometry.morphAttributes.position;
			const morphNormals = material.morphNormals && geometry.morphAttributes.normal;

			let morphInfluencesSum = 0;

			for ( let i = 0; i < 8; i ++ ) {

				const influence = workInfluences[ i ];
				const index = influence[ 0 ];
				const value = influence[ 1 ];

				if ( index !== Number.MAX_SAFE_INTEGER && value ) {

					if ( morphTargets && geometry.getAttribute( 'morphTarget' + i ) !== morphTargets[ index ] ) {

						geometry.setAttribute( 'morphTarget' + i, morphTargets[ index ] );

					}

					if ( morphNormals && geometry.getAttribute( 'morphNormal' + i ) !== morphNormals[ index ] ) {

						geometry.setAttribute( 'morphNormal' + i, morphNormals[ index ] );

					}

					morphInfluences[ i ] = value;
					morphInfluencesSum += value;

				} else {

					if ( morphTargets && geometry.getAttribute( 'morphTarget' + i ) !== undefined ) {

						geometry.deleteAttribute( 'morphTarget' + i );

					}

					if ( morphNormals && geometry.getAttribute( 'morphNormal' + i ) !== undefined ) {

						geometry.deleteAttribute( 'morphNormal' + i );

					}

					morphInfluences[ i ] = 0;

				}

			}

			// GLSL shader uses formula baseinfluence * base + sum(target * influence)
			// This allows us to switch between absolute morphs and relative morphs without changing shader code
			// When baseinfluence = 1 - sum(influence), the above is equivalent to sum((target - base) * influence)
			const morphBaseInfluence = geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;

			program.getUniforms().setValue( gl, 'morphTargetBaseInfluence', morphBaseInfluence );
			program.getUniforms().setValue( gl, 'morphTargetInfluences', morphInfluences );

		}

		return {

			update: update

		};

	}

	function WebGLObjects( gl, geometries, attributes, info ) {

		let updateMap = new WeakMap();

		function update( object ) {

			const frame = info.render.frame;

			const geometry = object.geometry;
			const buffergeometry = geometries.get( object, geometry );

			// Update once per frame

			if ( updateMap.get( buffergeometry ) !== frame ) {

				if ( geometry.isGeometry ) {

					buffergeometry.updateFromObject( object );

				}

				geometries.update( buffergeometry );

				updateMap.set( buffergeometry, frame );

			}


			return buffergeometry;

		}

		function dispose() {

			updateMap = new WeakMap();

		}

		return {

			update: update,
			dispose: dispose

		};

	}

	function CubeTexture( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding ) {

		images = images !== undefined ? images : [];
		mapping = mapping !== undefined ? mapping : CubeReflectionMapping;
		format = format !== undefined ? format : RGBFormat;

		Texture.call( this, images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

		this.flipY = false;

	}

	CubeTexture.prototype = Object.create( Texture.prototype );
	CubeTexture.prototype.constructor = CubeTexture;

	CubeTexture.prototype.isCubeTexture = true;

	Object.defineProperty( CubeTexture.prototype, 'images', {

		get: function () {

			return this.image;

		},

		set: function ( value ) {

			this.image = value;

		}

	} );

	function DataTexture2DArray( data, width, height, depth ) {

		Texture.call( this, null );

		this.image = { data: data || null, width: width || 1, height: height || 1, depth: depth || 1 };

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;

		this.needsUpdate = true;

	}

	DataTexture2DArray.prototype = Object.create( Texture.prototype );
	DataTexture2DArray.prototype.constructor = DataTexture2DArray;
	DataTexture2DArray.prototype.isDataTexture2DArray = true;

	function DataTexture3D( data, width, height, depth ) {

		// We're going to add .setXXX() methods for setting properties later.
		// Users can still set in DataTexture3D directly.
		//
		//	const texture = new THREE.DataTexture3D( data, width, height, depth );
		// 	texture.anisotropy = 16;
		//
		// See #14839

		Texture.call( this, null );

		this.image = { data: data || null, width: width || 1, height: height || 1, depth: depth || 1 };

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;

		this.needsUpdate = true;


	}

	DataTexture3D.prototype = Object.create( Texture.prototype );
	DataTexture3D.prototype.constructor = DataTexture3D;
	DataTexture3D.prototype.isDataTexture3D = true;

	/**
	 * Uniforms of a program.
	 * Those form a tree structure with a special top-level container for the root,
	 * which you get by calling 'new WebGLUniforms( gl, program )'.
	 *
	 *
	 * Properties of inner nodes including the top-level container:
	 *
	 * .seq - array of nested uniforms
	 * .map - nested uniforms by name
	 *
	 *
	 * Methods of all nodes except the top-level container:
	 *
	 * .setValue( gl, value, [textures] )
	 *
	 * 		uploads a uniform value(s)
	 *  	the 'textures' parameter is needed for sampler uniforms
	 *
	 *
	 * Static methods of the top-level container (textures factorizations):
	 *
	 * .upload( gl, seq, values, textures )
	 *
	 * 		sets uniforms in 'seq' to 'values[id].value'
	 *
	 * .seqWithValue( seq, values ) : filteredSeq
	 *
	 * 		filters 'seq' entries with corresponding entry in values
	 *
	 *
	 * Methods of the top-level container (textures factorizations):
	 *
	 * .setValue( gl, name, value, textures )
	 *
	 * 		sets uniform with  name 'name' to 'value'
	 *
	 * .setOptional( gl, obj, prop )
	 *
	 * 		like .set for an optional property of the object
	 *
	 */

	const emptyTexture = new Texture();
	const emptyTexture2dArray = new DataTexture2DArray();
	const emptyTexture3d = new DataTexture3D();
	const emptyCubeTexture = new CubeTexture();

	// --- Utilities ---

	// Array Caches (provide typed arrays for temporary by size)

	const arrayCacheF32 = [];
	const arrayCacheI32 = [];

	// Float32Array caches used for uploading Matrix uniforms

	const mat4array = new Float32Array( 16 );
	const mat3array = new Float32Array( 9 );
	const mat2array = new Float32Array( 4 );

	// Flattening for arrays of vectors and matrices

	function flatten( array, nBlocks, blockSize ) {

		const firstElem = array[ 0 ];

		if ( firstElem <= 0 || firstElem > 0 ) return array;
		// unoptimized: ! isNaN( firstElem )
		// see http://jacksondunstan.com/articles/983

		const n = nBlocks * blockSize;
		let r = arrayCacheF32[ n ];

		if ( r === undefined ) {

			r = new Float32Array( n );
			arrayCacheF32[ n ] = r;

		}

		if ( nBlocks !== 0 ) {

			firstElem.toArray( r, 0 );

			for ( let i = 1, offset = 0; i !== nBlocks; ++ i ) {

				offset += blockSize;
				array[ i ].toArray( r, offset );

			}

		}

		return r;

	}

	function arraysEqual( a, b ) {

		if ( a.length !== b.length ) return false;

		for ( let i = 0, l = a.length; i < l; i ++ ) {

			if ( a[ i ] !== b[ i ] ) return false;

		}

		return true;

	}

	function copyArray( a, b ) {

		for ( let i = 0, l = b.length; i < l; i ++ ) {

			a[ i ] = b[ i ];

		}

	}

	// Texture unit allocation

	function allocTexUnits( textures, n ) {

		let r = arrayCacheI32[ n ];

		if ( r === undefined ) {

			r = new Int32Array( n );
			arrayCacheI32[ n ] = r;

		}

		for ( let i = 0; i !== n; ++ i ) {

			r[ i ] = textures.allocateTextureUnit();

		}

		return r;

	}

	// --- Setters ---

	// Note: Defining these methods externally, because they come in a bunch
	// and this way their names minify.

	// Single scalar

	function setValueV1f( gl, v ) {

		const cache = this.cache;

		if ( cache[ 0 ] === v ) return;

		gl.uniform1f( this.addr, v );

		cache[ 0 ] = v;

	}

	// Single float vector (from flat array or THREE.VectorN)

	function setValueV2f( gl, v ) {

		const cache = this.cache;

		if ( v.x !== undefined ) {

			if ( cache[ 0 ] !== v.x || cache[ 1 ] !== v.y ) {

				gl.uniform2f( this.addr, v.x, v.y );

				cache[ 0 ] = v.x;
				cache[ 1 ] = v.y;

			}

		} else {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniform2fv( this.addr, v );

			copyArray( cache, v );

		}

	}

	function setValueV3f( gl, v ) {

		const cache = this.cache;

		if ( v.x !== undefined ) {

			if ( cache[ 0 ] !== v.x || cache[ 1 ] !== v.y || cache[ 2 ] !== v.z ) {

				gl.uniform3f( this.addr, v.x, v.y, v.z );

				cache[ 0 ] = v.x;
				cache[ 1 ] = v.y;
				cache[ 2 ] = v.z;

			}

		} else if ( v.r !== undefined ) {

			if ( cache[ 0 ] !== v.r || cache[ 1 ] !== v.g || cache[ 2 ] !== v.b ) {

				gl.uniform3f( this.addr, v.r, v.g, v.b );

				cache[ 0 ] = v.r;
				cache[ 1 ] = v.g;
				cache[ 2 ] = v.b;

			}

		} else {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniform3fv( this.addr, v );

			copyArray( cache, v );

		}

	}

	function setValueV4f( gl, v ) {

		const cache = this.cache;

		if ( v.x !== undefined ) {

			if ( cache[ 0 ] !== v.x || cache[ 1 ] !== v.y || cache[ 2 ] !== v.z || cache[ 3 ] !== v.w ) {

				gl.uniform4f( this.addr, v.x, v.y, v.z, v.w );

				cache[ 0 ] = v.x;
				cache[ 1 ] = v.y;
				cache[ 2 ] = v.z;
				cache[ 3 ] = v.w;

			}

		} else {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniform4fv( this.addr, v );

			copyArray( cache, v );

		}

	}

	// Single matrix (from flat array or MatrixN)

	function setValueM2( gl, v ) {

		const cache = this.cache;
		const elements = v.elements;

		if ( elements === undefined ) {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniformMatrix2fv( this.addr, false, v );

			copyArray( cache, v );

		} else {

			if ( arraysEqual( cache, elements ) ) return;

			mat2array.set( elements );

			gl.uniformMatrix2fv( this.addr, false, mat2array );

			copyArray( cache, elements );

		}

	}

	function setValueM3( gl, v ) {

		const cache = this.cache;
		const elements = v.elements;

		if ( elements === undefined ) {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniformMatrix3fv( this.addr, false, v );

			copyArray( cache, v );

		} else {

			if ( arraysEqual( cache, elements ) ) return;

			mat3array.set( elements );

			gl.uniformMatrix3fv( this.addr, false, mat3array );

			copyArray( cache, elements );

		}

	}

	function setValueM4( gl, v ) {

		const cache = this.cache;
		const elements = v.elements;

		if ( elements === undefined ) {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniformMatrix4fv( this.addr, false, v );

			copyArray( cache, v );

		} else {

			if ( arraysEqual( cache, elements ) ) return;

			mat4array.set( elements );

			gl.uniformMatrix4fv( this.addr, false, mat4array );

			copyArray( cache, elements );

		}

	}

	// Single texture (2D / Cube)

	function setValueT1( gl, v, textures ) {

		const cache = this.cache;
		const unit = textures.allocateTextureUnit();

		if ( cache[ 0 ] !== unit ) {

			gl.uniform1i( this.addr, unit );
			cache[ 0 ] = unit;

		}

		textures.safeSetTexture2D( v || emptyTexture, unit );

	}

	function setValueT2DArray1( gl, v, textures ) {

		const cache = this.cache;
		const unit = textures.allocateTextureUnit();

		if ( cache[ 0 ] !== unit ) {

			gl.uniform1i( this.addr, unit );
			cache[ 0 ] = unit;

		}

		textures.setTexture2DArray( v || emptyTexture2dArray, unit );

	}

	function setValueT3D1( gl, v, textures ) {

		const cache = this.cache;
		const unit = textures.allocateTextureUnit();

		if ( cache[ 0 ] !== unit ) {

			gl.uniform1i( this.addr, unit );
			cache[ 0 ] = unit;

		}

		textures.setTexture3D( v || emptyTexture3d, unit );

	}

	function setValueT6( gl, v, textures ) {

		const cache = this.cache;
		const unit = textures.allocateTextureUnit();

		if ( cache[ 0 ] !== unit ) {

			gl.uniform1i( this.addr, unit );
			cache[ 0 ] = unit;

		}

		textures.safeSetTextureCube( v || emptyCubeTexture, unit );

	}

	// Integer / Boolean vectors or arrays thereof (always flat arrays)

	function setValueV1i( gl, v ) {

		const cache = this.cache;

		if ( cache[ 0 ] === v ) return;

		gl.uniform1i( this.addr, v );

		cache[ 0 ] = v;

	}

	function setValueV2i( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform2iv( this.addr, v );

		copyArray( cache, v );

	}

	function setValueV3i( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform3iv( this.addr, v );

		copyArray( cache, v );

	}

	function setValueV4i( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform4iv( this.addr, v );

		copyArray( cache, v );

	}

	// uint

	function setValueV1ui( gl, v ) {

		const cache = this.cache;

		if ( cache[ 0 ] === v ) return;

		gl.uniform1ui( this.addr, v );

		cache[ 0 ] = v;

	}

	// Helper to pick the right setter for the singular case

	function getSingularSetter( type ) {

		switch ( type ) {

			case 0x1406: return setValueV1f; // FLOAT
			case 0x8b50: return setValueV2f; // _VEC2
			case 0x8b51: return setValueV3f; // _VEC3
			case 0x8b52: return setValueV4f; // _VEC4

			case 0x8b5a: return setValueM2; // _MAT2
			case 0x8b5b: return setValueM3; // _MAT3
			case 0x8b5c: return setValueM4; // _MAT4

			case 0x1404: case 0x8b56: return setValueV1i; // INT, BOOL
			case 0x8b53: case 0x8b57: return setValueV2i; // _VEC2
			case 0x8b54: case 0x8b58: return setValueV3i; // _VEC3
			case 0x8b55: case 0x8b59: return setValueV4i; // _VEC4

			case 0x1405: return setValueV1ui; // UINT

			case 0x8b5e: // SAMPLER_2D
			case 0x8d66: // SAMPLER_EXTERNAL_OES
			case 0x8dca: // INT_SAMPLER_2D
			case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
			case 0x8b62: // SAMPLER_2D_SHADOW
				return setValueT1;

			case 0x8b5f: // SAMPLER_3D
			case 0x8dcb: // INT_SAMPLER_3D
			case 0x8dd3: // UNSIGNED_INT_SAMPLER_3D
				return setValueT3D1;

			case 0x8b60: // SAMPLER_CUBE
			case 0x8dcc: // INT_SAMPLER_CUBE
			case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
			case 0x8dc5: // SAMPLER_CUBE_SHADOW
				return setValueT6;

			case 0x8dc1: // SAMPLER_2D_ARRAY
			case 0x8dcf: // INT_SAMPLER_2D_ARRAY
			case 0x8dd7: // UNSIGNED_INT_SAMPLER_2D_ARRAY
			case 0x8dc4: // SAMPLER_2D_ARRAY_SHADOW
				return setValueT2DArray1;

		}

	}

	// Array of scalars
	function setValueV1fArray( gl, v ) {

		gl.uniform1fv( this.addr, v );

	}

	// Integer / Boolean vectors or arrays thereof (always flat arrays)
	function setValueV1iArray( gl, v ) {

		gl.uniform1iv( this.addr, v );

	}

	function setValueV2iArray( gl, v ) {

		gl.uniform2iv( this.addr, v );

	}

	function setValueV3iArray( gl, v ) {

		gl.uniform3iv( this.addr, v );

	}

	function setValueV4iArray( gl, v ) {

		gl.uniform4iv( this.addr, v );

	}


	// Array of vectors (flat or from THREE classes)

	function setValueV2fArray( gl, v ) {

		const data = flatten( v, this.size, 2 );

		gl.uniform2fv( this.addr, data );

	}

	function setValueV3fArray( gl, v ) {

		const data = flatten( v, this.size, 3 );

		gl.uniform3fv( this.addr, data );

	}

	function setValueV4fArray( gl, v ) {

		const data = flatten( v, this.size, 4 );

		gl.uniform4fv( this.addr, data );

	}

	// Array of matrices (flat or from THREE clases)

	function setValueM2Array( gl, v ) {

		const data = flatten( v, this.size, 4 );

		gl.uniformMatrix2fv( this.addr, false, data );

	}

	function setValueM3Array( gl, v ) {

		const data = flatten( v, this.size, 9 );

		gl.uniformMatrix3fv( this.addr, false, data );

	}

	function setValueM4Array( gl, v ) {

		const data = flatten( v, this.size, 16 );

		gl.uniformMatrix4fv( this.addr, false, data );

	}

	// Array of textures (2D / Cube)

	function setValueT1Array( gl, v, textures ) {

		const n = v.length;

		const units = allocTexUnits( textures, n );

		gl.uniform1iv( this.addr, units );

		for ( let i = 0; i !== n; ++ i ) {

			textures.safeSetTexture2D( v[ i ] || emptyTexture, units[ i ] );

		}

	}

	function setValueT6Array( gl, v, textures ) {

		const n = v.length;

		const units = allocTexUnits( textures, n );

		gl.uniform1iv( this.addr, units );

		for ( let i = 0; i !== n; ++ i ) {

			textures.safeSetTextureCube( v[ i ] || emptyCubeTexture, units[ i ] );

		}

	}

	// Helper to pick the right setter for a pure (bottom-level) array

	function getPureArraySetter( type ) {

		switch ( type ) {

			case 0x1406: return setValueV1fArray; // FLOAT
			case 0x8b50: return setValueV2fArray; // _VEC2
			case 0x8b51: return setValueV3fArray; // _VEC3
			case 0x8b52: return setValueV4fArray; // _VEC4

			case 0x8b5a: return setValueM2Array; // _MAT2
			case 0x8b5b: return setValueM3Array; // _MAT3
			case 0x8b5c: return setValueM4Array; // _MAT4

			case 0x1404: case 0x8b56: return setValueV1iArray; // INT, BOOL
			case 0x8b53: case 0x8b57: return setValueV2iArray; // _VEC2
			case 0x8b54: case 0x8b58: return setValueV3iArray; // _VEC3
			case 0x8b55: case 0x8b59: return setValueV4iArray; // _VEC4

			case 0x8b5e: // SAMPLER_2D
			case 0x8d66: // SAMPLER_EXTERNAL_OES
			case 0x8dca: // INT_SAMPLER_2D
			case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
			case 0x8b62: // SAMPLER_2D_SHADOW
				return setValueT1Array;

			case 0x8b60: // SAMPLER_CUBE
			case 0x8dcc: // INT_SAMPLER_CUBE
			case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
			case 0x8dc5: // SAMPLER_CUBE_SHADOW
				return setValueT6Array;

		}

	}

	// --- Uniform Classes ---

	function SingleUniform( id, activeInfo, addr ) {

		this.id = id;
		this.addr = addr;
		this.cache = [];
		this.setValue = getSingularSetter( activeInfo.type );

		// this.path = activeInfo.name; // DEBUG

	}

	function PureArrayUniform( id, activeInfo, addr ) {

		this.id = id;
		this.addr = addr;
		this.cache = [];
		this.size = activeInfo.size;
		this.setValue = getPureArraySetter( activeInfo.type );

		// this.path = activeInfo.name; // DEBUG

	}

	PureArrayUniform.prototype.updateCache = function ( data ) {

		const cache = this.cache;

		if ( data instanceof Float32Array && cache.length !== data.length ) {

			this.cache = new Float32Array( data.length );

		}

		copyArray( cache, data );

	};

	function StructuredUniform( id ) {

		this.id = id;

		this.seq = [];
		this.map = {};

	}

	StructuredUniform.prototype.setValue = function ( gl, value, textures ) {

		const seq = this.seq;

		for ( let i = 0, n = seq.length; i !== n; ++ i ) {

			const u = seq[ i ];
			u.setValue( gl, value[ u.id ], textures );

		}

	};

	// --- Top-level ---

	// Parser - builds up the property tree from the path strings

	const RePathPart = /([\w\d_]+)(\])?(\[|\.)?/g;

	// extracts
	// 	- the identifier (member name or array index)
	//  - followed by an optional right bracket (found when array index)
	//  - followed by an optional left bracket or dot (type of subscript)
	//
	// Note: These portions can be read in a non-overlapping fashion and
	// allow straightforward parsing of the hierarchy that WebGL encodes
	// in the uniform names.

	function addUniform( container, uniformObject ) {

		container.seq.push( uniformObject );
		container.map[ uniformObject.id ] = uniformObject;

	}

	function parseUniform( activeInfo, addr, container ) {

		const path = activeInfo.name,
			pathLength = path.length;

		// reset RegExp object, because of the early exit of a previous run
		RePathPart.lastIndex = 0;

		while ( true ) {

			const match = RePathPart.exec( path ),
				matchEnd = RePathPart.lastIndex;

			let id = match[ 1 ];
			const idIsIndex = match[ 2 ] === ']',
				subscript = match[ 3 ];

			if ( idIsIndex ) id = id | 0; // convert to integer

			if ( subscript === undefined || subscript === '[' && matchEnd + 2 === pathLength ) {

				// bare name or "pure" bottom-level array "[0]" suffix

				addUniform( container, subscript === undefined ?
					new SingleUniform( id, activeInfo, addr ) :
					new PureArrayUniform( id, activeInfo, addr ) );

				break;

			} else {

				// step into inner node / create it in case it doesn't exist

				const map = container.map;
				let next = map[ id ];

				if ( next === undefined ) {

					next = new StructuredUniform( id );
					addUniform( container, next );

				}

				container = next;

			}

		}

	}

	// Root Container

	function WebGLUniforms( gl, program ) {

		this.seq = [];
		this.map = {};

		const n = gl.getProgramParameter( program, 35718 );

		for ( let i = 0; i < n; ++ i ) {

			const info = gl.getActiveUniform( program, i ),
				addr = gl.getUniformLocation( program, info.name );

			parseUniform( info, addr, this );

		}

	}

	WebGLUniforms.prototype.setValue = function ( gl, name, value, textures ) {

		const u = this.map[ name ];

		if ( u !== undefined ) u.setValue( gl, value, textures );

	};

	WebGLUniforms.prototype.setOptional = function ( gl, object, name ) {

		const v = object[ name ];

		if ( v !== undefined ) this.setValue( gl, name, v );

	};


	// Static interface

	WebGLUniforms.upload = function ( gl, seq, values, textures ) {

		for ( let i = 0, n = seq.length; i !== n; ++ i ) {

			const u = seq[ i ],
				v = values[ u.id ];

			if ( v.needsUpdate !== false ) {

				// note: always updating when .needsUpdate is undefined
				u.setValue( gl, v.value, textures );

			}

		}

	};

	WebGLUniforms.seqWithValue = function ( seq, values ) {

		const r = [];

		for ( let i = 0, n = seq.length; i !== n; ++ i ) {

			const u = seq[ i ];
			if ( u.id in values ) r.push( u );

		}

		return r;

	};

	function WebGLShader( gl, type, string ) {

		const shader = gl.createShader( type );

		gl.shaderSource( shader, string );
		gl.compileShader( shader );

		return shader;

	}

	let programIdCount = 0;

	function addLineNumbers( string ) {

		const lines = string.split( '\n' );

		for ( let i = 0; i < lines.length; i ++ ) {

			lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];

		}

		return lines.join( '\n' );

	}

	function getEncodingComponents( encoding ) {

		switch ( encoding ) {

			case LinearEncoding:
				return [ 'Linear', '( value )' ];
			case sRGBEncoding:
				return [ 'sRGB', '( value )' ];
			case RGBEEncoding:
				return [ 'RGBE', '( value )' ];
			case RGBM7Encoding:
				return [ 'RGBM', '( value, 7.0 )' ];
			case RGBM16Encoding:
				return [ 'RGBM', '( value, 16.0 )' ];
			case RGBDEncoding:
				return [ 'RGBD', '( value, 256.0 )' ];
			case GammaEncoding:
				return [ 'Gamma', '( value, float( GAMMA_FACTOR ) )' ];
			case LogLuvEncoding:
				return [ 'LogLuv', '( value )' ];
			default:
				console.warn( 'THREE.WebGLProgram: Unsupported encoding:', encoding );
				return [ 'Linear', '( value )' ];

		}

	}

	function getShaderErrors( gl, shader, type ) {

		const status = gl.getShaderParameter( shader, 35713 );
		const log = gl.getShaderInfoLog( shader ).trim();

		if ( status && log === '' ) return '';

		// --enable-privileged-webgl-extension
		// console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

		const source = gl.getShaderSource( shader );

		return 'THREE.WebGLShader: gl.getShaderInfoLog() ' + type + '\n' + log + addLineNumbers( source );

	}

	function getTexelDecodingFunction( functionName, encoding ) {

		const components = getEncodingComponents( encoding );
		return 'vec4 ' + functionName + '( vec4 value ) { return ' + components[ 0 ] + 'ToLinear' + components[ 1 ] + '; }';

	}

	function getTexelEncodingFunction( functionName, encoding ) {

		const components = getEncodingComponents( encoding );
		return 'vec4 ' + functionName + '( vec4 value ) { return LinearTo' + components[ 0 ] + components[ 1 ] + '; }';

	}

	function getToneMappingFunction( functionName, toneMapping ) {

		let toneMappingName;

		switch ( toneMapping ) {

			case LinearToneMapping:
				toneMappingName = 'Linear';
				break;

			case ReinhardToneMapping:
				toneMappingName = 'Reinhard';
				break;

			case CineonToneMapping:
				toneMappingName = 'OptimizedCineon';
				break;

			case ACESFilmicToneMapping:
				toneMappingName = 'ACESFilmic';
				break;

			case CustomToneMapping:
				toneMappingName = 'Custom';
				break;

			default:
				console.warn( 'THREE.WebGLProgram: Unsupported toneMapping:', toneMapping );
				toneMappingName = 'Linear';

		}

		return 'vec3 ' + functionName + '( vec3 color ) { return ' + toneMappingName + 'ToneMapping( color ); }';

	}

	function generateExtensions( parameters ) {

		const chunks = [
			( parameters.extensionDerivatives || parameters.envMapCubeUV || parameters.bumpMap || parameters.tangentSpaceNormalMap || parameters.clearcoatNormalMap || parameters.flatShading || parameters.shaderID === 'physical' ) ? '#extension GL_OES_standard_derivatives : enable' : '',
			( parameters.extensionFragDepth || parameters.logarithmicDepthBuffer ) && parameters.rendererExtensionFragDepth ? '#extension GL_EXT_frag_depth : enable' : '',
			( parameters.extensionDrawBuffers && parameters.rendererExtensionDrawBuffers ) ? '#extension GL_EXT_draw_buffers : require' : '',
			( parameters.extensionShaderTextureLOD || parameters.envMap ) && parameters.rendererExtensionShaderTextureLod ? '#extension GL_EXT_shader_texture_lod : enable' : ''
		];

		return chunks.filter( filterEmptyLine ).join( '\n' );

	}

	function generateDefines( defines ) {

		const chunks = [];

		for ( const name in defines ) {

			const value = defines[ name ];

			if ( value === false ) continue;

			chunks.push( '#define ' + name + ' ' + value );

		}

		return chunks.join( '\n' );

	}

	function fetchAttributeLocations( gl, program ) {

		const attributes = {};

		const n = gl.getProgramParameter( program, 35721 );

		for ( let i = 0; i < n; i ++ ) {

			const info = gl.getActiveAttrib( program, i );
			const name = info.name;

			// console.log( 'THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:', name, i );

			attributes[ name ] = gl.getAttribLocation( program, name );

		}

		return attributes;

	}

	function filterEmptyLine( string ) {

		return string !== '';

	}

	function replaceLightNums( string, parameters ) {

		return string
			.replace( /NUM_DIR_LIGHTS/g, parameters.numDirLights )
			.replace( /NUM_SPOT_LIGHTS/g, parameters.numSpotLights )
			.replace( /NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights )
			.replace( /NUM_POINT_LIGHTS/g, parameters.numPointLights )
			.replace( /NUM_HEMI_LIGHTS/g, parameters.numHemiLights )
			.replace( /NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows )
			.replace( /NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows )
			.replace( /NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows );

	}

	function replaceClippingPlaneNums( string, parameters ) {

		return string
			.replace( /NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes )
			.replace( /UNION_CLIPPING_PLANES/g, ( parameters.numClippingPlanes - parameters.numClipIntersection ) );

	}

	// Resolve Includes

	const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;

	function resolveIncludes( string ) {

		return string.replace( includePattern, includeReplacer );

	}

	function includeReplacer( match, include ) {

		const string = ShaderChunk[ include ];

		if ( string === undefined ) {

			throw new Error( 'Can not resolve #include <' + include + '>' );

		}

		return resolveIncludes( string );

	}

	// Unroll Loops

	const deprecatedUnrollLoopPattern = /#pragma unroll_loop[\s]+?for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;
	const unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

	function unrollLoops( string ) {

		return string
			.replace( unrollLoopPattern, loopReplacer )
			.replace( deprecatedUnrollLoopPattern, deprecatedLoopReplacer );

	}

	function deprecatedLoopReplacer( match, start, end, snippet ) {

		console.warn( 'WebGLProgram: #pragma unroll_loop shader syntax is deprecated. Please use #pragma unroll_loop_start syntax instead.' );
		return loopReplacer( match, start, end, snippet );

	}

	function loopReplacer( match, start, end, snippet ) {

		let string = '';

		for ( let i = parseInt( start ); i < parseInt( end ); i ++ ) {

			string += snippet
				.replace( /\[\s*i\s*\]/g, '[ ' + i + ' ]' )
				.replace( /UNROLLED_LOOP_INDEX/g, i );

		}

		return string;

	}

	//

	function generatePrecision( parameters ) {

		let precisionstring = "precision " + parameters.precision + " float;\nprecision " + parameters.precision + " int;";

		if ( parameters.precision === "highp" ) {

			precisionstring += "\n#define HIGH_PRECISION";

		} else if ( parameters.precision === "mediump" ) {

			precisionstring += "\n#define MEDIUM_PRECISION";

		} else if ( parameters.precision === "lowp" ) {

			precisionstring += "\n#define LOW_PRECISION";

		}

		return precisionstring;

	}

	function generateShadowMapTypeDefine( parameters ) {

		let shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';

		if ( parameters.shadowMapType === PCFShadowMap ) {

			shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';

		} else if ( parameters.shadowMapType === PCFSoftShadowMap ) {

			shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';

		} else if ( parameters.shadowMapType === VSMShadowMap ) {

			shadowMapTypeDefine = 'SHADOWMAP_TYPE_VSM';

		}

		return shadowMapTypeDefine;

	}

	function generateEnvMapTypeDefine( parameters ) {

		let envMapTypeDefine = 'ENVMAP_TYPE_CUBE';

		if ( parameters.envMap ) {

			switch ( parameters.envMapMode ) {

				case CubeReflectionMapping:
				case CubeRefractionMapping:
					envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
					break;

				case CubeUVReflectionMapping:
				case CubeUVRefractionMapping:
					envMapTypeDefine = 'ENVMAP_TYPE_CUBE_UV';
					break;

			}

		}

		return envMapTypeDefine;

	}

	function generateEnvMapModeDefine( parameters ) {

		let envMapModeDefine = 'ENVMAP_MODE_REFLECTION';

		if ( parameters.envMap ) {

			switch ( parameters.envMapMode ) {

				case CubeRefractionMapping:
				case CubeUVRefractionMapping:

					envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
					break;

			}

		}

		return envMapModeDefine;

	}

	function generateEnvMapBlendingDefine( parameters ) {

		let envMapBlendingDefine = 'ENVMAP_BLENDING_NONE';

		if ( parameters.envMap ) {

			switch ( parameters.combine ) {

				case MultiplyOperation:
					envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
					break;

				case MixOperation:
					envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
					break;

				case AddOperation:
					envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
					break;

			}

		}

		return envMapBlendingDefine;

	}

	function WebGLProgram( renderer, cacheKey, parameters, bindingStates ) {

		const gl = renderer.getContext();

		const defines = parameters.defines;

		let vertexShader = parameters.vertexShader;
		let fragmentShader = parameters.fragmentShader;

		const shadowMapTypeDefine = generateShadowMapTypeDefine( parameters );
		const envMapTypeDefine = generateEnvMapTypeDefine( parameters );
		const envMapModeDefine = generateEnvMapModeDefine( parameters );
		const envMapBlendingDefine = generateEnvMapBlendingDefine( parameters );


		const gammaFactorDefine = ( renderer.gammaFactor > 0 ) ? renderer.gammaFactor : 1.0;

		const customExtensions = parameters.isWebGL2 ? '' : generateExtensions( parameters );

		const customDefines = generateDefines( defines );

		const program = gl.createProgram();

		let prefixVertex, prefixFragment;
		let versionString = parameters.glslVersion ? '#version ' + parameters.glslVersion + "\n" : '';


			prefixVertex = [

				generatePrecision( parameters ),

				'#define SHADER_NAME ' + parameters.shaderName,

				customDefines,

				parameters.instancing ? '#define USE_INSTANCING' : '',
				parameters.instancingColor ? '#define USE_INSTANCING_COLOR' : '',

				parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',

				'#define GAMMA_FACTOR ' + gammaFactorDefine,

				'#define MAX_BONES ' + parameters.maxBones,
				( parameters.useFog && parameters.fog ) ? '#define USE_FOG' : '',
				( parameters.useFog && parameters.fogExp2 ) ? '#define FOG_EXP2' : '',

				parameters.map ? '#define USE_MAP' : '',
				parameters.envMap ? '#define USE_ENVMAP' : '',
				parameters.envMap ? '#define ' + envMapModeDefine : '',
				parameters.lightMap ? '#define USE_LIGHTMAP' : '',
				parameters.aoMap ? '#define USE_AOMAP' : '',
				parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
				parameters.bumpMap ? '#define USE_BUMPMAP' : '',
				parameters.normalMap ? '#define USE_NORMALMAP' : '',
				( parameters.normalMap && parameters.objectSpaceNormalMap ) ? '#define OBJECTSPACE_NORMALMAP' : '',
				( parameters.normalMap && parameters.tangentSpaceNormalMap ) ? '#define TANGENTSPACE_NORMALMAP' : '',

				parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
				parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
				parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',
				parameters.displacementMap && parameters.supportsVertexTextures ? '#define USE_DISPLACEMENTMAP' : '',
				parameters.specularMap ? '#define USE_SPECULARMAP' : '',
				parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
				parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
				parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
				parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',

				parameters.vertexTangents ? '#define USE_TANGENT' : '',
				parameters.vertexColors ? '#define USE_COLOR' : '',
				parameters.vertexUvs ? '#define USE_UV' : '',
				parameters.uvsVertexOnly ? '#define UVS_VERTEX_ONLY' : '',

				parameters.flatShading ? '#define FLAT_SHADED' : '',

				parameters.skinning ? '#define USE_SKINNING' : '',
				parameters.useVertexTexture ? '#define BONE_TEXTURE' : '',

				parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
				parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
				parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
				parameters.flipSided ? '#define FLIP_SIDED' : '',

				parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
				parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

				parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

				parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
				( parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth ) ? '#define USE_LOGDEPTHBUF_EXT' : '',

				'uniform mat4 modelMatrix;',
				'uniform mat4 modelViewMatrix;',
				'uniform mat4 projectionMatrix;',
				'uniform mat4 viewMatrix;',
				'uniform mat3 normalMatrix;',
				'uniform vec3 cameraPosition;',
				'uniform bool isOrthographic;',

				'#ifdef USE_INSTANCING',

				'	attribute mat4 instanceMatrix;',

				'#endif',

				'#ifdef USE_INSTANCING_COLOR',

				'	attribute vec3 instanceColor;',

				'#endif',

				'attribute vec3 position;',
				'attribute vec3 normal;',
				'attribute vec2 uv;',

				'#ifdef USE_TANGENT',

				'	attribute vec4 tangent;',

				'#endif',

				'#ifdef USE_COLOR',

				'	attribute vec3 color;',

				'#endif',

				'#ifdef USE_MORPHTARGETS',

				'	attribute vec3 morphTarget0;',
				'	attribute vec3 morphTarget1;',
				'	attribute vec3 morphTarget2;',
				'	attribute vec3 morphTarget3;',

				'	#ifdef USE_MORPHNORMALS',

				'		attribute vec3 morphNormal0;',
				'		attribute vec3 morphNormal1;',
				'		attribute vec3 morphNormal2;',
				'		attribute vec3 morphNormal3;',

				'	#else',

				'		attribute vec3 morphTarget4;',
				'		attribute vec3 morphTarget5;',
				'		attribute vec3 morphTarget6;',
				'		attribute vec3 morphTarget7;',

				'	#endif',

				'#endif',

				'#ifdef USE_SKINNING',

				'	attribute vec4 skinIndex;',
				'	attribute vec4 skinWeight;',

				'#endif',

				'\n'

			].filter( filterEmptyLine ).join( '\n' );

			prefixFragment = [

				customExtensions,

				generatePrecision( parameters ),

				'#define SHADER_NAME ' + parameters.shaderName,

				customDefines,

				parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest + ( parameters.alphaTest % 1 ? '' : '.0' ) : '', // add '.0' if integer

				'#define GAMMA_FACTOR ' + gammaFactorDefine,

				( parameters.useFog && parameters.fog ) ? '#define USE_FOG' : '',
				( parameters.useFog && parameters.fogExp2 ) ? '#define FOG_EXP2' : '',

				parameters.map ? '#define USE_MAP' : '',
				parameters.matcap ? '#define USE_MATCAP' : '',
				parameters.envMap ? '#define USE_ENVMAP' : '',
				parameters.envMap ? '#define ' + envMapTypeDefine : '',
				parameters.envMap ? '#define ' + envMapModeDefine : '',
				parameters.envMap ? '#define ' + envMapBlendingDefine : '',
				parameters.lightMap ? '#define USE_LIGHTMAP' : '',
				parameters.aoMap ? '#define USE_AOMAP' : '',
				parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
				parameters.bumpMap ? '#define USE_BUMPMAP' : '',
				parameters.normalMap ? '#define USE_NORMALMAP' : '',
				( parameters.normalMap && parameters.objectSpaceNormalMap ) ? '#define OBJECTSPACE_NORMALMAP' : '',
				( parameters.normalMap && parameters.tangentSpaceNormalMap ) ? '#define TANGENTSPACE_NORMALMAP' : '',
				parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
				parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
				parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',
				parameters.specularMap ? '#define USE_SPECULARMAP' : '',
				parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
				parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
				parameters.alphaMap ? '#define USE_ALPHAMAP' : '',

				parameters.sheen ? '#define USE_SHEEN' : '',
				parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',

				parameters.vertexTangents ? '#define USE_TANGENT' : '',
				parameters.vertexColors || parameters.instancingColor ? '#define USE_COLOR' : '',
				parameters.vertexUvs ? '#define USE_UV' : '',
				parameters.uvsVertexOnly ? '#define UVS_VERTEX_ONLY' : '',

				parameters.gradientMap ? '#define USE_GRADIENTMAP' : '',

				parameters.flatShading ? '#define FLAT_SHADED' : '',

				parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
				parameters.flipSided ? '#define FLIP_SIDED' : '',

				parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
				parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

				parameters.premultipliedAlpha ? '#define PREMULTIPLIED_ALPHA' : '',

				parameters.physicallyCorrectLights ? '#define PHYSICALLY_CORRECT_LIGHTS' : '',

				parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
				( parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth ) ? '#define USE_LOGDEPTHBUF_EXT' : '',

				( ( parameters.extensionShaderTextureLOD || parameters.envMap ) && parameters.rendererExtensionShaderTextureLod ) ? '#define TEXTURE_LOD_EXT' : '',

				'uniform mat4 viewMatrix;',
				'uniform vec3 cameraPosition;',
				'uniform bool isOrthographic;',

				( parameters.toneMapping !== NoToneMapping ) ? '#define TONE_MAPPING' : '',
				( parameters.toneMapping !== NoToneMapping ) ? ShaderChunk[ 'tonemapping_pars_fragment' ] : '', // this code is required here because it is used by the toneMapping() function defined below
				( parameters.toneMapping !== NoToneMapping ) ? getToneMappingFunction( 'toneMapping', parameters.toneMapping ) : '',

				parameters.dithering ? '#define DITHERING' : '',

				ShaderChunk[ 'encodings_pars_fragment' ], // this code is required here because it is used by the various encoding/decoding function defined below
				parameters.map ? getTexelDecodingFunction( 'mapTexelToLinear', parameters.mapEncoding ) : '',
				parameters.matcap ? getTexelDecodingFunction( 'matcapTexelToLinear', parameters.matcapEncoding ) : '',
				parameters.envMap ? getTexelDecodingFunction( 'envMapTexelToLinear', parameters.envMapEncoding ) : '',
				parameters.emissiveMap ? getTexelDecodingFunction( 'emissiveMapTexelToLinear', parameters.emissiveMapEncoding ) : '',
				parameters.lightMap ? getTexelDecodingFunction( 'lightMapTexelToLinear', parameters.lightMapEncoding ) : '',
				getTexelEncodingFunction( 'linearToOutputTexel', parameters.outputEncoding ),

				parameters.depthPacking ? '#define DEPTH_PACKING ' + parameters.depthPacking : '',

				'\n'

			].filter( filterEmptyLine ).join( '\n' );

		

		vertexShader = resolveIncludes( vertexShader );
		vertexShader = replaceLightNums( vertexShader, parameters );
		vertexShader = replaceClippingPlaneNums( vertexShader, parameters );

		fragmentShader = resolveIncludes( fragmentShader );
		fragmentShader = replaceLightNums( fragmentShader, parameters );
		fragmentShader = replaceClippingPlaneNums( fragmentShader, parameters );

		vertexShader = unrollLoops( vertexShader );
		fragmentShader = unrollLoops( fragmentShader );

		if ( parameters.isWebGL2 && parameters.isRawShaderMaterial !== true ) {

			// GLSL 3.0 conversion for built-in materials and ShaderMaterial

			versionString = '#version 300 es\n';

			prefixVertex = [
				'#define attribute in',
				'#define varying out',
				'#define texture2D texture'
			].join( '\n' ) + '\n' + prefixVertex;

			prefixFragment = [
				'#define varying in',
				( parameters.glslVersion === GLSL3 ) ? '' : 'out highp vec4 pc_fragColor;',
				( parameters.glslVersion === GLSL3 ) ? '' : '#define gl_FragColor pc_fragColor',
				'#define gl_FragDepthEXT gl_FragDepth',
				'#define texture2D texture',
				'#define textureCube texture',
				'#define texture2DProj textureProj',
				'#define texture2DLodEXT textureLod',
				'#define texture2DProjLodEXT textureProjLod',
				'#define textureCubeLodEXT textureLod',
				'#define texture2DGradEXT textureGrad',
				'#define texture2DProjGradEXT textureProjGrad',
				'#define textureCubeGradEXT textureGrad'
			].join( '\n' ) + '\n' + prefixFragment;

		}

		const vertexGlsl = versionString + prefixVertex + vertexShader;
		const fragmentGlsl = versionString + prefixFragment + fragmentShader;

		// console.log( '*VERTEX*', vertexGlsl );
		// console.log( '*FRAGMENT*', fragmentGlsl );

		const glVertexShader = WebGLShader( gl, 35633, vertexGlsl );
		const glFragmentShader = WebGLShader( gl, 35632, fragmentGlsl );

		gl.attachShader( program, glVertexShader );
		gl.attachShader( program, glFragmentShader );

		// Force a particular attribute to index 0.

		if ( parameters.index0AttributeName !== undefined ) {

			gl.bindAttribLocation( program, 0, parameters.index0AttributeName );

		} else if ( parameters.morphTargets === true ) {

			// programs with morphTargets displace position out of attribute 0
			gl.bindAttribLocation( program, 0, 'position' );

		}

		gl.linkProgram( program );

		// check for link errors
		if ( renderer.debug.checkShaderErrors ) {

			const programLog = gl.getProgramInfoLog( program ).trim();
			const vertexLog = gl.getShaderInfoLog( glVertexShader ).trim();
			const fragmentLog = gl.getShaderInfoLog( glFragmentShader ).trim();

			let runnable = true;
			let haveDiagnostics = true;

			if ( gl.getProgramParameter( program, 35714 ) === false ) {

				runnable = false;

				const vertexErrors = getShaderErrors( gl, glVertexShader, 'vertex' );
				const fragmentErrors = getShaderErrors( gl, glFragmentShader, 'fragment' );

				console.error( 'THREE.WebGLProgram: shader error: ', gl.getError(), '35715', gl.getProgramParameter( program, 35715 ), 'gl.getProgramInfoLog', programLog, vertexErrors, fragmentErrors );

			} else if ( programLog !== '' ) {

				console.warn( 'THREE.WebGLProgram: gl.getProgramInfoLog()', programLog );

			} else if ( vertexLog === '' || fragmentLog === '' ) {

				haveDiagnostics = false;

			}

			if ( haveDiagnostics ) {

				this.diagnostics = {

					runnable: runnable,

					programLog: programLog,

					vertexShader: {

						log: vertexLog,
						prefix: prefixVertex

					},

					fragmentShader: {

						log: fragmentLog,
						prefix: prefixFragment

					}

				};

			}

		}

		// Clean up

		// Crashes in iOS9 and iOS10. #18402
		// gl.detachShader( program, glVertexShader );
		// gl.detachShader( program, glFragmentShader );

		gl.deleteShader( glVertexShader );
		gl.deleteShader( glFragmentShader );

		// set up caching for uniform locations

		let cachedUniforms;

		this.getUniforms = function () {

			if ( cachedUniforms === undefined ) {

				cachedUniforms = new WebGLUniforms( gl, program );

			}

			return cachedUniforms;

		};

		// set up caching for attribute locations

		let cachedAttributes;

		this.getAttributes = function () {

			if ( cachedAttributes === undefined ) {

				cachedAttributes = fetchAttributeLocations( gl, program );

			}

			return cachedAttributes;

		};

		// free resource

		this.destroy = function () {

			bindingStates.releaseStatesOfProgram( this );

			gl.deleteProgram( program );
			this.program = undefined;

		};

		//

		this.name = parameters.shaderName;
		this.id = programIdCount ++;
		this.cacheKey = cacheKey;
		this.usedTimes = 1;
		this.program = program;
		this.vertexShader = glVertexShader;
		this.fragmentShader = glFragmentShader;

		return this;

	}

	function WebGLPrograms( renderer, cubemaps, extensions, capabilities, bindingStates, clipping ) {

		const programs = [];

		const isWebGL2 = capabilities.isWebGL2;
		const logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
		const floatVertexTextures = capabilities.floatVertexTextures;
		const maxVertexUniforms = capabilities.maxVertexUniforms;
		const vertexTextures = capabilities.vertexTextures;

		let precision = capabilities.precision;

		const shaderIDs = {
			MeshBasicMaterial: 'basic',
			MeshStandardMaterial: 'physical',
			LineBasicMaterial: 'basic'
		};


		function getTextureEncodingFromMap( map ) {

			let encoding;

			if ( ! map ) {

				encoding = LinearEncoding;

			} else if ( map.isTexture ) {

				encoding = map.encoding;

			} else if ( map.isWebGLRenderTarget ) {

				console.warn( "THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead." );
				encoding = map.texture.encoding;

			}

			return encoding;

		}

		function getParameters( material, lights, shadows, scene, object ) {

			const fog = scene.fog;
			const environment = material.isMeshStandardMaterial ? scene.environment : null;

			const envMap = cubemaps.get( material.envMap || environment );

			const shaderID = shaderIDs[ material.type ];

			// heuristics to create shader parameters according to lights in the scene
			// (not to blow over maxLights budget)

			const maxBones =  0;

			if ( material.precision !== null ) {

				precision = capabilities.getMaxPrecision( material.precision );

				if ( precision !== material.precision ) {

					console.warn( 'THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.' );

				}

			}

			let vertexShader, fragmentShader;

			if ( shaderID ) {

				const shader = ShaderLib[ shaderID ];

				vertexShader = shader.vertexShader;
				fragmentShader = shader.fragmentShader;

			} else {

				vertexShader = material.vertexShader;
				fragmentShader = material.fragmentShader;

			}

			const currentRenderTarget = renderer.getRenderTarget();

			const parameters = {

				isWebGL2: isWebGL2,

				shaderID: shaderID,
				shaderName: material.type,

				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				defines: material.defines,

				glslVersion: material.glslVersion,

				precision: precision,

				supportsVertexTextures: vertexTextures,
				outputEncoding: ( currentRenderTarget !== null ) ? getTextureEncodingFromMap( currentRenderTarget.texture ) : renderer.outputEncoding,
				map: !! material.map,
				mapEncoding: getTextureEncodingFromMap( material.map ),
				matcap: !! material.matcap,
				matcapEncoding: getTextureEncodingFromMap( material.matcap ),
				envMap: !! envMap,
				envMapMode: envMap && envMap.mapping,
				envMapEncoding: getTextureEncodingFromMap( envMap ),
				envMapCubeUV: ( !! envMap ) && ( ( envMap.mapping === CubeUVReflectionMapping ) || ( envMap.mapping === CubeUVRefractionMapping ) ),
				lightMap: !! material.lightMap,
				lightMapEncoding: getTextureEncodingFromMap( material.lightMap ),
				aoMap: !! material.aoMap,
				emissiveMap: !! material.emissiveMap,
				emissiveMapEncoding: getTextureEncodingFromMap( material.emissiveMap ),
				bumpMap: !! material.bumpMap,
				normalMap: !! material.normalMap,
				objectSpaceNormalMap: material.normalMapType === ObjectSpaceNormalMap,
				tangentSpaceNormalMap: material.normalMapType === TangentSpaceNormalMap,
				clearcoatMap: !! material.clearcoatMap,
				clearcoatRoughnessMap: !! material.clearcoatRoughnessMap,
				clearcoatNormalMap: !! material.clearcoatNormalMap,
				displacementMap: !! material.displacementMap,
				roughnessMap: !! material.roughnessMap,
				metalnessMap: !! material.metalnessMap,
				specularMap: !! material.specularMap,
				alphaMap: !! material.alphaMap,

				gradientMap: !! material.gradientMap,

				sheen: !! material.sheen,

				transmissionMap: !! material.transmissionMap,

				combine: material.combine,

				vertexTangents: ( material.normalMap && material.vertexTangents ),
				vertexColors: material.vertexColors,
				vertexUvs: !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatMap || !! material.clearcoatRoughnessMap || !! material.clearcoatNormalMap || !! material.displacementMap || !! material.transmissionMap,
				uvsVertexOnly: ! ( !! material.map || !! material.bumpMap || !! material.normalMap || !! material.specularMap || !! material.alphaMap || !! material.emissiveMap || !! material.roughnessMap || !! material.metalnessMap || !! material.clearcoatNormalMap || !! material.transmissionMap ) && !! material.displacementMap,

				fog: !! fog,
				useFog: material.fog,
				fogExp2: ( fog && fog.isFogExp2 ),

				flatShading: material.flatShading,

				sizeAttenuation: material.sizeAttenuation,
				logarithmicDepthBuffer: logarithmicDepthBuffer,

				skinning: material.skinning && maxBones > 0,
				maxBones: maxBones,
				useVertexTexture: floatVertexTextures,

				morphTargets: material.morphTargets,
				morphNormals: material.morphNormals,
				maxMorphTargets: renderer.maxMorphTargets,
				maxMorphNormals: renderer.maxMorphNormals,

				numDirLights: lights.directional.length,
				numPointLights: lights.point.length,
				numSpotLights: lights.spot.length,
				numRectAreaLights: lights.rectArea.length,
				numHemiLights: lights.hemi.length,

				numDirLightShadows: lights.directionalShadowMap.length,
				numPointLightShadows: lights.pointShadowMap.length,
				numSpotLightShadows: lights.spotShadowMap.length,

				numClippingPlanes: clipping.numPlanes,
				numClipIntersection: clipping.numIntersection,

				dithering: material.dithering,

				shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
				shadowMapType: renderer.shadowMap.type,

				toneMapping: material.toneMapped ? renderer.toneMapping : NoToneMapping,
				physicallyCorrectLights: renderer.physicallyCorrectLights,

				premultipliedAlpha: material.premultipliedAlpha,

				alphaTest: material.alphaTest,
				doubleSided: material.side === DoubleSide,
				flipSided: material.side === BackSide,

				depthPacking: ( material.depthPacking !== undefined ) ? material.depthPacking : false,

				index0AttributeName: material.index0AttributeName,

				extensionDerivatives: material.extensions && material.extensions.derivatives,
				extensionFragDepth: material.extensions && material.extensions.fragDepth,
				extensionDrawBuffers: material.extensions && material.extensions.drawBuffers,
				extensionShaderTextureLOD: material.extensions && material.extensions.shaderTextureLOD,

				rendererExtensionFragDepth: isWebGL2 || extensions.has( 'EXT_frag_depth' ),
				rendererExtensionDrawBuffers: isWebGL2 || extensions.has( 'WEBGL_draw_buffers' ),
				rendererExtensionShaderTextureLod: isWebGL2 || extensions.has( 'EXT_shader_texture_lod' ),

				customProgramCacheKey: material.customProgramCacheKey()

			};

			return parameters;

		}

		function getProgramCacheKey( parameters ) {

			const array = [];

			if ( parameters.shaderID ) {

				array.push( parameters.shaderID );

			} else {

				array.push( parameters.fragmentShader );
				array.push( parameters.vertexShader );

			}

			if ( parameters.defines !== undefined ) {

				for ( const name in parameters.defines ) {

					array.push( name );
					array.push( parameters.defines[ name ] );

				}

			}


			array.push( parameters.customProgramCacheKey );

			return array.join();

		}

		function getUniforms( material ) {

			const shaderID = shaderIDs[ material.type ];
			let uniforms;

			if ( shaderID ) {

				const shader = ShaderLib[ shaderID ];
				uniforms = UniformsUtils.clone( shader.uniforms );

			} else {

				uniforms = material.uniforms;

			}

			return uniforms;

		}

		function acquireProgram( parameters, cacheKey ) {

			let program;

			// Check if code has been already compiled
			for ( let p = 0, pl = programs.length; p < pl; p ++ ) {

				const preexistingProgram = programs[ p ];

				if ( preexistingProgram.cacheKey === cacheKey ) {

					program = preexistingProgram;
					++ program.usedTimes;

					break;

				}

			}

			if ( program === undefined ) {

				program = new WebGLProgram( renderer, cacheKey, parameters, bindingStates );
				programs.push( program );

			}

			return program;

		}

		function releaseProgram( program ) {

			if ( -- program.usedTimes === 0 ) {

				// Remove from unordered set
				const i = programs.indexOf( program );
				programs[ i ] = programs[ programs.length - 1 ];
				programs.pop();

				// Free WebGL resources
				program.destroy();

			}

		}

		return {
			getParameters: getParameters,
			getProgramCacheKey: getProgramCacheKey,
			getUniforms: getUniforms,
			acquireProgram: acquireProgram,
			releaseProgram: releaseProgram,
			// Exposed for resource monitoring & error feedback via renderer.info:
			programs: programs
		};

	}

	function WebGLProperties() {

		let properties = new WeakMap();

		function get( object ) {
			let map = properties.get( object );
			if ( map === undefined ) {
				map = {};
				properties.set( object, map );
			}
			return map;
		}

		function remove( object ) {properties.delete( object );}

		function update( object, key, value ) {properties.get( object )[ key ] = value;	}

		function dispose() {properties = new WeakMap();}

		return {
			get: get,
			remove: remove,
			update: update,
			dispose: dispose
		};

	}

	function painterSortStable( a, b ) {

		if ( a.groupOrder !== b.groupOrder ) {return a.groupOrder - b.groupOrder;
		} else if ( a.renderOrder !== b.renderOrder ) {	return a.renderOrder - b.renderOrder;
		} else if ( a.program !== b.program ) {return a.program.id - b.program.id;
		} else if ( a.material.id !== b.material.id ) {	return a.material.id - b.material.id;
		} else if ( a.z !== b.z ) {	return a.z - b.z;
		} else {return a.id - b.id;	}
	}

	function reversePainterSortStable( a, b ) {

		if ( a.groupOrder !== b.groupOrder ) {return a.groupOrder - b.groupOrder;
		} else if ( a.renderOrder !== b.renderOrder ) {	return a.renderOrder - b.renderOrder;
		} else if ( a.z !== b.z ) {return b.z - a.z;
		} else {return a.id - b.id;	}
	}


	function WebGLRenderList( properties ) {

		const renderItems = [];
		let renderItemsIndex = 0;
		const opaque = [];
		const transparent = [];
		const defaultProgram = { id: - 1 };

		function init() {
			renderItemsIndex = 0;
			opaque.length = 0;
			transparent.length = 0;
		}

		function getNextRenderItem( object, geometry, material, groupOrder, z, group ) {
			let renderItem = renderItems[ renderItemsIndex ];
			const materialProperties = properties.get( material );

			if ( renderItem === undefined ) {
				renderItem = {
					id: object.id,
					object: object,
					geometry: geometry,
					material: material,
					program: materialProperties.program || defaultProgram,
					groupOrder: groupOrder,
					renderOrder: object.renderOrder,
					z: z,
					group: group
				};
				renderItems[ renderItemsIndex ] = renderItem;
			} else {
				renderItem.id = object.id;
				renderItem.object = object;
				renderItem.geometry = geometry;
				renderItem.material = material;
				renderItem.program = materialProperties.program || defaultProgram;
				renderItem.groupOrder = groupOrder;
				renderItem.renderOrder = object.renderOrder;
				renderItem.z = z;
				renderItem.group = group;
			}

			renderItemsIndex ++;
			return renderItem;
		}

		function push( object, geometry, material, groupOrder, z, group ) {
			const renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );
			( material.transparent === true ? transparent : opaque ).push( renderItem );
		}

		function unshift( object, geometry, material, groupOrder, z, group ) {
			const renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );
			( material.transparent === true ? transparent : opaque ).unshift( renderItem );
		}

		function sort( customOpaqueSort, customTransparentSort ) {
			if ( opaque.length > 1 ) opaque.sort( customOpaqueSort || painterSortStable );
			if ( transparent.length > 1 ) transparent.sort( customTransparentSort || reversePainterSortStable );
		}

		function finish() {
			// Clear references from inactive renderItems in the list
			for ( let i = renderItemsIndex, il = renderItems.length; i < il; i ++ ) {
				const renderItem = renderItems[ i ];

				if ( renderItem.id === null ) break;

				renderItem.id = null;
				renderItem.object = null;
				renderItem.geometry = null;
				renderItem.material = null;
				renderItem.program = null;
				renderItem.group = null;

			}
		}

		return {
			opaque: opaque,
			transparent: transparent,
			init: init,
			push: push,
			unshift: unshift,
			finish: finish,
			sort: sort
		};

	}

	function WebGLRenderLists( properties ) {

		let lists = new WeakMap();

		function get( scene, camera ) {

			const cameras = lists.get( scene );
			let list;

			if ( cameras === undefined ) {
				list = new WebGLRenderList( properties );
				lists.set( scene, new WeakMap() );
				lists.get( scene ).set( camera, list );
			} else {
				list = cameras.get( camera );
				if ( list === undefined ) {
					list = new WebGLRenderList( properties );
					cameras.set( camera, list );
				}
			}

			return list;

		}

		function dispose() {lists = new WeakMap();}

		return {
			get: get,
			dispose: dispose
		};

	}

	function UniformsCache() {

		const lights = {};

		return {

			get: function ( light ) {

				if ( lights[ light.id ] !== undefined ) {

					return lights[ light.id ];

				}

				let uniforms;

				switch ( light.type ) {

					case 'DirectionalLight':
						uniforms = {
							direction: new Vector3(),
							color: new Color()
						};
						break;

					case 'SpotLight':
						uniforms = {
							position: new Vector3(),
							direction: new Vector3(),
							color: new Color(),
							distance: 0,
							coneCos: 0,
							penumbraCos: 0,
							decay: 0
						};
						break;

					case 'PointLight':
						uniforms = {
							position: new Vector3(),
							color: new Color(),
							distance: 0,
							decay: 0
						};
						break;

					case 'HemisphereLight':
						uniforms = {
							direction: new Vector3(),
							skyColor: new Color(),
							groundColor: new Color()
						};
						break;

					case 'RectAreaLight':
						uniforms = {
							color: new Color(),
							position: new Vector3(),
							halfWidth: new Vector3(),
							halfHeight: new Vector3()
						};
						break;

				}

				lights[ light.id ] = uniforms;

				return uniforms;

			}

		};

	}



	let nextVersion = 0;

	function shadowCastingLightsFirst( lightA, lightB ) {

		return ( lightB.castShadow ? 1 : 0 ) - ( lightA.castShadow ? 1 : 0 );

	}

	function WebGLLights() {

		const cache = new UniformsCache();


		const state = {

			version: 0,

			hash: {
				directionalLength: - 1,
				pointLength: - 1,
				spotLength: - 1,
				rectAreaLength: - 1,
				hemiLength: - 1,

				numDirectionalShadows: - 1,
				numPointShadows: - 1,
				numSpotShadows: - 1
			},

			ambient: [ 0, 0, 0 ],
			probe: [],
			directional: [],
			directionalShadow: [],
			directionalShadowMap: [],
			directionalShadowMatrix: [],
			spot: [],
			spotShadow: [],
			spotShadowMap: [],
			spotShadowMatrix: [],
			rectArea: [],
			rectAreaLTC1: null,
			rectAreaLTC2: null,
			point: [],
			pointShadow: [],
			pointShadowMap: [],
			pointShadowMatrix: [],
			hemi: []

		};

		for ( let i = 0; i < 9; i ++ ) state.probe.push( new Vector3() );

		const vector3 = new Vector3();
		const matrix4 = new Matrix4();
		const matrix42 = new Matrix4();

		function setup( lights, shadows, camera ) {

			let r = 0, g = 0, b = 0;

			for ( let i = 0; i < 9; i ++ ) state.probe[ i ].set( 0, 0, 0 );

			let directionalLength = 0;
			let pointLength = 0;
			let spotLength = 0;
			let rectAreaLength = 0;
			let hemiLength = 0;

			let numDirectionalShadows = 0;
			let numPointShadows = 0;
			let numSpotShadows = 0;

			const viewMatrix = camera.matrixWorldInverse;

			lights.sort( shadowCastingLightsFirst );

			for ( let i = 0, l = lights.length; i < l; i ++ ) {

				const light = lights[ i ];

				const color = light.color;
				const intensity = light.intensity;
				const distance = light.distance;

				const shadowMap = ( light.shadow && light.shadow.map ) ? light.shadow.map.texture : null;

				if ( light.isAmbientLight ) {

					r += color.r * intensity;
					g += color.g * intensity;
					b += color.b * intensity;

				} else if ( light.isDirectionalLight ) {

					const uniforms = cache.get( light );

					uniforms.color.copy( light.color ).multiplyScalar( light.intensity );
					uniforms.direction.setFromMatrixPosition( light.matrixWorld );
					vector3.setFromMatrixPosition( light.target.matrixWorld );
					uniforms.direction.sub( vector3 );
					uniforms.direction.transformDirection( viewMatrix );

					state.directional[ directionalLength ] = uniforms;

					directionalLength ++;

				} else if ( light.isHemisphereLight ) {

					const uniforms = cache.get( light );

					uniforms.direction.setFromMatrixPosition( light.matrixWorld );
					uniforms.direction.transformDirection( viewMatrix );
					uniforms.direction.normalize();

					uniforms.skyColor.copy( light.color ).multiplyScalar( intensity );
					uniforms.groundColor.copy( light.groundColor ).multiplyScalar( intensity );

					state.hemi[ hemiLength ] = uniforms;

					hemiLength ++;

				}

			}

			if ( rectAreaLength > 0 ) {

				state.rectAreaLTC1 = UniformsLib.LTC_1;
				state.rectAreaLTC2 = UniformsLib.LTC_2;

			}

			state.ambient[ 0 ] = r;
			state.ambient[ 1 ] = g;
			state.ambient[ 2 ] = b;

			const hash = state.hash;

			if ( hash.directionalLength !== directionalLength ||
				hash.pointLength !== pointLength ||
				hash.spotLength !== spotLength ||
				hash.rectAreaLength !== rectAreaLength ||
				hash.hemiLength !== hemiLength ||
				hash.numDirectionalShadows !== numDirectionalShadows ||
				hash.numPointShadows !== numPointShadows ||
				hash.numSpotShadows !== numSpotShadows ) {

				state.directional.length = directionalLength;
				state.spot.length = spotLength;
				state.rectArea.length = rectAreaLength;
				state.point.length = pointLength;
				state.hemi.length = hemiLength;

				state.directionalShadow.length = numDirectionalShadows;
				state.directionalShadowMap.length = numDirectionalShadows;

				hash.directionalLength = directionalLength;
				hash.pointLength = pointLength;
				hash.spotLength = spotLength;
				hash.rectAreaLength = rectAreaLength;
				hash.hemiLength = hemiLength;

				hash.numDirectionalShadows = numDirectionalShadows;

				state.version = nextVersion ++;

			}

		}

		return {
			setup: setup,
			state: state
		};

	}

	function WebGLRenderState() {

		const lights = new WebGLLights();
		const lightsArray = [];
		const shadowsArray = [];

		function init() {
			lightsArray.length = 0;
			shadowsArray.length = 0;
		}

		function pushLight( light ) {
			lightsArray.push( light );
		}

		function pushShadow( shadowLight ) {
			shadowsArray.push( shadowLight );
		}

		function setupLights( camera ) {
			lights.setup( lightsArray, shadowsArray, camera );
		}

		const state = {
			lightsArray: lightsArray,
			shadowsArray: shadowsArray,

			lights: lights
		};

		return {
			init: init,
			state: state,
			setupLights: setupLights,
			pushLight: pushLight,
			pushShadow: pushShadow
		};

	}

	function WebGLRenderStates() {

		let renderStates = new WeakMap();

		function get( scene, camera ) {

			let renderState;

			if ( renderStates.has( scene ) === false ) {

				renderState = new WebGLRenderState();
				renderStates.set( scene, new WeakMap() );
				renderStates.get( scene ).set( camera, renderState );

			} else {

				if ( renderStates.get( scene ).has( camera ) === false ) {

					renderState = new WebGLRenderState();
					renderStates.get( scene ).set( camera, renderState );

				} else {

					renderState = renderStates.get( scene ).get( camera );

				}

			}

			return renderState;

		}

		function dispose() {

			renderStates = new WeakMap();

		}

		return {
			get: get,
			dispose: dispose
		};

	}


	var vsm_frag = "uniform sampler2D shadow_pass;\nuniform vec2 resolution;\nuniform float radius;\n#include <packing>\nvoid main() {\n\tfloat mean = 0.0;\n\tfloat squared_mean = 0.0;\n\tfloat depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy ) / resolution ) );\n\tfor ( float i = -1.0; i < 1.0 ; i += SAMPLE_RATE) {\n\t\t#ifdef HORIZONAL_PASS\n\t\t\tvec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( i, 0.0 ) * radius ) / resolution ) );\n\t\t\tmean += distribution.x;\n\t\t\tsquared_mean += distribution.y * distribution.y + distribution.x * distribution.x;\n\t\t#else\n\t\t\tfloat depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, i ) * radius ) / resolution ) );\n\t\t\tmean += depth;\n\t\t\tsquared_mean += depth * depth;\n\t\t#endif\n\t}\n\tmean = mean * HALF_SAMPLE_RATE;\n\tsquared_mean = squared_mean * HALF_SAMPLE_RATE;\n\tfloat std_dev = sqrt( squared_mean - mean * mean );\n\tgl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );\n}";

	var vsm_vert = "void main() {\n\tgl_Position = vec4( position, 1.0 );\n}";

	function WebGLShadowMap( _renderer, _objects, maxTextureSize ) {

		let _frustum = new Frustum();

		const _shadowMapSize = new Vector2(),
			_viewportSize = new Vector2(),

			_viewport = new Vector4(),

			_depthMaterials = [],
			_distanceMaterials = [],

			_materialCache = {};

		const shadowSide = { 0: BackSide, 1: FrontSide, 2: DoubleSide };


		const scope = this;

		this.enabled = false;

		this.autoUpdate = true;
		this.needsUpdate = false;

		this.type = PCFShadowMap;

		this.render = function ( lights, scene, camera ) {

			if ( scope.enabled === false ) return;
			if ( scope.autoUpdate === false && scope.needsUpdate === false ) return;

			if ( lights.length === 0 ) return;

			const currentRenderTarget = _renderer.getRenderTarget();
			const activeCubeFace = _renderer.getActiveCubeFace();
			const activeMipmapLevel = _renderer.getActiveMipmapLevel();

			const _state = _renderer.state;

			// Set GL state for depth map.
			_state.setBlending( NoBlending );
			_state.buffers.color.setClear( 1, 1, 1, 1 );
			_state.buffers.depth.setTest( true );
			_state.setScissorTest( false );

			// render depth map

			for ( let i = 0, il = lights.length; i < il; i ++ ) {

				const light = lights[ i ];
				const shadow = light.shadow;

				if ( shadow.autoUpdate === false && shadow.needsUpdate === false ) continue;

				if ( shadow === undefined ) {

					console.warn( 'THREE.WebGLShadowMap:', light, 'has no shadow.' );
					continue;

				}

				_shadowMapSize.copy( shadow.mapSize );

				const shadowFrameExtents = shadow.getFrameExtents();

				_shadowMapSize.multiply( shadowFrameExtents );

				_viewportSize.copy( shadow.mapSize );

				if ( _shadowMapSize.x > maxTextureSize || _shadowMapSize.y > maxTextureSize ) {

					if ( _shadowMapSize.x > maxTextureSize ) {

						_viewportSize.x = Math.floor( maxTextureSize / shadowFrameExtents.x );
						_shadowMapSize.x = _viewportSize.x * shadowFrameExtents.x;
						shadow.mapSize.x = _viewportSize.x;

					}

					if ( _shadowMapSize.y > maxTextureSize ) {

						_viewportSize.y = Math.floor( maxTextureSize / shadowFrameExtents.y );
						_shadowMapSize.y = _viewportSize.y * shadowFrameExtents.y;
						shadow.mapSize.y = _viewportSize.y;

					}

				}

				if ( shadow.map === null && ! shadow.isPointLightShadow && this.type === VSMShadowMap ) {

					const pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat };

					shadow.map = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, pars );
					shadow.map.texture.name = light.name + ".shadowMap";

					shadow.mapPass = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, pars );

					shadow.camera.updateProjectionMatrix();

				}

				if ( shadow.map === null ) {

					const pars = { minFilter: NearestFilter, magFilter: NearestFilter, format: RGBAFormat };

					shadow.map = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, pars );
					shadow.map.texture.name = light.name + ".shadowMap";

					shadow.camera.updateProjectionMatrix();

				}

				_renderer.setRenderTarget( shadow.map );
				_renderer.clear();

				const viewportCount = shadow.getViewportCount();

				for ( let vp = 0; vp < viewportCount; vp ++ ) {

					const viewport = shadow.getViewport( vp );

					_viewport.set(
						_viewportSize.x * viewport.x,
						_viewportSize.y * viewport.y,
						_viewportSize.x * viewport.z,
						_viewportSize.y * viewport.w
					);

					_state.viewport( _viewport );

					shadow.updateMatrices( light, vp );

					_frustum = shadow.getFrustum();

					renderObject( scene, camera, shadow.camera, light, this.type );

				}


				shadow.needsUpdate = false;

			}

			scope.needsUpdate = false;

			_renderer.setRenderTarget( currentRenderTarget, activeCubeFace, activeMipmapLevel );

		};


		function getDepthMaterial( object, geometry, material, light, shadowCameraNear, shadowCameraFar, type ) {

			let result = null;

			let getMaterialVariant = getDepthMaterialVariant;
			let customMaterial = object.customDepthMaterial;

			if ( light.isPointLight === true ) {

				getMaterialVariant = getDistanceMaterialVariant;
				customMaterial = object.customDistanceMaterial;

			}

			if ( customMaterial === undefined ) {

				let useMorphing = false;

				if ( material.morphTargets === true ) {

					useMorphing = geometry.morphAttributes && geometry.morphAttributes.position && geometry.morphAttributes.position.length > 0;

				}

				let useSkinning = false;


				const useInstancing = object.isInstancedMesh === true;

				result = getMaterialVariant( useMorphing, useSkinning, useInstancing );

			} else {

				result = customMaterial;

			}

			if ( _renderer.localClippingEnabled &&
					material.clipShadows === true &&
					material.clippingPlanes.length !== 0 ) {

				// in this case we need a unique material instance reflecting the
				// appropriate state

				const keyA = result.uuid, keyB = material.uuid;

				let materialsForVariant = _materialCache[ keyA ];

				if ( materialsForVariant === undefined ) {

					materialsForVariant = {};
					_materialCache[ keyA ] = materialsForVariant;

				}

				let cachedMaterial = materialsForVariant[ keyB ];

				if ( cachedMaterial === undefined ) {

					cachedMaterial = result.clone();
					materialsForVariant[ keyB ] = cachedMaterial;

				}

				result = cachedMaterial;

			}

			result.visible = material.visible;
			result.wireframe = material.wireframe;

			if ( type === VSMShadowMap ) {

				result.side = ( material.shadowSide !== null ) ? material.shadowSide : material.side;

			} else {

				result.side = ( material.shadowSide !== null ) ? material.shadowSide : shadowSide[ material.side ];

			}

			result.clipShadows = material.clipShadows;
			result.clippingPlanes = material.clippingPlanes;
			result.clipIntersection = material.clipIntersection;

			result.wireframeLinewidth = material.wireframeLinewidth;
			result.linewidth = material.linewidth;

			if ( light.isPointLight === true  ) {

				result.referencePosition.setFromMatrixPosition( light.matrixWorld );
				result.nearDistance = shadowCameraNear;
				result.farDistance = shadowCameraFar;

			}

			return result;

		}

		function renderObject( object, camera, shadowCamera, light, type ) {

			if ( object.visible === false ) return;

			const visible = object.layers.test( camera.layers );

			if ( visible && ( object.isMesh || object.isLine || object.isPoints ) ) {

				if ( ( object.castShadow || ( object.receiveShadow && type === VSMShadowMap ) ) && ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) ) {

					object.modelViewMatrix.multiplyMatrices( shadowCamera.matrixWorldInverse, object.matrixWorld );

					const geometry = _objects.update( object );
					const material = object.material;

					if ( Array.isArray( material ) ) {

						const groups = geometry.groups;

						for ( let k = 0, kl = groups.length; k < kl; k ++ ) {

							const group = groups[ k ];
							const groupMaterial = material[ group.materialIndex ];

							if ( groupMaterial && groupMaterial.visible ) {

								const depthMaterial = getDepthMaterial( object, geometry, groupMaterial, light, shadowCamera.near, shadowCamera.far, type );

								_renderer.renderBufferDirect( shadowCamera, null, geometry, depthMaterial, object, group );

							}

						}

					} else if ( material.visible ) {

						const depthMaterial = getDepthMaterial( object, geometry, material, light, shadowCamera.near, shadowCamera.far, type );

						_renderer.renderBufferDirect( shadowCamera, null, geometry, depthMaterial, object, null );

					}

				}

			}

			const children = object.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				renderObject( children[ i ], camera, shadowCamera, light, type );

			}

		}

	}

	function WebGLState( gl, extensions, capabilities ) {

		const isWebGL2 = capabilities.isWebGL2;

		function ColorBuffer() {

			let locked = false;

			const color = new Vector4();
			let currentColorMask = null;
			const currentColorClear = new Vector4( 0, 0, 0, 0 );

			return {

				setMask: function ( colorMask ) {

					if ( currentColorMask !== colorMask && ! locked ) {

						gl.colorMask( colorMask, colorMask, colorMask, colorMask );
						currentColorMask = colorMask;

					}

				},

				setLocked: function ( lock ) {

					locked = lock;

				},

				setClear: function ( r, g, b, a, premultipliedAlpha ) {

					if ( premultipliedAlpha === true ) {

						r *= a; g *= a; b *= a;

					}

					color.set( r, g, b, a );

					if ( currentColorClear.equals( color ) === false ) {

						gl.clearColor( r, g, b, a );
						currentColorClear.copy( color );

					}

				},

				reset: function () {

					locked = false;

					currentColorMask = null;
					currentColorClear.set( - 1, 0, 0, 0 ); // set to invalid state

				}

			};

		}

		function DepthBuffer() {

			let locked = false;

			let currentDepthMask = null;
			let currentDepthFunc = null;
			let currentDepthClear = null;

			return {

				setTest: function ( depthTest ) {

					if ( depthTest ) {

						enable( 2929 );

					} else {

						disable( 2929 );

					}

				},

				setMask: function ( depthMask ) {

					if ( currentDepthMask !== depthMask && ! locked ) {

						gl.depthMask( depthMask );
						currentDepthMask = depthMask;

					}

				},

				setFunc: function ( depthFunc ) {

					if ( currentDepthFunc !== depthFunc ) {

						if ( depthFunc ) {

							switch ( depthFunc ) {

								case NeverDepth:

									gl.depthFunc( 512 );
									break;

								case AlwaysDepth:

									gl.depthFunc( 519 );
									break;

								case LessDepth:

									gl.depthFunc( 513 );
									break;

								case LessEqualDepth:

									gl.depthFunc( 515 );
									break;

								case EqualDepth:

									gl.depthFunc( 514 );
									break;

								case GreaterEqualDepth:

									gl.depthFunc( 518 );
									break;

								case GreaterDepth:

									gl.depthFunc( 516 );
									break;

								case NotEqualDepth:

									gl.depthFunc( 517 );
									break;

								default:

									gl.depthFunc( 515 );

							}

						} else {

							gl.depthFunc( 515 );

						}

						currentDepthFunc = depthFunc;

					}

				},

				setLocked: function ( lock ) {

					locked = lock;

				},

				setClear: function ( depth ) {

					if ( currentDepthClear !== depth ) {

						gl.clearDepth( depth );
						currentDepthClear = depth;

					}

				},

				reset: function () {

					locked = false;

					currentDepthMask = null;
					currentDepthFunc = null;
					currentDepthClear = null;

				}

			};

		}

		function StencilBuffer() {

			let locked = false;

			let currentStencilMask = null;
			let currentStencilFunc = null;
			let currentStencilRef = null;
			let currentStencilFuncMask = null;
			let currentStencilFail = null;
			let currentStencilZFail = null;
			let currentStencilZPass = null;
			let currentStencilClear = null;

			return {

				setTest: function ( stencilTest ) {

					if ( ! locked ) {

						if ( stencilTest ) {

							enable( 2960 );

						} else {

							disable( 2960 );

						}

					}

				},

				setMask: function ( stencilMask ) {

					if ( currentStencilMask !== stencilMask && ! locked ) {

						gl.stencilMask( stencilMask );
						currentStencilMask = stencilMask;

					}

				},

				setFunc: function ( stencilFunc, stencilRef, stencilMask ) {

					if ( currentStencilFunc !== stencilFunc ||
					     currentStencilRef !== stencilRef ||
					     currentStencilFuncMask !== stencilMask ) {

						gl.stencilFunc( stencilFunc, stencilRef, stencilMask );

						currentStencilFunc = stencilFunc;
						currentStencilRef = stencilRef;
						currentStencilFuncMask = stencilMask;

					}

				},

				setOp: function ( stencilFail, stencilZFail, stencilZPass ) {

					if ( currentStencilFail !== stencilFail ||
					     currentStencilZFail !== stencilZFail ||
					     currentStencilZPass !== stencilZPass ) {

						gl.stencilOp( stencilFail, stencilZFail, stencilZPass );

						currentStencilFail = stencilFail;
						currentStencilZFail = stencilZFail;
						currentStencilZPass = stencilZPass;

					}

				},

				setLocked: function ( lock ) {

					locked = lock;

				},

				setClear: function ( stencil ) {

					if ( currentStencilClear !== stencil ) {

						gl.clearStencil( stencil );
						currentStencilClear = stencil;

					}

				},

				reset: function () {

					locked = false;

					currentStencilMask = null;
					currentStencilFunc = null;
					currentStencilRef = null;
					currentStencilFuncMask = null;
					currentStencilFail = null;
					currentStencilZFail = null;
					currentStencilZPass = null;
					currentStencilClear = null;

				}

			};

		}

		//

		const colorBuffer = new ColorBuffer();
		const depthBuffer = new DepthBuffer();
		const stencilBuffer = new StencilBuffer();

		let enabledCapabilities = {};

		let currentProgram = null;

		let currentBlendingEnabled = null;
		let currentBlending = null;
		let currentBlendEquation = null;
		let currentBlendSrc = null;
		let currentBlendDst = null;
		let currentBlendEquationAlpha = null;
		let currentBlendSrcAlpha = null;
		let currentBlendDstAlpha = null;
		let currentPremultipledAlpha = false;

		let currentFlipSided = null;
		let currentCullFace = null;

		let currentLineWidth = null;

		let currentPolygonOffsetFactor = null;
		let currentPolygonOffsetUnits = null;

		const maxTextures = gl.getParameter( 35661 );

		let lineWidthAvailable = false;
		let version = 0;
		const glVersion = gl.getParameter( 7938 );

		if ( glVersion.indexOf( 'WebGL' ) !== - 1 ) {

			version = parseFloat( /^WebGL\ ([0-9])/.exec( glVersion )[ 1 ] );
			lineWidthAvailable = ( version >= 1.0 );

		} else if ( glVersion.indexOf( 'OpenGL ES' ) !== - 1 ) {

			version = parseFloat( /^OpenGL\ ES\ ([0-9])/.exec( glVersion )[ 1 ] );
			lineWidthAvailable = ( version >= 2.0 );

		}

		let currentTextureSlot = null;
		let currentBoundTextures = {};

		const currentScissor = new Vector4();
		const currentViewport = new Vector4();

		function createTexture( type, target, count ) {

			const data = new Uint8Array( 4 ); // 4 is required to match default unpack alignment of 4.
			const texture = gl.createTexture();

			gl.bindTexture( type, texture );
			gl.texParameteri( type, 10241, 9728 );
			gl.texParameteri( type, 10240, 9728 );

			for ( let i = 0; i < count; i ++ ) {

				gl.texImage2D( target + i, 0, 6408, 1, 1, 0, 6408, 5121, data );

			}

			return texture;

		}

		const emptyTextures = {};
		emptyTextures[ 3553 ] = createTexture( 3553, 3553, 1 );
		emptyTextures[ 34067 ] = createTexture( 34067, 34069, 6 );

		// init

		colorBuffer.setClear( 0, 0, 0, 1 );
		depthBuffer.setClear( 1 );
		stencilBuffer.setClear( 0 );

		enable( 2929 );
		depthBuffer.setFunc( LessEqualDepth );

		setFlipSided( false );
		setCullFace( CullFaceBack );
		enable( 2884 );

		setBlending( NoBlending );

		//

		function enable( id ) {

			if ( enabledCapabilities[ id ] !== true ) {

				gl.enable( id );
				enabledCapabilities[ id ] = true;

			}

		}

		function disable( id ) {

			if ( enabledCapabilities[ id ] !== false ) {

				gl.disable( id );
				enabledCapabilities[ id ] = false;

			}

		}

		function useProgram( program ) {

			if ( currentProgram !== program ) {

				gl.useProgram( program );

				currentProgram = program;

				return true;

			}

			return false;

		}

		const equationToGL = {
			[ AddEquation ]: 32774,
			[ SubtractEquation ]: 32778,
			[ ReverseSubtractEquation ]: 32779
		};

		if ( isWebGL2 ) {

			equationToGL[ MinEquation ] = 32775;
			equationToGL[ MaxEquation ] = 32776;

		} else {

			const extension = extensions.get( 'EXT_blend_minmax' );

			if ( extension !== null ) {

				equationToGL[ MinEquation ] = extension.MIN_EXT;
				equationToGL[ MaxEquation ] = extension.MAX_EXT;

			}

		}

		const factorToGL = {
			[ ZeroFactor ]: 0,
			[ OneFactor ]: 1,
			[ SrcColorFactor ]: 768,
			[ SrcAlphaFactor ]: 770,
			[ SrcAlphaSaturateFactor ]: 776,
			[ DstColorFactor ]: 774,
			[ DstAlphaFactor ]: 772,
			[ OneMinusSrcColorFactor ]: 769,
			[ OneMinusSrcAlphaFactor ]: 771,
			[ OneMinusDstColorFactor ]: 775,
			[ OneMinusDstAlphaFactor ]: 773
		};

		function setBlending( blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha ) {

			if ( blending === NoBlending ) {

				if ( currentBlendingEnabled ) {

					disable( 3042 );
					currentBlendingEnabled = false;

				}

				return;

			}

			if ( ! currentBlendingEnabled ) {

				enable( 3042 );
				currentBlendingEnabled = true;

			}

			if ( blending !== CustomBlending ) {

				if ( blending !== currentBlending || premultipliedAlpha !== currentPremultipledAlpha ) {

					if ( currentBlendEquation !== AddEquation || currentBlendEquationAlpha !== AddEquation ) {

						gl.blendEquation( 32774 );

						currentBlendEquation = AddEquation;
						currentBlendEquationAlpha = AddEquation;

					}

					if ( premultipliedAlpha ) {

						switch ( blending ) {

							case NormalBlending:
								gl.blendFuncSeparate( 1, 771, 1, 771 );
								break;

							case AdditiveBlending:
								gl.blendFunc( 1, 1 );
								break;

							case SubtractiveBlending:
								gl.blendFuncSeparate( 0, 0, 769, 771 );
								break;

							case MultiplyBlending:
								gl.blendFuncSeparate( 0, 768, 0, 770 );
								break;

							default:
								console.error( 'THREE.WebGLState: Invalid blending: ', blending );
								break;

						}

					} else {

						switch ( blending ) {

							case NormalBlending:
								gl.blendFuncSeparate( 770, 771, 1, 771 );
								break;

							case AdditiveBlending:
								gl.blendFunc( 770, 1 );
								break;

							case SubtractiveBlending:
								gl.blendFunc( 0, 769 );
								break;

							case MultiplyBlending:
								gl.blendFunc( 0, 768 );
								break;

							default:
								console.error( 'THREE.WebGLState: Invalid blending: ', blending );
								break;

						}

					}

					currentBlendSrc = null;
					currentBlendDst = null;
					currentBlendSrcAlpha = null;
					currentBlendDstAlpha = null;

					currentBlending = blending;
					currentPremultipledAlpha = premultipliedAlpha;

				}

				return;

			}

			// custom blending

			blendEquationAlpha = blendEquationAlpha || blendEquation;
			blendSrcAlpha = blendSrcAlpha || blendSrc;
			blendDstAlpha = blendDstAlpha || blendDst;

			if ( blendEquation !== currentBlendEquation || blendEquationAlpha !== currentBlendEquationAlpha ) {

				gl.blendEquationSeparate( equationToGL[ blendEquation ], equationToGL[ blendEquationAlpha ] );

				currentBlendEquation = blendEquation;
				currentBlendEquationAlpha = blendEquationAlpha;

			}

			if ( blendSrc !== currentBlendSrc || blendDst !== currentBlendDst || blendSrcAlpha !== currentBlendSrcAlpha || blendDstAlpha !== currentBlendDstAlpha ) {

				gl.blendFuncSeparate( factorToGL[ blendSrc ], factorToGL[ blendDst ], factorToGL[ blendSrcAlpha ], factorToGL[ blendDstAlpha ] );

				currentBlendSrc = blendSrc;
				currentBlendDst = blendDst;
				currentBlendSrcAlpha = blendSrcAlpha;
				currentBlendDstAlpha = blendDstAlpha;

			}

			currentBlending = blending;
			currentPremultipledAlpha = null;

		}

		function setMaterial( material, frontFaceCW ) {

			material.side === DoubleSide
				? disable( 2884 )
				: enable( 2884 );

			let flipSided = ( material.side === BackSide );
			if ( frontFaceCW ) flipSided = ! flipSided;

			setFlipSided( flipSided );

			( material.blending === NormalBlending && material.transparent === false )
				? setBlending( NoBlending )
				: setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha );

			depthBuffer.setFunc( material.depthFunc );
			depthBuffer.setTest( material.depthTest );
			depthBuffer.setMask( material.depthWrite );
			colorBuffer.setMask( material.colorWrite );

			const stencilWrite = material.stencilWrite;
			stencilBuffer.setTest( stencilWrite );
			if ( stencilWrite ) {

				stencilBuffer.setMask( material.stencilWriteMask );
				stencilBuffer.setFunc( material.stencilFunc, material.stencilRef, material.stencilFuncMask );
				stencilBuffer.setOp( material.stencilFail, material.stencilZFail, material.stencilZPass );

			}

			setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

		}

		//

		function setFlipSided( flipSided ) {

			if ( currentFlipSided !== flipSided ) {

				if ( flipSided ) {

					gl.frontFace( 2304 );

				} else {

					gl.frontFace( 2305 );

				}

				currentFlipSided = flipSided;

			}

		}

		function setCullFace( cullFace ) {

			if ( cullFace !== CullFaceNone ) {

				enable( 2884 );

				if ( cullFace !== currentCullFace ) {

					if ( cullFace === CullFaceBack ) {

						gl.cullFace( 1029 );

					} else if ( cullFace === CullFaceFront ) {

						gl.cullFace( 1028 );

					} else {

						gl.cullFace( 1032 );

					}

				}

			} else {

				disable( 2884 );

			}

			currentCullFace = cullFace;

		}

		function setLineWidth( width ) {
			if ( width !== currentLineWidth ) {
				if ( lineWidthAvailable ) gl.lineWidth( width );
				currentLineWidth = width;
			}

		}

		function setPolygonOffset( polygonOffset, factor, units ) {
			if ( polygonOffset ) {
				enable( 32823 );
				if ( currentPolygonOffsetFactor !== factor || currentPolygonOffsetUnits !== units ) {
					gl.polygonOffset( factor, units );
					currentPolygonOffsetFactor = factor;
					currentPolygonOffsetUnits = units;
				}
			} else {disable( 32823 );}
		}

		function setScissorTest( scissorTest ) {
			if ( scissorTest ) {
				enable( 3089 );
			} else {
				disable( 3089 );
			}
		}

		// texture
		function activeTexture( webglSlot ) {
			if ( webglSlot === undefined ) webglSlot = 33984 + maxTextures - 1;
			if ( currentTextureSlot !== webglSlot ) {
				gl.activeTexture( webglSlot );
				currentTextureSlot = webglSlot;
			}
		}

		function bindTexture( webglType, webglTexture ) {
			if ( currentTextureSlot === null ) {
				activeTexture();
			}

			let boundTexture = currentBoundTextures[ currentTextureSlot ];

			if ( boundTexture === undefined ) {
				boundTexture = { type: undefined, texture: undefined };
				currentBoundTextures[ currentTextureSlot ] = boundTexture;
			}

			if ( boundTexture.type !== webglType || boundTexture.texture !== webglTexture ) {

				gl.bindTexture( webglType, webglTexture || emptyTextures[ webglType ] );

				boundTexture.type = webglType;
				boundTexture.texture = webglTexture;

			}

		}

		function unbindTexture() {

			const boundTexture = currentBoundTextures[ currentTextureSlot ];

			if ( boundTexture !== undefined && boundTexture.type !== undefined ) {

				gl.bindTexture( boundTexture.type, null );

				boundTexture.type = undefined;
				boundTexture.texture = undefined;

			}

		}

		function compressedTexImage2D() {
			try {
				gl.compressedTexImage2D.apply( gl, arguments );
			} catch ( error ) {
				console.error( 'THREE.WebGLState:', error );
			}

		}

		function texImage2D() {

			try {

				gl.texImage2D.apply( gl, arguments );

			} catch ( error ) {

				console.error( 'THREE.WebGLState:', error );

			}

		}

		function texImage3D() {

			try {

				gl.texImage3D.apply( gl, arguments );

			} catch ( error ) {

				console.error( 'THREE.WebGLState:', error );

			}

		}

		//

		function scissor( scissor ) {

			if ( currentScissor.equals( scissor ) === false ) {

				gl.scissor( scissor.x, scissor.y, scissor.z, scissor.w );
				currentScissor.copy( scissor );

			}

		}

		function viewport( viewport ) {

			if ( currentViewport.equals( viewport ) === false ) {

				gl.viewport( viewport.x, viewport.y, viewport.z, viewport.w );
				currentViewport.copy( viewport );

			}

		}

		//

		function reset() {

			enabledCapabilities = {};

			currentTextureSlot = null;
			currentBoundTextures = {};

			currentProgram = null;

			currentBlending = null;

			currentFlipSided = null;
			currentCullFace = null;

			colorBuffer.reset();
			depthBuffer.reset();
			stencilBuffer.reset();

		}

		return {

			buffers: {
				color: colorBuffer,
				depth: depthBuffer,
				stencil: stencilBuffer
			},

			enable: enable,
			disable: disable,

			useProgram: useProgram,

			setBlending: setBlending,
			setMaterial: setMaterial,

			setFlipSided: setFlipSided,
			setCullFace: setCullFace,

			setLineWidth: setLineWidth,
			setPolygonOffset: setPolygonOffset,

			setScissorTest: setScissorTest,

			activeTexture: activeTexture,
			bindTexture: bindTexture,
			unbindTexture: unbindTexture,
			compressedTexImage2D: compressedTexImage2D,
			texImage2D: texImage2D,
			texImage3D: texImage3D,

			scissor: scissor,
			viewport: viewport,

			reset: reset

		};

	}

	function Group() {
		Object3D.call( this );
		this.type = 'Group';
	}

	Group.prototype = Object.assign( Object.create( Object3D.prototype ), {

		constructor: Group,

		isGroup: true

	} );

	function WebXRController() {
		this._targetRay = null;
		this._grip = null;
		this._hand = null;
	}

	Object.assign( WebXRController.prototype, {

		constructor: WebXRController,

		getHandSpace: function () {

			if ( this._hand === null ) {

				this._hand = new Group();
				this._hand.matrixAutoUpdate = false;
				this._hand.visible = false;

				this._hand.joints = [];
				this._hand.inputState = { pinching: false };

				if ( window.XRHand ) {

					for ( let i = 0; i <= window.XRHand.LITTLE_PHALANX_TIP; i ++ ) {

						// The transform of this joint will be updated with the joint pose on each frame
						const joint = new Group();
						joint.matrixAutoUpdate = false;
						joint.visible = false;
						this._hand.joints.push( joint );
						// ??
						this._hand.add( joint );

					}

				}

			}

			return this._hand;

		},

		getTargetRaySpace: function () {

			if ( this._targetRay === null ) {

				this._targetRay = new Group();
				this._targetRay.matrixAutoUpdate = false;
				this._targetRay.visible = false;

			}

			return this._targetRay;

		},

		getGripSpace: function () {

			if ( this._grip === null ) {

				this._grip = new Group();
				this._grip.matrixAutoUpdate = false;
				this._grip.visible = false;

			}

			return this._grip;

		},

		dispatchEvent: function ( event ) {

			if ( this._targetRay !== null ) {

				this._targetRay.dispatchEvent( event );

			}

			if ( this._grip !== null ) {

				this._grip.dispatchEvent( event );

			}

			if ( this._hand !== null ) {

				this._hand.dispatchEvent( event );

			}

			return this;

		},

		disconnect: function ( inputSource ) {

			this.dispatchEvent( { type: 'disconnected', data: inputSource } );

			if ( this._targetRay !== null ) {

				this._targetRay.visible = false;

			}

			if ( this._grip !== null ) {

				this._grip.visible = false;

			}

			if ( this._hand !== null ) {

				this._hand.visible = false;

			}

			return this;

		},

		update: function ( inputSource, frame, referenceSpace ) {

			let inputPose = null;
			let gripPose = null;
			let handPose = null;

			const targetRay = this._targetRay;
			const grip = this._grip;
			const hand = this._hand;

			if ( inputSource ) {

				if ( hand && inputSource.hand ) {

					handPose = true;

					for ( let i = 0; i <= window.XRHand.LITTLE_PHALANX_TIP; i ++ ) {

						if ( inputSource.hand[ i ] ) {

							// Update the joints groups with the XRJoint poses
							const jointPose = frame.getJointPose( inputSource.hand[ i ], referenceSpace );
							const joint = hand.joints[ i ];

							if ( jointPose !== null ) {

								joint.matrix.fromArray( jointPose.transform.matrix );
								joint.matrix.decompose( joint.position, joint.rotation, joint.scale );
								joint.jointRadius = jointPose.radius;

							}

							joint.visible = jointPose !== null;

							// Custom events

							// Check pinch
							const indexTip = hand.joints[ window.XRHand.INDEX_PHALANX_TIP ];
							const thumbTip = hand.joints[ window.XRHand.THUMB_PHALANX_TIP ];
							const distance = indexTip.position.distanceTo( thumbTip.position );

							const distanceToPinch = 0.02;
							const threshold = 0.005;

							if ( hand.inputState.pinching && distance > distanceToPinch + threshold ) {

								hand.inputState.pinching = false;
								this.dispatchEvent( {
									type: "pinchend",
									handedness: inputSource.handedness,
									target: this
								} );

							} else if ( ! hand.inputState.pinching && distance <= distanceToPinch - threshold ) {

								hand.inputState.pinching = true;
								this.dispatchEvent( {
									type: "pinchstart",
									handedness: inputSource.handedness,
									target: this
								} );

							}

						}

					}

				} else {

					if ( targetRay !== null ) {

						inputPose = frame.getPose( inputSource.targetRaySpace, referenceSpace );

						if ( inputPose !== null ) {

							targetRay.matrix.fromArray( inputPose.transform.matrix );
							targetRay.matrix.decompose( targetRay.position, targetRay.rotation, targetRay.scale );

						}

					}

					if ( grip !== null && inputSource.gripSpace ) {

						gripPose = frame.getPose( inputSource.gripSpace, referenceSpace );

						if ( gripPose !== null ) {

							grip.matrix.fromArray( gripPose.transform.matrix );
							grip.matrix.decompose( grip.position, grip.rotation, grip.scale );

						}

					}

				}

			}

			if ( targetRay !== null ) {

				targetRay.visible = ( inputPose !== null );

			}

			if ( grip !== null ) {

				grip.visible = ( gripPose !== null );

			}

			if ( hand !== null ) {

				hand.visible = ( handPose !== null );

			}

			return this;

		}

	} );

	function WebXRManager( renderer, gl ) {

		const scope = this;

		let session = null;

		let framebufferScaleFactor = 1.0;

		let referenceSpace = null;
		let referenceSpaceType = 'local-floor';

		let pose = null;

		const controllers = [];
		const inputSourcesMap = new Map();

		//

		const cameraL = new PerspectiveCamera();
		cameraL.layers.enable( 1 );
		cameraL.viewport = new Vector4();

		const cameraR = new PerspectiveCamera();
		cameraR.layers.enable( 2 );
		cameraR.viewport = new Vector4();

		const cameras = [ cameraL, cameraR ];


		let _currentDepthNear = null;
		let _currentDepthFar = null;

		//

		this.enabled = false;

		this.isPresenting = false;

		this.getController = function ( index ) {

			let controller = controllers[ index ];

			if ( controller === undefined ) {

				controller = new WebXRController();
				controllers[ index ] = controller;

			}

			return controller.getTargetRaySpace();

		};

		this.getControllerGrip = function ( index ) {

			let controller = controllers[ index ];

			if ( controller === undefined ) {

				controller = new WebXRController();
				controllers[ index ] = controller;

			}

			return controller.getGripSpace();

		};

		this.getHand = function ( index ) {

			let controller = controllers[ index ];

			if ( controller === undefined ) {

				controller = new WebXRController();
				controllers[ index ] = controller;

			}

			return controller.getHandSpace();

		};

		//

		function onSessionEvent( event ) {

			const controller = inputSourcesMap.get( event.inputSource );

			if ( controller ) {

				controller.dispatchEvent( { type: event.type } );

			}

		}

		function onSessionEnd() {

			inputSourcesMap.forEach( function ( controller, inputSource ) {

				controller.disconnect( inputSource );

			} );

			inputSourcesMap.clear();

			//

			renderer.setFramebuffer( null );
			renderer.setRenderTarget( renderer.getRenderTarget() ); // Hack #15830

			scope.isPresenting = false;

			scope.dispatchEvent( { type: 'sessionend' } );

		}

		function onRequestReferenceSpace( value ) {

			referenceSpace = value;


			scope.isPresenting = true;

			scope.dispatchEvent( { type: 'sessionstart' } );

		}

		this.setFramebufferScaleFactor = function ( value ) {

			framebufferScaleFactor = value;

			if ( scope.isPresenting === true ) {

				console.warn( 'THREE.WebXRManager: Cannot change framebuffer scale while presenting.' );

			}

		};

		this.setReferenceSpaceType = function ( value ) {

			referenceSpaceType = value;

			if ( scope.isPresenting === true ) {

				console.warn( 'THREE.WebXRManager: Cannot change reference space type while presenting.' );

			}

		};

		this.getReferenceSpace = function () {

			return referenceSpace;

		};

		this.getSession = function () {

			return session;

		};

		this.setSession = function ( value ) {

			session = value;

			if ( session !== null ) {

				session.addEventListener( 'select', onSessionEvent );
				session.addEventListener( 'selectstart', onSessionEvent );
				session.addEventListener( 'selectend', onSessionEvent );
				session.addEventListener( 'squeeze', onSessionEvent );
				session.addEventListener( 'squeezestart', onSessionEvent );
				session.addEventListener( 'squeezeend', onSessionEvent );
				session.addEventListener( 'end', onSessionEnd );

				const attributes = gl.getContextAttributes();

				if ( attributes.xrCompatible !== true ) {

					gl.makeXRCompatible();

				}

				const layerInit = {
					antialias: attributes.antialias,
					alpha: attributes.alpha,
					depth: attributes.depth,
					stencil: attributes.stencil,
					framebufferScaleFactor: framebufferScaleFactor
				};

				// eslint-disable-next-line no-undef
				const baseLayer = new XRWebGLLayer( session, gl, layerInit );

				session.updateRenderState( { baseLayer: baseLayer } );

				session.requestReferenceSpace( referenceSpaceType ).then( onRequestReferenceSpace );

				//

				session.addEventListener( 'inputsourceschange', updateInputSources );

			}

		};

		function updateInputSources( event ) {

			const inputSources = session.inputSources;

			// Assign inputSources to available controllers

			for ( let i = 0; i < controllers.length; i ++ ) {

				inputSourcesMap.set( inputSources[ i ], controllers[ i ] );

			}

			// Notify disconnected

			for ( let i = 0; i < event.removed.length; i ++ ) {

				const inputSource = event.removed[ i ];
				const controller = inputSourcesMap.get( inputSource );

				if ( controller ) {

					controller.dispatchEvent( { type: 'disconnected', data: inputSource } );
					inputSourcesMap.delete( inputSource );

				}

			}

			// Notify connected

			for ( let i = 0; i < event.added.length; i ++ ) {

				const inputSource = event.added[ i ];
				const controller = inputSourcesMap.get( inputSource );

				if ( controller ) {

					controller.dispatchEvent( { type: 'connected', data: inputSource } );

				}

			}

		}

		//

		const cameraLPos = new Vector3();
		const cameraRPos = new Vector3();

		/**
		 * Assumes 2 cameras that are parallel and share an X-axis, and that
		 * the cameras' projection and world matrices have already been set.
		 * And that near and far planes are identical for both cameras.
		 * Visualization of this technique: https://computergraphics.stackexchange.com/a/4765
		 */
		function setProjectionFromUnion( camera, cameraL, cameraR ) {

			cameraLPos.setFromMatrixPosition( cameraL.matrixWorld );
			cameraRPos.setFromMatrixPosition( cameraR.matrixWorld );

			const ipd = cameraLPos.distanceTo( cameraRPos );

			const projL = cameraL.projectionMatrix.elements;
			const projR = cameraR.projectionMatrix.elements;

			// VR systems will have identical far and near planes, and
			// most likely identical top and bottom frustum extents.
			// Use the left camera for these values.
			const near = projL[ 14 ] / ( projL[ 10 ] - 1 );
			const far = projL[ 14 ] / ( projL[ 10 ] + 1 );
			const topFov = ( projL[ 9 ] + 1 ) / projL[ 5 ];
			const bottomFov = ( projL[ 9 ] - 1 ) / projL[ 5 ];

			const leftFov = ( projL[ 8 ] - 1 ) / projL[ 0 ];
			const rightFov = ( projR[ 8 ] + 1 ) / projR[ 0 ];
			const left = near * leftFov;
			const right = near * rightFov;

			// Calculate the new camera's position offset from the
			// left camera. xOffset should be roughly half `ipd`.
			const zOffset = ipd / ( - leftFov + rightFov );
			const xOffset = zOffset * - leftFov;

			// TODO: Better way to apply this offset?
			cameraL.matrixWorld.decompose( camera.position, camera.quaternion, camera.scale );
			camera.translateX( xOffset );
			camera.translateZ( zOffset );
			camera.matrixWorld.compose( camera.position, camera.quaternion, camera.scale );
			camera.matrixWorldInverse.getInverse( camera.matrixWorld );

			// Find the union of the frustum values of the cameras and scale
			// the values so that the near plane's position does not change in world space,
			// although must now be relative to the new union camera.
			const near2 = near + zOffset;
			const far2 = far + zOffset;
			const left2 = left - xOffset;
			const right2 = right + ( ipd - xOffset );
			const top2 = topFov * far / far2 * near2;
			const bottom2 = bottomFov * far / far2 * near2;

			camera.projectionMatrix.makePerspective( left2, right2, top2, bottom2, near2, far2 );

		}

		function updateCamera( camera, parent ) {

			if ( parent === null ) {

				camera.matrixWorld.copy( camera.matrix );

			} else {

				camera.matrixWorld.multiplyMatrices( parent.matrixWorld, camera.matrix );

			}

			camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		}

		this.getCamera = function ( camera ) {

			cameraVR.near = cameraR.near = cameraL.near = camera.near;
			cameraVR.far = cameraR.far = cameraL.far = camera.far;

			if ( _currentDepthNear !== cameraVR.near || _currentDepthFar !== cameraVR.far ) {

				// Note that the new renderState won't apply until the next frame. See #18320

				session.updateRenderState( {
					depthNear: cameraVR.near,
					depthFar: cameraVR.far
				} );

				_currentDepthNear = cameraVR.near;
				_currentDepthFar = cameraVR.far;

			}

			const parent = camera.parent;
			const cameras = cameraVR.cameras;

			updateCamera( cameraVR, parent );

			for ( let i = 0; i < cameras.length; i ++ ) {

				updateCamera( cameras[ i ], parent );

			}

			// update camera and its children

			camera.matrixWorld.copy( cameraVR.matrixWorld );

			const children = camera.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].updateMatrixWorld( true );

			}

			// update projection matrix for proper view frustum culling

			if ( cameras.length === 2 ) {

				setProjectionFromUnion( cameraVR, cameraL, cameraR );

			} else {

				// assume single camera setup (AR)

				cameraVR.projectionMatrix.copy( cameraL.projectionMatrix );

			}

			return cameraVR;

		};

		


		this.dispose = function () {};

	}

	Object.assign( WebXRManager.prototype, EventDispatcher.prototype );

	function WebGLMaterials( properties ) {

		function refreshFogUniforms( uniforms, fog ) {

			uniforms.fogColor.value.copy( fog.color );

			if ( fog.isFog ) {

				uniforms.fogNear.value = fog.near;
				uniforms.fogFar.value = fog.far;

			} else if ( fog.isFogExp2 ) {

				uniforms.fogDensity.value = fog.density;

			}

		}

		function refreshMaterialUniforms( uniforms, material, pixelRatio, height ) {
			if ( material.isMeshBasicMaterial ) {
				refreshUniformsCommon( uniforms, material );
			} else if ( material.isMeshStandardMaterial ) {
				refreshUniformsCommon( uniforms, material );
				refreshUniformsStandard( uniforms, material );
			} 

		}

		function refreshUniformsCommon( uniforms, material ) {

			uniforms.opacity.value = material.opacity;
			if ( material.color ) {

				uniforms.diffuse.value.copy( material.color );

			}

			if ( material.emissive ) {

				uniforms.emissive.value.copy( material.emissive ).multiplyScalar( material.emissiveIntensity );

			}

			if ( material.map ) {

				uniforms.map.value = material.map;

			}

			if ( material.alphaMap ) {

				uniforms.alphaMap.value = material.alphaMap;

			}

			if ( material.specularMap ) {

				uniforms.specularMap.value = material.specularMap;

			}

			const envMap = properties.get( material ).envMap;

			if ( envMap ) {

				uniforms.envMap.value = envMap;

				uniforms.flipEnvMap.value = envMap.isCubeTexture ? - 1 : 1;

				uniforms.reflectivity.value = material.reflectivity;
				uniforms.refractionRatio.value = material.refractionRatio;

				const maxMipLevel = properties.get( envMap ).__maxMipLevel;

				if ( maxMipLevel !== undefined ) {

					uniforms.maxMipLevel.value = maxMipLevel;

				}

			}

			if ( material.lightMap ) {

				uniforms.lightMap.value = material.lightMap;
				uniforms.lightMapIntensity.value = material.lightMapIntensity;

			}

			if ( material.aoMap ) {

				uniforms.aoMap.value = material.aoMap;
				uniforms.aoMapIntensity.value = material.aoMapIntensity;

			}

			// uv repeat and offset setting priorities
			// 1. color map
			// 2. specular map
			// 3. displacementMap map
			// 4. normal map
			// 5. bump map
			// 6. roughnessMap map
			// 7. metalnessMap map
			// 8. alphaMap map
			// 9. emissiveMap map
			// 10. clearcoat map
			// 11. clearcoat normal map
			// 12. clearcoat roughnessMap map

			let uvScaleMap;

			if ( material.map ) {

				uvScaleMap = material.map;

			} else if ( material.specularMap ) {

				uvScaleMap = material.specularMap;

			} else if ( material.displacementMap ) {

				uvScaleMap = material.displacementMap;

			} else if ( material.normalMap ) {

				uvScaleMap = material.normalMap;

			} else if ( material.bumpMap ) {

				uvScaleMap = material.bumpMap;

			} else if ( material.roughnessMap ) {

				uvScaleMap = material.roughnessMap;

			} else if ( material.metalnessMap ) {

				uvScaleMap = material.metalnessMap;

			} else if ( material.alphaMap ) {

				uvScaleMap = material.alphaMap;

			} else if ( material.emissiveMap ) {

				uvScaleMap = material.emissiveMap;

			} else if ( material.clearcoatMap ) {

				uvScaleMap = material.clearcoatMap;

			} else if ( material.clearcoatNormalMap ) {

				uvScaleMap = material.clearcoatNormalMap;

			} else if ( material.clearcoatRoughnessMap ) {

				uvScaleMap = material.clearcoatRoughnessMap;

			}

			if ( uvScaleMap !== undefined ) {

				// backwards compatibility
				if ( uvScaleMap.isWebGLRenderTarget ) {

					uvScaleMap = uvScaleMap.texture;

				}

				if ( uvScaleMap.matrixAutoUpdate === true ) {

					uvScaleMap.updateMatrix();

				}

				uniforms.uvTransform.value.copy( uvScaleMap.matrix );

			}

			// uv repeat and offset setting priorities for uv2
			// 1. ao map
			// 2. light map

			let uv2ScaleMap;

			if ( material.aoMap ) {

				uv2ScaleMap = material.aoMap;

			} else if ( material.lightMap ) {

				uv2ScaleMap = material.lightMap;

			}

			if ( uv2ScaleMap !== undefined ) {

				// backwards compatibility
				if ( uv2ScaleMap.isWebGLRenderTarget ) {

					uv2ScaleMap = uv2ScaleMap.texture;

				}

				if ( uv2ScaleMap.matrixAutoUpdate === true ) {

					uv2ScaleMap.updateMatrix();

				}

				uniforms.uv2Transform.value.copy( uv2ScaleMap.matrix );

			}

		}


		function refreshUniformsStandard( uniforms, material ) {

			uniforms.roughness.value = material.roughness;
			uniforms.metalness.value = material.metalness;

			if ( material.roughnessMap ) {

				uniforms.roughnessMap.value = material.roughnessMap;

			}

			if ( material.metalnessMap ) {

				uniforms.metalnessMap.value = material.metalnessMap;

			}

			if ( material.emissiveMap ) {

				uniforms.emissiveMap.value = material.emissiveMap;

			}

			if ( material.bumpMap ) {

				uniforms.bumpMap.value = material.bumpMap;
				uniforms.bumpScale.value = material.bumpScale;
				if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

			}

			if ( material.normalMap ) {

				uniforms.normalMap.value = material.normalMap;
				uniforms.normalScale.value.copy( material.normalScale );
				if ( material.side === BackSide ) uniforms.normalScale.value.negate();

			}

			if ( material.displacementMap ) {

				uniforms.displacementMap.value = material.displacementMap;
				uniforms.displacementScale.value = material.displacementScale;
				uniforms.displacementBias.value = material.displacementBias;

			}

			const envMap = properties.get( material ).envMap;

			if ( envMap ) {

				//uniforms.envMap.value = material.envMap; // part of uniforms common
				uniforms.envMapIntensity.value = material.envMapIntensity;

			}

		}


		return {
			refreshFogUniforms: refreshFogUniforms,
			refreshMaterialUniforms: refreshMaterialUniforms
		};

	}

	function WebGLRenderer( parameters ) {

		parameters = parameters || {};

		const _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' ),
			_context = parameters.context !== undefined ? parameters.context : null,

			_alpha = parameters.alpha !== undefined ? parameters.alpha : false,
			_depth = parameters.depth !== undefined ? parameters.depth : true,
			_stencil = parameters.stencil !== undefined ? parameters.stencil : true,
			_antialias = parameters.antialias !== undefined ? parameters.antialias : false,
			_premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
			_preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,
			_powerPreference = parameters.powerPreference !== undefined ? parameters.powerPreference : 'default',
			_failIfMajorPerformanceCaveat = parameters.failIfMajorPerformanceCaveat !== undefined ? parameters.failIfMajorPerformanceCaveat : false;

		let currentRenderList = null;
		let currentRenderState = null;

		// public properties

		this.domElement = _canvas;

		// Debug configuration container
		this.debug = {

			/**
			 * Enables error checking and reporting when shader programs are being compiled
			 * @type {boolean}
			 */
			checkShaderErrors: true
		};

		// clearing

		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		// scene graph

		this.sortObjects = true;

		// user-defined clipping

		this.clippingPlanes = [];
		this.localClippingEnabled = false;

		// physically based shading

		this.gammaFactor = 2.0;	// for backwards compatibility
		this.outputEncoding = LinearEncoding;

		// physical lights

		this.physicallyCorrectLights = false;

		// tone mapping

		this.toneMapping = NoToneMapping;
		this.toneMappingExposure = 1.0;

		// morphs

		this.maxMorphTargets = 8;
		this.maxMorphNormals = 4;

		// internal properties

		const _this = this;

		let _isContextLost = false;

		// internal state cache

		let _framebuffer = null;

		let _currentActiveCubeFace = 0;
		let _currentActiveMipmapLevel = 0;
		let _currentRenderTarget = null;
		let _currentFramebuffer = null;
		let _currentMaterialId = - 1;

		let _currentCamera = null;
		let _currentArrayCamera = null;

		const _currentViewport = new Vector4();
		const _currentScissor = new Vector4();
		let _currentScissorTest = null;

		//

		let _width = _canvas.width;
		let _height = _canvas.height;

		let _pixelRatio = 1;
		let _opaqueSort = null;
		let _transparentSort = null;

		const _viewport = new Vector4( 0, 0, _width, _height );
		const _scissor = new Vector4( 0, 0, _width, _height );
		let _scissorTest = false;

		// frustum

		const _frustum = new Frustum();

		// clipping

		let _clippingEnabled = false;
		let _localClippingEnabled = false;

		// camera matrices cache

		const _projScreenMatrix = new Matrix4();

		const _vector3 = new Vector3();

		const _emptyScene = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: true };

		function getTargetPixelRatio() {

			return _currentRenderTarget === null ? _pixelRatio : 1;

		}

		// initialize

		let _gl = _context;

		function getContext( contextNames, contextAttributes ) {

			for ( let i = 0; i < contextNames.length; i ++ ) {

				const contextName = contextNames[ i ];
				const context = _canvas.getContext( contextName, contextAttributes );
				if ( context !== null ) return context;

			}

			return null;

		}

		try {

			const contextAttributes = {
				alpha: _alpha,
				depth: _depth,
				stencil: _stencil,
				antialias: _antialias,
				premultipliedAlpha: _premultipliedAlpha,
				preserveDrawingBuffer: _preserveDrawingBuffer,
				powerPreference: _powerPreference,
				failIfMajorPerformanceCaveat: _failIfMajorPerformanceCaveat
			};

			// event listeners must be registered before WebGL context is created, see #12753

			_canvas.addEventListener( 'webglcontextlost', onContextLost, false );
			_canvas.addEventListener( 'webglcontextrestored', onContextRestore, false );

			if ( _gl === null ) {

				const contextNames = [ 'webgl2', 'webgl', 'experimental-webgl' ];

				if ( _this.isWebGL1Renderer === true ) {

					contextNames.shift();

				}

				_gl = getContext( contextNames, contextAttributes );

				if ( _gl === null ) {

					if ( getContext( contextNames ) ) {

						throw new Error( 'Error creating WebGL context with your selected attributes.' );

					} else {

						throw new Error( 'Error creating WebGL context.' );

					}

				}

			}

			// Some experimental-webgl implementations do not have getShaderPrecisionFormat

			if ( _gl.getShaderPrecisionFormat === undefined ) {

				_gl.getShaderPrecisionFormat = function () {

					return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };

				};

			}

		} catch ( error ) {

			console.error( 'THREE.WebGLRenderer: ' + error.message );
			throw error;

		}

		let extensions, capabilities, state, info;
		let properties, textures, cubemaps, attributes, geometries, objects;
		let programCache, materials, renderLists, renderStates, clipping;

		let background, morphtargets, bufferRenderer, indexedBufferRenderer;

		let utils, bindingStates;

		function initGLContext() {
			extensions = new WebGLExtensions( _gl );

			capabilities = new WebGLCapabilities( _gl, extensions, parameters );

			if ( capabilities.isWebGL2 === false ) {

				extensions.get( 'WEBGL_depth_texture' );
				extensions.get( 'OES_texture_float' );
				extensions.get( 'OES_texture_half_float' );
				extensions.get( 'OES_texture_half_float_linear' );
				extensions.get( 'OES_standard_derivatives' );
				extensions.get( 'OES_element_index_uint' );
				extensions.get( 'OES_vertex_array_object' );
				extensions.get( 'ANGLE_instanced_arrays' );

			}

			extensions.get( 'OES_texture_float_linear' );


			state = new WebGLState( _gl, extensions, capabilities );
			state.scissor( _currentScissor.copy( _scissor ).multiplyScalar( _pixelRatio ).floor() );
			state.viewport( _currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio ).floor() );

			info = new WebGLInfo( _gl );
			properties = new WebGLProperties();
			cubemaps = new WebGLCubeMaps( _this );
			attributes = new WebGLAttributes( _gl, capabilities );
			bindingStates = new WebGLBindingStates( _gl, extensions, attributes, capabilities );
			geometries = new WebGLGeometries( _gl, attributes, info, bindingStates );
			objects = new WebGLObjects( _gl, geometries, attributes, info );
			morphtargets = new WebGLMorphtargets( _gl );
			clipping = new WebGLClipping( properties );
			programCache = new WebGLPrograms( _this, cubemaps, extensions, capabilities, bindingStates, clipping );
			materials = new WebGLMaterials( properties );
			renderLists = new WebGLRenderLists( properties );
			renderStates = new WebGLRenderStates();
			background = new WebGLBackground( _this, cubemaps, state, objects, _premultipliedAlpha );

			bufferRenderer = new WebGLBufferRenderer( _gl, extensions, info, capabilities );
			indexedBufferRenderer = new WebGLIndexedBufferRenderer( _gl, extensions, info, capabilities );

			info.programs = programCache.programs;

			_this.capabilities = capabilities;
			_this.extensions = extensions;
			_this.properties = properties;
			_this.renderLists = renderLists;
			_this.state = state;
			_this.info = info;

		}

		initGLContext();

		// xr

		const xr = new WebXRManager( _this, _gl );

		this.xr = xr;

		// shadow map

		const shadowMap = new WebGLShadowMap( _this, objects, capabilities.maxTextureSize );

		this.shadowMap = shadowMap;

		// API

		this.getContext = function () {

			return _gl;

		};

		this.getContextAttributes = function () {

			return _gl.getContextAttributes();

		};

		this.forceContextLoss = function () {

			const extension = extensions.get( 'WEBGL_lose_context' );
			if ( extension ) extension.loseContext();

		};

		this.forceContextRestore = function () {

			const extension = extensions.get( 'WEBGL_lose_context' );
			if ( extension ) extension.restoreContext();

		};

		this.getPixelRatio = function () {

			return _pixelRatio;

		};

		this.setPixelRatio = function ( value ) {

			if ( value === undefined ) return;

			_pixelRatio = value;

			this.setSize( _width, _height, false );

		};

		this.getSize = function ( target ) {

			if ( target === undefined ) {

				console.warn( 'WebGLRenderer: .getsize() now requires a Vector2 as an argument' );

				target = new Vector2();

			}

			return target.set( _width, _height );

		};

		this.setSize = function ( width, height, updateStyle ) {

			if ( xr.isPresenting ) {

				console.warn( 'THREE.WebGLRenderer: Can\'t change size while VR device is presenting.' );
				return;

			}

			_width = width;
			_height = height;

			_canvas.width = Math.floor( width * _pixelRatio );
			_canvas.height = Math.floor( height * _pixelRatio );

			if ( updateStyle !== false ) {

				_canvas.style.width = width + 'px';
				_canvas.style.height = height + 'px';

			}

			this.setViewport( 0, 0, width, height );

		};

		this.getDrawingBufferSize = function ( target ) {

			if ( target === undefined ) {

				console.warn( 'WebGLRenderer: .getdrawingBufferSize() now requires a Vector2 as an argument' );

				target = new Vector2();

			}

			return target.set( _width * _pixelRatio, _height * _pixelRatio ).floor();

		};

		this.setDrawingBufferSize = function ( width, height, pixelRatio ) {

			_width = width;
			_height = height;

			_pixelRatio = pixelRatio;

			_canvas.width = Math.floor( width * pixelRatio );
			_canvas.height = Math.floor( height * pixelRatio );

			this.setViewport( 0, 0, width, height );

		};

		this.getCurrentViewport = function ( target ) {

			if ( target === undefined ) {

				console.warn( 'WebGLRenderer: .getCurrentViewport() now requires a Vector4 as an argument' );

				target = new Vector4();

			}

			return target.copy( _currentViewport );

		};

		this.getViewport = function ( target ) {

			return target.copy( _viewport );

		};

		this.setViewport = function ( x, y, width, height ) {

			if ( x.isVector4 ) {

				_viewport.set( x.x, x.y, x.z, x.w );

			} else {

				_viewport.set( x, y, width, height );

			}

			state.viewport( _currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio ).floor() );

		};

		this.getScissor = function ( target ) {

			return target.copy( _scissor );

		};

		this.setScissor = function ( x, y, width, height ) {

			if ( x.isVector4 ) {

				_scissor.set( x.x, x.y, x.z, x.w );

			} else {

				_scissor.set( x, y, width, height );

			}

			state.scissor( _currentScissor.copy( _scissor ).multiplyScalar( _pixelRatio ).floor() );

		};

		this.getScissorTest = function () {

			return _scissorTest;

		};

		this.setScissorTest = function ( boolean ) {

			state.setScissorTest( _scissorTest = boolean );

		};

		this.setOpaqueSort = function ( method ) {

			_opaqueSort = method;

		};

		this.setTransparentSort = function ( method ) {

			_transparentSort = method;

		};

		// Clearing

		this.getClearColor = function () {

			return background.getClearColor();

		};

		this.setClearColor = function () {

			background.setClearColor.apply( background, arguments );

		};

		this.getClearAlpha = function () {

			return background.getClearAlpha();

		};

		this.setClearAlpha = function () {

			background.setClearAlpha.apply( background, arguments );

		};

		this.clear = function ( color, depth, stencil ) {

			let bits = 0;

			if ( color === undefined || color ) bits |= 16384;
			if ( depth === undefined || depth ) bits |= 256;
			if ( stencil === undefined || stencil ) bits |= 1024;

			_gl.clear( bits );

		};

		this.clearColor = function () {

			this.clear( true, false, false );

		};

		this.clearDepth = function () {

			this.clear( false, true, false );

		};

		this.clearStencil = function () {

			this.clear( false, false, true );

		};

		//

		this.dispose = function () {

			_canvas.removeEventListener( 'webglcontextlost', onContextLost, false );
			_canvas.removeEventListener( 'webglcontextrestored', onContextRestore, false );

			renderLists.dispose();
			renderStates.dispose();
			properties.dispose();
			cubemaps.dispose();
			objects.dispose();
			bindingStates.dispose();

			xr.dispose();

		};

		// Events

		function onContextLost( event ) {

			event.preventDefault();

			console.log( 'THREE.WebGLRenderer: Context Lost.' );

			_isContextLost = true;

		}

		function onContextRestore( /* event */ ) {

			console.log( 'THREE.WebGLRenderer: Context Restored.' );

			_isContextLost = false;

			initGLContext();

		}

		function onMaterialDispose( event ) {

			const material = event.target;

			material.removeEventListener( 'dispose', onMaterialDispose );

			deallocateMaterial( material );

		}

		// Buffer deallocation

		function deallocateMaterial( material ) {

			releaseMaterialProgramReference( material );

			properties.remove( material );

		}


		function releaseMaterialProgramReference( material ) {

			const programInfo = properties.get( material ).program;

			if ( programInfo !== undefined ) {

				programCache.releaseProgram( programInfo );

			}

		}

		// Buffer rendering

		function renderObjectImmediate( object, program ) {

			object.render( function ( object ) {

				_this.renderBufferImmediate( object, program );

			} );

		}

		this.renderBufferImmediate = function ( object, program ) {

			bindingStates.initAttributes();

			const buffers = properties.get( object );

			if ( object.hasPositions && ! buffers.position ) buffers.position = _gl.createBuffer();
			if ( object.hasNormals && ! buffers.normal ) buffers.normal = _gl.createBuffer();
			if ( object.hasUvs && ! buffers.uv ) buffers.uv = _gl.createBuffer();
			if ( object.hasColors && ! buffers.color ) buffers.color = _gl.createBuffer();

			const programAttributes = program.getAttributes();

			if ( object.hasPositions ) {

				_gl.bindBuffer( 34962, buffers.position );
				_gl.bufferData( 34962, object.positionArray, 35048 );

				bindingStates.enableAttribute( programAttributes.position );
				_gl.vertexAttribPointer( programAttributes.position, 3, 5126, false, 0, 0 );

			}

			if ( object.hasNormals ) {

				_gl.bindBuffer( 34962, buffers.normal );
				_gl.bufferData( 34962, object.normalArray, 35048 );

				bindingStates.enableAttribute( programAttributes.normal );
				_gl.vertexAttribPointer( programAttributes.normal, 3, 5126, false, 0, 0 );

			}

			if ( object.hasUvs ) {

				_gl.bindBuffer( 34962, buffers.uv );
				_gl.bufferData( 34962, object.uvArray, 35048 );

				bindingStates.enableAttribute( programAttributes.uv );
				_gl.vertexAttribPointer( programAttributes.uv, 2, 5126, false, 0, 0 );

			}

			if ( object.hasColors ) {

				_gl.bindBuffer( 34962, buffers.color );
				_gl.bufferData( 34962, object.colorArray, 35048 );

				bindingStates.enableAttribute( programAttributes.color );
				_gl.vertexAttribPointer( programAttributes.color, 3, 5126, false, 0, 0 );

			}

			bindingStates.disableUnusedAttributes();

			_gl.drawArrays( 4, 0, object.count );

			object.count = 0;

		};

		this.renderBufferDirect = function ( camera, scene, geometry, material, object, group ) {

			if ( scene === null ) scene = _emptyScene; // renderBufferDirect second parameter used to be fog (could be null)

			const frontFaceCW = ( object.isMesh && object.matrixWorld.determinant() < 0 );

			const program = setProgram( camera, scene, material, object );

			state.setMaterial( material, frontFaceCW );

			//

			let index = geometry.index;
			const position = geometry.attributes.position;

			//

			if ( index === null ) {

				if ( position === undefined || position.count === 0 ) return;

			} else if ( index.count === 0 ) {

				return;

			}

			//

			let rangeFactor = 1;

			if ( material.wireframe === true ) {

				index = geometries.getWireframeAttribute( geometry );
				rangeFactor = 2;

			}

			if ( material.morphTargets || material.morphNormals ) {

				morphtargets.update( object, geometry, material, program );

			}

			bindingStates.setup( object, material, program, geometry, index );

			let attribute;
			let renderer = bufferRenderer;

			if ( index !== null ) {

				attribute = attributes.get( index );

				renderer = indexedBufferRenderer;
				renderer.setIndex( attribute );

			}

			//

			const dataCount = ( index !== null ) ? index.count : position.count;

			const rangeStart = geometry.drawRange.start * rangeFactor;
			const rangeCount = geometry.drawRange.count * rangeFactor;

			const groupStart = group !== null ? group.start * rangeFactor : 0;
			const groupCount = group !== null ? group.count * rangeFactor : Infinity;

			const drawStart = Math.max( rangeStart, groupStart );
			const drawEnd = Math.min( dataCount, rangeStart + rangeCount, groupStart + groupCount ) - 1;

			const drawCount = Math.max( 0, drawEnd - drawStart + 1 );

			if ( drawCount === 0 ) return;

			//

			if ( object.isMesh ) {

				if ( material.wireframe === true ) {

					state.setLineWidth( material.wireframeLinewidth * getTargetPixelRatio() );
					renderer.setMode( 1 );

				} else {

					renderer.setMode( 4 );

				}

			} else if ( object.isLine ) {

				let lineWidth = material.linewidth;

				if ( lineWidth === undefined ) lineWidth = 1; // Not using Line*Material

				state.setLineWidth( lineWidth * getTargetPixelRatio() );

				if ( object.isLineSegments ) {

					renderer.setMode( 1 );

				} else {

					renderer.setMode( 3 );

				}

			} else if ( object.isPoints ) {

				renderer.setMode( 0 );

			} else if ( object.isSprite ) {

				renderer.setMode( 4 );

			}

			if ( object.isInstancedMesh ) {

				renderer.renderInstances( drawStart, drawCount, object.count );

			} else if ( geometry.isInstancedBufferGeometry ) {

				const instanceCount = Math.min( geometry.instanceCount, geometry._maxInstanceCount );

				renderer.renderInstances( drawStart, drawCount, instanceCount );

			} else {

				renderer.render( drawStart, drawCount );

			}

		};

		// Compile

		this.compile = function ( scene, camera ) {

			currentRenderState = renderStates.get( scene, camera );
			currentRenderState.init();

			scene.traverse( function ( object ) {

				if ( object.isLight ) {

					currentRenderState.pushLight( object );

					if ( object.castShadow ) {

						currentRenderState.pushShadow( object );

					}

				}

			} );

			currentRenderState.setupLights( camera );

			const compiled = new WeakMap();

			scene.traverse( function ( object ) {

				const material = object.material;

				if ( material ) {

					if ( Array.isArray( material ) ) {

						for ( let i = 0; i < material.length; i ++ ) {

							const material2 = material[ i ];

							if ( compiled.has( material2 ) === false ) {

								initMaterial( material2, scene, object );
								compiled.set( material2 );

							}

						}

					} else if ( compiled.has( material ) === false ) {

						initMaterial( material, scene, object );
						compiled.set( material );

					}

				}

			} );

		};

		

		// Rendering

		this.render = function ( scene, camera ) {
			let renderTarget, forceClear;

			if ( arguments[ 2 ] !== undefined ) {
				console.warn( 'THREE.WebGLRenderer.render(): the renderTarget argument has been removed. Use .setRenderTarget() instead.' );
				renderTarget = arguments[ 2 ];
			}

			if ( arguments[ 3 ] !== undefined ) {
				console.warn( 'THREE.WebGLRenderer.render(): the forceClear argument has been removed. Use .clear() instead.' );
				forceClear = arguments[ 3 ];
			}

			if ( camera !== undefined && camera.isCamera !== true ) {
				console.error( 'THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.' );
				return;
			}

			if ( _isContextLost === true ) return;

			// reset caching for this frame
			bindingStates.resetDefaultState();
			_currentMaterialId = - 1;
			_currentCamera = null;

			// update scene graph
			if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

			// update camera matrices and frustum
			if ( camera.parent === null ) camera.updateMatrixWorld();

			if ( xr.enabled === true && xr.isPresenting === true ) {
				camera = xr.getCamera( camera );
			}

			//
			if ( scene.isScene === true ) scene.onBeforeRender( _this, scene, camera, renderTarget || _currentRenderTarget );

			currentRenderState = renderStates.get( scene, camera );
			currentRenderState.init();

			_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
			_frustum.setFromProjectionMatrix( _projScreenMatrix );

			_localClippingEnabled = this.localClippingEnabled;
			_clippingEnabled = clipping.init( this.clippingPlanes, _localClippingEnabled, camera );

			currentRenderList = renderLists.get( scene, camera );
			currentRenderList.init();

			projectObject( scene, camera, 0, _this.sortObjects );

			currentRenderList.finish();

			if ( _this.sortObjects === true ) {

				currentRenderList.sort( _opaqueSort, _transparentSort );

			}

			//

			if ( _clippingEnabled === true ) clipping.beginShadows();

			const shadowsArray = currentRenderState.state.shadowsArray;

			shadowMap.render( shadowsArray, scene, camera );

			currentRenderState.setupLights( camera );

			if ( _clippingEnabled === true ) clipping.endShadows();

			//

			if ( this.info.autoReset === true ) this.info.reset();

			if ( renderTarget !== undefined ) {

				this.setRenderTarget( renderTarget );

			}

			//

			background.render( currentRenderList, scene, camera, forceClear );

			// render scene

			const opaqueObjects = currentRenderList.opaque;
			const transparentObjects = currentRenderList.transparent;

			if ( opaqueObjects.length > 0 ) renderObjects( opaqueObjects, scene, camera );
			if ( transparentObjects.length > 0 ) renderObjects( transparentObjects, scene, camera );

			//

			if ( scene.isScene === true ) scene.onAfterRender( _this, scene, camera );

			//

			// Ensure depth buffer writing is enabled so it can be cleared on next render

			state.buffers.depth.setTest( true );
			state.buffers.depth.setMask( true );
			state.buffers.color.setMask( true );

			state.setPolygonOffset( false );

			// _gl.finish();

			currentRenderList = null;
			currentRenderState = null;

		};

		function projectObject( object, camera, groupOrder, sortObjects ) {

			if ( object.visible === false ) return;

			const visible = object.layers.test( camera.layers );

			if ( visible ) {

				if ( object.isGroup ) {

					groupOrder = object.renderOrder;

				} else if ( object.isLOD ) {

					if ( object.autoUpdate === true ) object.update( camera );

				} else if ( object.isLight ) {

					currentRenderState.pushLight( object );

					if ( object.castShadow ) {

						currentRenderState.pushShadow( object );

					}

				} else if ( object.isSprite ) {

					if ( ! object.frustumCulled || _frustum.intersectsSprite( object ) ) {

						if ( sortObjects ) {

							_vector3.setFromMatrixPosition( object.matrixWorld )
								.applyMatrix4( _projScreenMatrix );

						}

						const geometry = objects.update( object );
						const material = object.material;

						if ( material.visible ) {

							currentRenderList.push( object, geometry, material, groupOrder, _vector3.z, null );

						}

					}

				} else if ( object.isImmediateRenderObject ) {

					if ( sortObjects ) {

						_vector3.setFromMatrixPosition( object.matrixWorld )
							.applyMatrix4( _projScreenMatrix );

					}

					currentRenderList.push( object, null, object.material, groupOrder, _vector3.z, null );

				} else if ( object.isMesh || object.isLine || object.isPoints ) {

					

					if ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) {

						if ( sortObjects ) {

							_vector3.setFromMatrixPosition( object.matrixWorld )
								.applyMatrix4( _projScreenMatrix );

						}

						const geometry = objects.update( object );
						const material = object.material;

						if ( Array.isArray( material ) ) {

							const groups = geometry.groups;

							for ( let i = 0, l = groups.length; i < l; i ++ ) {

								const group = groups[ i ];
								const groupMaterial = material[ group.materialIndex ];

								if ( groupMaterial && groupMaterial.visible ) {

									currentRenderList.push( object, geometry, groupMaterial, groupOrder, _vector3.z, group );

								}

							}

						} else if ( material.visible ) {

							currentRenderList.push( object, geometry, material, groupOrder, _vector3.z, null );

						}

					}

				}

			}

			const children = object.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				projectObject( children[ i ], camera, groupOrder, sortObjects );

			}

		}

		function renderObjects( renderList, scene, camera ) {

			const overrideMaterial = scene.isScene === true ? scene.overrideMaterial : null;

			for ( let i = 0, l = renderList.length; i < l; i ++ ) {

				const renderItem = renderList[ i ];

				const object = renderItem.object;
				const geometry = renderItem.geometry;
				const material = overrideMaterial === null ? renderItem.material : overrideMaterial;
				const group = renderItem.group;


				_currentArrayCamera = null;

				renderObject( object, scene, camera, geometry, material, group );

			}

		}

		function renderObject( object, scene, camera, geometry, material, group ) {

			object.onBeforeRender( _this, scene, camera, geometry, material, group );
			currentRenderState = renderStates.get( scene, _currentArrayCamera || camera );

			object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
			object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

			if ( object.isImmediateRenderObject ) {

				const program = setProgram( camera, scene, material, object );

				state.setMaterial( material );

				bindingStates.reset();

				renderObjectImmediate( object, program );

			} else {

				_this.renderBufferDirect( camera, scene, geometry, material, object, group );

			}

			object.onAfterRender( _this, scene, camera, geometry, material, group );
			currentRenderState = renderStates.get( scene, _currentArrayCamera || camera );

		}

		function initMaterial( material, scene, object ) {

			if ( scene.isScene !== true ) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...

			const materialProperties = properties.get( material );

			const lights = currentRenderState.state.lights;
			const shadowsArray = currentRenderState.state.shadowsArray;

			const lightsStateVersion = lights.state.version;

			const parameters = programCache.getParameters( material, lights.state, shadowsArray, scene, object );
			const programCacheKey = programCache.getProgramCacheKey( parameters );

			let program = materialProperties.program;
			let programChange = true;

			if ( program === undefined ) {

				// new material
				material.addEventListener( 'dispose', onMaterialDispose );

			} else if ( program.cacheKey !== programCacheKey ) {

				// changed glsl or parameters
				releaseMaterialProgramReference( material );

			} else if ( materialProperties.lightsStateVersion !== lightsStateVersion ) {

				programChange = false;

			} else if ( parameters.shaderID !== undefined ) {

				// same glsl and uniform list, envMap still needs the update here to avoid a frame-late effect

				const environment = material.isMeshStandardMaterial ? scene.environment : null;
				materialProperties.envMap = cubemaps.get( material.envMap || environment );

				return;

			} else {

				// only rebuild uniform list
				programChange = false;

			}

			if ( programChange ) {

				parameters.uniforms = programCache.getUniforms( material );

				material.onBeforeCompile( parameters, _this );

				program = programCache.acquireProgram( parameters, programCacheKey );

				materialProperties.program = program;
				materialProperties.uniforms = parameters.uniforms;
				materialProperties.outputEncoding = parameters.outputEncoding;

			}

			const uniforms = materialProperties.uniforms;

			if ( ! material.isShaderMaterial ||
				material.clipping === true ) {

				materialProperties.numClippingPlanes = clipping.numPlanes;
				materialProperties.numIntersection = clipping.numIntersection;
				uniforms.clippingPlanes = clipping.uniform;

			}

			materialProperties.environment = material.isMeshStandardMaterial ? scene.environment : null;
			materialProperties.fog = scene.fog;
			materialProperties.envMap = cubemaps.get( material.envMap || materialProperties.environment );

			// store the light setup it was created for

			materialProperties.needsLights = materialNeedsLights( material );
			materialProperties.lightsStateVersion = lightsStateVersion;

			if ( materialProperties.needsLights ) {

				// wire up the material to this renderer's lighting state

				uniforms.ambientLightColor.value = lights.state.ambient;
				uniforms.lightProbe.value = lights.state.probe;
				uniforms.directionalLights.value = lights.state.directional;
				uniforms.directionalLightShadows.value = lights.state.directionalShadow;
				uniforms.spotLights.value = lights.state.spot;
				uniforms.spotLightShadows.value = lights.state.spotShadow;
				uniforms.rectAreaLights.value = lights.state.rectArea;
				uniforms.ltc_1.value = lights.state.rectAreaLTC1;
				uniforms.ltc_2.value = lights.state.rectAreaLTC2;
				uniforms.pointLights.value = lights.state.point;
				uniforms.pointLightShadows.value = lights.state.pointShadow;
				uniforms.hemisphereLights.value = lights.state.hemi;

				uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
				uniforms.directionalShadowMatrix.value = lights.state.directionalShadowMatrix;
				uniforms.spotShadowMap.value = lights.state.spotShadowMap;
				uniforms.spotShadowMatrix.value = lights.state.spotShadowMatrix;
				uniforms.pointShadowMap.value = lights.state.pointShadowMap;
				uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;
				// TODO (abelnation): add area lights shadow info to uniforms

			}

			const progUniforms = materialProperties.program.getUniforms();
			const uniformsList = WebGLUniforms.seqWithValue( progUniforms.seq, uniforms );

			materialProperties.uniformsList = uniformsList;

		}

		function setProgram( camera, scene, material, object ) {

			if ( scene.isScene !== true ) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...

			const fog = scene.fog;
			const environment = material.isMeshStandardMaterial ? scene.environment : null;
			const encoding = ( _currentRenderTarget === null ) ? _this.outputEncoding : _currentRenderTarget.texture.encoding;
			const envMap = cubemaps.get( material.envMap || environment );

			const materialProperties = properties.get( material );
			const lights = currentRenderState.state.lights;

			if ( _clippingEnabled === true ) {

				if ( _localClippingEnabled === true || camera !== _currentCamera ) {

					const useCache =
						camera === _currentCamera &&
						material.id === _currentMaterialId;

					// we might want to call this function with some ClippingGroup
					// object instead of the material, once it becomes feasible
					// (#8465, #8379)
					clipping.setState( material, camera, useCache );

				}

			}

			if ( material.version === materialProperties.__version ) {

				if ( material.fog && materialProperties.fog !== fog ) {

					initMaterial( material, scene, object );

				} else if ( materialProperties.environment !== environment ) {

					initMaterial( material, scene, object );

				} else if ( materialProperties.needsLights && ( materialProperties.lightsStateVersion !== lights.state.version ) ) {

					initMaterial( material, scene, object );

				} else if ( materialProperties.numClippingPlanes !== undefined &&
					( materialProperties.numClippingPlanes !== clipping.numPlanes ||
					materialProperties.numIntersection !== clipping.numIntersection ) ) {

					initMaterial( material, scene, object );

				} else if ( materialProperties.outputEncoding !== encoding ) {

					initMaterial( material, scene, object );

				} else if ( materialProperties.envMap !== envMap ) {

					initMaterial( material, scene, object );

				}

			} else {

				initMaterial( material, scene, object );
				materialProperties.__version = material.version;

			}

			let refreshProgram = false;
			let refreshMaterial = false;
			let refreshLights = false;

			const program = materialProperties.program,
				p_uniforms = program.getUniforms(),
				m_uniforms = materialProperties.uniforms;

			if ( state.useProgram( program.program ) ) {

				refreshProgram = true;
				refreshMaterial = true;
				refreshLights = true;

			}

			if ( material.id !== _currentMaterialId ) {

				_currentMaterialId = material.id;

				refreshMaterial = true;

			}

			if ( refreshProgram || _currentCamera !== camera ) {

				p_uniforms.setValue( _gl, 'projectionMatrix', camera.projectionMatrix );

				if ( capabilities.logarithmicDepthBuffer ) {

					p_uniforms.setValue( _gl, 'logDepthBufFC',
						2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );

				}

				if ( _currentCamera !== camera ) {

					_currentCamera = camera;

					// lighting uniforms depend on the camera so enforce an update
					// now, in case this material supports lights - or later, when
					// the next material that does gets activated:

					refreshMaterial = true;		// set to true on material change
					refreshLights = true;		// remains set until update done

				}

				// load material specific uniforms
				// (shader material also gets them for the sake of genericity)

				if ( material.isShaderMaterial ||material.isMeshStandardMaterial ||	material.envMap ) {

					const uCamPos = p_uniforms.map.cameraPosition;

					if ( uCamPos !== undefined ) {

						uCamPos.setValue( _gl,
							_vector3.setFromMatrixPosition( camera.matrixWorld ) );

					}

				}

				if (material.isMeshBasicMaterial ||	material.isMeshStandardMaterial ) {
					p_uniforms.setValue( _gl, 'isOrthographic', camera.isOrthographicCamera === true );
				}

				if ( material.isMeshBasicMaterial ||material.isMeshStandardMaterial ||material.skinning ) {
					p_uniforms.setValue( _gl, 'viewMatrix', camera.matrixWorldInverse );
				}

			}

			// skinning uniforms must be set even if material didn't change
			// auto-setting of texture unit for bone texture must go before other textures
			// otherwise textures used for skinning can take over texture units reserved for other material textures

			if ( material.skinning ) {

				p_uniforms.setOptional( _gl, object, 'bindMatrix' );
				p_uniforms.setOptional( _gl, object, 'bindMatrixInverse' );

				const skeleton = object.skeleton;

				if ( skeleton ) {

					const bones = skeleton.bones;

					if ( capabilities.floatVertexTextures ) {

						if ( skeleton.boneTexture === undefined ) {

							// layout (1 matrix = 4 pixels)
							//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
							//  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
							//       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
							//       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
							//       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)


							let size = Math.sqrt( bones.length * 4 ); // 4 pixels needed for 1 matrix
							size = MathUtils.ceilPowerOfTwo( size );
							size = Math.max( size, 4 );

							const boneMatrices = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
							boneMatrices.set( skeleton.boneMatrices ); // copy current values

							const boneTexture = new DataTexture( boneMatrices, size, size, RGBAFormat, FloatType );

							skeleton.boneMatrices = boneMatrices;
							skeleton.boneTexture = boneTexture;
							skeleton.boneTextureSize = size;

						}

						p_uniforms.setValue( _gl, 'boneTexture', skeleton.boneTexture, textures );
						p_uniforms.setValue( _gl, 'boneTextureSize', skeleton.boneTextureSize );

					} else {

						p_uniforms.setOptional( _gl, skeleton, 'boneMatrices' );

					}

				}

			}

			if ( refreshMaterial || materialProperties.receiveShadow !== object.receiveShadow ) {

				materialProperties.receiveShadow = object.receiveShadow;
				p_uniforms.setValue( _gl, 'receiveShadow', object.receiveShadow );

			}

			if ( refreshMaterial ) {

				p_uniforms.setValue( _gl, 'toneMappingExposure', _this.toneMappingExposure );

				if ( materialProperties.needsLights ) {

					// the current material requires lighting info

					// note: all lighting uniforms are always set correctly
					// they simply reference the renderer's state for their
					// values
					//
					// use the current material's .needsUpdate flags to set
					// the GL state when required

					markUniformsLightsNeedsUpdate( m_uniforms, refreshLights );

				}

				// refresh uniforms common to several materials

				if ( fog && material.fog ) {

					materials.refreshFogUniforms( m_uniforms, fog );

				}

				materials.refreshMaterialUniforms( m_uniforms, material, _pixelRatio, _height );

				WebGLUniforms.upload( _gl, materialProperties.uniformsList, m_uniforms, textures );

			}

			if ( material.isShaderMaterial && material.uniformsNeedUpdate === true ) {

				WebGLUniforms.upload( _gl, materialProperties.uniformsList, m_uniforms, textures );
				material.uniformsNeedUpdate = false;

			}
			// common matrices

			p_uniforms.setValue( _gl, 'modelViewMatrix', object.modelViewMatrix );
			p_uniforms.setValue( _gl, 'normalMatrix', object.normalMatrix );
			p_uniforms.setValue( _gl, 'modelMatrix', object.matrixWorld );

			return program;

		}

		// If uniforms are marked as clean, they don't need to be loaded to the GPU.

		function markUniformsLightsNeedsUpdate( uniforms, value ) {

			uniforms.ambientLightColor.needsUpdate = value;
			uniforms.lightProbe.needsUpdate = value;

			uniforms.directionalLights.needsUpdate = value;
			uniforms.directionalLightShadows.needsUpdate = value;
			uniforms.pointLights.needsUpdate = value;
			uniforms.pointLightShadows.needsUpdate = value;
			uniforms.spotLights.needsUpdate = value;
			uniforms.spotLightShadows.needsUpdate = value;
			uniforms.rectAreaLights.needsUpdate = value;
			uniforms.hemisphereLights.needsUpdate = value;

		}

		function materialNeedsLights( material ) {

			return material.isMeshStandardMaterial ||
				( material.isShaderMaterial && material.lights === true );

		}

		//
		this.setFramebuffer = function ( value ) {

			if ( _framebuffer !== value && _currentRenderTarget === null ) _gl.bindFramebuffer( 36160, value );

			_framebuffer = value;

		};

		this.getActiveCubeFace = function () {

			return _currentActiveCubeFace;

		};

		this.getActiveMipmapLevel = function () {

			return _currentActiveMipmapLevel;

		};

		this.getRenderList = function () {

			return currentRenderList;

		};

		this.setRenderList = function ( renderList ) {

			currentRenderList = renderList;

		};

		this.getRenderState = function () {

			return currentRenderState;

		};

		this.setRenderState = function ( renderState ) {

			currentRenderState = renderState;

		};

		this.getRenderTarget = function () {

			return _currentRenderTarget;

		};

		this.setRenderTarget = function ( renderTarget, activeCubeFace = 0, activeMipmapLevel = 0 ) {

			_currentRenderTarget = renderTarget;
			_currentActiveCubeFace = activeCubeFace;
			_currentActiveMipmapLevel = activeMipmapLevel;

			if ( renderTarget && properties.get( renderTarget ).__webglFramebuffer === undefined ) {

				textures.setupRenderTarget( renderTarget );

			}

			let framebuffer = _framebuffer;
			let isCube = false;

			if ( renderTarget ) {

				const __webglFramebuffer = properties.get( renderTarget ).__webglFramebuffer;

				if ( renderTarget.isWebGLCubeRenderTarget ) {

					framebuffer = __webglFramebuffer[ activeCubeFace ];
					isCube = true;

				} else {

					framebuffer = __webglFramebuffer;

				}

				_currentViewport.copy( renderTarget.viewport );
				_currentScissor.copy( renderTarget.scissor );
				_currentScissorTest = renderTarget.scissorTest;

			} else {

				_currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio ).floor();
				_currentScissor.copy( _scissor ).multiplyScalar( _pixelRatio ).floor();
				_currentScissorTest = _scissorTest;

			}

			if ( _currentFramebuffer !== framebuffer ) {

				_gl.bindFramebuffer( 36160, framebuffer );
				_currentFramebuffer = framebuffer;

			}

			state.viewport( _currentViewport );
			state.scissor( _currentScissor );
			state.setScissorTest( _currentScissorTest );

			if ( isCube ) {

				const textureProperties = properties.get( renderTarget.texture );
				_gl.framebufferTexture2D( 36160, 36064, 34069 + activeCubeFace, textureProperties.__webglTexture, activeMipmapLevel );

			}

		};


		if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

			__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) ); // eslint-disable-line no-undef

		}

	}

	function WebGL1Renderer( parameters ) {

		WebGLRenderer.call( this, parameters );

	}

	WebGL1Renderer.prototype = Object.assign( Object.create( WebGLRenderer.prototype ), {

		constructor: WebGL1Renderer,

		isWebGL1Renderer: true

	} );


	class Scene extends Object3D {

		constructor() {
			super();

			Object.defineProperty( this, 'isScene', { value: true } );

			this.type = 'Scene';

			this.background = null;
			this.environment = null;
			this.fog = null;

			this.overrideMaterial = null;

			this.autoUpdate = true; // checked by the renderer

			if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {
				__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) ); // eslint-disable-line no-undef
			}
		}

		copy( source, recursive ) {
			super.copy( source, recursive );

			if ( source.background !== null ) this.background = source.background.clone();
			if ( source.environment !== null ) this.environment = source.environment.clone();
			if ( source.fog !== null ) this.fog = source.fog.clone();

			if ( source.overrideMaterial !== null ) this.overrideMaterial = source.overrideMaterial.clone();

			this.autoUpdate = source.autoUpdate;
			this.matrixAutoUpdate = source.matrixAutoUpdate;

			return this;
		}
	}

	function InterleavedBuffer( array, stride ) {

		this.array = array;
		this.stride = stride;
		this.count = array !== undefined ? array.length / stride : 0;

		this.usage = StaticDrawUsage;
		this.updateRange = { offset: 0, count: - 1 };

		this.version = 0;

		this.uuid = MathUtils.generateUUID();
	}

	Object.defineProperty( InterleavedBuffer.prototype, 'needsUpdate', {
		set: function ( value ) {if ( value === true ) this.version ++;}
	} );

	Object.assign( InterleavedBuffer.prototype, {
		isInterleavedBuffer: true,
		onUploadCallback: function () {},
		setUsage: function ( value ) {
			this.usage = value;
			return this;
		},

		copy: function ( source ) {
			this.array = new source.array.constructor( source.array );
			this.count = source.count;
			this.stride = source.stride;
			this.usage = source.usage;
			return this;
		},

		copyAt: function ( index1, attribute, index2 ) {
			index1 *= this.stride;
			index2 *= attribute.stride;

			for ( let i = 0, l = this.stride; i < l; i ++ ) {
				this.array[ index1 + i ] = attribute.array[ index2 + i ];
			}

			return this;
		},

		set: function ( value, offset ) {
			if ( offset === undefined ) offset = 0;
			this.array.set( value, offset );
			return this;
		},

		clone: function ( data ) {
			if ( data.arrayBuffers === undefined ) {
				data.arrayBuffers = {};
			}

			if ( this.array.buffer._uuid === undefined ) {
				this.array.buffer._uuid = MathUtils.generateUUID();
			}

			if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {
				data.arrayBuffers[ this.array.buffer._uuid ] = this.array.slice( 0 ).buffer;
			}

			const array = new this.array.constructor( data.arrayBuffers[ this.array.buffer._uuid ] );

			const ib = new InterleavedBuffer( array, this.stride );
			ib.setUsage( this.usage );
			return ib;
		},

		onUpload: function ( callback ) {
			this.onUploadCallback = callback;
			return this;
		},

		toJSON: function ( data ) {
			if ( data.arrayBuffers === undefined ) {data.arrayBuffers = {};}

			// generate UUID for array buffer if necessary

			if ( this.array.buffer._uuid === undefined ) {this.array.buffer._uuid = MathUtils.generateUUID();}

			if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {data.arrayBuffers[ this.array.buffer._uuid ] = Array.prototype.slice.call( new Uint32Array( this.array.buffer ) );}

			return {
				uuid: this.uuid,
				buffer: this.array.buffer._uuid,
				type: this.array.constructor.name,
				stride: this.stride
			};

		}
	} );

	const _vector$6 = new Vector3();

	function InterleavedBufferAttribute( interleavedBuffer, itemSize, offset, normalized ) {
		this.name = '';
		this.data = interleavedBuffer;
		this.itemSize = itemSize;
		this.offset = offset;
		this.normalized = normalized === true;
	}

	Object.defineProperties( InterleavedBufferAttribute.prototype, {
		count: {get: function () {return this.data.count;}},
		array: {get: function () {return this.data.array;}},
		needsUpdate: {set: function ( value ) {this.data.needsUpdate = value;}}
	} );

	Object.assign( InterleavedBufferAttribute.prototype, {

		isInterleavedBufferAttribute: true,

		applyMatrix4: function ( m ) {

			for ( let i = 0, l = this.data.count; i < l; i ++ ) {
				_vector$6.x = this.getX( i );
				_vector$6.y = this.getY( i );
				_vector$6.z = this.getZ( i );
				_vector$6.applyMatrix4( m );
				this.setXYZ( i, _vector$6.x, _vector$6.y, _vector$6.z );
			}
			return this;
		},


		getX: function ( index ) {
			return this.data.array[ index * this.data.stride + this.offset ];
		},

		getY: function ( index ) {
			return this.data.array[ index * this.data.stride + this.offset + 1 ];
		},

		getZ: function ( index ) {
			return this.data.array[ index * this.data.stride + this.offset + 2 ];
		},

		setXYZ: function ( index, x, y, z ) {
			index = index * this.data.stride + this.offset;
			this.data.array[ index + 0 ] = x;
			this.data.array[ index + 1 ] = y;
			this.data.array[ index + 2 ] = z;
			return this;
		},


		clone: function ( data ) {

			if ( data === undefined ) {
				console.log( 'THREE.InterleavedBufferAttribute.clone(): Cloning an interlaved buffer attribute will deinterleave buffer data.' );
				const array = [];

				for ( let i = 0; i < this.count; i ++ ) {
					const index = i * this.data.stride + this.offset;
					for ( let j = 0; j < this.itemSize; j ++ ) {
						array.push( this.data.array[ index + j ] );
					}
				}

				return new BufferAttribute( new this.array.constructor( array ), this.itemSize, this.normalized );
			} else {

				if ( data.interleavedBuffers === undefined ) {
					data.interleavedBuffers = {};
				}

				if ( data.interleavedBuffers[ this.data.uuid ] === undefined ) {
					data.interleavedBuffers[ this.data.uuid ] = this.data.clone( data );
				}
				return new InterleavedBufferAttribute( data.interleavedBuffers[ this.data.uuid ], this.itemSize, this.offset, this.normalized );
			}
		}
	} );

	const _offsetMatrix = new Matrix4();
	const _identityMatrix = new Matrix4();

	function Skeleton( bones, boneInverses ) {

		// copy the bone array

		bones = bones || [];

		this.bones = bones.slice( 0 );
		this.boneMatrices = new Float32Array( this.bones.length * 16 );

		this.frame = - 1;

		// use the supplied bone inverses or calculate the inverses

		if ( boneInverses === undefined ) {
			this.calculateInverses();
		} else {

			if ( this.bones.length === boneInverses.length ) {
				this.boneInverses = boneInverses.slice( 0 );
			} else {
				console.warn( 'THREE.Skeleton boneInverses is the wrong length.' );
				this.boneInverses = [];
				for ( let i = 0, il = this.bones.length; i < il; i ++ ) {
					this.boneInverses.push( new Matrix4() );
				}
			}
		}
	}

	Object.assign( Skeleton.prototype, {
		calculateInverses: function () {
			this.boneInverses = [];
			for ( let i = 0, il = this.bones.length; i < il; i ++ ) {
				const inverse = new Matrix4();
				if ( this.bones[ i ] ) {
					inverse.getInverse( this.bones[ i ].matrixWorld );
				}
				this.boneInverses.push( inverse );
			}
		},

		pose: function () {
			// recover the bind-time world matrices
			for ( let i = 0, il = this.bones.length; i < il; i ++ ) {
				const bone = this.bones[ i ];
				if ( bone ) {
					bone.matrixWorld.getInverse( this.boneInverses[ i ] );
				}
			}

			// compute the local matrices, positions, rotations and scales
			for ( let i = 0, il = this.bones.length; i < il; i ++ ) {
				const bone = this.bones[ i ];
				if ( bone ) {
					if ( bone.parent && bone.parent.isBone ) {
						bone.matrix.getInverse( bone.parent.matrixWorld );
						bone.matrix.multiply( bone.matrixWorld );
					} else {
						bone.matrix.copy( bone.matrixWorld );
					}

					bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );
				}
			}
		},

		update: function () {
			const bones = this.bones;
			const boneInverses = this.boneInverses;
			const boneMatrices = this.boneMatrices;
			const boneTexture = this.boneTexture;

			// flatten bone matrices to array

			for ( let i = 0, il = bones.length; i < il; i ++ ) {

				// compute the offset between the current and the original transform

				const matrix = bones[ i ] ? bones[ i ].matrixWorld : _identityMatrix;

				_offsetMatrix.multiplyMatrices( matrix, boneInverses[ i ] );
				_offsetMatrix.toArray( boneMatrices, i * 16 );

			}

			if ( boneTexture !== undefined ) {

				boneTexture.needsUpdate = true;

			}

		},

		clone: function () {return new Skeleton( this.bones, this.boneInverses );},

		getBoneByName: function ( name ) {
			for ( let i = 0, il = this.bones.length; i < il; i ++ ) {
				const bone = this.bones[ i ];

				if ( bone.name === name ) {
					return bone;
				}
			}
			return undefined;
		},

		dispose: function ( ) {
			if ( this.boneTexture ) {
				this.boneTexture.dispose();
				this.boneTexture = undefined;
			}
		}
	} );

	function Bone() {
		Object3D.call( this );
		this.type = 'Bone';
	}

	Bone.prototype = Object.assign( Object.create( Object3D.prototype ), {
		constructor: Bone,
		isBone: true
	} );


	function LineBasicMaterial( parameters ) {

		Material.call( this );

		this.type = 'LineBasicMaterial';

		this.color = new Color( 0xffffff );

		this.linewidth = 1;
		this.linecap = 'round';
		this.linejoin = 'round';

		this.morphTargets = false;

		this.setValues( parameters );

	}

	LineBasicMaterial.prototype = Object.create( Material.prototype );
	LineBasicMaterial.prototype.constructor = LineBasicMaterial;

	LineBasicMaterial.prototype.isLineBasicMaterial = true;

	LineBasicMaterial.prototype.copy = function ( source ) {
		Material.prototype.copy.call( this, source );

		this.color.copy( source.color );
		this.linewidth = source.linewidth;
		this.linecap = source.linecap;
		this.linejoin = source.linejoin;
		this.morphTargets = source.morphTargets;
		return this;
	};


	function MeshStandardMaterial( parameters ) {

		Material.call( this );

		this.defines = { 'STANDARD': '' };

		this.type = 'MeshStandardMaterial';

		this.color = new Color( 0xffffff ); // diffuse
		this.roughness = 1.0;
		this.metalness = 0.0;

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.emissive = new Color( 0x000000 );
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalMapType = TangentSpaceNormalMap;
		this.normalScale = new Vector2( 1, 1 );

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.roughnessMap = null;

		this.metalnessMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.envMapIntensity = 1.0;

		this.refractionRatio = 0.98;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.skinning = false;
		this.morphTargets = false;
		this.morphNormals = false;

		this.vertexTangents = false;

		this.setValues( parameters );

	}

	MeshStandardMaterial.prototype = Object.create( Material.prototype );
	MeshStandardMaterial.prototype.constructor = MeshStandardMaterial;

	MeshStandardMaterial.prototype.isMeshStandardMaterial = true;

	MeshStandardMaterial.prototype.copy = function ( source ) {

		Material.prototype.copy.call( this, source );

		this.defines = { 'STANDARD': '' };
		this.color.copy( source.color );
		this.roughness = source.roughness;
		this.metalness = source.metalness;

		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.emissive.copy( source.emissive );
		this.emissiveMap = source.emissiveMap;
		this.emissiveIntensity = source.emissiveIntensity;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.roughnessMap = source.roughnessMap;

		this.metalnessMap = source.metalnessMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.envMapIntensity = source.envMapIntensity;

		this.refractionRatio = source.refractionRatio;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.skinning = source.skinning;
		this.morphTargets = source.morphTargets;
		this.morphNormals = source.morphNormals;

		this.vertexTangents = source.vertexTangents;

		return this;

	};



	function LoadingManager( onLoad, onProgress, onError ) {

		const scope = this;

		let isLoading = false;
		let itemsLoaded = 0;
		let itemsTotal = 0;
		let urlModifier = undefined;
		const handlers = [];

		// Refer to #5689 for the reason why we don't set .onStart
		// in the constructor

		this.onStart = undefined;
		this.onLoad = onLoad;
		this.onProgress = onProgress;
		this.onError = onError;

		this.itemStart = function ( url ) {

			itemsTotal ++;

			if ( isLoading === false ) {

				if ( scope.onStart !== undefined ) {

					scope.onStart( url, itemsLoaded, itemsTotal );

				}

			}

			isLoading = true;

		};

		this.itemEnd = function ( url ) {

			itemsLoaded ++;

			if ( scope.onProgress !== undefined ) {

				scope.onProgress( url, itemsLoaded, itemsTotal );

			}

			if ( itemsLoaded === itemsTotal ) {

				isLoading = false;

				if ( scope.onLoad !== undefined ) {

					scope.onLoad();

				}

			}

		};

		this.itemError = function ( url ) {

			if ( scope.onError !== undefined ) {

				scope.onError( url );

			}

		};

		this.resolveURL = function ( url ) {

			if ( urlModifier ) {

				return urlModifier( url );

			}

			return url;

		};

		this.setURLModifier = function ( transform ) {

			urlModifier = transform;

			return this;

		};

		this.addHandler = function ( regex, loader ) {

			handlers.push( regex, loader );

			return this;

		};

		this.removeHandler = function ( regex ) {

			const index = handlers.indexOf( regex );

			if ( index !== - 1 ) {

				handlers.splice( index, 2 );

			}

			return this;

		};

		this.getHandler = function ( file ) {

			for ( let i = 0, l = handlers.length; i < l; i += 2 ) {

				const regex = handlers[ i ];
				const loader = handlers[ i + 1 ];

				if ( regex.global ) regex.lastIndex = 0; // see #17920

				if ( regex.test( file ) ) {

					return loader;

				}

			}

			return null;

		};

	}

	const DefaultLoadingManager = new LoadingManager();

	function Loader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

		this.crossOrigin = 'anonymous';
		this.path = '';
		this.resourcePath = '';
		this.requestHeader = {};

	}

	Object.assign( Loader.prototype, {

		load: function ( /* url, onLoad, onProgress, onError */ ) {},

		loadAsync: function ( url, onProgress ) {
			const scope = this;
			return new Promise( function ( resolve, reject ) {
				scope.load( url, resolve, onProgress, reject );
			} );
		},

		parse: function ( /* data */ ) {},

		setCrossOrigin: function ( crossOrigin ) {
			this.crossOrigin = crossOrigin;
			return this;
		},

		setPath: function ( path ) {
			this.path = path;
			return this;
		},

		setResourcePath: function ( resourcePath ) {
			this.resourcePath = resourcePath;
			return this;
		},

		setRequestHeader: function ( requestHeader ) {
			this.requestHeader = requestHeader;
			return this;
		}
	} );

	const loading = {};



	/**
	 * Extensible curve object.
	 *
	 * Some common of curve methods:
	 * .getPoint( t, optionalTarget ), .getTangent( t, optionalTarget )
	 * .getPointAt( u, optionalTarget ), .getTangentAt( u, optionalTarget )
	 * .getPoints(), .getSpacedPoints()
	 * .getLength()
	 * .updateArcLengths()
	 *
	 * This following curves inherit from THREE.Curve:
	 *
	 * -- 2D curves --
	 * THREE.LineCurve
	 *
	 * -- 3D curves --
	 *
	 * A series of curves can be represented as a THREE.CurvePath.
	 *
	 **/

	function Curve() {
		this.type = 'Curve';
		this.arcLengthDivisions = 200;
	}

	Object.assign( Curve.prototype, {
		clone: function () {return new this.constructor().copy( this );	},
		copy: function ( source ) {
			this.arcLengthDivisions = source.arcLengthDivisions;
			return this;
		}
	} );

	const tmp = new Vector3();
	var Curves = /*#__PURE__*/Object.freeze({
		__proto__: null
	});

	/**************************************************************
	 *	Curved Path - a curve path is simply a array of connected
	 *  curves, but retains the api of a curve
	 **************************************************************/

	function CurvePath() {
		Curve.call( this );
		this.type = 'CurvePath';
		this.curves = [];
		this.autoClose = false; // Automatically closes the path
	}

	CurvePath.prototype = Object.assign( Object.create( Curve.prototype ), {
		constructor: CurvePath,

		add: function ( curve ) {this.curves.push( curve );},

		// To get accurate point with reference to
		// entire path distance at time t,
		// following has to be done:

		// 1. Length of each sub path have to be known
		// 2. Locate and identify type of curve
		// 3. Get t for the curve
		// 4. Return curve.getPointAt(t')

		getPoint: function ( t ) {

			const d = t * this.getLength();
			const curveLengths = this.getCurveLengths();
			let i = 0;

			// To think about boundaries points.

			while ( i < curveLengths.length ) {

				if ( curveLengths[ i ] >= d ) {

					const diff = curveLengths[ i ] - d;
					const curve = this.curves[ i ];

					const segmentLength = curve.getLength();
					const u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;

					return curve.getPointAt( u );
				}
				i ++;
			}
			return null;
			// loop where sum != 0, sum > d , sum+1 <d
		},

		// We cannot use the default THREE.Curve getPoint() with getLength() because in
		// THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
		// getPoint() depends on getLength

		getLength: function () {

			const lens = this.getCurveLengths();
			return lens[ lens.length - 1 ];

		},

		// cacheLengths must be recalculated.
		updateArcLengths: function () {

			this.needsUpdate = true;
			this.cacheLengths = null;
			this.getCurveLengths();

		},

		// Compute lengths and cache them
		// We cannot overwrite getLengths() because UtoT mapping uses it.

		getCurveLengths: function () {

			// We use cache values if curves and cache array are same length

			if ( this.cacheLengths && this.cacheLengths.length === this.curves.length ) {

				return this.cacheLengths;

			}

			// Get length of sub-curve
			// Push sums into cached array

			const lengths = [];
			let sums = 0;

			for ( let i = 0, l = this.curves.length; i < l; i ++ ) {

				sums += this.curves[ i ].getLength();
				lengths.push( sums );

			}

			this.cacheLengths = lengths;

			return lengths;

		},

		getSpacedPoints: function ( divisions ) {

			if ( divisions === undefined ) divisions = 40;

			const points = [];

			for ( let i = 0; i <= divisions; i ++ ) {

				points.push( this.getPoint( i / divisions ) );

			}

			if ( this.autoClose ) {

				points.push( points[ 0 ] );

			}

			return points;

		},

		getPoints: function ( divisions ) {

			divisions = divisions || 12;

			const points = [];
			let last;

			for ( let i = 0, curves = this.curves; i < curves.length; i ++ ) {

				const curve = curves[ i ];
				const resolution = ( curve && curve.isEllipseCurve ) ? divisions * 2
					: ( curve && ( curve.isLineCurve || curve.isLineCurve3 ) ) ? 1
						: ( curve && curve.isSplineCurve ) ? divisions * curve.points.length
							: divisions;

				const pts = curve.getPoints( resolution );

				for ( let j = 0; j < pts.length; j ++ ) {

					const point = pts[ j ];

					if ( last && last.equals( point ) ) continue; // ensures no consecutive points are duplicates

					points.push( point );
					last = point;

				}

			}

			if ( this.autoClose && points.length > 1 && ! points[ points.length - 1 ].equals( points[ 0 ] ) ) {

				points.push( points[ 0 ] );

			}

			return points;

		},

		copy: function ( source ) {

			Curve.prototype.copy.call( this, source );

			this.curves = [];

			for ( let i = 0, l = source.curves.length; i < l; i ++ ) {

				const curve = source.curves[ i ];

				this.curves.push( curve.clone() );

			}

			this.autoClose = source.autoClose;

			return this;

		},

		toJSON: function () {

			const data = Curve.prototype.toJSON.call( this );

			data.autoClose = this.autoClose;
			data.curves = [];

			for ( let i = 0, l = this.curves.length; i < l; i ++ ) {

				const curve = this.curves[ i ];
				data.curves.push( curve.toJSON() );

			}

			return data;

		},

		fromJSON: function ( json ) {

			Curve.prototype.fromJSON.call( this, json );

			this.autoClose = json.autoClose;
			this.curves = [];

			for ( let i = 0, l = json.curves.length; i < l; i ++ ) {

				const curve = json.curves[ i ];
				this.curves.push( new Curves[ curve.type ]().fromJSON( curve ) );

			}

			return this;

		}

	} );

	function Path( points ) {

		CurvePath.call( this );

		this.type = 'Path';

		this.currentPoint = new Vector2();

		if ( points ) {

			this.setFromPoints( points );

		}

	}

	Path.prototype = Object.assign( Object.create( CurvePath.prototype ), {

		constructor: Path,


		moveTo: function ( x, y ) {
			this.currentPoint.set( x, y ); // TODO consider referencing vectors instead of copying?
			return this;
		},

		copy: function ( source ) {
			CurvePath.prototype.copy.call( this, source );
			this.currentPoint.copy( source.currentPoint );
			return this;
		}
	} );

	function Light( color, intensity ) {

		Object3D.call( this );

		this.type = 'Light';

		this.color = new Color( color );
		this.intensity = intensity !== undefined ? intensity : 1;

		this.receiveShadow = undefined;

	}

	Light.prototype = Object.assign( Object.create( Object3D.prototype ), {

		constructor: Light,

		isLight: true,

		copy: function ( source ) {

			Object3D.prototype.copy.call( this, source );

			this.color.copy( source.color );
			this.intensity = source.intensity;

			return this;

		},

		toJSON: function ( meta ) {

			const data = Object3D.prototype.toJSON.call( this, meta );
			data.object.color = this.color.getHex();
			data.object.intensity = this.intensity;

			if ( this.groundColor !== undefined ) data.object.groundColor = this.groundColor.getHex();

			if ( this.distance !== undefined ) data.object.distance = this.distance;
			if ( this.angle !== undefined ) data.object.angle = this.angle;
			if ( this.decay !== undefined ) data.object.decay = this.decay;
			if ( this.penumbra !== undefined ) data.object.penumbra = this.penumbra;

			if ( this.shadow !== undefined ) data.object.shadow = this.shadow.toJSON();

			return data;

		}

	} );

	function HemisphereLight( skyColor, groundColor, intensity ) {

		Light.call( this, skyColor, intensity );

		this.type = 'HemisphereLight';

		this.castShadow = undefined;

		this.position.copy( Object3D.DefaultUp );
		this.updateMatrix();

		this.groundColor = new Color( groundColor );

	}

	HemisphereLight.prototype = Object.assign( Object.create( Light.prototype ), {

		constructor: HemisphereLight,

		isHemisphereLight: true,

		copy: function ( source ) {

			Light.prototype.copy.call( this, source );

			this.groundColor.copy( source.groundColor );

			return this;

		}

	} );

	function LightShadow( camera ) {

		this.camera = camera;

		this.bias = 0;
		this.normalBias = 0;
		this.radius = 1;

		this.mapSize = new Vector2( 512, 512 );

		this.map = null;
		this.mapPass = null;
		this.matrix = new Matrix4();

		this.autoUpdate = true;
		this.needsUpdate = false;

		this._frustum = new Frustum();
		this._frameExtents = new Vector2( 1, 1 );

		this._viewportCount = 1;

		this._viewports = [

			new Vector4( 0, 0, 1, 1 )

		];

	}

	Object.assign( LightShadow.prototype, {

		_projScreenMatrix: new Matrix4(),

		_lightPositionWorld: new Vector3(),

		_lookTarget: new Vector3(),

		getViewportCount: function () {

			return this._viewportCount;

		},

		getFrustum: function () {

			return this._frustum;

		},

		updateMatrices: function ( light ) {

			const shadowCamera = this.camera,
				shadowMatrix = this.matrix,
				projScreenMatrix = this._projScreenMatrix,
				lookTarget = this._lookTarget,
				lightPositionWorld = this._lightPositionWorld;

			lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
			shadowCamera.position.copy( lightPositionWorld );

			lookTarget.setFromMatrixPosition( light.target.matrixWorld );
			shadowCamera.lookAt( lookTarget );
			shadowCamera.updateMatrixWorld();

			projScreenMatrix.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
			this._frustum.setFromProjectionMatrix( projScreenMatrix );

			shadowMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);

			shadowMatrix.multiply( shadowCamera.projectionMatrix );
			shadowMatrix.multiply( shadowCamera.matrixWorldInverse );

		},

		getViewport: function ( viewportIndex ) {

			return this._viewports[ viewportIndex ];

		},

		getFrameExtents: function () {

			return this._frameExtents;

		},

		copy: function ( source ) {

			this.camera = source.camera.clone();

			this.bias = source.bias;
			this.radius = source.radius;

			this.mapSize.copy( source.mapSize );

			return this;

		},

		clone: function () {

			return new this.constructor().copy( this );

		},

		toJSON: function () {

			const object = {};

			if ( this.bias !== 0 ) object.bias = this.bias;
			if ( this.normalBias !== 0 ) object.normalBias = this.normalBias;
			if ( this.radius !== 1 ) object.radius = this.radius;
			if ( this.mapSize.x !== 512 || this.mapSize.y !== 512 ) object.mapSize = this.mapSize.toArray();

			object.camera = this.camera.toJSON( false ).object;
			delete object.camera.matrix;

			return object;

		}

	} );

	function OrthographicCamera( left, right, top, bottom, near, far ) {

		Camera.call( this );
		this.type = 'OrthographicCamera';

		this.zoom = 1;
		this.view = null;
		this.left = ( left !== undefined ) ? left : - 1;
		this.right = ( right !== undefined ) ? right : 1;
		this.top = ( top !== undefined ) ? top : 1;
		this.bottom = ( bottom !== undefined ) ? bottom : - 1;
		this.near = ( near !== undefined ) ? near : 0.1;
		this.far = ( far !== undefined ) ? far : 2000;
		this.updateProjectionMatrix();

	}

	OrthographicCamera.prototype = Object.assign( Object.create( Camera.prototype ), {

		constructor: OrthographicCamera,

		isOrthographicCamera: true,

		copy: function ( source, recursive ) {
			Camera.prototype.copy.call( this, source, recursive );

			this.left = source.left;
			this.right = source.right;
			this.top = source.top;
			this.bottom = source.bottom;
			this.near = source.near;
			this.far = source.far;
			this.zoom = source.zoom;
			this.view = source.view === null ? null : Object.assign( {}, source.view );

			return this;
		},

		updateProjectionMatrix: function () {

			const dx = ( this.right - this.left ) / ( 2 * this.zoom );
			const dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
			const cx = ( this.right + this.left ) / 2;
			const cy = ( this.top + this.bottom ) / 2;

			let left = cx - dx;
			let right = cx + dx;
			let top = cy + dy;
			let bottom = cy - dy;

			if ( this.view !== null && this.view.enabled ) {

				const scaleW = ( this.right - this.left ) / this.view.fullWidth / this.zoom;
				const scaleH = ( this.top - this.bottom ) / this.view.fullHeight / this.zoom;

				left += scaleW * this.view.offsetX;
				right = left + scaleW * this.view.width;
				top -= scaleH * this.view.offsetY;
				bottom = top - scaleH * this.view.height;

			}

			this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );

			this.projectionMatrixInverse.getInverse( this.projectionMatrix );

		}

	} );

	function DirectionalLightShadow() {LightShadow.call( this, new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );}

	DirectionalLightShadow.prototype = Object.assign( Object.create( LightShadow.prototype ), {
		constructor: DirectionalLightShadow,
		isDirectionalLightShadow: true,

		updateMatrices: function ( light ) {
			LightShadow.prototype.updateMatrices.call( this, light );
		}
	} );

	function DirectionalLight( color, intensity ) {

		Light.call( this, color, intensity );

		this.type = 'DirectionalLight';

		this.position.copy( Object3D.DefaultUp );
		this.updateMatrix();

		this.target = new Object3D();

		this.shadow = new DirectionalLightShadow();

	}

	DirectionalLight.prototype = Object.assign( Object.create( Light.prototype ), {

		constructor: DirectionalLight,

		isDirectionalLight: true,

		copy: function ( source ) {

			Light.prototype.copy.call( this, source );

			this.target = source.target.clone();

			this.shadow = source.shadow.clone();

			return this;

		}

	} );

	function AmbientLight( color, intensity ) {

		Light.call( this, color, intensity );

		this.type = 'AmbientLight';

		this.castShadow = undefined;

	}

	AmbientLight.prototype = Object.assign( Object.create( Light.prototype ), {
		constructor: AmbientLight,
		isAmbientLight: true
	} );


	const LoaderUtils = {

		decodeText: function ( array ) {

			if ( typeof TextDecoder !== 'undefined' ) {

				return new TextDecoder().decode( array );

			}

			// Avoid the String.fromCharCode.apply(null, array) shortcut, which
			// throws a "maximum call stack size exceeded" error for large arrays.
			let s = '';

			for ( let i = 0, il = array.length; i < il; i ++ ) {
				// Implicitly assumes little-endian.
				s += String.fromCharCode( array[ i ] );
			}

			try {
				// merges multi-byte utf-8 characters.
				return decodeURIComponent( escape( s ) );
			} catch ( e ) { // see #16358
				return s;
			}
		},

		extractUrlBase: function ( url ) {
			const index = url.lastIndexOf( '/' );
			if ( index === - 1 ) return './';
			return url.substr( 0, index + 1 );
		}

	};

	function InstancedBufferGeometry() {
		BufferGeometry.call( this );

		this.type = 'InstancedBufferGeometry';
		this.instanceCount = Infinity;
	}

	InstancedBufferGeometry.prototype = Object.assign( Object.create( BufferGeometry.prototype ), {

		constructor: InstancedBufferGeometry,
		isInstancedBufferGeometry: true,
		copy: function ( source ) {
			BufferGeometry.prototype.copy.call( this, source );
			this.instanceCount = source.instanceCount;
			return this;
		},

		clone: function () {return new this.constructor().copy( this );},

		toJSON: function () {
			const data = BufferGeometry.prototype.toJSON.call( this );
			data.instanceCount = this.instanceCount;
			data.isInstancedBufferGeometry = true;
			return data;
		}

	} );

	function InstancedBufferAttribute( array, itemSize, normalized, meshPerAttribute ) {

		if ( typeof ( normalized ) === 'number' ) {

			meshPerAttribute = normalized;

			normalized = false;

			console.error( 'THREE.InstancedBufferAttribute: The constructor now expects normalized as the third argument.' );

		}

		BufferAttribute.call( this, array, itemSize, normalized );

		this.meshPerAttribute = meshPerAttribute || 1;

	}

	InstancedBufferAttribute.prototype = Object.assign( Object.create( BufferAttribute.prototype ), {

		constructor: InstancedBufferAttribute,

		isInstancedBufferAttribute: true,

		copy: function ( source ) {

			BufferAttribute.prototype.copy.call( this, source );

			this.meshPerAttribute = source.meshPerAttribute;

			return this;

		},

		toJSON: function ()	{

			const data = BufferAttribute.prototype.toJSON.call( this );

			data.meshPerAttribute = this.meshPerAttribute;

			data.isInstancedBufferAttribute = true;

			return data;

		}

	} );


	class Uniform {

		constructor( value ) {
			if ( typeof value === 'string' ) {
				console.warn( 'THREE.Uniform: Type parameter is no longer needed.' );
				value = arguments[ 1 ];
			}
			this.value = value;
		}

		clone() {return new Uniform( this.value.clone === undefined ? this.value : this.value.clone() );}

	}


	function Raycaster( origin, direction, near, far ) {

		this.ray = new Ray( origin, direction );
		// direction is assumed to be normalized (for accurate distance calculations)

		this.near = near || 0;
		this.far = far || Infinity;
		this.camera = null;
		this.layers = new Layers();

		this.params = {
			Mesh: {},
			Line: { threshold: 1 },
			LOD: {},
			Points: { threshold: 1 },
			Sprite: {}
		};

		Object.defineProperties( this.params, {
			PointCloud: {
				get: function () {

					console.warn( 'THREE.Raycaster: params.PointCloud has been renamed to params.Points.' );
					return this.Points;

				}
			}
		} );

	}

	function ascSort( a, b ) {return a.distance - b.distance;}

	function intersectObject( object, raycaster, intersects, recursive ) {
		if ( object.layers.test( raycaster.layers ) ) {
			object.raycast( raycaster, intersects );
		}

		if ( recursive === true ) {
			const children = object.children;
			for ( let i = 0, l = children.length; i < l; i ++ ) {
				intersectObject( children[ i ], raycaster, intersects, true );
			}
		}
	}

	Object.assign( Raycaster.prototype, {
		set: function ( origin, direction ) {
			// direction is assumed to be normalized (for accurate distance calculations)
			this.ray.set( origin, direction );
		},

		setFromCamera: function ( coords, camera ) {

			if ( ( camera && camera.isPerspectiveCamera ) ) {

				this.ray.origin.setFromMatrixPosition( camera.matrixWorld );
				this.ray.direction.set( coords.x, coords.y, 0.5 ).unproject( camera ).sub( this.ray.origin ).normalize();
				this.camera = camera;

			} else if ( ( camera && camera.isOrthographicCamera ) ) {

				this.ray.origin.set( coords.x, coords.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera ); // set origin in plane of camera
				this.ray.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
				this.camera = camera;

			} else {

				console.error( 'THREE.Raycaster: Unsupported camera type.' );

			}

		},

		intersectObject: function ( object, recursive, optionalTarget ) {

			const intersects = optionalTarget || [];

			intersectObject( object, this, intersects, recursive );

			intersects.sort( ascSort );

			return intersects;

		},

		intersectObjects: function ( objects, recursive, optionalTarget ) {

			const intersects = optionalTarget || [];

			if ( Array.isArray( objects ) === false ) {

				console.warn( 'THREE.Raycaster.intersectObjects: objects is not an Array.' );
				return intersects;

			}

			for ( let i = 0, l = objects.length; i < l; i ++ ) {

				intersectObject( objects[ i ], this, intersects, recursive );

			}

			intersects.sort( ascSort );

			return intersects;

		}

	} );


	function ImmediateRenderObject( material ) {

		Object3D.call( this );

		this.material = material;
		this.render = function ( /* renderCallback */ ) {};

		this.hasPositions = false;
		this.hasNormals = false;
		this.hasColors = false;
		this.hasUvs = false;

		this.positionArray = null;
		this.normalArray = null;
		this.colorArray = null;
		this.uvArray = null;

		this.count = 0;

	}

	ImmediateRenderObject.prototype = Object.create( Object3D.prototype );
	ImmediateRenderObject.prototype.constructor = ImmediateRenderObject;

	ImmediateRenderObject.prototype.isImmediateRenderObject = true;



	//

	Object.assign( Loader.prototype, {
		extractUrlBase: function ( url ) {
			console.warn( 'THREE.Loader: .extractUrlBase() has been deprecated. Use THREE.LoaderUtils.extractUrlBase() instead.' );
			return LoaderUtils.extractUrlBase( url );
		}
	} );

	Object.assign( Box3.prototype, {
		center: function ( optionalTarget ) {
			console.warn( 'THREE.Box3: .center() has been renamed to .getCenter().' );
			return this.getCenter( optionalTarget );
		},
		empty: function () {
			console.warn( 'THREE.Box3: .empty() has been renamed to .isEmpty().' );
			return this.isEmpty();
		},
		isIntersectionBox: function ( box ) {
			console.warn( 'THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox().' );
			return this.intersectsBox( box );
		},
		isIntersectionSphere: function ( sphere ) {
			console.warn( 'THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
			return this.intersectsSphere( sphere );
		},
		size: function ( optionalTarget ) {
			console.warn( 'THREE.Box3: .size() has been renamed to .getSize().' );
			return this.getSize( optionalTarget );
		}
	} );

	

	Frustum.prototype.setFromMatrix = function ( m ) {
		console.warn( 'THREE.Frustum: .setFromMatrix() has been renamed to .setFromProjectionMatrix().' );
		return this.setFromProjectionMatrix( m );
	};



	Object.assign( MathUtils, {
		random16: function () {
			console.warn( 'THREE.Math: .random16() has been deprecated. Use Math.random() instead.' );
			return Math.random();
		},
		nearestPowerOfTwo: function ( value ) {
			console.warn( 'THREE.Math: .nearestPowerOfTwo() has been renamed to .floorPowerOfTwo().' );
			return MathUtils.floorPowerOfTwo( value );
		},
		nextPowerOfTwo: function ( value ) {
			console.warn( 'THREE.Math: .nextPowerOfTwo() has been renamed to .ceilPowerOfTwo().' );
			return MathUtils.ceilPowerOfTwo( value );
		}
	} );

	Object.assign( Matrix3.prototype, {
		flattenToArrayOffset: function ( array, offset ) {
			console.warn( "THREE.Matrix3: .flattenToArrayOffset() has been deprecated. Use .toArray() instead." );
			return this.toArray( array, offset );
		},
		multiplyVector3: function ( vector ) {
			console.warn( 'THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.' );
			return vector.applyMatrix3( this );
		},
		applyToBufferAttribute: function ( attribute ) {
			console.warn( 'THREE.Matrix3: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix3( matrix ) instead.' );
			return attribute.applyMatrix3( this );
		}
	} );

	Object.assign( Matrix4.prototype, {
		extractPosition: function ( m ) {
			console.warn( 'THREE.Matrix4: .extractPosition() has been renamed to .copyPosition().' );
			return this.copyPosition( m );
		},
		flattenToArrayOffset: function ( array, offset ) {
			console.warn( "THREE.Matrix4: .flattenToArrayOffset() has been deprecated. Use .toArray() instead." );
			return this.toArray( array, offset );
		},
		getPosition: function () {
			console.warn( 'THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.' );
			return new Vector3().setFromMatrixColumn( this, 3 );
		},
		setRotationFromQuaternion: function ( q ) {
			console.warn( 'THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion().' );
			return this.makeRotationFromQuaternion( q );
		},
		multiplyVector3: function ( vector ) {
			console.warn( 'THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
			return vector.applyMatrix4( this );
		},
		multiplyVector4: function ( vector ) {
			console.warn( 'THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
			return vector.applyMatrix4( this );
		},
		rotateAxis: function ( v ) {
			console.warn( 'THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead.' );
			v.transformDirection( this );
		},
		crossVector: function ( vector ) {
			console.warn( 'THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
			return vector.applyMatrix4( this );
		},
		applyToBufferAttribute: function ( attribute ) {
			console.warn( 'THREE.Matrix4: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix4( matrix ) instead.' );
			return attribute.applyMatrix4( this );
		},
		makeFrustum: function ( left, right, bottom, top, near, far ) {
			console.warn( 'THREE.Matrix4: .makeFrustum() has been removed. Use .makePerspective( left, right, top, bottom, near, far ) instead.' );
			return this.makePerspective( left, right, top, bottom, near, far );
		}
	} );

	Plane.prototype.isIntersectionLine = function ( line ) {
		console.warn( 'THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine().' );
		return this.intersectsLine( line );
	};

	Quaternion.prototype.multiplyVector3 = function ( vector ) {
		console.warn( 'THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
		return vector.applyQuaternion( this );
	};

	Object.assign( Ray.prototype, {
		isIntersectionBox: function ( box ) {
			console.warn( 'THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox().' );
			return this.intersectsBox( box );
		},
		isIntersectionPlane: function ( plane ) {
			console.warn( 'THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane().' );
			return this.intersectsPlane( plane );
		},
		isIntersectionSphere: function ( sphere ) {
			console.warn( 'THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
			return this.intersectsSphere( sphere );
		}
	} );

	Object.assign( Triangle.prototype, {
		area: function () {
			console.warn( 'THREE.Triangle: .area() has been renamed to .getArea().' );
			return this.getArea();
		},
		barycoordFromPoint: function ( point, target ) {
			console.warn( 'THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().' );
			return this.getBarycoord( point, target );
		},
		midpoint: function ( target ) {
			console.warn( 'THREE.Triangle: .midpoint() has been renamed to .getMidpoint().' );
			return this.getMidpoint( target );
		},
		normal: function ( target ) {
			console.warn( 'THREE.Triangle: .normal() has been renamed to .getNormal().' );
			return this.getNormal( target );
		},
		plane: function ( target ) {
			console.warn( 'THREE.Triangle: .plane() has been renamed to .getPlane().' );
			return this.getPlane( target );
		}

	} );

	Object.assign( Triangle, {
		barycoordFromPoint: function ( point, a, b, c, target ) {
			console.warn( 'THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().' );
			return Triangle.getBarycoord( point, a, b, c, target );
		},
		normal: function ( a, b, c, target ) {

			console.warn( 'THREE.Triangle: .normal() has been renamed to .getNormal().' );
			return Triangle.getNormal( a, b, c, target );

		}

	} );

	

	Object.assign( Vector2.prototype, {

		fromAttribute: function ( attribute, index, offset ) {

			console.warn( 'THREE.Vector2: .fromAttribute() has been renamed to .fromBufferAttribute().' );
			return this.fromBufferAttribute( attribute, index, offset );

		},
		distanceToManhattan: function ( v ) {

			console.warn( 'THREE.Vector2: .distanceToManhattan() has been renamed to .manhattanDistanceTo().' );
			return this.manhattanDistanceTo( v );

		},
		lengthManhattan: function () {

			console.warn( 'THREE.Vector2: .lengthManhattan() has been renamed to .manhattanLength().' );
			return this.manhattanLength();

		}

	} );

	Object.assign( Vector3.prototype, {
		getPositionFromMatrix: function ( m ) {

			console.warn( 'THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().' );
			return this.setFromMatrixPosition( m );

		},
		getScaleFromMatrix: function ( m ) {

			console.warn( 'THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().' );
			return this.setFromMatrixScale( m );

		},
		getColumnFromMatrix: function ( index, matrix ) {

			console.warn( 'THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().' );
			return this.setFromMatrixColumn( matrix, index );

		},
		applyProjection: function ( m ) {

			console.warn( 'THREE.Vector3: .applyProjection() has been removed. Use .applyMatrix4( m ) instead.' );
			return this.applyMatrix4( m );

		},
		fromAttribute: function ( attribute, index, offset ) {

			console.warn( 'THREE.Vector3: .fromAttribute() has been renamed to .fromBufferAttribute().' );
			return this.fromBufferAttribute( attribute, index, offset );

		},
		distanceToManhattan: function ( v ) {

			console.warn( 'THREE.Vector3: .distanceToManhattan() has been renamed to .manhattanDistanceTo().' );
			return this.manhattanDistanceTo( v );

		},
		lengthManhattan: function () {

			console.warn( 'THREE.Vector3: .lengthManhattan() has been renamed to .manhattanLength().' );
			return this.manhattanLength();

		}

	} );

	Object.assign( Vector4.prototype, {

		fromAttribute: function ( attribute, index, offset ) {

			console.warn( 'THREE.Vector4: .fromAttribute() has been renamed to .fromBufferAttribute().' );
			return this.fromBufferAttribute( attribute, index, offset );

		},
		lengthManhattan: function () {

			console.warn( 'THREE.Vector4: .lengthManhattan() has been renamed to .manhattanLength().' );
			return this.manhattanLength();

		}

	} );

	//

	Object.assign( Geometry.prototype, {
		applyMatrix: function ( matrix ) {
			console.warn( 'THREE.Geometry: .applyMatrix() has been renamed to .applyMatrix4().' );
			return this.applyMatrix4( matrix );
		}
	} );

	Object.assign( Object3D.prototype, {

		getChildByName: function ( name ) {
			console.warn( 'THREE.Object3D: .getChildByName() has been renamed to .getObjectByName().' );
			return this.getObjectByName( name );
		},
		translate: function ( distance, axis ) {
			console.warn( 'THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead.' );
			return this.translateOnAxis( axis, distance );
		},
		applyMatrix: function ( matrix ) {
			console.warn( 'THREE.Object3D: .applyMatrix() has been renamed to .applyMatrix4().' );
			return this.applyMatrix4( matrix );
		}

	} );

	Object.defineProperties( Object3D.prototype, {

		eulerOrder: {
			get: function () {
				console.warn( 'THREE.Object3D: .eulerOrder is now .rotation.order.' );
				return this.rotation.order;
			},
			set: function ( value ) {
				console.warn( 'THREE.Object3D: .eulerOrder is now .rotation.order.' );
				this.rotation.order = value;
			}
		}
	} );

	
	//

	PerspectiveCamera.prototype.setLens = function ( focalLength, filmGauge ) {
		console.warn( "THREE.PerspectiveCamera.setLens is deprecated. " +
				"Use .setFocalLength and .filmGauge for a photographic setup." );

		if ( filmGauge !== undefined ) this.filmGauge = filmGauge;
		this.setFocalLength( focalLength );

	};

	//

	Object.defineProperties( Light.prototype, {
		shadowCameraFov: {
			set: function ( value ) {
				console.warn( 'THREE.Light: .shadowCameraFov is now .shadow.camera.fov.' );
				this.shadow.camera.fov = value;
			}
		},
		shadowCameraLeft: {
			set: function ( value ) {
				console.warn( 'THREE.Light: .shadowCameraLeft is now .shadow.camera.left.' );
				this.shadow.camera.left = value;
			}
		},
		shadowCameraRight: {
			set: function ( value ) {
				console.warn( 'THREE.Light: .shadowCameraRight is now .shadow.camera.right.' );
				this.shadow.camera.right = value;
			}
		},
		shadowCameraTop: {
			set: function ( value ) {
				console.warn( 'THREE.Light: .shadowCameraTop is now .shadow.camera.top.' );
				this.shadow.camera.top = value;
			}
		},
		shadowCameraBottom: {
			set: function ( value ) {
				console.warn( 'THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom.' );
				this.shadow.camera.bottom = value;
			}
		},
		shadowCameraNear: {
			set: function ( value ) {
				console.warn( 'THREE.Light: .shadowCameraNear is now .shadow.camera.near.' );
				this.shadow.camera.near = value;
			}
		},
		shadowCameraFar: {
			set: function ( value ) {

				console.warn( 'THREE.Light: .shadowCameraFar is now .shadow.camera.far.' );
				this.shadow.camera.far = value;

			}
		},
		shadowBias: {
			set: function ( value ) {

				console.warn( 'THREE.Light: .shadowBias is now .shadow.bias.' );
				this.shadow.bias = value;

			}
		},
		shadowMapWidth: {
			set: function ( value ) {

				console.warn( 'THREE.Light: .shadowMapWidth is now .shadow.mapSize.width.' );
				this.shadow.mapSize.width = value;

			}
		},
		shadowMapHeight: {
			set: function ( value ) {

				console.warn( 'THREE.Light: .shadowMapHeight is now .shadow.mapSize.height.' );
				this.shadow.mapSize.height = value;

			}
		}
	} );

	//

	Object.defineProperties( BufferAttribute.prototype, {

		length: {
			get: function () {

				console.warn( 'THREE.BufferAttribute: .length has been deprecated. Use .count instead.' );
				return this.array.length;

			}
		},
		dynamic: {
			get: function () {

				console.warn( 'THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead.' );
				return this.usage === DynamicDrawUsage;

			},
			set: function ( /* value */ ) {

				console.warn( 'THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead.' );
				this.setUsage( DynamicDrawUsage );

			}
		}

	} );

	Object.assign( BufferAttribute.prototype, {
		setDynamic: function ( value ) {

			console.warn( 'THREE.BufferAttribute: .setDynamic() has been deprecated. Use .setUsage() instead.' );
			this.setUsage( value === true ? DynamicDrawUsage : StaticDrawUsage );
			return this;

		}
	} );

	Object.assign( BufferGeometry.prototype, {

		addIndex: function ( index ) {

			console.warn( 'THREE.BufferGeometry: .addIndex() has been renamed to .setIndex().' );
			this.setIndex( index );

		},
		addAttribute: function ( name, attribute ) {

			console.warn( 'THREE.BufferGeometry: .addAttribute() has been renamed to .setAttribute().' );

			if ( ! ( attribute && attribute.isBufferAttribute ) && ! ( attribute && attribute.isInterleavedBufferAttribute ) ) {

				console.warn( 'THREE.BufferGeometry: .addAttribute() now expects ( name, attribute ).' );

				return this.setAttribute( name, new BufferAttribute( arguments[ 1 ], arguments[ 2 ] ) );

			}

			if ( name === 'index' ) {

				console.warn( 'THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute.' );
				this.setIndex( attribute );

				return this;

			}

			return this.setAttribute( name, attribute );

		},
		addDrawCall: function ( start, count, indexOffset ) {

			if ( indexOffset !== undefined ) {

				console.warn( 'THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset.' );

			}

			console.warn( 'THREE.BufferGeometry: .addDrawCall() is now .addGroup().' );
			this.addGroup( start, count );

		},
		clearDrawCalls: function () {

			console.warn( 'THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups().' );
			this.clearGroups();

		},
		removeAttribute: function ( name ) {

			console.warn( 'THREE.BufferGeometry: .removeAttribute() has been renamed to .deleteAttribute().' );

			return this.deleteAttribute( name );

		},
		applyMatrix: function ( matrix ) {

			console.warn( 'THREE.BufferGeometry: .applyMatrix() has been renamed to .applyMatrix4().' );
			return this.applyMatrix4( matrix );

		}

	} );

	Object.defineProperties( BufferGeometry.prototype, {

		drawcalls: {
			get: function () {

				console.error( 'THREE.BufferGeometry: .drawcalls has been renamed to .groups.' );
				return this.groups;

			}
		},
		offsets: {
			get: function () {

				console.warn( 'THREE.BufferGeometry: .offsets has been renamed to .groups.' );
				return this.groups;

			}
		}

	} );

	Object.defineProperties( InstancedBufferGeometry.prototype, {

		maxInstancedCount: {
			get: function () {

				console.warn( 'THREE.InstancedBufferGeometry: .maxInstancedCount has been renamed to .instanceCount.' );
				return this.instanceCount;

			},
			set: function ( value ) {

				console.warn( 'THREE.InstancedBufferGeometry: .maxInstancedCount has been renamed to .instanceCount.' );
				this.instanceCount = value;

			}
		}

	} );

	Object.defineProperties( Raycaster.prototype, {

		linePrecision: {
			get: function () {

				console.warn( 'THREE.Raycaster: .linePrecision has been deprecated. Use .params.Line.threshold instead.' );
				return this.params.Line.threshold;

			},
			set: function ( value ) {

				console.warn( 'THREE.Raycaster: .linePrecision has been deprecated. Use .params.Line.threshold instead.' );
				this.params.Line.threshold = value;

			}
		}

	} );

	Object.defineProperties( InterleavedBuffer.prototype, {

		dynamic: {
			get: function () {

				console.warn( 'THREE.InterleavedBuffer: .length has been deprecated. Use .usage instead.' );
				return this.usage === DynamicDrawUsage;

			},
			set: function ( value ) {

				console.warn( 'THREE.InterleavedBuffer: .length has been deprecated. Use .usage instead.' );
				this.setUsage( value );

			}
		}

	} );

	Object.assign( InterleavedBuffer.prototype, {
		setDynamic: function ( value ) {
			console.warn( 'THREE.InterleavedBuffer: .setDynamic() has been deprecated. Use .setUsage() instead.' );
			this.setUsage( value === true ? DynamicDrawUsage : StaticDrawUsage );
			return this;

		}
	} );


	//

	Object.defineProperties( Uniform.prototype, {
		onUpdate: {
			value: function () {
				console.warn( 'THREE.Uniform: .onUpdate() has been removed. Use object.onBeforeRender() instead.' );
				return this;
			}
		}
	} );

	//

	Object.defineProperties( Material.prototype, {
		wrapRGB: {
			get: function () {
				console.warn( 'THREE.Material: .wrapRGB has been removed.' );
				return new Color();
			}
		},

		shading: {
			set: function ( value ) {
				console.warn( 'THREE.' + this.type + ': .shading has been removed. Use the boolean .flatShading instead.' );
				this.flatShading = ( value === FlatShading );
			}
		},

		stencilMask: {
			get: function () {
				console.warn( 'THREE.' + this.type + ': .stencilMask has been removed. Use .stencilFuncMask instead.' );
				return this.stencilFuncMask;
			},
			set: function ( value ) {
				console.warn( 'THREE.' + this.type + ': .stencilMask has been removed. Use .stencilFuncMask instead.' );
				this.stencilFuncMask = value;
			}
		}
	} );


	//

	Object.assign( WebGLRenderer.prototype, {

		clearTarget: function ( renderTarget, color, depth, stencil ) {

			console.warn( 'THREE.WebGLRenderer: .clearTarget() has been deprecated. Use .setRenderTarget() and .clear() instead.' );
			this.setRenderTarget( renderTarget );
			this.clear( color, depth, stencil );

		},
		getCurrentRenderTarget: function () {return this.getRenderTarget();},
		getMaxAnisotropy: function () {return this.capabilities.getMaxAnisotropy();},
		getPrecision: function () {return this.capabilities.precision;},
		resetGLState: function () {return this.state.reset();},
		supportsFloatTextures: function () {return this.extensions.get( 'OES_texture_float' );},
		supportsHalfFloatTextures: function () {return this.extensions.get( 'OES_texture_half_float' );},
		supportsStandardDerivatives: function () {return this.extensions.get( 'OES_standard_derivatives' );},
		supportsCompressedTextureS3TC: function () {return this.extensions.get( 'WEBGL_compressed_texture_s3tc' );},
		supportsCompressedTexturePVRTC: function () {return this.extensions.get( 'WEBGL_compressed_texture_pvrtc' );},
		supportsBlendMinMax: function () {return this.extensions.get( 'EXT_blend_minmax' );},
		supportsVertexTextures: function () {return this.capabilities.vertexTextures;},
		supportsInstancedArrays: function () {return this.extensions.get( 'ANGLE_instanced_arrays' );},
		enableScissorTest: function ( boolean ) {this.setScissorTest( boolean );},
		getActiveMipMapLevel: function () {	return this.getActiveMipmapLevel();}
	} );

	Object.defineProperties( WebGLRenderer.prototype, {

		shadowMapEnabled: {
			get: function () {return this.shadowMap.enabled;},
			set: function ( value ) {this.shadowMap.enabled = value;}
		},
		shadowMapType: {
			get: function () {return this.shadowMap.type;},
			set: function ( value ) {this.shadowMap.type = value;}
		},
		shadowMapCullFace: {
			get: function () {return undefined;	},
			set: function ( /* value */ ) {	}
		},
		context: {
			get: function () {return this.getContext();}
		},
		vr: {
			get: function () {return this.xr;}
		},
		gammaInput: {
			get: function () {return false;	},
			set: function () {}
		},
		gammaOutput: {
			get: function () {return false;},
			set: function ( value ) {this.outputEncoding = ( value === true ) ? sRGBEncoding : LinearEncoding;}
		},
		toneMappingWhitePoint: {
			get: function () {return 1.0;},
			set: function () {}
		},

	} );

	Object.defineProperties( WebGLShadowMap.prototype, {

		cullFace: {
			get: function () {return undefined;	},
			set: function ( /* cullFace */ ) {	}
		},
		renderReverseSided: {
			get: function () {return undefined;},
			set: function () {	}
		},
		renderSingleSided: {
			get: function () {return undefined;	},
			set: function () {	}
		}
	} );


	if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

		/* eslint-disable no-undef */
		__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'register', { detail: {
			revision: REVISION,
		} } ) );
		/* eslint-enable no-undef */

	}

	const MERCATOR_A = 6378137.0;
	const WORLD_SIZE = MERCATOR_A * Math.PI * 2;

	const ThreeboxConstants = {
	    WORLD_SIZE: WORLD_SIZE,
	    PROJECTION_WORLD_SIZE: WORLD_SIZE / (MERCATOR_A * Math.PI * 2),
	    MERCATOR_A: MERCATOR_A,
	    DEG2RAD: Math.PI / 180,
	    RAD2DEG: 180 / Math.PI,
	    EARTH_CIRCUMFERENCE: 40075000 // In meters
	};

	/* 
	  mapbox-gl uses a camera fixed at the orgin (the middle of the canvas) The camera is only updated when rotated (bearing angle), 
	  pitched or when the map view is resized.
	  When panning and zooming the map, the desired part of the world is translated and zoomed in front of the camera. The world is only updated when
	  the map is panned or zoomed.

	  The mapbox-gl internal coordinate system has origin (0,0) located at longitude -180 degrees and latitude 0 degrees. 
	  The scaling is 2^map.getZoom() * 512/EARTH_CIRCUMFERENCE_IN_METERS. At zoom=0 (scale=2^0=1), the whole world fits in 512 units.
	*/
	class CameraSync {
	    constructor(map, camera, world) {
	        this.map = map;
	        this.camera = camera;
	        this.active = true;
	        this.updateCallback = null;
	        this.camera.matrixAutoUpdate = false; // We're in charge of the camera now!

	        // Postion and configure the world group so we can scale it appropriately when the camera zooms
	        this.world = world || new Group();
	        this.world.position.x = this.world.position.y = ThreeboxConstants.WORLD_SIZE / 2;
	        this.world.matrixAutoUpdate = false;

	        //set up basic camera state
	        this.state = {
	            fov: 0.6435011087932844, // Math.atan(0.75);
	            translateCenter: new Matrix4(),
	            worldSizeRatio: 512 / ThreeboxConstants.WORLD_SIZE
	        };

	        this.state.translateCenter.makeTranslation(
	            ThreeboxConstants.WORLD_SIZE / 2,
	            -ThreeboxConstants.WORLD_SIZE / 2,
	            0
	        );

	        // Listen for move events from the map and update the Three.js camera. Some attributes only change when viewport resizes, so update those accordingly
	        this.updateCameraBound = () => this.updateCamera();
	        this.map.on('move', this.updateCameraBound);
	        this.setupCameraBound = () => this.setupCamera();
	        this.map.on('resize', this.setupCameraBound);
	        //this.map.on('moveend', ()=>this.updateCallback())

	        this.setupCamera();
	    }
	    detachCamera() {
	        this.map.off('move', this.updateCameraBound);
	        this.map.off('resize', this.setupCameraBound);
	        this.updateCallback = null;
	        this.map = null;
	        this.camera = null;
	    }
	    setupCamera() {
	        var t = this.map.transform;
	        const halfFov = this.state.fov / 2;
	        var cameraToCenterDistance = (0.5 / Math.tan(halfFov)) * t.height;

	        this.state.cameraToCenterDistance = cameraToCenterDistance;
	        this.state.cameraTranslateZ = new Matrix4().makeTranslation(0, 0, cameraToCenterDistance);

	        this.updateCamera();
	    }
	    updateCamera(ev) {
	        if (!this.camera) {
	            console.log('nocamera');
	            return;
	        }

	        var t = this.map.transform;
	        
	        var halfFov = this.state.fov / 2;
	        const groundAngle = Math.PI / 2 + t._pitch;
	        this.state.topHalfSurfaceDistance =
	            (Math.sin(halfFov) * this.state.cameraToCenterDistance) / Math.sin(Math.PI - groundAngle - halfFov);

	        // Calculate z distance of the farthest fragment that should be rendered.
	        const furthestDistance =
	            Math.cos(Math.PI / 2 - t._pitch) * this.state.topHalfSurfaceDistance + this.state.cameraToCenterDistance;

	        // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
	        const farZ = furthestDistance * 1.01;

	        this.camera.aspect = t.width / t.height;
	        this.camera.projectionMatrix = this.makePerspectiveMatrix(this.state.fov, t.width / t.height, 1, farZ);

	        var cameraWorldMatrix = new Matrix4();
	        var rotatePitch = new Matrix4().makeRotationX(t._pitch);
	        var rotateBearing = new Matrix4().makeRotationZ(t.angle);

	        // Unlike the Mapbox GL JS camera, separate camera translation and rotation out into its world matrix
	        // If this is applied directly to the projection matrix, it will work OK but break raycasting

	        cameraWorldMatrix.premultiply(this.state.cameraTranslateZ).premultiply(rotatePitch).premultiply(rotateBearing);

	        this.camera.matrixWorld.copy(cameraWorldMatrix);

	        // Handle scaling and translation of objects in the map in the world's matrix transform, not the camera
	        let zoomPow = t.scale * this.state.worldSizeRatio;
	        let scale = new Matrix4();
	        scale.makeScale(zoomPow, zoomPow, zoomPow);
	        //console.log(`zoomPow: ${zoomPow}`);

	        let translateMap = new Matrix4();
	        translateMap.makeTranslation(-t.point.x, t.point.y, 0);

	        this.world.matrix = new Matrix4();
	        this.world.matrix
	            //.premultiply(rotateMap)
	            .premultiply(this.state.translateCenter)
	            .premultiply(scale)
	            .premultiply(translateMap);
	        let matrixWorldInverse = new Matrix4();
	        matrixWorldInverse.getInverse(this.world.matrix);

	        this.camera.projectionMatrixInverse.getInverse(this.camera.projectionMatrix);
	        this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
	        this.frustum = new Frustum();
	        this.frustum.setFromProjectionMatrix(
	            new Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
	        );

	        this.cameraPosition = new Vector3(0, 0, 0).unproject(this.camera).applyMatrix4(matrixWorldInverse);
	        
	        if (this.updateCallback) {
	            this.updateCallback();
	        }
	    }
	    makePerspectiveMatrix(fovy, aspect, near, far) {
	        let out = new Matrix4();
	        let f = 1.0 / Math.tan(fovy / 2),
	            nf = 1 / (near - far);

	        let newMatrix = [f / aspect, 0, 0, 0, 
	                         0, f, 0, 0, 
	                         0, 0, (far + near) * nf, -1, 
	                         0, 0, 2 * far * near * nf, 0];

	        out.elements = newMatrix;
	        return out;
	    }
	}

	var GLTFLoader = ( function () {

		function GLTFLoader( manager ) {

			Loader.call( this, manager );

			this.dracoLoader = null;
			this.ddsLoader = null;
			this.ktx2Loader = null;

			this.pluginCallbacks = [];
		}

		GLTFLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

			constructor: GLTFLoader,

			load: function ( url, onLoad, onProgress, onError ) {

				var scope = this;

				var resourcePath;

				if ( this.resourcePath !== '' ) {

					resourcePath = this.resourcePath;

				} else if ( this.path !== '' ) {

					resourcePath = this.path;

				} else {

					resourcePath = LoaderUtils.extractUrlBase( url );

				}

				// Tells the LoadingManager to track an extra item, which resolves after
				// the model is fully loaded. This means the count of items loaded will
				// be incorrect, but ensures manager.onLoad() does not fire early.
				scope.manager.itemStart( url );

				var _onError = function ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						console.error( e );

					}

					scope.manager.itemError( url );
					scope.manager.itemEnd( url );

				};

			},

			setKTX2Loader: function ( ktx2Loader ) {

				this.ktx2Loader = ktx2Loader;
				return this;

			},

			register: function ( callback ) {

				if ( this.pluginCallbacks.indexOf( callback ) === - 1 ) {

					this.pluginCallbacks.push( callback );

				}

				return this;

			},

			unregister: function ( callback ) {

				if ( this.pluginCallbacks.indexOf( callback ) !== - 1 ) {

					this.pluginCallbacks.splice( this.pluginCallbacks.indexOf( callback ), 1 );

				}

				return this;

			},

			parse: function ( data, path, onLoad, onError ) {
				var content;
				var extensions = {};
				var plugins = {};

				if ( typeof data === 'string' ) {

					content = data;

				} else {

					var magic = LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );
					if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {
						try {

							extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );

						} catch ( error ) {

							if ( onError ) onError( error );
							return;

						}

						content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

					} else {

						content = LoaderUtils.decodeText( new Uint8Array( data ) );

					}

				}

				var json = JSON.parse( content );
				if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {

					if ( onError ) onError( new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.' ) );
					return;

				}

				var parser = new GLTFParser( json, {

					path: path || this.resourcePath || '',
					crossOrigin: this.crossOrigin,
					manager: this.manager,
					ktx2Loader: this.ktx2Loader

				} );

				for ( var i = 0; i < this.pluginCallbacks.length; i ++ ) {

					var plugin = this.pluginCallbacks[ i ]( parser );
					plugins[ plugin.name ] = plugin;

					// Workaround to avoid determining as unknown extension
					// in addUnknownExtensionsToUserData().
					// Remove this workaround if we move all the existing
					// extension handlers to plugin system
					extensions[ plugin.name ] = true;

				}

				if ( json.extensionsUsed ) {

					for ( var i = 0; i < json.extensionsUsed.length; ++ i ) {

						var extensionName = json.extensionsUsed[ i ];
						var extensionsRequired = json.extensionsRequired || [];

						switch ( extensionName ) {

							case EXTENSIONS.KHR_LIGHTS_PUNCTUAL:
								extensions[ extensionName ] = new GLTFLightsExtension( json );
								break;

							case EXTENSIONS.KHR_MATERIALS_UNLIT:
								extensions[ extensionName ] = new GLTFMaterialsUnlitExtension();
								break;

							case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
								extensions[ extensionName ] = new GLTFDracoMeshCompressionExtension( json, this.dracoLoader );
								break;

							default:

								if ( extensionsRequired.indexOf( extensionName ) >= 0 && plugins[ extensionName ] === undefined ) {

									console.warn( 'THREE.GLTFLoader: Unknown extension "' + extensionName + '".' );

								}

						}

					}

				}

				parser.setExtensions( extensions );
				parser.setPlugins( plugins );
				parser.parse( onLoad, onError );

			}

		} );

		/* GLTFREGISTRY */

		function GLTFRegistry() {

			var objects = {};

			return	{
				get: function ( key ) {return objects[ key ];},

				add: function ( key, object ) {objects[ key ] = object;},

				remove: function ( key ) {delete objects[ key ];},

				removeAll: function () {objects = {};}

			};

		}

		/*********************************/
		/********** EXTENSIONS ***********/
		/*********************************/

		var EXTENSIONS = {
			KHR_BINARY_GLTF: 'KHR_binary_glTF',
			KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
			KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
			KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
			KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
			KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
			KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
			KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
			KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
			KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
			MSFT_TEXTURE_DDS: 'MSFT_texture_dds'
		};

		/**
		 * Punctual Lights Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
		 */
		function GLTFLightsExtension( json ) {

			this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

			var extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ] ) || {};
			this.lightDefs = extension.lights || [];

		}

		GLTFLightsExtension.prototype.loadLight = function ( lightIndex ) {

			var lightDef = this.lightDefs[ lightIndex ];
			var lightNode;
			var color = new Color( 0xffffff );
			if ( lightDef.color !== undefined ) color.fromArray( lightDef.color );

			var range = lightDef.range !== undefined ? lightDef.range : 0;

			switch ( lightDef.type ) {

				case 'directional':
					lightNode = new DirectionalLight( color );
					lightNode.target.position.set( 0, 0, - 1 );
					lightNode.add( lightNode.target );
					break;

				case 'point':
					lightNode = new PointLight( color );
					lightNode.distance = range;
					break;

				case 'spot':
					lightNode = new SpotLight( color );
					lightNode.distance = range;
					// Handle spotlight properties.
					lightDef.spot = lightDef.spot || {};
					lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
					lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0;
					lightNode.angle = lightDef.spot.outerConeAngle;
					lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
					lightNode.target.position.set( 0, 0, - 1 );
					lightNode.add( lightNode.target );
					break;

				default:
					throw new Error( 'THREE.GLTFLoader: Unexpected light type, "' + lightDef.type + '".' );

			}

			// Some lights (e.g. spot) default to a position other than the origin. Reset the position
			// here, because node-level parsing will only override position if explicitly specified.
			lightNode.position.set( 0, 0, 0 );

			lightNode.decay = 2;

			if ( lightDef.intensity !== undefined ) lightNode.intensity = lightDef.intensity;

			lightNode.name = lightDef.name || ( 'light_' + lightIndex );

			return Promise.resolve( lightNode );

		};

		/**
		 * Unlit Materials Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
		 */
		function GLTFMaterialsUnlitExtension() {

			this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;

		}

		GLTFMaterialsUnlitExtension.prototype.getMaterialType = function () {
			return MeshBasicMaterial;
		};

		GLTFMaterialsUnlitExtension.prototype.extendParams = function ( materialParams, materialDef, parser ) {

			var pending = [];

			materialParams.color = new Color( 1.0, 1.0, 1.0 );
			materialParams.opacity = 1.0;

			var metallicRoughness = materialDef.pbrMetallicRoughness;

			if ( metallicRoughness ) {

				if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

					var array = metallicRoughness.baseColorFactor;
					materialParams.color.fromArray( array );
					materialParams.opacity = array[ 3 ];

				}

				if ( metallicRoughness.baseColorTexture !== undefined ) {

					pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

				}

			}

			return Promise.all( pending );

		};


		/* BINARY EXTENSION */
		var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
		var BINARY_EXTENSION_HEADER_LENGTH = 12;
		var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

		function GLTFBinaryExtension( data ) {
			this.name = EXTENSIONS.KHR_BINARY_GLTF;
			this.content = null;
			this.body = null;
			var headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

			this.header = {
				magic: LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
				version: headerView.getUint32( 4, true ),
				length: headerView.getUint32( 8, true )
			};

			if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {
				throw new Error( 'THREE.GLTFLoader: Unsupported glTF-Binary header.' );
			} else if ( this.header.version < 2.0 ) {
				throw new Error( 'THREE.GLTFLoader: Legacy binary file detected.' );
			}

			var chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
			var chunkIndex = 0;

			while ( chunkIndex < chunkView.byteLength ) {
				var chunkLength = chunkView.getUint32( chunkIndex, true );
				chunkIndex += 4;

				var chunkType = chunkView.getUint32( chunkIndex, true );
				chunkIndex += 4;

				if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {
					var contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
					this.content = LoaderUtils.decodeText( contentArray );
				} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {
					var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
					this.body = data.slice( byteOffset, byteOffset + chunkLength );
				}

				// Clients must ignore chunks with unknown types.
				chunkIndex += chunkLength;

			}

			if ( this.content === null ) {
				throw new Error( 'THREE.GLTFLoader: JSON content not found.' );
			}

		}

		/*********************************/
		/********** INTERNALS ************/
		/*********************************/

		/* CONSTANTS */

		var WEBGL_CONSTANTS = {
			FLOAT: 5126,
			//FLOAT_MAT2: 35674,
			FLOAT_MAT3: 35675,
			FLOAT_MAT4: 35676,
			FLOAT_VEC2: 35664,
			FLOAT_VEC3: 35665,
			FLOAT_VEC4: 35666,
			LINEAR: 9729,
			REPEAT: 10497,
			SAMPLER_2D: 35678,
			POINTS: 0,
			LINES: 1,
			LINE_LOOP: 2,
			LINE_STRIP: 3,
			TRIANGLES: 4,
			TRIANGLE_STRIP: 5,
			TRIANGLE_FAN: 6,
			UNSIGNED_BYTE: 5121,
			UNSIGNED_SHORT: 5123
		};

		var WEBGL_COMPONENT_TYPES = {
			5120: Int8Array,
			5121: Uint8Array,
			5122: Int16Array,
			5123: Uint16Array,
			5125: Uint32Array,
			5126: Float32Array
		};

		var WEBGL_FILTERS = {
			9728: NearestFilter,
			9729: LinearFilter,
			9984: NearestMipmapNearestFilter,
			9985: LinearMipmapNearestFilter,
			9986: NearestMipmapLinearFilter,
			9987: LinearMipmapLinearFilter
		};

		var WEBGL_WRAPPINGS = {
			33071: ClampToEdgeWrapping,
			33648: MirroredRepeatWrapping,
			10497: RepeatWrapping
		};

		var WEBGL_TYPE_SIZES = {
			'SCALAR': 1,
			'VEC2': 2,
			'VEC3': 3,
			'VEC4': 4,
			'MAT2': 4,
			'MAT3': 9,
			'MAT4': 16
		};

		var ATTRIBUTES = {
			POSITION: 'position',
			NORMAL: 'normal',
			TANGENT: 'tangent',
			TEXCOORD_0: 'uv',
			TEXCOORD_1: 'uv2',
			COLOR_0: 'color',
			WEIGHTS_0: 'skinWeight',
			JOINTS_0: 'skinIndex',
		};

		var ALPHA_MODES = {
			OPAQUE: 'OPAQUE',
			MASK: 'MASK',
			BLEND: 'BLEND'
		};

		/* UTILITY FUNCTIONS */

		function resolveURL( url, path ) {

			// Invalid URL
			if ( typeof url !== 'string' || url === '' ) return '';

			// Host Relative URL
			if ( /^https?:\/\//i.test( path ) && /^\//.test( url ) ) {

				path = path.replace( /(^https?:\/\/[^\/]+).*/i, '$1' );

			}

			// Absolute URL http://,https://,//
			if ( /^(https?:)?\/\//i.test( url ) ) return url;

			// Data URI
			if ( /^data:.*,.*$/i.test( url ) ) return url;

			// Blob URL
			if ( /^blob:.*$/i.test( url ) ) return url;

			// Relative URL
			return path + url;

		}

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
		 */
		function createDefaultMaterial( cache ) {
			if ( cache[ 'DefaultMaterial' ] === undefined ) {
				cache[ 'DefaultMaterial' ] = new MeshStandardMaterial( {
					color: 0xFFFFFF,
					emissive: 0x000000,
					metalness: 1,
					roughness: 1,
					transparent: false,
					depthTest: true,
					side: FrontSide
				} );
			}
			return cache[ 'DefaultMaterial' ];
		}

		function addUnknownExtensionsToUserData( knownExtensions, object, objectDef ) {
			// Add unknown glTF extensions to an object's userData.
			for ( var name in objectDef.extensions ) {
				if ( knownExtensions[ name ] === undefined ) {
					object.userData.gltfExtensions = object.userData.gltfExtensions || {};
					object.userData.gltfExtensions[ name ] = objectDef.extensions[ name ];
				}
			}
		}

		/**
		 * @param {Object3D|Material|BufferGeometry} object
		 * @param {GLTF.definition} gltfDef
		 */
		function assignExtrasToUserData( object, gltfDef ) {
			if ( gltfDef.extras !== undefined ) {
				if ( typeof gltfDef.extras === 'object' ) {
					Object.assign( object.userData, gltfDef.extras );
				} else {
					console.warn( 'THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras );
				}
			}
		}

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
		 *
		 * @param {BufferGeometry} geometry
		 * @param {Array<GLTF.Target>} targets
		 * @param {GLTFParser} parser
		 * @return {Promise<BufferGeometry>}
		 */
		function addMorphTargets( geometry, targets, parser ) {

			var hasMorphPosition = false;
			var hasMorphNormal = false;

			for ( var i = 0, il = targets.length; i < il; i ++ ) {

				var target = targets[ i ];

				if ( target.POSITION !== undefined ) hasMorphPosition = true;
				if ( target.NORMAL !== undefined ) hasMorphNormal = true;

				if ( hasMorphPosition && hasMorphNormal ) break;

			}

			if ( ! hasMorphPosition && ! hasMorphNormal ) return Promise.resolve( geometry );

			var pendingPositionAccessors = [];
			var pendingNormalAccessors = [];

			for ( var i = 0, il = targets.length; i < il; i ++ ) {

				var target = targets[ i ];

				if ( hasMorphPosition ) {

					var pendingAccessor = target.POSITION !== undefined
						? parser.getDependency( 'accessor', target.POSITION )
						: geometry.attributes.position;

					pendingPositionAccessors.push( pendingAccessor );

				}

				if ( hasMorphNormal ) {

					var pendingAccessor = target.NORMAL !== undefined
						? parser.getDependency( 'accessor', target.NORMAL )
						: geometry.attributes.normal;

					pendingNormalAccessors.push( pendingAccessor );

				}

			}

			return Promise.all( [
				Promise.all( pendingPositionAccessors ),
				Promise.all( pendingNormalAccessors )
			] ).then( function ( accessors ) {

				var morphPositions = accessors[ 0 ];
				var morphNormals = accessors[ 1 ];

				if ( hasMorphPosition ) geometry.morphAttributes.position = morphPositions;
				if ( hasMorphNormal ) geometry.morphAttributes.normal = morphNormals;
				geometry.morphTargetsRelative = true;

				return geometry;

			} );

		}

		/**
		 * @param {Mesh} mesh
		 * @param {GLTF.Mesh} meshDef
		 */
		function updateMorphTargets( mesh, meshDef ) {

			mesh.updateMorphTargets();

			if ( meshDef.weights !== undefined ) {

				for ( var i = 0, il = meshDef.weights.length; i < il; i ++ ) {

					mesh.morphTargetInfluences[ i ] = meshDef.weights[ i ];

				}

			}

			// .extras has user-defined data, so check that .extras.targetNames is an array.
			if ( meshDef.extras && Array.isArray( meshDef.extras.targetNames ) ) {

				var targetNames = meshDef.extras.targetNames;

				if ( mesh.morphTargetInfluences.length === targetNames.length ) {

					mesh.morphTargetDictionary = {};

					for ( var i = 0, il = targetNames.length; i < il; i ++ ) {

						mesh.morphTargetDictionary[ targetNames[ i ] ] = i;

					}

				} else {

					console.warn( 'THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.' );

				}

			}

		}

		function createPrimitiveKey( primitiveDef ) {

			var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ];
			var geometryKey;

			if ( dracoExtension ) {

				geometryKey = 'draco:' + dracoExtension.bufferView
					+ ':' + dracoExtension.indices
					+ ':' + createAttributesKey( dracoExtension.attributes );

			} else {

				geometryKey = primitiveDef.indices + ':' + createAttributesKey( primitiveDef.attributes ) + ':' + primitiveDef.mode;

			}

			return geometryKey;

		}

		function createAttributesKey( attributes ) {

			var attributesKey = '';

			var keys = Object.keys( attributes ).sort();

			for ( var i = 0, il = keys.length; i < il; i ++ ) {

				attributesKey += keys[ i ] + ':' + attributes[ keys[ i ] ] + ';';

			}

			return attributesKey;

		}

		/* GLTF PARSER */

		function GLTFParser( json, options ) {

			this.json = json || {};
			this.extensions = {};
			this.plugins = {};
			this.options = options || {};

			// loader object cache
			this.cache = new GLTFRegistry();

			// associations between Three.js objects and glTF elements
			this.associations = new Map();

			// BufferGeometry caching
			this.primitiveCache = {};

			// Object3D instance caches
			this.meshCache = { refs: {}, uses: {} };
			this.cameraCache = { refs: {}, uses: {} };
			this.lightCache = { refs: {}, uses: {} };



		}

		GLTFParser.prototype.setExtensions = function ( extensions ) {this.extensions = extensions;};

		GLTFParser.prototype.setPlugins = function ( plugins ) {this.plugins = plugins;};

		GLTFParser.prototype.parse = function ( onLoad, onError ) {
			var parser = this;
			var json = this.json;
			var extensions = this.extensions;

			// Clear the loader cache
			this.cache.removeAll();

			// Mark the special nodes/meshes in json for efficient parse
			this._markDefs();

			Promise.all( [
				this.getDependencies( 'scene' ),
				this.getDependencies( 'camera' ),
			] ).then( function ( dependencies ) {
				var result = {
					scene: dependencies[ 0 ][ json.scene || 0 ],
					scenes: dependencies[ 0 ],
					cameras: dependencies[ 2 ],
					asset: json.asset,
					parser: parser,
					userData: {}
				};

				addUnknownExtensionsToUserData( extensions, result, json );
				assignExtrasToUserData( result, json );
				onLoad( result );
			} ).catch( onError );

		};

		/**
		 * Marks the special nodes/meshes in json for efficient parse.
		 */
		GLTFParser.prototype._markDefs = function () {

			var nodeDefs = this.json.nodes || [];
			var skinDefs = this.json.skins || [];
			var meshDefs = this.json.meshes || [];

			// Nothing in the node definition indicates whether it is a Bone or an
			// Object3D. Use the skins' joint references to mark bones.
			for ( var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex ++ ) {

				var joints = skinDefs[ skinIndex ].joints;

				for ( var i = 0, il = joints.length; i < il; i ++ ) {

					nodeDefs[ joints[ i ] ].isBone = true;

				}

			}

			// Iterate over all nodes, marking references to shared resources,
			// as well as skeleton joints.
			for ( var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

				var nodeDef = nodeDefs[ nodeIndex ];

				if ( nodeDef.mesh !== undefined ) {

					this._addNodeRef( this.meshCache, nodeDef.mesh );

					// Nothing in the mesh definition indicates whether it is
					// a SkinnedMesh or Mesh. Use the node's mesh reference
					// to mark SkinnedMesh if node has skin.
					if ( nodeDef.skin !== undefined ) {

						meshDefs[ nodeDef.mesh ].isSkinnedMesh = true;

					}

				}

				if ( nodeDef.camera !== undefined ) {

					this._addNodeRef( this.cameraCache, nodeDef.camera );

				}

				if ( nodeDef.extensions
					&& nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ]
					&& nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ].light !== undefined ) {

					this._addNodeRef( this.lightCache, nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ].light );

				}

			}

		};

		/**
		 * Counts references to shared node / Object3D resources. These resources
		 * can be reused, or "instantiated", at multiple nodes in the scene
		 * hierarchy. Mesh, Camera, and Light instances are instantiated and must
		 * be marked. Non-scenegraph resources (like Materials, Geometries, and
		 * Textures) can be reused directly and are not marked here.
		 *
		 * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
		 */
		GLTFParser.prototype._addNodeRef = function ( cache, index ) {

			if ( index === undefined ) return;

			if ( cache.refs[ index ] === undefined ) {

				cache.refs[ index ] = cache.uses[ index ] = 0;

			}

			cache.refs[ index ] ++;

		};

		/** Returns a reference to a shared resource, cloning it if necessary. */
		GLTFParser.prototype._getNodeRef = function ( cache, index, object ) {

			if ( cache.refs[ index ] <= 1 ) return object;

			var ref = object.clone();

			ref.name += '_instance_' + ( cache.uses[ index ] ++ );

			return ref;

		};

		GLTFParser.prototype._invokeOne = function ( func ) {

			var extensions = Object.values( this.plugins );
			extensions.push( this );

			for ( var i = 0; i < extensions.length; i ++ ) {

				var result = func( extensions[ i ] );

				if ( result ) return result;

			}

		};

		GLTFParser.prototype._invokeAll = function ( func ) {

			var extensions = Object.values( this.plugins );
			extensions.unshift( this );

			var pending = [];

			for ( var i = 0; i < extensions.length; i ++ ) {

				pending.push( func( extensions[ i ] ) );

			}

			return Promise.all( pending );

		};

		/**
		 * Requests the specified dependency asynchronously, with caching.
		 * @param {string} type
		 * @param {number} index
		 * @return {Promise<Object3D|Material|THREE.Texture|ArrayBuffer|Object>}
		 */
		GLTFParser.prototype.getDependency = function ( type, index ) {

			var cacheKey = type + ':' + index;
			var dependency = this.cache.get( cacheKey );

			if ( ! dependency ) {

				switch ( type ) {

					case 'scene':
						dependency = this.loadScene( index );
						break;

					case 'node':
						dependency = this.loadNode( index );
						break;

					case 'mesh':
						dependency = this._invokeOne( function ( ext ) {
							return ext.loadMesh && ext.loadMesh( index );

						} );
						break;

					case 'accessor':
						dependency = this.loadAccessor( index );
						break;

					case 'bufferView':
						dependency = this._invokeOne( function ( ext ) {

							return ext.loadBufferView && ext.loadBufferView( index );

						} );
						break;

					case 'buffer':
						dependency = this.loadBuffer( index );
						break;

					case 'material':
						dependency = this._invokeOne( function ( ext ) {

							return ext.loadMaterial && ext.loadMaterial( index );

						} );
						break;

					case 'texture':
						dependency = this._invokeOne( function ( ext ) {

							return ext.loadTexture && ext.loadTexture( index );

						} );
						break;

					case 'skin':
						dependency = this.loadSkin( index );
						break;

					case 'camera':
						dependency = this.loadCamera( index );
						break;

					case 'light':
						dependency = this.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ].loadLight( index );
						break;

					default:
						throw new Error( 'Unknown type: ' + type );

				}

				this.cache.add( cacheKey, dependency );

			}

			return dependency;

		};

		/**
		 * Requests all dependencies of the specified type asynchronously, with caching.
		 * @param {string} type
		 * @return {Promise<Array<Object>>}
		 */
		GLTFParser.prototype.getDependencies = function ( type ) {
			var dependencies = this.cache.get( type );

			if ( ! dependencies ) {

				var parser = this;
				var defs = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || [];

				dependencies = Promise.all( defs.map( function ( def, index ) {

					return parser.getDependency( type, index );

				} ) );

				this.cache.add( type, dependencies );

			}

			return dependencies;

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
		 * @param {number} bufferIndex
		 * @return {Promise<ArrayBuffer>}
		 */
		GLTFParser.prototype.loadBuffer = function ( bufferIndex ) {

			var bufferDef = this.json.buffers[ bufferIndex ];

			if ( bufferDef.type && bufferDef.type !== 'arraybuffer' ) {

				throw new Error( 'THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.' );

			}

			// If present, GLB container is required to be the first buffer.
			if ( bufferDef.uri === undefined && bufferIndex === 0 ) {

				return Promise.resolve( this.extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body );

			}

			var options = this.options;

			return new Promise( function ( resolve, reject ) {

				loader.load( resolveURL( bufferDef.uri, options.path ), resolve, undefined, function () {

					reject( new Error( 'THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".' ) );

				} );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
		 * @param {number} bufferViewIndex
		 * @return {Promise<ArrayBuffer>}
		 */
		GLTFParser.prototype.loadBufferView = function ( bufferViewIndex ) {

			var bufferViewDef = this.json.bufferViews[ bufferViewIndex ];

			return this.getDependency( 'buffer', bufferViewDef.buffer ).then( function ( buffer ) {

				var byteLength = bufferViewDef.byteLength || 0;
				var byteOffset = bufferViewDef.byteOffset || 0;
				return buffer.slice( byteOffset, byteOffset + byteLength );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
		 * @param {number} accessorIndex
		 * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
		 */
		GLTFParser.prototype.loadAccessor = function ( accessorIndex ) {

			var parser = this;
			var json = this.json;

			var accessorDef = this.json.accessors[ accessorIndex ];

			if ( accessorDef.bufferView === undefined && accessorDef.sparse === undefined ) {

				// Ignore empty accessors, which may be used to declare runtime
				// information about attributes coming from another source (e.g. Draco
				// compression extension).
				return Promise.resolve( null );

			}

			var pendingBufferViews = [];

			if ( accessorDef.bufferView !== undefined ) {

				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.bufferView ) );

			} else {

				pendingBufferViews.push( null );

			}

			if ( accessorDef.sparse !== undefined ) {

				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.indices.bufferView ) );
				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.values.bufferView ) );

			}

			return Promise.all( pendingBufferViews ).then( function ( bufferViews ) {

				var bufferView = bufferViews[ 0 ];

				var itemSize = WEBGL_TYPE_SIZES[ accessorDef.type ];
				var TypedArray = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

				// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
				var elementBytes = TypedArray.BYTES_PER_ELEMENT;
				var itemBytes = elementBytes * itemSize;
				var byteOffset = accessorDef.byteOffset || 0;
				var byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[ accessorDef.bufferView ].byteStride : undefined;
				var normalized = accessorDef.normalized === true;
				var array, bufferAttribute;

				// The buffer is not interleaved if the stride is the item size in bytes.
				if ( byteStride && byteStride !== itemBytes ) {

					// Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
					// This makes sure that IBA.count reflects accessor.count properly
					var ibSlice = Math.floor( byteOffset / byteStride );
					var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
					var ib = parser.cache.get( ibCacheKey );

					if ( ! ib ) {

						array = new TypedArray( bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes );

						// Integer parameters to IB/IBA are in array elements, not bytes.
						ib = new InterleavedBuffer( array, byteStride / elementBytes );

						parser.cache.add( ibCacheKey, ib );

					}

					bufferAttribute = new InterleavedBufferAttribute( ib, itemSize, ( byteOffset % byteStride ) / elementBytes, normalized );

				} else {

					if ( bufferView === null ) {

						array = new TypedArray( accessorDef.count * itemSize );

					} else {

						array = new TypedArray( bufferView, byteOffset, accessorDef.count * itemSize );

					}

					bufferAttribute = new BufferAttribute( array, itemSize, normalized );

				}

				// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
				if ( accessorDef.sparse !== undefined ) {

					var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
					var TypedArrayIndices = WEBGL_COMPONENT_TYPES[ accessorDef.sparse.indices.componentType ];

					var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
					var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

					var sparseIndices = new TypedArrayIndices( bufferViews[ 1 ], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices );
					var sparseValues = new TypedArray( bufferViews[ 2 ], byteOffsetValues, accessorDef.sparse.count * itemSize );

					if ( bufferView !== null ) {

						// Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
						bufferAttribute = new BufferAttribute( bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized );

					}

					for ( var i = 0, il = sparseIndices.length; i < il; i ++ ) {

						var index = sparseIndices[ i ];

						bufferAttribute.setX( index, sparseValues[ i * itemSize ] );
						if ( itemSize >= 2 ) bufferAttribute.setY( index, sparseValues[ i * itemSize + 1 ] );
						if ( itemSize >= 3 ) bufferAttribute.setZ( index, sparseValues[ i * itemSize + 2 ] );
						if ( itemSize >= 4 ) bufferAttribute.setW( index, sparseValues[ i * itemSize + 3 ] );
						if ( itemSize >= 5 ) throw new Error( 'THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.' );

					}

				}

				return bufferAttribute;

			} );

		};

		/**
		 * Assigns final material to a Mesh, Line, or Points instance. The instance
		 * already has a material (generated from the glTF material options alone)
		 * but reuse of the same glTF material may require multiple threejs materials
		 * to accomodate different primitive types, defines, etc. New materials will
		 * be created if necessary, and reused from a cache.
		 * @param  {Object3D} mesh Mesh, Line, or Points instance.
		 */
		GLTFParser.prototype.assignFinalMaterial = function ( mesh ) {

			var geometry = mesh.geometry;
			var material = mesh.material;

			var useVertexTangents = geometry.attributes.tangent !== undefined;
			var useVertexColors = geometry.attributes.color !== undefined;
			var useFlatShading = geometry.attributes.normal === undefined;
			var useSkinning = mesh.isSkinnedMesh === true;
			var useMorphTargets = Object.keys( geometry.morphAttributes ).length > 0;
			var useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== undefined;
			if ( mesh.isLine ) {

				var cacheKey = 'LineBasicMaterial:' + material.uuid;

				var lineMaterial = this.cache.get( cacheKey );

				if ( ! lineMaterial ) {

					lineMaterial = new LineBasicMaterial();
					Material.prototype.copy.call( lineMaterial, material );
					lineMaterial.color.copy( material.color );

					this.cache.add( cacheKey, lineMaterial );

				}

				material = lineMaterial;

			}

			// Clone the material if it will be modified
			if ( useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets ) {

				var cacheKey = 'ClonedMaterial:' + material.uuid + ':';

				if ( material.isGLTFSpecularGlossinessMaterial ) cacheKey += 'specular-glossiness:';
				if ( useSkinning ) cacheKey += 'skinning:';
				if ( useVertexTangents ) cacheKey += 'vertex-tangents:';
				if ( useVertexColors ) cacheKey += 'vertex-colors:';
				if ( useFlatShading ) cacheKey += 'flat-shading:';
				if ( useMorphTargets ) cacheKey += 'morph-targets:';
				if ( useMorphNormals ) cacheKey += 'morph-normals:';

				var cachedMaterial = this.cache.get( cacheKey );

				if ( ! cachedMaterial ) {

					cachedMaterial = material.clone();

					if ( useSkinning ) cachedMaterial.skinning = true;
					if ( useVertexTangents ) cachedMaterial.vertexTangents = true;
					if ( useVertexColors ) cachedMaterial.vertexColors = true;
					if ( useFlatShading ) cachedMaterial.flatShading = true;
					if ( useMorphTargets ) cachedMaterial.morphTargets = true;
					if ( useMorphNormals ) cachedMaterial.morphNormals = true;

					this.cache.add( cacheKey, cachedMaterial );

					this.associations.set( cachedMaterial, this.associations.get( material ) );

				}

				material = cachedMaterial;

			}

			// workarounds for mesh and geometry

			if ( material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined ) {

				geometry.setAttribute( 'uv2', geometry.attributes.uv );

			}

			// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
			if ( material.normalScale && ! useVertexTangents ) {

				material.normalScale.y = - material.normalScale.y;

			}

			if ( material.clearcoatNormalScale && ! useVertexTangents ) {

				material.clearcoatNormalScale.y = - material.clearcoatNormalScale.y;

			}

			mesh.material = material;

		};

		GLTFParser.prototype.getMaterialType = function ( /* materialIndex */ ) {

			return MeshStandardMaterial;

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
		 * @param {number} materialIndex
		 * @return {Promise<Material>}
		 */
		GLTFParser.prototype.loadMaterial = function ( materialIndex ) {

			var parser = this;
			var json = this.json;
			var extensions = this.extensions;
			var materialDef = json.materials[ materialIndex ];

			var materialType;
			var materialParams = {};
			var materialExtensions = materialDef.extensions || {};

			var pending = [];

			if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] ) {

				var sgExtension = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ];
				materialType = sgExtension.getMaterialType();
				pending.push( sgExtension.extendParams( materialParams, materialDef, parser ) );

			} else if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ] ) {

				var kmuExtension = extensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ];
				materialType = kmuExtension.getMaterialType();
				pending.push( kmuExtension.extendParams( materialParams, materialDef, parser ) );

			} else {

				// Specification:
				// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

				var metallicRoughness = materialDef.pbrMetallicRoughness || {};

				materialParams.color = new Color( 1.0, 1.0, 1.0 );
				materialParams.opacity = 1.0;

				if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

					var array = metallicRoughness.baseColorFactor;

					materialParams.color.fromArray( array );
					materialParams.opacity = array[ 3 ];

				}

				if ( metallicRoughness.baseColorTexture !== undefined ) {

					pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

				}

				materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
				materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

				if ( metallicRoughness.metallicRoughnessTexture !== undefined ) {

					pending.push( parser.assignTexture( materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture ) );
					pending.push( parser.assignTexture( materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture ) );

				}

				materialType = this._invokeOne( function ( ext ) {

					return ext.getMaterialType && ext.getMaterialType( materialIndex );

				} );

				pending.push( this._invokeAll( function ( ext ) {

					return ext.extendMaterialParams && ext.extendMaterialParams( materialIndex, materialParams );

				} ) );

			}

			if ( materialDef.doubleSided === true ) {

				materialParams.side = DoubleSide;

			}

			var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

			if ( alphaMode === ALPHA_MODES.BLEND ) {

				materialParams.transparent = true;

				// See: https://github.com/mrdoob/three.js/issues/17706
				materialParams.depthWrite = false;

			} else {

				materialParams.transparent = false;

				if ( alphaMode === ALPHA_MODES.MASK ) {

					materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

				}

			}

			if ( materialDef.normalTexture !== undefined && materialType !== MeshBasicMaterial ) {

				pending.push( parser.assignTexture( materialParams, 'normalMap', materialDef.normalTexture ) );

				materialParams.normalScale = new Vector2( 1, 1 );

				if ( materialDef.normalTexture.scale !== undefined ) {

					materialParams.normalScale.set( materialDef.normalTexture.scale, materialDef.normalTexture.scale );

				}

			}

			if ( materialDef.occlusionTexture !== undefined && materialType !== MeshBasicMaterial ) {

				pending.push( parser.assignTexture( materialParams, 'aoMap', materialDef.occlusionTexture ) );

				if ( materialDef.occlusionTexture.strength !== undefined ) {

					materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

				}

			}

			if ( materialDef.emissiveFactor !== undefined && materialType !== MeshBasicMaterial ) {

				materialParams.emissive = new Color().fromArray( materialDef.emissiveFactor );

			}

			if ( materialDef.emissiveTexture !== undefined && materialType !== MeshBasicMaterial ) {

				pending.push( parser.assignTexture( materialParams, 'emissiveMap', materialDef.emissiveTexture ) );

			}

			return Promise.all( pending ).then( function () {

				var material;

				material = new materialType( materialParams );
				if ( materialDef.name ) material.name = materialDef.name;

				// baseColorTexture, emissiveTexture, and specularGlossinessTexture use sRGB encoding.
				if ( material.map ) material.map.encoding = sRGBEncoding;
				if ( material.emissiveMap ) material.emissiveMap.encoding = sRGBEncoding;

				assignExtrasToUserData( material, materialDef );
				parser.associations.set( material, { type: 'materials', index: materialIndex } );

				if ( materialDef.extensions ) addUnknownExtensionsToUserData( extensions, material, materialDef );

				return material;

			} );

		};

		/**
		 * @param {BufferGeometry} geometry
		 * @param {GLTF.Primitive} primitiveDef
		 * @param {GLTFParser} parser
		 */
		function computeBounds( geometry, primitiveDef, parser ) {

			var attributes = primitiveDef.attributes;

			var box = new Box3();

			if ( attributes.POSITION !== undefined ) {

				var accessor = parser.json.accessors[ attributes.POSITION ];

				var min = accessor.min;
				var max = accessor.max;

				// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

				if ( min !== undefined && max !== undefined ) {

					box.set(
						new Vector3( min[ 0 ], min[ 1 ], min[ 2 ] ),
						new Vector3( max[ 0 ], max[ 1 ], max[ 2 ] ) );

				} else {

					console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

					return;

				}

			} else {

				return;

			}

			var targets = primitiveDef.targets;

			if ( targets !== undefined ) {

				var maxDisplacement = new Vector3();
				var vector = new Vector3();

				for ( var i = 0, il = targets.length; i < il; i ++ ) {

					var target = targets[ i ];

					if ( target.POSITION !== undefined ) {

						var accessor = parser.json.accessors[ target.POSITION ];
						var min = accessor.min;
						var max = accessor.max;

						// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

						if ( min !== undefined && max !== undefined ) {

							// we need to get max of absolute components because target weight is [-1,1]
							vector.setX( Math.max( Math.abs( min[ 0 ] ), Math.abs( max[ 0 ] ) ) );
							vector.setY( Math.max( Math.abs( min[ 1 ] ), Math.abs( max[ 1 ] ) ) );
							vector.setZ( Math.max( Math.abs( min[ 2 ] ), Math.abs( max[ 2 ] ) ) );

							// Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
							// to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
							// are used to implement key-frame animations and as such only two are active at a time - this results in very large
							// boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
							maxDisplacement.max( vector );

						} else {

							console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

						}

					}

				}

				// As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
				box.expandByVector( maxDisplacement );

			}

			geometry.boundingBox = box;

			var sphere = new Sphere();

			box.getCenter( sphere.center );
			sphere.radius = box.min.distanceTo( box.max ) / 2;

			geometry.boundingSphere = sphere;

		}

		/**
		 * @param {BufferGeometry} geometry
		 * @param {GLTF.Primitive} primitiveDef
		 * @param {GLTFParser} parser
		 * @return {Promise<BufferGeometry>}
		 */
		function addPrimitiveAttributes( geometry, primitiveDef, parser ) {

			var attributes = primitiveDef.attributes;

			var pending = [];

			function assignAttributeAccessor( accessorIndex, attributeName ) {

				return parser.getDependency( 'accessor', accessorIndex )
					.then( function ( accessor ) {

						geometry.setAttribute( attributeName, accessor );

					} );

			}

			for ( var gltfAttributeName in attributes ) {

				var threeAttributeName = ATTRIBUTES[ gltfAttributeName ] || gltfAttributeName.toLowerCase();

				// Skip attributes already provided by e.g. Draco extension.
				if ( threeAttributeName in geometry.attributes ) continue;

				pending.push( assignAttributeAccessor( attributes[ gltfAttributeName ], threeAttributeName ) );

			}

			if ( primitiveDef.indices !== undefined && ! geometry.index ) {

				var accessor = parser.getDependency( 'accessor', primitiveDef.indices ).then( function ( accessor ) {

					geometry.setIndex( accessor );

				} );

				pending.push( accessor );

			}

			assignExtrasToUserData( geometry, primitiveDef );

			computeBounds( geometry, primitiveDef, parser );

			return Promise.all( pending ).then( function () {

				return primitiveDef.targets !== undefined
					? addMorphTargets( geometry, primitiveDef.targets, parser )
					: geometry;

			} );

		}

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
		 *
		 * Creates BufferGeometries from primitives.
		 *
		 * @param {Array<GLTF.Primitive>} primitives
		 * @return {Promise<Array<BufferGeometry>>}
		 */
		GLTFParser.prototype.loadGeometries = function ( primitives ) {

			var parser = this;
			var extensions = this.extensions;
			var cache = this.primitiveCache;

			function createDracoPrimitive( primitive ) {

				return extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ]
					.decodePrimitive( primitive, parser )
					.then( function ( geometry ) {

						return addPrimitiveAttributes( geometry, primitive, parser );

					} );

			}

			var pending = [];

			for ( var i = 0, il = primitives.length; i < il; i ++ ) {

				var primitive = primitives[ i ];
				var cacheKey = createPrimitiveKey( primitive );

				// See if we've already created this geometry
				var cached = cache[ cacheKey ];

				if ( cached ) {

					// Use the cached geometry if it exists
					pending.push( cached.promise );

				} else {

					var geometryPromise;

					if ( primitive.extensions && primitive.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ] ) {

						// Use DRACO geometry if available
						geometryPromise = createDracoPrimitive( primitive );

					} else {

						// Otherwise create a new geometry
						geometryPromise = addPrimitiveAttributes( new BufferGeometry(), primitive, parser );

					}

					// Cache this geometry
					cache[ cacheKey ] = { primitive: primitive, promise: geometryPromise };

					pending.push( geometryPromise );

				}

			}

			return Promise.all( pending );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
		 * @param {number} meshIndex
		 * @return {Promise<Group|Mesh|SkinnedMesh>}
		 */
		GLTFParser.prototype.loadMesh = function ( meshIndex ) {
			var parser = this;
			var json = this.json;

			var meshDef = json.meshes[ meshIndex ];
			var primitives = meshDef.primitives;

			var pending = [];

			for ( var i = 0, il = primitives.length; i < il; i ++ ) {

				var material = primitives[ i ].material === undefined
					? createDefaultMaterial( this.cache )
					: this.getDependency( 'material', primitives[ i ].material );

				pending.push( material );

			}

			pending.push( parser.loadGeometries( primitives ) );

			return Promise.all( pending ).then( function ( results ) {

				var materials = results.slice( 0, results.length - 1 );
				var geometries = results[ results.length - 1 ];

				var meshes = [];

				for ( var i = 0, il = geometries.length; i < il; i ++ ) {

					var geometry = geometries[ i ];
					var primitive = primitives[ i ];

					// 1. create Mesh

					var mesh;

					var material = materials[ i ];

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
						primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
						primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
						primitive.mode === undefined ) {
						// .isSkinnedMesh isn't in glTF spec. See ._markDefs()
						mesh = new Mesh( geometry, material );


					} else {

						throw new Error( 'THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode );

					}

					if ( Object.keys( mesh.geometry.morphAttributes ).length > 0 ) {

						updateMorphTargets( mesh, meshDef );

					}

					mesh.name = meshDef.name || ( 'mesh_' + meshIndex );

					if ( geometries.length > 1 ) mesh.name += '_' + i;

					assignExtrasToUserData( mesh, meshDef );

					parser.assignFinalMaterial( mesh );

					meshes.push( mesh );

				}

				if ( meshes.length === 1 ) {

					return meshes[ 0 ];

				}

				var group = new Group();

				for ( var i = 0, il = meshes.length; i < il; i ++ ) {

					group.add( meshes[ i ] );

				}

				return group;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
		 * @param {number} cameraIndex
		 * @return {Promise<THREE.Camera>}
		 */
		GLTFParser.prototype.loadCamera = function ( cameraIndex ) {

			var camera;
			var cameraDef = this.json.cameras[ cameraIndex ];
			var params = cameraDef[ cameraDef.type ];

			if ( ! params ) {

				console.warn( 'THREE.GLTFLoader: Missing camera parameters.' );
				return;

			}

			if ( cameraDef.type === 'perspective' ) {

				camera = new PerspectiveCamera( MathUtils.radToDeg( params.yfov ), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6 );

			} else if ( cameraDef.type === 'orthographic' ) {

				camera = new OrthographicCamera( - params.xmag, params.xmag, params.ymag, - params.ymag, params.znear, params.zfar );

			}

			if ( cameraDef.name ) camera.name = cameraDef.name;

			assignExtrasToUserData( camera, cameraDef );

			return Promise.resolve( camera );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
		 * @param {number} skinIndex
		 * @return {Promise<Object>}
		 */
		GLTFParser.prototype.loadSkin = function ( skinIndex ) {

			var skinDef = this.json.skins[ skinIndex ];

			var skinEntry = { joints: skinDef.joints };

			if ( skinDef.inverseBindMatrices === undefined ) {

				return Promise.resolve( skinEntry );

			}

			return this.getDependency( 'accessor', skinDef.inverseBindMatrices ).then( function ( accessor ) {

				skinEntry.inverseBindMatrices = accessor;

				return skinEntry;

			} );


		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
		 * @param {number} nodeIndex
		 * @return {Promise<Object3D>}
		 */
		GLTFParser.prototype.loadNode = function ( nodeIndex ) {

			var json = this.json;
			var extensions = this.extensions;
			var parser = this;

			var nodeDef = json.nodes[ nodeIndex ];

			return ( function () {

				var pending = [];

				if ( nodeDef.mesh !== undefined ) {

					pending.push( parser.getDependency( 'mesh', nodeDef.mesh ).then( function ( mesh ) {

						var node = parser._getNodeRef( parser.meshCache, nodeDef.mesh, mesh );

						// if weights are provided on the node, override weights on the mesh.
						if ( nodeDef.weights !== undefined ) {

							node.traverse( function ( o ) {

								if ( ! o.isMesh ) return;

								for ( var i = 0, il = nodeDef.weights.length; i < il; i ++ ) {

									o.morphTargetInfluences[ i ] = nodeDef.weights[ i ];

								}

							} );

						}

						return node;

					} ) );

				}

				if ( nodeDef.camera !== undefined ) {

					pending.push( parser.getDependency( 'camera', nodeDef.camera ).then( function ( camera ) {

						return parser._getNodeRef( parser.cameraCache, nodeDef.camera, camera );

					} ) );

				}

				if ( nodeDef.extensions
					&& nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ]
					&& nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ].light !== undefined ) {

					var lightIndex = nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ].light;

					pending.push( parser.getDependency( 'light', lightIndex ).then( function ( light ) {

						return parser._getNodeRef( parser.lightCache, lightIndex, light );

					} ) );

				}

				return Promise.all( pending );

			}() ).then( function ( objects ) {

				var node;

				// .isBone isn't in glTF spec. See ._markDefs
				if ( nodeDef.isBone === true ) {

					node = new Bone();

				} else if ( objects.length > 1 ) {

					node = new Group();

				} else if ( objects.length === 1 ) {

					node = objects[ 0 ];

				} else {

					node = new Object3D();

				}

				if ( node !== objects[ 0 ] ) {

					for ( var i = 0, il = objects.length; i < il; i ++ ) {

						node.add( objects[ i ] );

					}

				}


				assignExtrasToUserData( node, nodeDef );

				if ( nodeDef.extensions ) addUnknownExtensionsToUserData( extensions, node, nodeDef );

				if ( nodeDef.matrix !== undefined ) {

					var matrix = new Matrix4();
					matrix.fromArray( nodeDef.matrix );
					node.applyMatrix4( matrix );

				} else {

					if ( nodeDef.translation !== undefined ) {

						node.position.fromArray( nodeDef.translation );

					}

					if ( nodeDef.rotation !== undefined ) {

						node.quaternion.fromArray( nodeDef.rotation );

					}

					if ( nodeDef.scale !== undefined ) {

						node.scale.fromArray( nodeDef.scale );

					}

				}

				parser.associations.set( node, { type: 'nodes', index: nodeIndex } );

				return node;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
		 * @param {number} sceneIndex
		 * @return {Promise<Group>}
		 */
		GLTFParser.prototype.loadScene = function () {

			// scene node hierachy builder

			function buildNodeHierachy( nodeId, parentObject, json, parser ) {

				var nodeDef = json.nodes[ nodeId ];
				return parser.getDependency( 'node', nodeId ).then( function ( node ) {

					if ( nodeDef.skin === undefined ) return node;

					// build skeleton here as well

					var skinEntry;

					return parser.getDependency( 'skin', nodeDef.skin ).then( function ( skin ) {

						skinEntry = skin;

						var pendingJoints = [];

						for ( var i = 0, il = skinEntry.joints.length; i < il; i ++ ) {

							pendingJoints.push( parser.getDependency( 'node', skinEntry.joints[ i ] ) );

						}

						return Promise.all( pendingJoints );

					} ).then( function ( jointNodes ) {

						node.traverse( function ( mesh ) {

							if ( ! mesh.isMesh ) return;

							var bones = [];
							var boneInverses = [];

							for ( var j = 0, jl = jointNodes.length; j < jl; j ++ ) {

								var jointNode = jointNodes[ j ];

								if ( jointNode ) {

									bones.push( jointNode );

									var mat = new Matrix4();

									if ( skinEntry.inverseBindMatrices !== undefined ) {

										mat.fromArray( skinEntry.inverseBindMatrices.array, j * 16 );

									}

									boneInverses.push( mat );

								} else {

									console.warn( 'THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[ j ] );

								}

							}

							mesh.bind( new Skeleton( bones, boneInverses ), mesh.matrixWorld );

						} );

						return node;

					} );

				} ).then( function ( node ) {

					// build node hierachy

					parentObject.add( node );

					var pending = [];

					if ( nodeDef.children ) {

						var children = nodeDef.children;

						for ( var i = 0, il = children.length; i < il; i ++ ) {

							var child = children[ i ];
							pending.push( buildNodeHierachy( child, node, json, parser ) );

						}

					}

					return Promise.all( pending );

				} );

			}

			return function loadScene( sceneIndex ) {

				var json = this.json;
				var extensions = this.extensions;
				var sceneDef = this.json.scenes[ sceneIndex ];
				var parser = this;

				// Loader returns Group, not Scene.
				// See: https://github.com/mrdoob/three.js/issues/18342#issuecomment-578981172
				var scene = new Group();
				if ( sceneDef.name ) scene.name = sceneDef.name;

				assignExtrasToUserData( scene, sceneDef );

				if ( sceneDef.extensions ) addUnknownExtensionsToUserData( extensions, scene, sceneDef );

				var nodeIds = sceneDef.nodes || [];

				var pending = [];

				for ( var i = 0, il = nodeIds.length; i < il; i ++ ) {

					pending.push( buildNodeHierachy( nodeIds[ i ], scene, json, parser ) );

				}

				return Promise.all( pending ).then( function () {

					return scene;

				} );

			};

		}();

		return GLTFLoader;

	} )();


	const wasm = 'AGFzbQEAAAABpQEVYAF/AX9gAn9/AGADf39/AX9gBX9/f39/AX9gAX8AYAJ/fwF/YAR/f39/AX9gA39/fwBgBn9/f39/fwF/YAd/f39/f39/AX9gAn9/AX5gAn5+AX5gAABgBX9/f39/AGAGf39/f39/AGAIf39/f39/f38AYAl/f39/f39/f38AYAABf2AIf39/f39/f38Bf2ANf39/f39/f39/f39/fwF/YAF/AX4CJwEDZW52H2Vtc2NyaXB0ZW5fbm90aWZ5X21lbW9yeV9ncm93dGgABANpaAEFAAAFAgEFCwACAQABAgIFBQcAAwABDgsBAQcAEhMHAAUBDAQEAAANBwQCAgYCBAgDAwMDBgEACQkHBgICAAYGAgQUBwYGAwIGAAMCAQgBBwUGCgoEEQAEBAEIAwgDBQgDEA8IAAcABAUBcAECAgUEAQCAAgYJAX8BQaCgwAILB2AHBm1lbW9yeQIABm1hbGxvYwAoBGZyZWUAJgxaU1REX2lzRXJyb3IAaBlaU1REX2ZpbmREZWNvbXByZXNzZWRTaXplAFQPWlNURF9kZWNvbXByZXNzAEoGX3N0YXJ0ACQJBwEAQQELASQKussBaA8AIAAgACgCBCABajYCBAsZACAAKAIAIAAoAgRBH3F0QQAgAWtBH3F2CwgAIABBiH9LC34BBH9BAyEBIAAoAgQiA0EgTQRAIAAoAggiASAAKAIQTwRAIAAQDQ8LIAAoAgwiAiABRgRAQQFBAiADQSBJGw8LIAAgASABIAJrIANBA3YiBCABIARrIAJJIgEbIgJrIgQ2AgggACADIAJBA3RrNgIEIAAgBCgAADYCAAsgAQsUAQF/IAAgARACIQIgACABEAEgAgv3AQECfyACRQRAIABCADcCACAAQQA2AhAgAEIANwIIQbh/DwsgACABNgIMIAAgAUEEajYCECACQQRPBEAgACABIAJqIgFBfGoiAzYCCCAAIAMoAAA2AgAgAUF/ai0AACIBBEAgAEEIIAEQFGs2AgQgAg8LIABBADYCBEF/DwsgACABNgIIIAAgAS0AACIDNgIAIAJBfmoiBEEBTQRAIARBAWtFBEAgACABLQACQRB0IANyIgM2AgALIAAgAS0AAUEIdCADajYCAAsgASACakF/ai0AACIBRQRAIABBADYCBEFsDwsgAEEoIAEQFCACQQN0ams2AgQgAgsWACAAIAEpAAA3AAAgACABKQAINwAICy8BAX8gAUECdEGgHWooAgAgACgCAEEgIAEgACgCBGprQR9xdnEhAiAAIAEQASACCyEAIAFCz9bTvtLHq9lCfiAAfEIfiUKHla+vmLbem55/fgsdAQF/IAAoAgggACgCDEYEfyAAKAIEQSBGBUEACwuCBAEDfyACQYDAAE8EQCAAIAEgAhBnIAAPCyAAIAJqIQMCQCAAIAFzQQNxRQRAAkAgAkEBSARAIAAhAgwBCyAAQQNxRQRAIAAhAgwBCyAAIQIDQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADTw0BIAJBA3ENAAsLAkAgA0F8cSIEQcAASQ0AIAIgBEFAaiIFSw0AA0AgAiABKAIANgIAIAIgASgCBDYCBCACIAEoAgg2AgggAiABKAIMNgIMIAIgASgCEDYCECACIAEoAhQ2AhQgAiABKAIYNgIYIAIgASgCHDYCHCACIAEoAiA2AiAgAiABKAIkNgIkIAIgASgCKDYCKCACIAEoAiw2AiwgAiABKAIwNgIwIAIgASgCNDYCNCACIAEoAjg2AjggAiABKAI8NgI8IAFBQGshASACQUBrIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQALDAELIANBBEkEQCAAIQIMAQsgA0F8aiIEIABJBEAgACECDAELIAAhAgNAIAIgAS0AADoAACACIAEtAAE6AAEgAiABLQACOgACIAIgAS0AAzoAAyABQQRqIQEgAkEEaiICIARNDQALCyACIANJBEADQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADRw0ACwsgAAsMACAAIAEpAAA3AAALQQECfyAAKAIIIgEgACgCEEkEQEEDDwsgACAAKAIEIgJBB3E2AgQgACABIAJBA3ZrIgE2AgggACABKAAANgIAQQALDAAgACABKAIANgAAC/cCAQJ/AkAgACABRg0AAkAgASACaiAASwRAIAAgAmoiBCABSw0BCyAAIAEgAhALDwsgACABc0EDcSEDAkACQCAAIAFJBEAgAwRAIAAhAwwDCyAAQQNxRQRAIAAhAwwCCyAAIQMDQCACRQ0EIAMgAS0AADoAACABQQFqIQEgAkF/aiECIANBAWoiA0EDcQ0ACwwBCwJAIAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQh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ASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigC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C0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdB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IAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY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wOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEE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';

	/**
	 * References:
	 * - KTX: http://github.khronos.org/KTX-Specification/
	 * - DFD: https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#basicdescriptor
	 */

	// Data Format Descriptor (DFD) constants.

	const DFDModel = {
		ETC1S: 163,
		UASTC: 166,
	};

	const DFDChannel = {
		ETC1S: {
			RGB: 0,
			RRR: 3,
			GGG: 4,
			AAA: 15,
		},
		UASTC: {
			RGB: 0,
			RGBA: 3,
			RRR: 4,
			RRRG: 5
		},
	};

	//

	class KTX2Loader {

		constructor( manager ) {
			Loader.call( this, manager );
			this.basisModule = null;
			this.basisModulePending = null;
			this.transcoderConfig = {};
		}

		detectSupport( renderer ) {
			this.transcoderConfig = {
				astcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_astc' ),
				etc1Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc1' ),
				etc2Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc' ),
				dxtSupported: renderer.extensions.has( 'WEBGL_compressed_texture_s3tc' ),
				bptcSupported: renderer.extensions.has( 'EXT_texture_compression_bptc' ),
				pvrtcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_pvrtc' )
					|| renderer.extensions.has( 'WEBKIT_WEBGL_compressed_texture_pvrtc' )
			};
			return this;
		}

		initModule() {
			if ( this.basisModulePending ) {return;}

			var scope = this;

			// The Emscripten wrapper returns a fake Promise, which can cause
			// infinite recursion when mixed with native Promises. Wrap the module
			// initialization to return a native Promise.
			scope.basisModulePending = new Promise( function ( resolve ) {
				MSC_TRANSCODER().then( function ( basisModule ) {
					scope.basisModule = basisModule;
					basisModule.initTranscoders();
					resolve();
				} );
			} );

		}

	}



	class TileLoader {
	    // This class contains the common code to load tile content, such as b3dm and pnts files.
	    // It is not to be used directly. Instead, subclasses are used to implement specific content loaders for different tile types.
	    constructor(url) {
	        this.url = url;
	        this.type = url.slice(-4);
	        this.version = null;
	        this.byteLength = null;
	        this.featureTableJSON = null;
	        this.featureTableBinary = null;
	        this.batchTableJson = null;
	        this.batchTableBinary = null;
	        this.binaryData = null;
	    }
	    // TileLoader.load
	    async load() {
	        let response = await fetch(this.url);
	        if (!response.ok) {
	            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
	        }
	        let buffer = await response.arrayBuffer();
	        let res = await this.parseResponse(buffer);
	        return res;
	    }
	    async parseResponse(buffer) {
	        let header = new Uint32Array(buffer.slice(0, 32));
	        let decoder = new TextDecoder();
	        let magic = decoder.decode(new Uint8Array(buffer.slice(0, 4)));
	        if (magic != this.type) {
	            throw new Error(`Invalid magic string, expected '${this.type}', got '${this.magic}'`);
	        }
	        this.version = header[1];
	        this.byteLength = header[2];
	        let featureTableJSONByteLength = header[3];
	        let featureTableBinaryByteLength = header[4];
	        let batchTableJsonByteLength = header[5];
	        let batchTableBinaryByteLength = header[6];
	        let gltfFormat = magic === 'i3dm' ? header[7] : 1;

	        let pos = magic === 'i3dm' ? 32 : 28; // header length
	        if (featureTableJSONByteLength > 0) {
	            this.featureTableJSON = JSON.parse(
	                decoder.decode(new Uint8Array(buffer.slice(pos, pos + featureTableJSONByteLength)))
	            );
	            pos += featureTableJSONByteLength;
	        } else {
	            this.featureTableJSON = {};
	        }
	        this.featureTableBinary = buffer.slice(pos, pos + featureTableBinaryByteLength);
	        pos += featureTableBinaryByteLength;
	        if (batchTableJsonByteLength > 0) {
	            this.batchTableJson = JSON.parse(
	                decoder.decode(new Uint8Array(buffer.slice(pos, pos + batchTableJsonByteLength)))
	            );
	            pos += batchTableJsonByteLength;
	        } else {
	            this.batchTableJson = {};
	        }
	        this.batchTableBinary = buffer.slice(pos, pos + batchTableBinaryByteLength);
	        pos += batchTableBinaryByteLength;
	        if (gltfFormat === 1) {
	            this.binaryData = buffer.slice(pos);
	        } else {
	            // load binary data from url at pos
	            let modelUrl = decoder.decode(new Uint8Array(buffer.slice(pos)));
	            if (internalGLTFCache.has(modelUrl)) {
	                this.binaryData = internalGLTFCache.get(modelUrl);
	            } else {
	                let response = await fetch(modelUrl);
	                if (!response.ok) {
	                    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
	                }    
	                this.binaryData = await response.arrayBuffer();
	                internalGLTFCache.set(modelUrl, this.binaryData);
	            }
	        }
	        return this;
	    }
	}

	class B3DM extends TileLoader {
	    constructor(url) {
	        super(url);
	        this.glbData = null;
		}
		
	    async parseResponse(buffer) {
	        await super.parseResponse(buffer);
	        this.glbData = this.binaryData;
	        return this;
	    }
	}

	let internalGLTFCache = new Map();

	function YToLat(Y) {
	    return (Math.atan(Math.pow(Math.E, ((Y / 111319.490778) * Math.PI) / 180.0)) * 360.0) / Math.PI - 90.0;
	}

	function LatToScale(lat) {
	    return 1 / Math.cos((lat * Math.PI) / 180);
	}


	class ThreeDeeTile {
		constructor(json, resourcePath, styleParams, updateCallback, parentRefine, parentTransform,projectToMercator,global_transform) {
		  this.loaded = false;
		  this.styleParams = styleParams;
		  this.updateCallback = updateCallback;
		  this.resourcePath = resourcePath;
		  this.projectToMercator = projectToMercator;
		  this.totalContent = new Group();  // Three JS Object3D Group for this tile and all its children
		  this.tileContent = new Group();    // Three JS Object3D Group for this tile's content
		  this.childContent = new Group();    // Three JS Object3D Group for this tile's children
		  this.totalContent.add(this.tileContent);
		  this.totalContent.add(this.childContent);
          this.boundingVolume= json.box? json.box:json.b;


		  if (json.box) {
			let x = this.boundingVolume;
            let b=[x[0],x[1],0.0,x[2],0.0,0.0,0.0,x[3],0.0,0.0,0.0,500]
			let extent = [b[0] - b[3], b[1] - b[7], b[0] + b[3], b[1] + b[7]];
			let sw = new Vector3(extent[0], extent[1], b[2] - b[11]);
			let ne = new Vector3(extent[2], extent[3], b[2] + b[11]);
			this.box = new Box3(sw, ne);			
		  } else if(json.b)
		  {
            let x = this.boundingVolume;
            let bound=1250
            let b=[x[0],x[1],0.0,bound,0.0,0.0,0.0,bound,0.0,0.0,0.0,500.0]
            let extent = [b[0] - b[3], b[1] - b[7], b[0] + b[3], b[1] + b[7]];
            let sw = new Vector3(extent[0], extent[1], b[2] - b[11]);
            let ne = new Vector3(extent[2], extent[3], b[2] + b[11]);
            this.box = new Box3(sw, ne);
		  }

		  this.refine = json.refine ? json.refine.toUpperCase() : parentRefine;
		  this.geometricError= json.g? json.g:500.0;
		  this.worldTransform = parentTransform ? parentTransform.clone() : new Matrix4();
		  this.transform = json.transform
		  
		  if (this.transform || global_transform) 
		  { 
            let tr=this.transform?json.transform:global_transform;					   
			this.transform = [1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,tr[0],tr[1],tr[2],tr[3]];

			let tileMatrix = new Matrix4().fromArray(this.transform);
			this.totalContent.applyMatrix4(tileMatrix);
			this.worldTransform.multiply(tileMatrix);
		  }

		  this.content = json.content;
		  this.children = [];

		  //Auswahl ueber checkLoad->Frustum
		  if (json.children) {
			for (let i=0; i<json.children.length; i++){
				//if(inBox)
			  		let child = new ThreeDeeTile(json.children[i], resourcePath, styleParams, updateCallback, this.refine, this.worldTransform, this.projectToMercator,json.global_transform);
			  		this.childContent.add(child.totalContent);
					this.children.push(child);
				
			}
		  }
		}

		//ThreeDeeTile.load
		async load() {
		  if (this.unloadedTileContent) {
			this.totalContent.add(this.tileContent);
			this.unloadedTileContent = false;
		  }
		  if (this.unloadedChildContent) {
			this.totalContent.add(this.childContent);
			this.unloadedChildContent = false;
		  }
		  if (this.loaded) {
			this.updateCallback();
			return;
		  }
		  this.loaded = true;

		  let url=this.boundingVolume[this.boundingVolume.length-1];
		  if ( typeof url === 'string') {
			if (!url) return;
			if (url.substr(0, 4) != 'http')
			  url = this.resourcePath + url;
			let type = url.slice(-4);
                     if(type!='json')type='b3dm';
			switch (type) {
			  case 'json':
				// child is a tileset json
				try {
				  let subTileset = new TileSet(()=>this.updateCallback());
				  await subTileset.load(url, this.styleParams);
				  if (subTileset.root) {
					this.box.applyMatrix4(this.worldTransform);
					let inverseMatrix = new Matrix4().getInverse(this.worldTransform);
					this.totalContent.applyMatrix4(inverseMatrix);
					this.totalContent.updateMatrixWorld();
					this.worldTransform = new Matrix4();
	  
					this.children.push(subTileset.root);
					this.childContent.add(subTileset.root.totalContent);
					subTileset.root.totalContent.updateMatrixWorld();
					subTileset.root.checkLoad(this.frustum, this.cameraPosition);
				  }
				} catch (error) {
				  console.error(error);
				}
				break;
			  case 'b3dm':
				try {
                    var urlArr=url.split("/")
                    urlArr.pop();
                    var beginUrl=urlArr.join("/");
                    var tileNumber=url.split("/").slice(-1)[0];
                    let loader = new GLTFLoader();
                    url=beginUrl+"/tiles/"+tileNumber+".b3dm"

                    let b3dm = new B3DM(url);
				  	let rotateX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI / 2);
				  	this.tileContent.applyMatrix4(rotateX); // convert from GLTF Y-up to Z-up
					let b3dmData = await b3dm.load();
				  	loader.parse(b3dmData.glbData, this.resourcePath, (gltf) => {
					let scene = gltf.scene || gltf.scenes[0];

					if (this.projectToMercator) {
						//TODO: must be a nicer way to get the local Y in webmerc. than worldTransform.elements	
						scene.scale.setScalar(LatToScale(YToLat(this.worldTransform.elements[13])));
					}
					scene.traverse(child => {
						if (child instanceof Mesh) {
						  // some gltf has wrong bounding data, recompute here
						  //child.geometry.computeBoundingBox();
						  //child.geometry.computeBoundingSphere();
						  child.material.metalness=0.0;
						  child.userData = b3dmData.batchTableJson;
						  child.userData.b3dm = url.replace(this.resourcePath, '').replace('.b3dm', '');
						}
					  });
					  
					  this.tileContent.add(scene);
					}, (error) => {
					  throw new Error('error parsing gltf: ' + error);
					}
				  );
				} catch (error) {
				  console.error(error);
				}
				break;
			  default:
				throw new Error('invalid tile type: ' + type);
			}
		  }
		  this.updateCallback();
		}

		unload(includeChildren) {
		  this.unloadedTileContent = true;
		  this.totalContent.remove(this.tileContent);
	  
		  //this.tileContent.visible = false;
		  if (includeChildren) {
			this.unloadedChildContent = true;
			this.totalContent.remove(this.childContent);
			//this.childContent.visible = false;
		  } else  {
			if (this.unloadedChildContent) {
			  this.unloadedChildContent = false;
			  this.totalContent.add(this.childContent);
			}
		  }
		  if (this.debugLine) {
			this.totalContent.remove(this.debugLine);
			this.unloadedDebugContent = true;
		  }
		  this.updateCallback();
		  // TODO: should we also free up memory?
		}

		checkLoad(frustum, cameraPosition) {
		  this.frustum = frustum;
		  this.cameraPosition = cameraPosition;

		  if(map.transform._zoom<16)
		  {
				this.unload(true);
				return;
		  }

		  /*this.load();
		  for (let i=0; i<this.children.length;i++) {
			this.children[i].checkLoad(frustum, cameraPosition);
		  }
		  return;
		  */
	  
		  /*if (this.totalContent.parent.name === "world") {
			this.totalContent.parent.updateMatrixWorld();
		  }*/
		  let transformedBox = this.box.clone();
		  transformedBox.applyMatrix4(this.totalContent.matrixWorld);
		  
		  // is this tile visible?
		  if (!frustum.intersectsBox(transformedBox)) {
			this.unload(true);
			return;
		  }
		  
		  let worldBox = this.box.clone().applyMatrix4(this.worldTransform);
		  let dist = worldBox.distanceToPoint(cameraPosition);
		  
		  //console.log(`dist: ${dist}, geometricError: ${this.geometricError}`);
		  // are we too far to render this tile?
		  if (this.geometricError > 0.0 && dist > this.geometricError * 30.0) {
			this.unload(true);
			return;
		  }

		  //console.log(`camPos: ${cameraPosition.z}, dist: ${dist}, geometricError: ${this.geometricError}`);
		  // should we load this tile?
		  if ((this.refine == 'REPLACE' && dist < this.geometricError * 15.0 && this.children.length > 0)) {
			this.unload(false);
		  } else {
			this.load();
		  }
		  
		  // should we load its children?
		  for (let i=0; i<this.children.length; i++) {
			if (dist < this.geometricError * 15.0) {
			  this.children[i].checkLoad(frustum, cameraPosition);
			} else {
			  this.children[i].unload(true);
			}
		  }
	  
		  /*
		  // below code loads tiles based on screenspace instead of geometricError,
		  // not sure yet which algorith is better so i'm leaving this code here for now
		  let sw = this.box.min.clone().project(camera);
		  let ne = this.box.max.clone().project(camera);      
		  let x1 = sw.x, x2 = ne.x;
		  let y1 = sw.y, y2 = ne.y;
		  let tilespace = Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)); // distance in screen space
		  
		  if (tilespace < 0.2) {
			this.unload();
		  }
		  // do nothing between 0.2 and 0.25 to avoid excessive tile loading/unloading
		  else if (tilespace > 0.25) {
			this.load();
			this.children.forEach(child => {
			  child.checkLoad(camera);
			});
		  }*/
		  
		}
	  }

	class TileSet {
	    constructor(updateCallback) {
	        if (!updateCallback) {
	            updateCallback = () => {};
	        }
	        this.updateCallback = updateCallback;
	        this.url = null;
	        this.version = null;
	        this.gltfUpAxis = 'Z';
	        this.geometricError = null;
	        this.root = null;
		}
		
	    // TileSet.load
	    async load(url, styleParams, projectToMercator) {
	        this.url = url;
	        let resourcePath = LoaderUtils.extractUrlBase(url);

	        let response = await fetch(this.url);
	        if (!response.ok) {
	            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
	        }
	        let json = await response.json();
	        this.version = json.asset.version;
	        this.geometricError = json.g? json.g:500.0;
	        this.refine = json.root.refine ? json.root.refine.toUpperCase() : 'ADD';
	        this.root = new ThreeDeeTile(
	            json.root,
	            resourcePath,
	            styleParams,
	            this.updateCallback,
	            this.refine,
	            null,
	            projectToMercator
	        );
	        return;
	    }
	}


	/**
	 * parameters = {
	 *  color: <hex>,
	 *  linewidth: <float>,
	 *  dashed: <boolean>,
	 *  dashScale: <float>,
	 *  dashSize: <float>,
	 *  gapSize: <float>,
	 *  resolution: <Vector2>, // to be set by renderer
	 * }
	 */

	UniformsLib.line = {

		linewidth: { value: 1 },
		resolution: { value: new Vector2( 1, 1 ) },
		dashScale: { value: 1 },
		dashSize: { value: 1 },
		gapSize: { value: 1 }, // todo FIX - maybe change to totalSize
		opacity: { value: 1 }

	};

	ShaderLib[ 'line' ] = {

		uniforms: UniformsUtils.merge( [
			UniformsLib.common,
			UniformsLib.fog,
			UniformsLib.line
		] ),

		vertexShader:
			`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

		fragmentShader:
			`
		uniform vec3 diffuse;
		uniform float opacity;

		#ifdef USE_DASH

			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		varying vec2 vUv;

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			if ( abs( vUv.y ) > 1.0 ) {

				float a = vUv.x;
				float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				float len2 = a * a + b * b;

				if ( len2 > 1.0 ) discard;

			}

			vec4 diffuseColor = vec4( diffuse, opacity );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );

			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`
	};




	//

	var RenderableVertex = function () {

		this.position = new Vector3();
		this.positionWorld = new Vector3();
		this.positionScreen = new Vector4();

		this.visible = true;

	};

	RenderableVertex.prototype.copy = function ( vertex ) {

		this.positionWorld.copy( vertex.positionWorld );
		this.positionScreen.copy( vertex.positionScreen );

	};



	class Marker {
	    constructor(scene, map) {
	        this.scene = scene;
	        this.map = map;
	        this.items = [];
	    }

	    

	    remove(modelId) {
	        const item = this._getItem(modelId);
	        if (!item) {
	            return;
	        }

	        document.body.removeChild(item.renderer.domElement);
	        item.model.remove(item.marker);
	        this._removeFromItems(modelId);
	    }

	    clear() {
	        this.items.forEach((e) => {
	            this.remove(e.modelId);
	        });

	        this.items = [];
	    }

	    getMarkers() {
	        return this.items;
	    }


	    _addToItems(item) {
	        this.items.push(item);
	    }

	    _removeFromItems(modelId) {
	        this.items = this.items.filter((e) => {
	            return e.modelId !== modelId;
	        });
	    }

	    _hasMarker(modelId) {
	        return this._getItem(modelId) !== undefined;
	    }

	    _getItem(modelId) {
	        for (let i = 0; i < this.items.length; i++) {
	            if (this.items[i].modelId === modelId) {
	                return this.items[i];
	            }
	        }
	    }
	}


	function Pass() {

		// if set to true, the pass is processed by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
		this.renderToScreen = false;

	}

	Object.assign( Pass.prototype, {

		setSize: function ( /* width, height */ ) {},

		render: function ( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

			console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

		}

	} );

	// Helper for passes that need to fill the viewport with a single quad.

	Pass.FullScreenQuad = ( function () {

		var camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		var geometry = new PlaneBufferGeometry( 2, 2 );

		var FullScreenQuad = function ( material ) {

			this._mesh = new Mesh( geometry, material );

		};

		Object.defineProperty( FullScreenQuad.prototype, 'material', {

			get: function () {

				return this._mesh.material;

			},

			set: function ( value ) {

				this._mesh.material = value;

			}

		} );

		Object.assign( FullScreenQuad.prototype, {

			dispose: function () {

				this._mesh.geometry.dispose();

			},

			render: function ( renderer ) {

				renderer.render( this._mesh, camera );

			}

		} );

		return FullScreenQuad;

	} )();



	var Pass$1 = function () {

		// if set to true, the pass is processed by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
		this.renderToScreen = false;

	};

	Object.assign( Pass$1.prototype, {

		setSize: function ( /* width, height */ ) {},

		render: function ( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

			console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

		}

	} );

	// Helper for passes that need to fill the viewport with a single quad.
	Pass$1.FullScreenQuad = ( function () {

		var camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		var geometry = new PlaneBufferGeometry( 2, 2 );

		var FullScreenQuad = function ( material ) {

			this._mesh = new Mesh( geometry, material );

		};

		Object.defineProperty( FullScreenQuad.prototype, 'material', {

			get: function () {

				return this._mesh.material;

			},

			set: function ( value ) {

				this._mesh.material = value;

			}

		} );

		Object.assign( FullScreenQuad.prototype, {

			dispose: function () {

				this._mesh.geometry.dispose();

			},

			render: function ( renderer ) {

				renderer.render( this._mesh, camera );

			}

		} );

		return FullScreenQuad;

	} )();


	function projectedUnitsPerMeter(latitude) {
	    let c = ThreeboxConstants;
	    return Math.abs(c.WORLD_SIZE / Math.cos(c.DEG2RAD * latitude) / c.EARTH_CIRCUMFERENCE);
	}

	function projectToWorld(coords) {
	    // Spherical mercator forward projection, re-scaling to WORLD_SIZE
	    let c = ThreeboxConstants;
	    var projected = [
	        c.MERCATOR_A * c.DEG2RAD * coords[0] * c.PROJECTION_WORLD_SIZE,
	        c.MERCATOR_A * Math.log(Math.tan(Math.PI * 0.25 + 0.5 * c.DEG2RAD * coords[1])) * c.PROJECTION_WORLD_SIZE
	    ];

	    //z dimension, defaulting to 0 if not provided
	    if (!coords[2]) {
	        projected.push(0);
	    } else {
	        var pixelsPerMeter = projectedUnitsPerMeter(coords[1]);
	        projected.push(coords[2] * pixelsPerMeter);
	    }

	    var result = new Vector3(projected[0], projected[1], projected[2]);

	    return result;
	}

	class Mapbox3DTilesLayer {
	    constructor(params) {
	        if (!params) throw new Error('parameters missing for mapbox 3D tiles layer');

			this.id = params.id;
			this.url = params.url;

                        wallColor = params.colorWall!=null?params.colorWall:wallColor;
                        roofColor = params.colorRoof!=null?params.colorRoof:roofColor;
                        bridgeColor = params.colorBridge!=null?params.colorBridge:bridgeColor;
	        this.styleParams = {};
	        this.projectToMercator = false;
	        this.lights = this.getDefaultLights();

	        this.loadStatus = 0;
	        this.viewProjectionMatrix = null;
	        this.type = 'custom';
	        this.renderingMode = '3d';
	    }

	    getDefaultLights() {
			const hemiLight = new HemisphereLight(0xffffff, 0xbebebe, 1);
	        return [hemiLight];
	    }

		//Wird jedes Mal bei Bewegung angestoßen->rekursiv checkLoad
	    loadVisibleTiles() {
			if (this.tileset && this.tileset.root) 
			{
				this.tileset.root.checkLoad(this.cameraSync.frustum, this.cameraSync.cameraPosition);
			}
	    }

	    onAdd(map, gl) {
	        this.map = map;
	        const fov = 36.8;
	        const aspect = map.getCanvas().width / map.getCanvas().height;
	        const near = 0.000000000001;
	        const far = Infinity;
	        // create perspective camera, parameters reinitialized by CameraSync
	        this.camera = new PerspectiveCamera(fov, aspect, near, far);
	        this.mapQueryRenderedFeatures = map.queryRenderedFeatures.bind(this.map);
	        this.map.queryRenderedFeatures = this.queryRenderedFeatures.bind(this);
	        this.scene = new Scene();
	        this.rootTransform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

			this.lights.forEach((light) => {this.scene.add(light);});

	        this.world = new Group();
	        this.world.name = 'flatMercatorWorld';
	        this.scene.add(this.world);

	        this.renderer = new WebGLRenderer({
	            alpha: true,
	            antialias: true,
	            canvas: map.getCanvas(),
	            context: gl
	        });

	        this.marker = new Marker(this.scene, this.map);

	        /* WIP on composer */
	        let width = window.innerWidth;
	        let height = window.innerHeight;


	        //let renderScene = new RenderPass(this.scene, this.camera);
	        //let bloomPass = new UnrealBloomPass(
	        //  new THREE.Vector2(window.innerWidth, window.innerHeight),
	        //  1.5,
	        //  0.4,
	        //  0.85
	        //);
	        //bloomPass.threshold = 0;
	        //bloomPass.strength = 1.5;
	        //bloomPass.radius = 0;
	        //this.composer.addPass( renderScene );
	        //this.composer.addPass( bloomPass );

	        /* END OF WIP */
	        this.renderer.autoClear = false;

	        this.cameraSync = new CameraSync(this.map, this.camera, this.world);
	        this.cameraSync.updateCallback = () => this.loadVisibleTiles();

	        //raycaster for mouse events
	        this.raycaster = new Raycaster();
	        if (this.url) {
	            this.tileset = new TileSet(() => this.map.triggerRepaint());
	            this.tileset
	                .load(this.url, this.styleParams, this.projectToMercator)
	                .then(() => {
	                    if (this.tileset.root) {
	                        this.world.add(this.tileset.root.totalContent);
	                        this.world.updateMatrixWorld();
	                        this.loadStatus = 1;
	                        this.loadVisibleTiles();
	                    }
	                })
	                .catch((error) => {
	                    console.error(`${error} (${this.url})`);
	                });
	        }
	    }

	    onRemove(map, gl) {
	        // todo: (much) more cleanup?
	        this.map.queryRenderedFeatures = this.mapQueryRenderedFeatures;
	        this.cameraSync.detachCamera();
	        this.cameraSync = null;
	    }

	    //ToDo: currently based on default lights, can be overriden by user, handle differently
	    setHismphereIntensity(intensity) {
	        if(this.lights[0] instanceof HemisphereLight) {
	            const newIntensity = intensity < 0 ? 0.0 : intensity > 1 ? 1.0 : intensity;
	            this.lights[0].intensity = newIntensity;
	        }
	    }

	    queryRenderedFeatures(geometry, options) {
	        let result = this.mapQueryRenderedFeatures(geometry, options);
	        if (!this.map || !this.map.transform) {
	            return result;
	        }
	        if (!(options && options.layers && !options.layers.includes(this.id))) {
	            if (geometry && geometry.x && geometry.y) {
	                var mouse = new Vector2();

	                // scale mouse pixel position to a percentage of the screen's width and height
	                mouse.x = (geometry.x / this.map.transform.width) * 2 - 1;
	                mouse.y = 1 - (geometry.y / this.map.transform.height) * 2;

	                this.raycaster.setFromCamera(mouse, this.camera);

	                // calculate objects intersecting the picking ray
	                let intersects = this.raycaster.intersectObjects(this.world.children, true);
	                if (intersects.length) {
	                    let feature = {
	                        type: 'Feature',
	                        properties: {},
	                        geometry: {},
	                        layer: { id: this.id, type: 'custom 3d' },
	                        source: this.url,
	                        'source-layer': null,
	                        state: {}
	                    };
	                    let propertyIndex;
	                    let intersect = intersects[0];

	                    if (intersect.object.userData.b3dm) {
	                        feature.properties['b3dm'] = intersect.object.userData.b3dm;
	                    }

	                    if (intersect.instanceId) {
	                        let keys = Object.keys(intersect.object.userData);
	                        if (keys.length) {
	                            for (let propertyName of keys) {
	                                feature.properties[propertyName] =
	                                    intersect.object.userData[propertyName][intersect.instanceId];
	                            }
	                        } else {
	                            feature.properties.batchId = intersect.instanceId;
	                        }
	                    } else if (
	                        intersect.object &&
	                        intersect.object.geometry &&
	                        intersect.object.geometry.attributes &&
	                        intersect.object.geometry.attributes._batchid
	                    ) {
	                        let geometry = intersect.object.geometry;
	                        let vertexIdx = intersect.faceIndex;
	                        if (geometry.index) {
	                            // indexed BufferGeometry
	                            vertexIdx = geometry.index.array[intersect.faceIndex * 3];
	                            propertyIndex = geometry.attributes._batchid.data.array[vertexIdx * 7 + 6];
	                        } else {
	                            // un-indexed BufferGeometry
	                            propertyIndex = geometry.attributes._batchid.array[vertexIdx * 3];
	                        }
	                        let keys = Object.keys(intersect.object.userData);
	                        if (keys.length) {
	                            for (let propertyName of keys) {
	                                feature.properties[propertyName] =
	                                    intersect.object.userData[propertyName][propertyIndex];
	                            }
	                        } else {
	                            feature.properties.batchId = propertyIndex;
	                        }
	                    } else {
	                        if (intersect.index != null) {
	                            feature.properties.index = intersect.index;
	                        } else {
	                            feature.properties.name = this.id;
	                        }
	                    }
	                    /* WORK in progress 
	                    if (options.outline != false && (intersect.object !== this.outlinedObject || 
	                      (propertyIndex != null && propertyIndex !== this.outlinePropertyIndex) 
	                        || (propertyIndex == null && intersect.index !== this.outlineIndex))) {
	                      
	                      //WIP
	                      
	                      //this.outlinePass.selectedObjects = [intersect.object];
	                
	                      // update outline
	                      if (this.outlineMesh) {
	                      let parent = this.outlineMesh.parent;
	                      parent.remove(this.outlineMesh);
	                      this.outlineMesh = null;
	                      }
	                      this.outlinePropertyIndex = propertyIndex;
	                      this.outlineIndex = intersect.index;
	                      if (intersect.object instanceof THREE.Mesh) {
	                      this.outlinedObject = intersect.object;
	                      let outlineMaterial = new THREE.MeshBasicMaterial({color: options.outlineColor? options.outlineColor : 0xff0000, wireframe: true});
	                      let outlineMesh;
	                      if (intersect.object && 
	                        intersect.object.geometry && 
	                        intersect.object.geometry.attributes && 
	                        intersect.object.geometry.attributes._batchid) {
	                        // create new geometry from faces that have same _batchid
	                        let geometry = intersect.object.geometry;
	                        if (geometry.index) {
	                        let ip1 = geometry.index.array[intersect.faceIndex*3];
	                        let idx = geometry.attributes._batchid.data.array[ip1*7+6];
	                        let blockFaces = [];
	                        for (let faceIndex = 0; faceIndex < geometry.index.array.length; faceIndex += 3) {
	                          let p1 = geometry.index.array[faceIndex];
	                          if (geometry.attributes._batchid.data.array[p1*7+6] === idx) {
	                          let p2 = geometry.index.array[faceIndex+1];
	                          if (geometry.attributes._batchid.data.array[p2*7+6] === idx) {
	                            let p3 = geometry.index.array[faceIndex+2];
	                            if (geometry.attributes._batchid.data.array[p3*7+6] === idx) {
	                            blockFaces.push(faceIndex);
	                            }
	                          }
	                          }
	                        }  
	                        let highLightGeometry = new THREE.Geometry(); 
	                        for (let vertexCount = 0, face = 0; face < blockFaces.length; face++) {
	                          let faceIndex = blockFaces[face];
	                          let p1 = geometry.index.array[faceIndex];
	                          let p2 = geometry.index.array[faceIndex+1];
	                          let p3 = geometry.index.array[faceIndex+2];
	                          let positions = geometry.attributes.position.data.array;
	                          highLightGeometry.vertices.push(
	                          new THREE.Vector3(positions[p1*7], positions[p1*7+1], positions[p1*7+2]),
	                          new THREE.Vector3(positions[p2*7], positions[p2*7+1], positions[p2*7+2]),
	                          new THREE.Vector3(positions[p3*7], positions[p3*7+1], positions[p3*7+2]),
	                          )
	                          highLightGeometry.faces.push(new THREE.Face3(vertexCount, vertexCount+1, vertexCount+2));
	                          vertexCount += 3;
	                        }
	                        highLightGeometry.computeBoundingSphere();
	                        outlineMesh = new THREE.Mesh(highLightGeometry, outlineMaterial);
	                        } else {
	                        let ip1 = intersect.faceIndex*3;
	                        let idx = geometry.attributes._batchid.array[ip1];
	                        let blockFaces = [];
	                        for (let faceIndex = 0; faceIndex < geometry.attributes._batchid.array.length; faceIndex += 3) {
	                          let p1 = faceIndex;
	                          if (geometry.attributes._batchid.array[p1] === idx) {
	                          let p2 = faceIndex + 1;
	                          if (geometry.attributes._batchid.array[p2] === idx) {
	                            let p3 = faceIndex + 2;
	                            if (geometry.attributes._batchid.array[p3] === idx) {
	                            blockFaces.push(faceIndex);
	                            }
	                          }
	                          }
	                        }
	                        let highLightGeometry = new THREE.Geometry(); 
	                        for (let vertexCount = 0, face = 0; face < blockFaces.length; face++) {
	                          let faceIndex = blockFaces[face] * 3;
	                          let positions = geometry.attributes.position.array;
	                          highLightGeometry.vertices.push(
	                          new THREE.Vector3(positions[faceIndex], positions[faceIndex+1], positions[faceIndex+2]),
	                          new THREE.Vector3(positions[faceIndex+3], positions[faceIndex+4], positions[faceIndex+5]),
	                          new THREE.Vector3(positions[faceIndex+6], positions[faceIndex+7], positions[faceIndex+8]),
	                          )
	                          highLightGeometry.faces.push(new THREE.Face3(vertexCount, vertexCount+1, vertexCount+2));
	                          vertexCount += 3;
	                        }
	                        highLightGeometry.computeBoundingSphere();   
	                        outlineMesh = new THREE.Mesh(highLightGeometry, outlineMaterial);
	                        }
	                      } else {
	                        outlineMesh = new THREE.Mesh(this.outlinedObject.geometry, outlineMaterial);
	                      }
	                      outlineMesh.position.x = this.outlinedObject.position.x+0.1;
	                      outlineMesh.position.y = this.outlinedObject.position.y+0.1;
	                      outlineMesh.position.z = this.outlinedObject.position.z+0.1;
	                      outlineMesh.quaternion.copy(this.outlinedObject.quaternion);
	                      outlineMesh.scale.copy(this.outlinedObject.scale);
	                      outlineMesh.matrix.copy(this.outlinedObject.matrix);
	                      outlineMesh.raycast = () =>{};
	                      outlineMesh.name = "outline";
	                      outlineMesh.wireframe = true;
	                      this.outlinedObject.parent.add(outlineMesh);
	                      this.outlineMesh = outlineMesh;
	                      
	                      }
	                    }
	                    /* END OF work in progress */
	                    result.unshift(feature);
	                    this.map.triggerRepaint();
	                } else {
	                    this.outlinedObject = null;
	                    if (this.outlineMesh) {
	                        let parent = this.outlineMesh.parent;
	                        parent.remove(this.outlineMesh);
	                        this.outlineMesh = null;
	                        this.map.triggerRepaint();
	                    }
	                }
	            }
	        }
	        return result;
	    }

	    _update() {
	        this.renderer.state.reset();
	        //WIP on composer
	        //this.composer.render (this.scene, this.camera);
	        this.renderer.render(this.scene, this.camera);

	        /*if (this.loadStatus == 1) { // first render after root tile is loaded
	        this.loadStatus = 2;
	        let frustum = new THREE.Frustum();
	        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse));
	        if (this.tileset.root) {
	          this.tileset.root.checkLoad(frustum, this.getCameraPosition());
	        }
	        }*/
	    }

	    render(gl, viewProjectionMatrix) {
	        this.renderer.state.reset();
	        this.renderer.render(this.scene, this.camera);
			
			// this.map.triggerRepaint() ---- funktioniert nicht, threedeetile wird nicht aufgerufen
	    }
	}

	exports.Mapbox3DTilesLayer = Mapbox3DTilesLayer;
	exports.projectToWorld = projectToWorld;
	exports.projectedUnitsPerMeter = projectedUnitsPerMeter;
	return exports;
}({}));
