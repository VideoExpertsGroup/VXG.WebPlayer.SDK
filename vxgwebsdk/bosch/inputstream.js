/**
 * @class
 * @classdesc Simulate an java DataInputStream
 * @constructor
 * @desc Creates a new input stream object
 * @param {Array} b - byte array to read from
 */
function InputStream(b) {

    this.data = $.merge([], b);

	/**
	 * @function
	 * @desc Read one byte from the stream
	 * @returns {Number} first byte of the stream (unsigned)
	 */
	this.readByte = function() {
		if(this.available()>=1) {
			var back = this.data[0];
			this.data.splice(0,1);
			return back;
		} else {
			throw "InputStream.readByte: not enough bytes available (available: "+this.available()+", required: 1, data: "+this.data+")";
		}
	};

	/**
	 * @function
	 * @desc Read one byte from the stream
	 * @returns {Number} first byte of the stream (signed)
	 */
	this.readSignedByte = function() {
		if(this.available()>=1) {
			var back = this.readByte();
			if((back & 0x80)!==0) {
				var intMax = Math.pow(2, 8)-1;
				back = (intMax-back+1)*(-1);
			}
			return back;
		} else {
			throw "InputStream.readSignedByte: not enough bytes available (available: "+this.available()+", required: 1, data: "+this.data+")";
		}
	};

	/**
	 * @function
	 * @desc Read a short value from the stream (2 bytes, unsigned)
	 * @returns {Number} short value (2 bytes)
	 */
	this.readShort = function() {
		if(this.available()>=2) {
			var back = (this.data[0]<<8) + this.data[1];
			this.data.splice(0,2);
			return back;
		} else {
			throw "InputStream.readShort: not enough bytes available (available: "+this.available()+", required: 2, data: "+this.data+")";
		}
	};

	/**
	 * @function
	 * @desc Read a short value from the stream (2 bytes, signed)
	 * @returns {Number} short value (2 bytes)
	 */
	this.readSignedShort = function() {
		if(this.available()>=2) {
			var back =this.readShort();
			if((back & 0x8000)!==0) {
				var intMax = Math.pow(2, 16)-1;
				back = (intMax-back+1)*(-1);
			}
			return back;
		} else {
			throw "InputStream.readSignedShort: not enough bytes available (available: "+this.available()+", required: 2, data: "+this.data+")";
		}
	};

	/**
	 * @function
	 * @desc Read a int value from the stream (4 bytes, unsigned)
	 * @returns {Number} int value (4 bytes)
	 */
	this.readInt = function() {
		if(this.available()>=4) {
			var back = this.readSignedInt();
			if((back & 0x80000000)!==0) {
				back = back&0x7FFFFFFF;
				back += 2147483648; //==0x80000000 but > 0
			}
			return back;
		} else {
			throw "InputStream.readInt: not enough bytes available (available: "+this.available()+", required: 4, data: "+this.data+")";
		}
	};

	/**
	 * @function
	 * @desc Read a int value from the stream (4 bytes, signed)
	 * @returns {Number} int value (4 bytes)
	 */
	this.readSignedInt = function() {
		if(this.available()>=4) {
			var back = (this.data[0]<<24) + (this.data[1]<<16) + (this.data[2]<<8) + this.data[3];
			this.data.splice(0,4);
			return back;
		} else {
			throw "InputStream.readSignedInt: not enough bytes available (available: "+this.available()+", required: 4, data: "+this.data+")";
		}
	};

    /**
     * @function
     * @desc Read a number value from the stream with the given length
     * @returns {Number} value
     */
    this.readNumber = function(length, signed) {
        if(this.available()>=length) {
            if(length==1 && signed) return this.readSignedByte();
            else if(length==1) return this.readByte();
            else if(length==2 && signed) return this.readSignedShort();
            else if(length==2) return this.readShort();
            else if(length==4 && signed) return this.readSignedInt();
            else if(length==4) return this.readInt();
            else throw "InputStream.readNumber: length of "+length+" not supported";
        } else {
            throw "InputStream.readNumber: not enough bytes available (available: "+this.available()+", required: "+length+", data: "+this.data+")";
        }
    };

	/**
	 * @function
	 * @desc Read the given number of bytes from the stream
	 * @param {Number} count - number of bytes to read
	 * @returns {Array} bytes
	 */
	this.readBytes = function(count) {
		if(this.available()>=count) {
			var back = this.data.slice(0,count);
			this.data.splice(0, count);
			return back;
		} else {
			throw "InputStream.readBytes: not enough bytes available (available: "+this.available()+", required: "+count+", data: "+this.data+")";
		}
	};

	/**
     * @function
     * @desc Read the given number of bytes from the stream and converts it to a string
     * @param {Number} count - number of characters to read
     * @returns {String} string
     */
    this.readString = function(count) {
        var s = "";
        var bytes = this.readBytes(count);
        for (var i = 0; i < bytes.length; i++) {
            if(bytes[i] != 0) s += String.fromCharCode(bytes[i]);
            else break;
        }
        return s;
    };

    /**
     * @function
     * @desc Read the given number of bytes from the stream and converts it to a utf8-string
     * @param {Number} count - number of characters to read
     * @returns {String} string
     */
    this.readUTF8 = function(count) {
        var bytes = this.readBytes(count);
        return this.utf8ByteArrayToString(bytes);
    };

    /**
     * @function
     * @desc Read the given number of bytes from the stream and converts it to a utf16-string
     * @param {Number} count - number of bytes to read
     * @returns {String} string
     */
    this.readUTF16 = function(count) {
        var s = "";
        var bytes = this.readBytes(count);
        for (var i = 0; i < bytes.length-1; i+=2) {
            var b = (bytes[i]<<8) + bytes[i+1];
            if(b != 0) s += String.fromCharCode(b);
            else break;
        }
        return s;
    };

	/**
	 * @function
	 * @desc Get the available number of bytes
	 * @returns {Number} available number of bytes
	 */
	this.available = function() {
		if(this.data===null || typeof(this.data)==="undefined") return 0;
		else return this.data.length;
	};

	/**
	 * @function
	 * @desc Get the available bytes
	 * @returns {Array} available bytes
	 */
	this.getBytes = function() {
		return this.data;
	};

	this.printData = function() {
		$.dbg.out($.dbg.createByteString(this.data));
	};

    /**
     * Converts a UTF-8 byte array to JavaScript's 16-bit Unicode.
     * @param {Uint8Array|Array<number>} bytes UTF-8 byte array.
     * @return {string} 16-bit Unicode string.
     * @see https://github.com/google/closure-library/blob/e877b1eac410c0d842bcda118689759512e0e26f/closure/goog/crypt/crypt.js
     */
    this.utf8ByteArrayToString = function(bytes) {
        var out = [], pos = 0, c = 0;
        while (pos < bytes.length) {
            var c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            } else if (c1 > 191 && c1 < 224) {
                var c2 = bytes[pos++];
                out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
            } else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                var c4 = bytes[pos++];
                var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
                    0x10000;
                out[c++] = String.fromCharCode(0xD800 + (u >> 10));
                out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
            } else {
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                out[c++] =
                    String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
            }
        }
        return out.join('');
    };
}

/**
 * @class
 * @classdesc Simulate an java DataInputStream, based on a UInt8 typed array
 * @constructor
 * @desc Creates a new input stream object
 * @param {Uint8Array} b - Uint8 byte array to read from
 */
function InputStreamUInt8(b) {

    var curPos = 0;
    this.data = b;

    /**
     * @function
     * @desc Read one byte from the stream
     * @returns {Number} first byte of the stream (unsigned)
     */
    this.readByte = function() {
        if(this.available()>=1) {
            var back = this.data[curPos];
            curPos++;
            return back;
        } else {
            throw "InputStream.readByte: not enough bytes available (available: "+this.available()+", required: 1, data: "+this.data+")";
        }
    };

    /**
     * @function
     * @desc Read one byte from the stream
     * @returns {Number} first byte of the stream (signed)
     */
    this.readSignedByte = function() {
        if(this.available()>=1) {
            var back = this.readByte();
            if((back & 0x80)!==0) {
                var intMax = Math.pow(2, 8)-1;
                back = (intMax-back+1)*(-1);
            }
            return back;
        } else {
            throw "InputStream.readSignedByte: not enough bytes available (available: "+this.available()+", required: 1, data: "+this.data+")";
        }
    };

    /**
     * @function
     * @desc Read a short value from the stream (2 bytes, unsigned)
     * @returns {Number} short value (2 bytes)
     */
    this.readShort = function() {
        if(this.available()>=2) {
            var back = (this.data[curPos]<<8) + this.data[curPos+1];
            curPos += 2;
            return back;
        } else {
            throw "InputStream.readShort: not enough bytes available (available: "+this.available()+", required: 2, data: "+this.data+")";
        }
    };

    /**
     * @function
     * @desc Read a short value from the stream (2 bytes, signed)
     * @returns {Number} short value (2 bytes)
     */
    this.readSignedShort = function() {
        if(this.available()>=2) {
            var back =this.readShort();
            if((back & 0x8000)!==0) {
                var intMax = Math.pow(2, 16)-1;
                back = (intMax-back+1)*(-1);
            }
            return back;
        } else {
            throw "InputStream.readSignedShort: not enough bytes available (available: "+this.available()+", required: 2, data: "+this.data+")";
        }
    };

    /**
     * @function
     * @desc Read a int value from the stream (4 bytes, unsigned)
     * @returns {Number} int value (4 bytes)
     */
    this.readInt = function() {
        if(this.available()>=4) {
            var back = this.readSignedInt();
            if((back & 0x80000000)!==0) {
                back = back&0x7FFFFFFF;
                back += 2147483648; //==0x80000000 but > 0
            }
            return back;
        } else {
            throw "InputStream.readInt: not enough bytes available (available: "+this.available()+", required: 4, data: "+this.data+")";
        }
    };

    /**
     * @function
     * @desc Read a int value from the stream (4 bytes, signed)
     * @returns {Number} int value (4 bytes)
     */
    this.readSignedInt = function() {
        if(this.available()>=4) {
            var back = (this.data[curPos]<<24) + (this.data[curPos+1]<<16) + (this.data[curPos+2]<<8) + this.data[curPos+3];
            curPos += 4;
            return back;
        } else {
            throw "InputStream.readSignedInt: not enough bytes available (available: "+this.available()+", required: 4, data: "+this.data+")";
        }
    };

    /**
     * @function
     * @desc Read a number value from the stream with the given length
     * @returns {Number} value
     */
    this.readNumber = function(length) {
        if(this.available()>=length) {
            if(length==1) return this.readByte();
            else if(length==2) return this.readShort();
            else if(length==4) return this.readInt();
            else throw "InputStream.readNumber: length of "+length+" not supported";
        } else {
            throw "InputStream.readNumber: not enough bytes available (available: "+this.available()+", required: "+length+", data: "+this.data+")";
        }
    };

    /**
     * @function
     * @desc Read the given number of bytes from the stream
     * @param {Number} count - number of bytes to read
     * @returns {Array} bytes
     */
    this.readBytes = function(count) {
        if(this.available()>=count) {
            var back = this.data.subarray(curPos, curPos+count);
            curPos += count;
            return back;
        } else {
            throw "InputStream.readBytes: not enough bytes available (available: "+this.available()+", required: "+count+", data: "+this.data+")";
        }
    };

    /**
     * @function
     * @desc Read the given number of bytes from the stream and converts it to a string
     * @param {Number} count - number of characters to read
     * @returns {String} string
     */
    this.readString = function(count) {
        var s = "";
        var bytes = this.readBytes(count);
        for (var i = 0; i < bytes.length; i++) {
            if(bytes[i] != 0) s += String.fromCharCode(bytes[i]);
            else break;
        }
        return s;
    };

    /**
     * @function
     * @desc Read the given number of bytes from the stream and converts it to a utf16-string
     * @param {Number} count - number of bytes to read
     * @returns {String} string
     */
    this.readUTF16 = function(count) {
        var s = "";
        var bytes = this.readBytes(count);
        for (var i = 0; i < bytes.length-1; i+=2) {
            var b = (bytes[i]<<8) + bytes[i+1];
            if(b != 0) s += String.fromCharCode(b);
            else break;
        }
        return s;
    };

    /**
     * @function
     * @desc Get the available number of bytes
     * @returns {Number} available number of bytes
     */
    this.available = function() {
        if(this.data===null || typeof(this.data)==="undefined") return 0;
        else return this.data.length - curPos;
    };

    /**
     * @function
     * @desc Get the available bytes
     * @returns {Array} available bytes
     */
    this.getBytes = function() {
        return this.data;
    };

    this.getRemainingBytes = function() {
        return this.readBytes(this.available());
    };

    this.printData = function() {
        $.dbg.out($.dbg.createByteString(this.data));
    };
}


/**
 * @class
 * @classdesc Simulate an java DataInputStream for reading single bits
 * @constructor
 * @desc Creates a new BitInputStream object
 * @param {Array} b - byte array to read from
 */
function BitInputStreamUInt8(b) {

    var curBitPos = 0;      // 0..(b.length-1)*8

    this.logTopic = "BitInputStreamUint8";
    this.data = b;

    /**
     * @function
     * @desc Read the given number of bits from the stream
     * @returns {Number} number consisting of the read bits
     */
    this.readBits = function (cnt) {
        if (this.bitsavailable() >= cnt) {
            var curBytePos = Math.floor(curBitPos/8);
            var curBitPosInByte = curBitPos%8;
            var bitsToRemove = ((curBitPosInByte+cnt)%8 == 0) ? 0 : 8 - ((curBitPosInByte+cnt)%8);
            var bytesToRead = Math.ceil((curBitPosInByte+cnt)/8);
            var val = 0;
            for(var i=0; i<bytesToRead; i++) {
                val += this.data[curBytePos+i] << (bytesToRead-1-i)*8;
            }
            val = (val>>bitsToRemove);
            val = val&(Math.pow(2,cnt)-1);
            curBitPos+=cnt;
            //console.log("cnt: "+cnt+", bytesToRead: "+bytesToRead+", curBytePos: "+curBytePos+", curBitPosInByte: "+curBitPosInByte+", bitsToRemove: "+bitsToRemove);
            return val;
        } else {
            throw "InputStream.readBits: not enough bits available (available: " + this.bitsavailable() + ", required: " + cnt + ", data: " + this.data + ")";
        }
    };

    /**
     * @function
     * @desc Alias for readBits
     * @returns {Number} number consisting of the read bits
     */
    this.readUnsignedBits = function (cnt) {
        return this.readBits(cnt);
    };

    /**
     * @function
     * @desc read the given number of bits with sign bit
     * @returns {Number} number consisting of the read bits
     */
    this.readSignedBits = function (cnt) {
        var val = this.readBits(cnt);
        var signbit = Math.pow(2, cnt-1);
        if((val&signbit)!=0) {
            val = -1 * ((~val & (Math.pow(2, cnt-1)-1)) + 1 );
        }
        return val;
    };

    /**
     * @function
     * @desc Get the available number of bits
     * @returns {Number} available number of bits
     */
    this.bitsavailable = function() {
        if(this.data===null || typeof(this.data)==="undefined") return 0;
        else return (this.data.length * 8) - curBitPos;
    };
}

/**
 * @class
 * @classdesc Simulate an java DataOutputStream
 * @constructor
 * @desc Creates a new output stream object
 */
function OutputStream() {

	//negative values not yet supported !

	this.data = [];

	/**
	 * @function
	 * @desc Adds one byte to the stream
	 * @param {Number} b - byte to add
	 */
	this.writeByte = function(b) {
		this.data.push(b&0xff);
	};

	/**
	 * @function
	 * @desc Adds 2 byte to the stream
	 * @param {Number} s - short to add
	 */
	this.writeShort = function(s) {
		s = s&0xFFFF;
		this.writeByte((s&0xFF00)>>8);
		this.writeByte(s&0xFF);
	};

	/**
	 * @function
	 * @desc Adds 4 byte to the stream
	 * @param {Number} i - integer to add
	 */
	this.writeInt = function(i) {
		i = i&0xFFFFFFFF;
		this.writeShort((i&0xFFFF0000)>>16);
		this.writeShort(i&0xFFFF);
	};

    /**
     * @function
     * @desc write a number value to the stream with the given length
     * @returns {Number} value
     */
    this.writeNumber = function(n, length) {
        if(length==1) return this.writeByte(n);
        else if(length==2) return this.writeShort(n);
        else if(length==4) return this.writeInt(n);
        else throw "OutputStream.writeNumber: length of "+length+" not supported";
    };

	/**
	 * @function
	 * @desc Adds a byte array to the stream
	 * @param {Array} b - bytes to add
	 * @param {Number} length - length of array with 0 as values to add
	 */
	this.writeBytes = function(b, length) {
		if (!b) {
			return;
		}
		var i, l = b.length;
		for (i = 0; i < l; i ++) {
			this.writeByte(b[i]);
		}
		if (length && length > l) {
			l = length - l;
			for (i = 0; i < l; i ++) {
				this.writeByte(0);
			}
		}
	};

	/**
	 * @function
	 * @desc Converts a string to a byte array and adds it to the stream
	 * @param {String} s - string to add
	 */
	this.writeString = function(s) {
		s = s || "";
		for(var i=0; i<s.length; i++) {
			this.writeByte(s.charCodeAt(i));
		}
	};

    /**
     * @function
     * @desc Converts a string to a byte array and adds it to the stream
     * @param {String} s - string to add
     */
    this.writeUTF8 = function(s) {
        s = s || "";
        this.writeBytes(this.stringToUtf8ByteArray(s));
    };

    /**
     * @function
     * @desc Converts a string to a byte array (UTF-16) and adds it to the stream
     * @param {String} s - string to add
     */
    this.writeUTF16 = function(s) {
        s = s || "";
        for(var i=0; i<s.length; i++) {
            this.writeShort(s.charCodeAt(i));
        }
    };

	/**
	 * @function
	 * @desc Get the added number of bytes
	 * @returns {Number} added number of bytes
	 */
	this.available = function() {
		if(this.data===null || typeof(this.data)==="undefined") return 0;
		else return this.data.length;
	};

	/**
	 * @function
	 * @desc Get the available bytes
	 * @returns {Array} available bytes
	 */
	this.getBytes = function() {
		return this.data;
	};

    /**
     * @function
     * @desc Get the available bytes as Uint8Array
     * @returns {Uint8Array} available bytes as Uint8Array
     */
    this.getBytesAsUint8 = function() {
        return new Uint8Array(this.data);
    };

    this.clear = function() {
        this.data = [];
    };

	this.printData = function() {
		$.dbg.out($.dbg.createByteString(this.data));
	};

    /**
     * Converts a JS string to a UTF-8 "byte" array.
     * @param {string} str 16-bit unicode string.
     * @return {!Array<number>} UTF-8 byte array.
     * @see https://github.com/google/closure-library/blob/e877b1eac410c0d842bcda118689759512e0e26f/closure/goog/crypt/crypt.js
     */
    this.stringToUtf8ByteArray = function(str) {
        var out = [], p = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            } else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            } else if (
                ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
                ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            } else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    }
}

/**
 * @class
 * @classdesc Simulate an java DataOutputStream, based on a UInt8 typed array
 * @constructor
 * @desc Creates a new output stream object
 */
function OutputStreamUint8() {

    this.logTopic = "OutputStreamUint8";
    this.buffer = new ArrayBuffer();
    this.uint8 = new Uint8Array(this.buffer);


    /**
     * @function
     * @desc Adds one byte to the stream
     * @param {Number} b - byte to add
     */
    this.writeByte = function(b) {
        this.extend(1);
        this.uint8.set([b], this.uint8.length-1);
    };

    /**
     * @function
     * @desc Adds 2 byte to the stream
     * @param {Number} s - short to add
     */
    this.writeShort = function(s) {
        s = s&0xFFFF;
        this.extend(2);
        this.uint8.set([(s&0xFF00)>>8, s&0x00FF], this.uint8.length-2);
    };

    /**
     * @function
     * @desc Adds 4 byte to the stream
     * @param {Number} i - integer to add
     */
    this.writeInt = function(i) {
        i = i&0xFFFFFFFF;
        this.extend(4);
        this.uint8.set([(i&0xFF000000)>>24, (i&0x00FF0000)>>16, (i&0x0000FF00)>>8, i&0x000000FF], this.uint8.length-4);
    };

    /**
     * @function
     * @desc write a number value to the stream with the given length
     * @returns {Number} value
     */
    this.writeNumber = function(n, length) {
        if(length==1) return this.writeByte(n);
        else if(length==2) return this.writeShort(n);
        else if(length==4) return this.writeInt(n);
        else throw "OutputStream.writeNumber: length of "+length+" not supported";
    };

    /**
     * @function
     * @desc Adds a byte array to the stream
     * @param {Array} b - bytes to add
     */
    this.writeBytes = function(b) {
        this.extend(b.length);
        this.uint8.set(b, this.uint8.length- b.length);
    };

    /**
     * @function
     * @desc Converts a string to a byte array and adds it to the stream
     * @param {String} s - string to add
     */
    this.writeString = function(s) {
        s = s || "";
        for(var i=0; i<s.length; i++) {
            this.writeByte(s.charCodeAt(i));
        }
    };

    /**
     * @function
     * @desc Converts a string to a byte array (UTF-16) and adds it to the stream
     * @param {String} s - string to add
     */
    this.writeUTF16 = function(s) {
        s = s || "";
        for(var i=0; i<s.length; i++) {
            this.writeShort(s.charCodeAt(i));
        }
    };

    /**
     * @function
     * @desc Get the added number of bytes
     * @returns {Number} added number of bytes
     */
    this.available = function() {
        if(this.uint8===null || typeof(this.uint8)==="undefined") return 0;
        else return this.uint8.length;
    };

    /**
     * @function
     * @desc Get the available bytes
     * @returns {Array} available bytes
     */
    this.getBytes = function() {
        return this.uint8;
    };

    this.clear = function() {
        this.buffer = new ArrayBuffer();
        this.uint8 = new Uint8Array(this.buffer);
    };

    this.extend = function(cnt) {
        var cur_len = this.buffer.byteLength;
        var new_buf = new ArrayBuffer(cur_len + cnt);
        var new_uint8 = new Uint8Array(new_buf);
        new_uint8.set(this.uint8);
        this.buffer = new_buf;
        this.uint8 = new_uint8;
    };

    this.printData = function() {
        Logger.i(this.logTopic, UInt8ArrayToByteString(this.uint8));
    };

    this.saveToFile = function(filename) {
        var blob = new Blob([this.buffer]);
        if (window.URL && window.URL.createObjectURL) {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', filename);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            throw("DataStream.save: Can't create object URL.");
        }
    };
}

//debug helper
function UInt8ArrayToByteString(a) {
    var strBytes = "";
    for(var i=0; i<a.length; i++) {
        var s = Number(a[i]).toString(16) + " ";
        if(s.length==2) s = "0"+s;
        strBytes += s;
    }
    return strBytes;
}
