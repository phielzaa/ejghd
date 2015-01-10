var Utils;
(function (Utils) {
    var AssetLoader = (function () {
        function AssetLoader(_lang, _aFileData, _ctx, _canvasWidth, _canvasHeight, _showBar) {
            if (typeof _showBar === "undefined") { _showBar = true; }
            this.oAssetData = {
            };
            this.assetsLoaded = 0;
            this.totalAssets = _aFileData.length;
            this.ctx = _ctx;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.showBar = _showBar;
            this.topLeftX = this.canvasWidth / 2 - _canvasWidth / 4;
            this.topLeftY = 210;
            if(this.showBar) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.fillStyle = "#FF592E";
                ctx.moveTo(this.topLeftX, this.topLeftY);
                ctx.lineTo(this.topLeftX + _canvasWidth / 2, this.topLeftY + 0);
                ctx.lineTo(this.topLeftX + _canvasWidth / 2, this.topLeftY + 20);
                ctx.lineTo(this.topLeftX + 0, this.topLeftY + 20);
                ctx.lineTo(this.topLeftX + 0, this.topLeftY + 0);
                ctx.stroke();
            }
            for(var i = 0; i < _aFileData.length; i++) {
                this.loadImage(_aFileData[i]);
            }
        }
        AssetLoader.prototype.loadImage = function (_oData) {
            var _this = this;
            var img = new Image();
            img.onload = function () {
                _this.oAssetData[_oData.id] = {
                };
                _this.oAssetData[_oData.id].img = img;
                _this.oAssetData[_oData.id].oData = {
                };
                var aSpriteSize = _this.getSpriteSize(_oData.file);
                if(aSpriteSize[0] != 0) {
                    _this.oAssetData[_oData.id].oData.spriteWidth = aSpriteSize[0];
                    _this.oAssetData[_oData.id].oData.spriteHeight = aSpriteSize[1];
                } else {
                    _this.oAssetData[_oData.id].oData.spriteWidth = _this.oAssetData[_oData.id].img.width;
                    _this.oAssetData[_oData.id].oData.spriteHeight = _this.oAssetData[_oData.id].img.height;
                }
                if(_oData.oAnims) {
                    _this.oAssetData[_oData.id].oData.oAnims = _oData.oAnims;
                }
                ++_this.assetsLoaded;
                if(_this.showBar) {
                    ctx.fillRect(_this.topLeftX + 2, _this.topLeftY + 2, ((_this.canvasWidth / 2 - 4) / _this.totalAssets) * _this.assetsLoaded, 16);
                }
                _this.checkLoadComplete();
            };
            img.src = _oData.file;
        };
        AssetLoader.prototype.getSpriteSize = function (_file) {
            var aNew = new Array();
            var sizeY = "";
            var sizeX = "";
            var stage = 0;
            var inc = _file.lastIndexOf(".");
            var canCont = true;
            while(canCont) {
                inc--;
                if(stage == 0 && this.isNumber(_file.charAt(inc))) {
                    sizeY = _file.charAt(inc) + sizeY;
                } else if(stage == 0 && sizeY.length > 0 && _file.charAt(inc) == "x") {
                    inc--;
                    stage = 1;
                    sizeX = _file.charAt(inc) + sizeX;
                } else if(stage == 1 && this.isNumber(_file.charAt(inc))) {
                    sizeX = _file.charAt(inc) + sizeX;
                } else if(stage == 1 && sizeX.length > 0 && _file.charAt(inc) == "_") {
                    canCont = false;
                    aNew = [
                        parseInt(sizeX), 
                        parseInt(sizeY)
                    ];
                } else {
                    canCont = false;
                    aNew = [
                        0, 
                        0
                    ];
                }
            }
            return aNew;
        };
        AssetLoader.prototype.isNumber = function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        AssetLoader.prototype.checkLoadComplete = function () {
            if(this.assetsLoaded == this.totalAssets) {
                this.loadedCallback();
            }
        };
        AssetLoader.prototype.onReady = function (_func) {
            this.loadedCallback = _func;
        };
        AssetLoader.prototype.getImg = function (_id) {
            return this.oAssetData[_id].img;
        };
        AssetLoader.prototype.getData = function (_id) {
            return this.oAssetData[_id];
        };
        return AssetLoader;
    })();
    Utils.AssetLoader = AssetLoader;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var AnimSprite = (function () {
        function AnimSprite(_oImgData, _fps, _radius, _animId) {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.radius = 10;
            this.removeMe = false;
            this.frameInc = 0;
            this.animType = "loop";
            this.offsetX = 0;
            this.offsetY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.oImgData = _oImgData;
            this.oAnims = this.oImgData.oData.oAnims;
            this.fps = _fps;
            this.radius = _radius;
            this.animId = _animId;
        }
        AnimSprite.prototype.updateAnimation = function (_delta) {
            this.frameInc += this.fps * _delta;
        };
        AnimSprite.prototype.resetAnim = function () {
            this.frameInc = 0;
        };
        AnimSprite.prototype.setFrame = function (_frameNum) {
            this.fixedFrame = _frameNum;
        };
        AnimSprite.prototype.setAnimType = function (_type, _animId, _reset) {
            if (typeof _reset === "undefined") { _reset = true; }
            this.animId = _animId;
            this.animType = _type;
            if(_reset) {
                this.resetAnim();
            }
            switch(_type) {
                case "loop":
                    break;
                case "once":
                    this.maxIdx = this.oAnims[this.animId].length - 1;
                    break;
            }
        };
        AnimSprite.prototype.render = function (_ctx) {
            if(this.animId != null) {
                var max = this.oAnims[this.animId].length;
                var idx = Math.floor(this.frameInc);
                var frame = this.oAnims[this.animId][idx % max];
                var imgX = (frame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(frame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                if(this.animType == "once") {
                    if(idx > this.maxIdx) {
                        this.fixedFrame = this.oAnims[this.animId][max - 1];
                        this.animId = null;
                        this.animEndedFunc();
                        var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                        var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                    }
                }
            } else {
                var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            }
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, -this.oImgData.oData.spriteWidth / 2 + this.offsetX, -this.oImgData.oData.spriteHeight / 2 + this.offsetY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight);
        };
        return AnimSprite;
    })();
    Utils.AnimSprite = AnimSprite;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var BasicSprite = (function () {
        function BasicSprite(_oImgData, _radius, _frame) {
            if (typeof _frame === "undefined") { _frame = 0; }
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.radius = 10;
            this.removeMe = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.oImgData = _oImgData;
            this.radius = _radius;
            this.setFrame(_frame);
        }
        BasicSprite.prototype.setFrame = function (_frameNum) {
            this.frameNum = _frameNum;
        };
        BasicSprite.prototype.render = function (_ctx) {
            var imgX = (this.frameNum * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
            var imgY = Math.floor(this.frameNum / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, -this.oImgData.oData.spriteWidth / 2 + this.offsetX, -this.oImgData.oData.spriteHeight / 2 + this.offsetY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight);
        };
        return BasicSprite;
    })();
    Utils.BasicSprite = BasicSprite;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var UserInput = (function () {
        function UserInput(_canvas, _isBugBrowser) {
            var _this = this;
            this.canvasX = 0;
            this.canvasY = 0;
            this.canvasScaleX = 1;
            this.canvasScaleY = 1;
            this.prevHitTime = 0;
            this.pauseIsOn = false;
            this.isDown = false;
            this.isDetectingKeys = false;
            this.isBugBrowser = _isBugBrowser;
            _canvas.addEventListener("touchstart", function (e) {
                for(var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitDown(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchend", function (e) {
                for(var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitUp(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchmove", function (e) {
                for(var i = 0; i < _this.aHitAreas.length; i++) {
                    _this.move(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier, true);
                }
            }, false);
            _canvas.addEventListener("mousedown", function (e) {
                _this.isDown = true;
                _this.hitDown(e, e.pageX, e.pageY, 1);
            }, false);
            _canvas.addEventListener("mouseup", function (e) {
                _this.isDown = false;
                _this.hitUp(e, e.pageX, e.pageY, 1);
            }, false);
            _canvas.addEventListener("mousemove", function (e) {
                _this.move(e, e.pageX, e.pageY, 1, _this.isDown);
            }, false);
            this.aHitAreas = new Array();
            this.aKeys = new Array();
        }
        UserInput.prototype.setCanvas = function (_canvasX, _canvasY, _canvasScaleX, _canvasScaleY) {
            this.canvasX = _canvasX;
            this.canvasY = _canvasY;
            this.canvasScaleX = _canvasScaleX;
            this.canvasScaleY = _canvasScaleY;
        };
        UserInput.prototype.hitDown = function (e, _posX, _posY, _identifer) {
            if(this.pauseIsOn) {
                return;
            }
            var curHitTime = new Date().getTime();
            if(curHitTime - this.prevHitTime < 500 && isBugBrowser) {
                return;
            }
            this.prevHitTime = curHitTime;
            e.preventDefault();
            e.stopPropagation();
            _posX = (_posX - this.canvasX) * this.canvasScaleX;
            _posY = (_posY - this.canvasY) * this.canvasScaleY;
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].rect) {
                    if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                        this.aHitAreas[i].aTouchIdentifiers.push(_identifer);
                        this.aHitAreas[i].oData.hasLeft = false;
                        if(!this.aHitAreas[i].oData.isDown) {
                            this.aHitAreas[i].oData.isDown = true;
                            this.aHitAreas[i].oData.x = _posX;
                            this.aHitAreas[i].oData.y = _posY;
                            this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                        }
                        break;
                    }
                } else {
                }
            }
        };
        UserInput.prototype.hitUp = function (e, _posX, _posY, _identifer) {
            if(this.pauseIsOn) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            _posX = (_posX - this.canvasX) * this.canvasScaleX;
            _posY = (_posY - this.canvasY) * this.canvasScaleY;
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].rect) {
                    if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                        for(var j = 0; j < this.aHitAreas[i].aTouchIdentifiers.length; j++) {
                            if(this.aHitAreas[i].aTouchIdentifiers[j] == _identifer) {
                                this.aHitAreas[i].aTouchIdentifiers.splice(j, 1);
                                j -= 1;
                            }
                        }
                        if(this.aHitAreas[i].aTouchIdentifiers.length == 0) {
                            this.aHitAreas[i].oData.isDown = false;
                            if(this.aHitAreas[i].oData.multiTouch) {
                                this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                            }
                        }
                        break;
                    }
                } else {
                }
            }
        };
        UserInput.prototype.move = function (e, _posX, _posY, _identifer, _isDown) {
            if(this.pauseIsOn) {
                return;
            }
            if(_isDown) {
                _posX = (_posX - this.canvasX) * this.canvasScaleX;
                _posY = (_posY - this.canvasY) * this.canvasScaleY;
                for(var i = 0; i < this.aHitAreas.length; i++) {
                    if(this.aHitAreas[i].rect) {
                        if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                            this.aHitAreas[i].oData.hasLeft = false;
                            if(!this.aHitAreas[i].oData.isDown) {
                                this.aHitAreas[i].oData.isDown = true;
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].aTouchIdentifiers.push(_identifer);
                                if(this.aHitAreas[i].oData.multiTouch) {
                                    this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                }
                            }
                            if(this.aHitAreas[i].oData.isDraggable) {
                                this.aHitAreas[i].oData.isBeingDragged = true;
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                this.aHitAreas[i].oData.isBeingDragged = false;
                            }
                        } else if(this.aHitAreas[i].oData.isDown && !this.aHitAreas[i].oData.hasLeft) {
                            for(var j = 0; j < this.aHitAreas[i].aTouchIdentifiers.length; j++) {
                                if(this.aHitAreas[i].aTouchIdentifiers[j] == _identifer) {
                                    this.aHitAreas[i].aTouchIdentifiers.splice(j, 1);
                                    j -= 1;
                                }
                            }
                            if(this.aHitAreas[i].aTouchIdentifiers.length == 0) {
                                this.aHitAreas[i].oData.hasLeft = true;
                                if(this.aHitAreas[i].oData.multiTouch) {
                                    this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                }
                            }
                        }
                    }
                }
            }
        };
        UserInput.prototype.keyDown = function (e) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(e.keyCode == this.aKeys[i].keyCode) {
                    this.aKeys[i].oData.isDown = true;
                    this.aKeys[i].callback(this.aKeys[i].id, this.aKeys[i].oData);
                }
            }
        };
        UserInput.prototype.keyUp = function (e) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(e.keyCode == this.aKeys[i].keyCode) {
                    this.aKeys[i].oData.isDown = false;
                    this.aKeys[i].callback(this.aKeys[i].id, this.aKeys[i].oData);
                }
            }
        };
        UserInput.prototype.addKey = function (_id, _callback, _oCallbackData, _keyCode) {
            var _this = this;
            if(!this.isDetectingKeys) {
                window.addEventListener('keydown', function (e) {
                    _this.keyDown(e);
                }, false);
                window.addEventListener('keyup', function (e) {
                    _this.keyUp(e);
                }, false);
                this.isDetectingKeys = true;
            }
            if(_oCallbackData == null) {
                _oCallbackData = new Object();
            }
            this.aKeys.push({
                id: _id,
                callback: _callback,
                oData: _oCallbackData,
                keyCode: _keyCode
            });
        };
        UserInput.prototype.removeKey = function (_id) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(this.aKeys[i].id == _id) {
                    this.aKeys.splice(i, 1);
                    i -= 1;
                }
            }
        };
        UserInput.prototype.addHitArea = function (_id, _callback, _oCallbackData, _type, _oAreaData, _isUnique) {
            if (typeof _isUnique === "undefined") { _isUnique = false; }
            if(_oCallbackData == null) {
                _oCallbackData = new Object();
            }
            if(_isUnique) {
                this.removeHitArea(_id);
            }
            var aTouchIdentifiers = new Array();
            switch(_type) {
                case "image":
                    var aRect;
                    aRect = new Array(_oAreaData.aPos[0] - (_oAreaData.oImgData.oData.spriteWidth / 2) * _oAreaData.scale, _oAreaData.aPos[1] - (_oAreaData.oImgData.oData.spriteHeight / 2) * _oAreaData.scale, _oAreaData.aPos[0] + (_oAreaData.oImgData.oData.spriteWidth / 2) * _oAreaData.scale, _oAreaData.aPos[1] + (_oAreaData.oImgData.oData.spriteHeight / 2) * _oAreaData.scale);
                    this.aHitAreas.push({
                        id: _id,
                        aTouchIdentifiers: aTouchIdentifiers,
                        callback: _callback,
                        oData: _oCallbackData,
                        rect: true,
                        area: aRect
                    });
                    break;
                case "rect":
                    this.aHitAreas.push({
                        id: _id,
                        aTouchIdentifiers: aTouchIdentifiers,
                        callback: _callback,
                        oData: _oCallbackData,
                        rect: true,
                        area: _oAreaData.aRect
                    });
                    break;
            }
        };
        UserInput.prototype.removeHitArea = function (_id) {
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].id == _id) {
                    this.aHitAreas.splice(i, 1);
                    i -= 1;
                }
            }
        };
        return UserInput;
    })();
    Utils.UserInput = UserInput;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var FpsMeter = (function () {
        function FpsMeter(_canvasHeight) {
            this.updateFreq = 10;
            this.updateInc = 0;
            this.frameAverage = 0;
            this.display = 1;
            this.log = "";
            this.render = function (_ctx) {
                this.frameAverage += this.delta / this.updateFreq;
                if(++this.updateInc >= this.updateFreq) {
                    this.updateInc = 0;
                    this.display = this.frameAverage;
                    this.frameAverage = 0;
                }
                _ctx.textAlign = "left";
                ctx.font = "10px Helvetica";
                _ctx.fillStyle = "#333333";
                _ctx.beginPath();
                _ctx.rect(0, this.canvasHeight - 15, 40, 15);
                _ctx.closePath();
                _ctx.fill();
                _ctx.fillStyle = "#ffffff";
                _ctx.fillText(Math.round(1000 / (this.display * 1000)) + " fps " + this.log, 5, this.canvasHeight - 5);
            };
            this.canvasHeight = _canvasHeight;
        }
        FpsMeter.prototype.update = function (_delta) {
            this.delta = _delta;
        };
        return FpsMeter;
    })();
    Utils.FpsMeter = FpsMeter;    
})(Utils || (Utils = {}));
var Elements;
(function (Elements) {
    var Background = (function () {
        function Background(_oImgData, _canvasWidth, _canvasHeight) {
            this.x = 0;
            this.y = 0;
            this.targY = 0;
            this.incY = 0;
            this.posY = 0;
            this.oImgData = _oImgData;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
        }
        Background.prototype.updateScroll = function (_delta) {
            this.incY += 5 * _delta;
            this.posY -= (this.posY * 8) * _delta;
        };
        Background.prototype.renderScroll = function (_ctx) {
            var segs = 40;
            _ctx.drawImage(this.oImgData.img, 0, 0);
            for(var i = 0; i < segs; i++) {
                _ctx.drawImage(this.oImgData.img, i * (this.canvasWidth / segs), 0, this.canvasWidth / segs, this.canvasHeight, i * (this.canvasWidth / segs), Math.sin(this.incY + i / 5) * 2 - this.posY, this.canvasWidth / segs, this.canvasHeight);
            }
        };
        Background.prototype.render = function (_ctx) {
            _ctx.drawImage(this.oImgData.img, 0, 0);
        };
        return Background;
    })();
    Elements.Background = Background;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Splash = (function () {
        function Splash(_oSplashScreenImgData, _canvasWidth, _canvasHeight) {
            this.inc = 0;
            this.oSplashScreenImgData = _oSplashScreenImgData;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.posY = -this.canvasHeight;
            TweenLite.to(this, .5, {
                posY: 0
            });
        }
        Splash.prototype.render = function (_ctx, _delta) {
            this.inc += 5 * _delta;
            _ctx.drawImage(this.oSplashScreenImgData.img, 0, 0 - this.posY);
        };
        return Splash;
    })();
    Elements.Splash = Splash;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Panel = (function () {
        function Panel(_oPanelsImgData, _oNumbersImgData, _oEyeballImgData, _panelType, _aButs, _canvasWidth, _canvasHeight) {
            this.timer = .3;
            this.endTime = 0;
            this.posY = 0;
            this.numberSpace = 13;
            this.potNumberSpace = 30;
            this.incY = 0;
            this.oPanelsImgData = _oPanelsImgData;
            this.oNumbersImgData = _oNumbersImgData;
            this.oEyeballImgData = _oEyeballImgData;
            this.panelType = _panelType;
            this.aButs = _aButs;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
        }
        Panel.prototype.update = function (_delta) {
            this.incY += 5 * _delta;
        };
        Panel.prototype.startTween1 = function () {
            this.posY = 800;
            TweenLite.to(this, .8, {
                posY: 0,
                ease: "Back.easeOut"
            });
        };
        Panel.prototype.startTween2 = function () {
            this.posY = 800;
            TweenLite.to(this, .5, {
                posY: 0,
                ease: "Quad.easeOut"
            });
        };
        Panel.prototype.startTweenEndLevel = function () {
            this.aStarPos = new Array();
            for(var i = 0; i < this.oScoreData.stars; i++) {
                this.aStarPos.push({
                    posY: -400,
                    scaleY: 2
                });
                TweenLite.to(this.aStarPos[i], 1.5, {
                    posY: 0,
                    scaleY: 1,
                    ease: "Bounce.easeOut",
                    delay: i * .3
                });
            }
            this.posY = 800;
            TweenLite.to(this, .8, {
                posY: 0,
                ease: "Back.easeOut"
            });
        };
        Panel.prototype.render = function (_ctx, _butsOnTop) {
            if (typeof _butsOnTop === "undefined") { _butsOnTop = true; }
            if(_butsOnTop) {
                this.addButs(_ctx);
            }
            switch(this.panelType) {
                case "start":
                    var id = 0;
                    var imgX = (id * this.oPanelsImgData.oData.spriteWidth) % this.oPanelsImgData.img.width;
                    var imgY = Math.floor(id / (this.oPanelsImgData.img.width / this.oPanelsImgData.oData.spriteWidth)) * this.oPanelsImgData.oData.spriteHeight;
                    _ctx.drawImage(this.oPanelsImgData.img, imgX, imgY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight, 0, 0 + this.posY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight);
                    break;
                case "credits":
                    var id = 1;
                    var imgX = (id * this.oPanelsImgData.oData.spriteWidth) % this.oPanelsImgData.img.width;
                    var imgY = Math.floor(id / (this.oPanelsImgData.img.width / this.oPanelsImgData.oData.spriteWidth)) * this.oPanelsImgData.oData.spriteHeight;
                    _ctx.drawImage(this.oPanelsImgData.img, imgX, imgY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight, 0, 0 + this.posY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight);
                    break;
                case "levelSelect":
                    for(var j = 0; j < 12; j++) {
                        var num = j + this.oScoreData.levelButsPage * 12 + 1;
                        for(var i = 0; i < num.toString().length; i++) {
                            id = parseFloat(num.toString().charAt(i));
                            var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                            var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                            _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, this.aButs[j].aPos[0] - 87 + i * this.numberSpace + this.posY, this.aButs[j].aPos[1] - 36, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
                        }
                    }
                    break;
                case "levelComplete":
                    var id = 2;
                    var imgX = (id * this.oPanelsImgData.oData.spriteWidth) % this.oPanelsImgData.img.width;
                    var imgY = Math.floor(id / (this.oPanelsImgData.img.width / this.oPanelsImgData.oData.spriteWidth)) * this.oPanelsImgData.oData.spriteHeight;
                    _ctx.drawImage(this.oPanelsImgData.img, imgX, imgY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight, 0, 0 + this.posY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight);
                    var num = this.oScoreData.levelScore;
                    for(var i = 0; i < num.toString().length; i++) {
                        id = parseFloat(num.toString().charAt(i));
                        var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                        _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 125 + i * this.potNumberSpace - (this.potNumberSpace * num.toString().length) / 2, 145 + this.posY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
                    }
                    var num = this.oScoreData.totalScore;
                    for(var i = 0; i < num.toString().length; i++) {
                        id = parseFloat(num.toString().charAt(i));
                        var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                        _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 660 + i * this.potNumberSpace - (this.potNumberSpace * num.toString().length) / 2, 145 + this.posY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
                    }
                    for(var i = 0; i < this.oScoreData.stars; i++) {
                        id = 0;
                        var imgX = (id * this.oEyeballImgData.oData.spriteWidth) % this.oEyeballImgData.img.width;
                        var imgY = Math.floor(id / (this.oEyeballImgData.img.width / this.oEyeballImgData.oData.spriteWidth)) * this.oEyeballImgData.oData.spriteHeight;
                        _ctx.drawImage(this.oEyeballImgData.img, imgX, imgY, this.oEyeballImgData.oData.spriteWidth, this.oEyeballImgData.oData.spriteHeight, 234 + i * 80, 110 + this.aStarPos[i].posY, this.oEyeballImgData.oData.spriteWidth, this.oEyeballImgData.oData.spriteHeight * this.aStarPos[i].scaleY);
                    }
                    break;
                case "roachComplete":
                    var id = 3;
                    var imgX = (id * this.oPanelsImgData.oData.spriteWidth) % this.oPanelsImgData.img.width;
                    var imgY = Math.floor(id / (this.oPanelsImgData.img.width / this.oPanelsImgData.oData.spriteWidth)) * this.oPanelsImgData.oData.spriteHeight;
                    _ctx.drawImage(this.oPanelsImgData.img, imgX, imgY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight, 0, 0 + this.posY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight);
                    var num = this.oScoreData.levelScore;
                    for(var i = 0; i < num.toString().length; i++) {
                        id = parseFloat(num.toString().charAt(i));
                        var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                        _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 125 + i * this.potNumberSpace - (this.potNumberSpace * num.toString().length) / 2, 145 + this.posY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
                    }
                    var num = this.oScoreData.totalScore;
                    for(var i = 0; i < num.toString().length; i++) {
                        id = parseFloat(num.toString().charAt(i));
                        var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                        _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 660 + i * this.potNumberSpace - (this.potNumberSpace * num.toString().length) / 2, 145 + this.posY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
                    }
                    id = 1;
                    var imgX = (id * this.oEyeballImgData.oData.spriteWidth) % this.oEyeballImgData.img.width;
                    var imgY = Math.floor(id / (this.oEyeballImgData.img.width / this.oEyeballImgData.oData.spriteWidth)) * this.oEyeballImgData.oData.spriteHeight;
                    _ctx.drawImage(this.oEyeballImgData.img, imgX, imgY, this.oEyeballImgData.oData.spriteWidth, this.oEyeballImgData.oData.spriteHeight, this.canvasWidth / 2 - this.oEyeballImgData.oData.spriteWidth / 2, 100 + this.aStarPos[0].posY, this.oEyeballImgData.oData.spriteWidth, this.oEyeballImgData.oData.spriteHeight * this.aStarPos[0].scaleY);
                    break;
                case "tutorial0":
                case "tutorial1":
                case "tutorial2":
                case "tutorial3":
                case "tutorial4":
                    var id = parseFloat(this.panelType.charAt(this.panelType.length - 1)) + 5;
                    var imgX = (id * this.oPanelsImgData.oData.spriteWidth) % this.oPanelsImgData.img.width;
                    var imgY = Math.floor(id / (this.oPanelsImgData.img.width / this.oPanelsImgData.oData.spriteWidth)) * this.oPanelsImgData.oData.spriteHeight;
                    _ctx.drawImage(this.oPanelsImgData.img, imgX, imgY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight, 0, 0 + this.posY, this.oPanelsImgData.oData.spriteWidth, this.oPanelsImgData.oData.spriteHeight);
                    break;
                case "pause":
                    _ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                    _ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                    break;
            }
            if(!_butsOnTop) {
                this.addButs(_ctx);
            }
        };
        Panel.prototype.addButs = function (_ctx) {
            for(var i = 0; i < this.aButs.length; i++) {
                var offsetPosY = this.posY;
                var floatY = 0;
                if(this.incY != 0) {
                    floatY = Math.sin(this.incY + i * 45) * 3;
                }
                if(i % 2 == 0) {
                }
                var id = this.aButs[i].frame;
                var imgX = (id * this.aButs[i].oImgData.oData.spriteWidth) % this.aButs[i].oImgData.img.width;
                var imgY = Math.floor(id / (this.aButs[i].oImgData.img.width / this.aButs[i].oImgData.oData.spriteWidth)) * this.aButs[i].oImgData.oData.spriteHeight;
                _ctx.drawImage(this.aButs[i].oImgData.img, imgX, imgY, this.aButs[i].oImgData.oData.spriteWidth, this.aButs[i].oImgData.oData.spriteHeight, this.aButs[i].aPos[0] - this.aButs[i].oImgData.oData.spriteWidth / 2 + offsetPosY, this.aButs[i].aPos[1] - this.aButs[i].oImgData.oData.spriteHeight / 2 - floatY, this.aButs[i].oImgData.oData.spriteWidth * this.aButs[i].scale, this.aButs[i].oImgData.oData.spriteHeight * this.aButs[i].scale);
            }
        };
        return Panel;
    })();
    Elements.Panel = Panel;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Hud = (function () {
        function Hud(_oHudImgData, _oNumbersImgData, _canvasWidth, _canvasHeight, _score, _levelNum) {
            this.x = 0;
            this.y = 0;
            this.score = 0;
            this.letterSpace = 13;
            this.oHudImgData = _oHudImgData;
            this.oNumbersImgData = _oNumbersImgData;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.levelNum = _levelNum + 1;
            this.score = _score;
        }
        Hud.prototype.update = function (_trackX, _trackY, _delta) {
            this.x = _trackX;
            this.y = _trackY;
        };
        Hud.prototype.render = function (_ctx) {
            _ctx.drawImage(this.oHudImgData.img, 0, 0);
            for(var i = 0; i < this.score.toString().length; i++) {
                var id = parseFloat(this.score.toString().charAt(i));
                var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 545 + i * this.letterSpace, 49 + this.y, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
            }
            for(var i = 0; i < this.levelNum.toString().length; i++) {
                var id = parseFloat(this.levelNum.toString().charAt(i));
                var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 255 + i * this.letterSpace, 49 + this.y, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
            }
        };
        Hud.prototype.updateScore = function (_bonusScore, _score) {
            this.score = _score;
        };
        return Hud;
    })();
    Elements.Hud = Hud;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Table = (function () {
        function Table(_oLevelImgData, _canvasWidth, _canvasHeight) {
            this.radian = Math.PI / 180;
            this.oLevelImgData = _oLevelImgData;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
        }
        Table.prototype.update = function (_trackX, _trackY, _delta) {
            this.x = _trackX;
            this.y = _trackY;
        };
        Table.prototype.render = function (_ctx) {
            _ctx.drawImage(this.oLevelImgData.img, -this.x, -this.y, this.canvasWidth, this.canvasHeight, 0, 0, this.canvasWidth, this.canvasHeight);
        };
        return Table;
    })();
    Elements.Table = Table;    
})(Elements || (Elements = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Elements;
(function (Elements) {
    var Ball = (function (_super) {
        __extends(Ball, _super);
        function Ball(_oBallImgData, _oNumbersImgData, _oData, _ballCallback, _canvasWidth, _canvasHeight) {
                _super.call(this, _oBallImgData, 24, 26, _oData.type + "Waiting");
            this.radian = Math.PI / 180;
            this.angle = 0;
            this.inc = 0;
            this.ballRadius = 14;
            this.vx = 0;
            this.vy = 0;
            this.m = 1;
            this.f = 1;
            this.b = 1;
            this.oNumbersImgData = _oNumbersImgData;
            this.oData = _oData;
            this.ballCallback = _ballCallback;
            this.trackX = this.startX = this.oData.x;
            this.trackY = this.startY = this.oData.y;
            this.p0 = {
                x: this.trackX,
                y: this.trackY
            };
            this.p1 = {
                x: this.trackX,
                y: this.trackY
            };
            this.offsetY = -23;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.renderFunc = this.renderBall;
            this.changeState("waiting");
        }
        Ball.prototype.changeState = function (_newState, _oData) {
            if (typeof _oData === "undefined") { _oData = null; }
            switch(_newState) {
                case "reset":
                    this.fps = 24;
                    this.state = "reset";
                    this.updateFunc = this.updateWaiting;
                    this.renderFunc = this.renderBall;
                    this.removeMe = false;
                    this.trackX = _oData.x;
                    this.trackY = _oData.y;
                    this.x = this.trackX;
                    this.y = this.trackY - 40;
                    this.p0 = {
                        x: this.trackX,
                        y: this.trackY
                    };
                    this.p1 = {
                        x: this.trackX,
                        y: this.trackY
                    };
                    this.scaleX = this.scaleY = 1;
                    break;
                case "waiting":
                    this.state = "waiting";
                    this.updateFunc = this.updateWaiting;
                    break;
                case "indicating":
                    this.state = "indicating";
                    this.setAnimType("loop", this.oData.type + "Waiting");
                    break;
                case "aiming":
                    this.state = "aiming";
                    this.updateFunc = this.updateWaiting;
                    this.setAnimType("loop", this.oData.type + "Moving");
                    break;
                case "moving":
                    this.state = "moving";
                    this.vx = (_oData.power) / 13 * Math.cos(_oData.angle);
                    this.vy = (_oData.power) / 13 * Math.sin(_oData.angle);
                    this.vz = 1;
                    this.dec = 1;
                    this.setAnimType("loop", this.oData.type + "Moving");
                    this.p0 = {
                        x: this.trackX,
                        y: this.trackY
                    };
                    this.p1 = {
                        x: this.trackX,
                        y: this.trackY
                    };
                    this.updateFunc = this.updateMoving;
                    break;
                case "rebound":
                    this.state = "moving";
                    this.vz = 1;
                    this.dec = 1;
                    this.setAnimType("loop", this.oData.type + "Moving");
                    this.p0 = {
                        x: this.trackX,
                        y: this.trackY
                    };
                    this.p1 = {
                        x: this.trackX,
                        y: this.trackY
                    };
                    this.updateFunc = this.updateMoving;
                    break;
                case "holed":
                    if(this.oData.type != "cueBall") {
                        this.oData.score = _oData.score;
                    } else {
                        this.oData.score = -50;
                    }
                    this.state = "holed";
                    this.trackX = _oData.x;
                    this.trackY = _oData.y;
                    this.fps = 15;
                    this.setAnimType("once", "splash");
                    this.animEndedFunc = function () {
                        this.ballHoled();
                    };
                    this.updateFunc = this.updateWaiting;
                    this.renderFunc = this.renderHoling;
                    break;
                case "scoring1":
                    this.state = "holed";
                    this.scaleX = this.scaleY = 1;
                    this.scoreX = this.x;
                    this.scoreY = this.y - this.oNumbersImgData.oData.spriteHeight / 2;
                    this.x = this.y = 0;
                    this.scoreScale = .5;
                    this.tween = TweenLite.to(this, 1, {
                        scoreY: this.scoreY - 5,
                        scoreScale: 1,
                        ease: "Back.easeOut",
                        onComplete: this.scoreEnded1,
                        onCompleteParams: [
                            this
                        ]
                    });
                    this.updateFunc = this.updateScoring;
                    this.renderFunc = this.renderScoring;
                    if(this.oData.type != "cueBall") {
                        playSound("zombie" + Math.ceil(Math.random() * 5));
                    } else {
                        playSound("zombie" + Math.ceil(Math.random() * 5));
                    }
                    break;
                case "scoring2":
                    this.state = "holed";
                    this.scoreScale = 1;
                    this.tween = TweenLite.to(this, .5, {
                        scoreX: this.canvasWidth + 100,
                        scoreScale: 2,
                        ease: "Back.easeIn",
                        onComplete: this.scoreEnded2,
                        onCompleteParams: [
                            this
                        ]
                    });
                    break;
            }
        };
        Ball.prototype.moveEnded = function (_scope) {
            _scope.changeState("waiting");
            _scope.ballCallback("moveEnded");
        };
        Ball.prototype.ballHoled = function (_scope) {
            if (typeof _scope === "undefined") { _scope = this; }
            _scope.changeState("scoring1");
            _scope.ballCallback("moveEnded");
        };
        Ball.prototype.scoreEnded1 = function (_scope) {
            _scope.changeState("scoring2");
        };
        Ball.prototype.scoreEnded2 = function (_scope) {
            _scope.removeMe = true;
            _scope.ballCallback("holeEnded");
        };
        Ball.prototype.hitRoach = function () {
            var hyp = Math.sqrt((this.vx * this.vx) + (this.vy * this.vy));
            var rot = Math.atan2(this.vy, this.vx) + Math.random() * 1 - .5;
            this.vx = hyp * Math.cos(rot);
            this.vy = hyp * Math.sin(rot);
        };
        Ball.prototype.update = function (_trackX, _trackY, _delta) {
            this.updateFunc(_trackX, _trackY, _delta);
        };
        Ball.prototype.updateMoving = function (_trackX, _trackY, _delta) {
            _super.prototype.updateAnimation.call(this, _delta);
            this.vx *= .98;
            this.vy *= .98;
            if(Math.abs(this.vx) < .05 && Math.abs(this.vy) < .05) {
                this.moveEnded(this);
            }
            this.x = this.trackX + _trackX;
            this.y = this.trackY + _trackY;
        };
        Ball.prototype.updateScoring = function (_trackX, _trackY, _delta) {
        };
        Ball.prototype.updateWaiting = function (_trackX, _trackY, _delta) {
            _super.prototype.updateAnimation.call(this, _delta);
            this.x = this.trackX + _trackX;
            this.y = this.trackY + _trackY;
        };
        Ball.prototype.render = function (_ctx) {
            this.renderFunc(_ctx);
        };
        Ball.prototype.renderBall = function (_ctx) {
            _super.prototype.render.call(this, _ctx);
        };
        Ball.prototype.renderHoling = function (_ctx) {
            _super.prototype.render.call(this, _ctx);
        };
        Ball.prototype.renderScoring = function (_ctx) {
            var num = this.oData.score;
            for(var i = 0; i < num.toString().length; i++) {
                var id = parseFloat(num.toString().charAt(i));
                if(isNaN(id)) {
                    id = 10;
                }
                var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, this.scoreX + i * 30 - (30 * num.toString().length) / 2 - 10, this.scoreY, this.oNumbersImgData.oData.spriteWidth * this.scoreScale, this.oNumbersImgData.oData.spriteHeight / this.scoreScale);
            }
        };
        return Ball;
    })(Utils.AnimSprite);
    Elements.Ball = Ball;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Arrow = (function () {
        function Arrow(_oArrowImgData, _oCueImgData, _canvasWidth, _canvasHeight) {
            this.x = 0;
            this.y = 0;
            this.scaleX = 0;
            this.scaleY = 1;
            this.alpha = 1;
            this.maxLength = 100;
            this.oArrowImgData = _oArrowImgData;
            this.oCueImgData = _oCueImgData;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.renderFunc = this.renderAim;
        }
        Arrow.prototype.takeShot = function (_cueBall) {
            this.renderFunc = this.renderShot;
            this.shotHyp = this.hyp;
            this.shotRot = this.rotation;
            this.tween = TweenLite.to(this, .15, {
                shotHyp: 0,
                ease: "Quad.easeIn",
                onComplete: this.shotEnded,
                onCompleteParams: [
                    this, 
                    _cueBall
                ]
            });
        };
        Arrow.prototype.shotEnded = function (_scope, _cueBall) {
            _cueBall.changeState("moving", {
                power: _scope.hyp,
                angle: _scope.shotRot
            });
        };
        Arrow.prototype.update = function (_ballPosX, _ballPosY, _posX, _posY, _delta) {
            this.x = _ballPosX;
            this.y = _ballPosY;
            this.lengthX = this.x - _posX;
            this.lengthY = this.y - _posY;
            this.hyp = Math.min((Math.sqrt((this.lengthX * this.lengthX) + (this.lengthY * this.lengthY))), this.maxLength);
            this.scaleX = Math.min(this.hyp / this.maxLength, 1);
            this.rotation = Math.atan2(this.lengthY, this.lengthX);
        };
        Arrow.prototype.render = function (_ctx) {
            this.renderFunc(_ctx);
        };
        Arrow.prototype.renderAim = function (_ctx) {
            if(this.scaleX < .1) {
                return;
            }
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            _ctx.scale(this.scaleX * 2.5, this.scaleY);
            var imgX = (0 * this.oArrowImgData.oData.spriteWidth) % this.oArrowImgData.img.width;
            var imgY = Math.floor(0 / (this.oArrowImgData.img.width / this.oArrowImgData.oData.spriteWidth)) * this.oArrowImgData.oData.spriteHeight;
            _ctx.drawImage(this.oArrowImgData.img, imgX, imgY, this.oArrowImgData.oData.spriteWidth, this.oArrowImgData.oData.spriteHeight, 0, -this.oArrowImgData.oData.spriteHeight / 2, this.oArrowImgData.oData.spriteWidth, this.oArrowImgData.oData.spriteHeight);
            _ctx.restore();
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.globalAlpha = this.alpha;
            _ctx.rotate(this.rotation);
            var imgX = (1 * this.oArrowImgData.oData.spriteWidth) % this.oArrowImgData.img.width;
            var imgY = Math.floor(1 / (this.oArrowImgData.img.width / this.oArrowImgData.oData.spriteWidth)) * this.oArrowImgData.oData.spriteHeight;
            _ctx.drawImage(this.oArrowImgData.img, imgX, imgY, this.oArrowImgData.oData.spriteWidth, this.oArrowImgData.oData.spriteHeight, -this.hyp - 13.6, -this.oArrowImgData.oData.spriteHeight / 2, this.oArrowImgData.oData.spriteWidth * this.scaleX, this.oArrowImgData.oData.spriteHeight);
            _ctx.restore();
            _ctx.save();
            _ctx.globalAlpha = this.alpha;
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            var imgX = (1 * this.oArrowImgData.oData.spriteWidth) % this.oArrowImgData.img.width;
            var imgY = Math.floor(1 / (this.oArrowImgData.img.width / this.oArrowImgData.oData.spriteWidth)) * this.oArrowImgData.oData.spriteHeight;
            _ctx.drawImage(this.oCueImgData.img, 0, 0, this.oCueImgData.oData.spriteWidth, this.oCueImgData.oData.spriteHeight, -this.hyp - this.oCueImgData.oData.spriteWidth - 5, -this.oCueImgData.oData.spriteHeight / 2 + 5, this.oCueImgData.oData.spriteWidth, this.oCueImgData.oData.spriteHeight);
            _ctx.restore();
        };
        Arrow.prototype.renderShot = function (_ctx) {
            if(this.shotHyp == 0) {
                return;
            }
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            _ctx.drawImage(this.oCueImgData.img, 0, 0, this.oCueImgData.oData.spriteWidth, this.oCueImgData.oData.spriteHeight, -this.shotHyp - this.oCueImgData.oData.spriteWidth - 5, -this.oCueImgData.oData.spriteHeight / 2, this.oCueImgData.oData.spriteWidth, this.oCueImgData.oData.spriteHeight);
            _ctx.restore();
        };
        return Arrow;
    })();
    Elements.Arrow = Arrow;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Roach = (function (_super) {
        __extends(Roach, _super);
        function Roach(_oRoachImgData, _oNumbersImgData, _ballCallback, _canvasWidth, _canvasHeight) {
                _super.call(this, _oRoachImgData, 22, 20, "running");
            this.canHit = true;
            this.oNumbersImgData = _oNumbersImgData;
            this.ballCallback = _ballCallback;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.reset();
            this.frameInc = Math.ceil(Math.random() * 100);
            this.animEndedFunc = this.showScore;
        }
        Roach.prototype.reset = function () {
            this.trackX = Math.random() * 550 + 130;
            this.trackY = Math.random() * 247 + 120;
            this.scaleX = this.scaleY = 0;
            this.setAnimType("loop", "running");
            TweenLite.to(this, .5, {
                scaleX: 1,
                scaleY: 1,
                ease: "Quad.easeOut"
            });
            this.removeMe = false;
            this.canHit = true;
            this.setPos();
        };
        Roach.prototype.setPos = function (_this) {
            if (typeof _this === "undefined") { _this = this; }
            var newX = Math.random() * 550 + 130;
            var newY = Math.random() * 247 + 120;
            _this.tween = TweenLite.to(_this, Math.random() * 2 + 2, {
                trackX: newX,
                trackY: newY,
                ease: "Quad.easeInOut",
                onComplete: _this.setPos,
                onCompleteParams: [
                    _this
                ]
            });
            _this.rotation = Math.atan2(newY - _this.trackY, newX - _this.trackX);
            this.updateFunc = this.updateMoving;
            this.renderFunc = this.renderMoving;
        };
        Roach.prototype.hit = function () {
            this.tween.kill();
            this.canHit = false;
            this.setAnimType("once", "explode");
            this.ballCallback("hitRoach", {
                roach: this
            });
        };
        Roach.prototype.showScore = function () {
            this.scoreScale = .5;
            this.y -= 75;
            this.tween = TweenLite.to(this, 1, {
                y: this.y - 5,
                scoreScale: 1,
                ease: "Back.easeOut",
                onComplete: this.scoreEnded1,
                onCompleteParams: [
                    this
                ]
            });
            this.rotation = 0;
            this.updateFunc = this.updateScoring;
            this.renderFunc = this.renderScoring;
        };
        Roach.prototype.scoreEnded1 = function (_this) {
            if (typeof _this === "undefined") { _this = this; }
            _this.scoreScale = 1;
            _this.tween = TweenLite.to(_this, .5, {
                x: _this.canvasWidth + 100,
                scoreScale: 2,
                ease: "Back.easeIn",
                onComplete: _this.scoreEnded2,
                onCompleteParams: [
                    _this
                ]
            });
        };
        Roach.prototype.scoreEnded2 = function (_this) {
            _this.removeMe = true;
        };
        Roach.prototype.update = function (_trackX, _trackY, _delta) {
            this.updateFunc(_trackX, _trackY, _delta);
        };
        Roach.prototype.updateMoving = function (_trackX, _trackY, _delta) {
            _super.prototype.updateAnimation.call(this, _delta);
            this.x = this.trackX + _trackX;
            this.y = this.trackY + _trackY;
        };
        Roach.prototype.updateScoring = function (_trackX, _trackY, _delta) {
        };
        Roach.prototype.render = function (_ctx) {
            this.renderFunc(_ctx);
        };
        Roach.prototype.renderMoving = function (_ctx) {
            _super.prototype.render.call(this, _ctx);
        };
        Roach.prototype.renderScoring = function (_ctx) {
            var num = this.roachScore;
            for(var i = 0; i < num.toString().length; i++) {
                var id = parseFloat(num.toString().charAt(i));
                var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                _ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 0 + i * 30 - (30 * num.toString().length) / 2 - 10, 0, this.oNumbersImgData.oData.spriteWidth * this.scoreScale, this.oNumbersImgData.oData.spriteHeight / this.scoreScale);
            }
        };
        return Roach;
    })(Utils.AnimSprite);
    Elements.Roach = Roach;    
})(Elements || (Elements = {}));
var Utils;
(function (Utils) {
    var Physics2D = (function () {
        function Physics2D(_aLines, _aBalls) {
            this.aLines = new Array();
            this.aBalls = new Array();
            this.aLines = _aLines;
            this.aBalls = _aBalls;
            for(var i = 0; i < this.aLines.length; i++) {
                this.updateVector(this.aLines[i], null, true);
            }
        }
        Physics2D.prototype.drawAll = function (_delta) {
            for(var i = 0; i < this.aBalls.length; i++) {
                if(this.aBalls[i].state != "moving") {
                    continue;
                }
                var v = this.aBalls[i];
                v.trackX = v.p1.x;
                v.trackY = v.p1.y;
                v.p0 = v.p1;
                this.updateVector(v, _delta);
            }
        };
        Physics2D.prototype.update = function (_delta) {
            var i;
            for(i = 0; i < this.aBalls.length; i++) {
                var ob = this.aBalls[i];
                if(ob.state != "moving") {
                    continue;
                }
                this.updateVector(ob, _delta);
                for(var k = 0; k < this.aLines.length; k++) {
                    this.fi = this.findIntersection(ob, this.aLines[k]);
                    this.updateVector(this.fi, _delta, false);
                    var pen2 = ob.radius - this.fi.len;
                    if(pen2 >= 0) {
                        playSound("thud" + Math.ceil(Math.random() * 5));
                        ob.p1.x += this.fi.dx * pen2;
                        ob.p1.y += this.fi.dy * pen2;
                        var vbounce = {
                            dx: this.fi.lx,
                            dy: this.fi.ly,
                            lx: this.fi.dx,
                            ly: this.fi.dy,
                            b: 1,
                            f: 1
                        };
                        var vb = this.bounce(ob, vbounce);
                        ob.vx = vb.vx;
                        ob.vy = vb.vy;
                    }
                }
                for(var j = 0; j < this.aBalls.length; j++) {
                    if(i == j || this.aBalls[j].state == "holed") {
                        continue;
                    }
                    var ob2 = this.aBalls[j];
                    this.vc = {
                    };
                    this.vc.p0 = ob.p0;
                    this.vc.p1 = ob2.p0;
                    this.updateVector(this.vc, _delta, true);
                    var totalRadius = ob.ballRadius + ob2.ballRadius;
                    var pen = totalRadius - this.vc.len;
                    if(pen >= 0) {
                        ob.p1.x -= this.vc.dx * pen;
                        ob.p1.y -= this.vc.dy * pen;
                        var newv = this.bounceBalls(ob, ob2, this.vc);
                        ob.vx = newv.vx1;
                        ob.vy = newv.vy1;
                        ob2.vx = newv.vx2;
                        ob2.vy = newv.vy2;
                        ob.changeState("rebound");
                        ob2.changeState("rebound");
                        playSound("ballHit" + Math.ceil(Math.random() * 3));
                    } else if(pen >= -50) {
                        this.v3 = new Object();
                        this.v3.p0 = ob.p0;
                        this.v3.p1 = {
                            x: 0,
                            y: 0
                        };
                        this.v3.vx = ob.vx - ob2.vx;
                        this.v3.vy = ob.vy - ob2.vy;
                        this.updateVector(this.v3, _delta);
                        var vp = this.projectVector(this.vc, this.v3.dx, this.v3.dy);
                        this.vn = {
                        };
                        var p2 = {
                            x: ob.p0.x + vp.vx,
                            y: ob.p0.y + vp.vy
                        };
                        this.vn.p0 = p2;
                        this.vn.p1 = ob2.p0;
                        this.updateVector(this.vn, _delta, true);
                        var diff = totalRadius - this.vn.len;
                        if(diff > 0) {
                            var moveBack = Math.sqrt(totalRadius * totalRadius - this.vn.len * this.vn.len);
                            this.p3 = {
                                x: this.vn.p0.x - moveBack * this.v3.dx,
                                y: this.vn.p0.y - moveBack * this.v3.dy
                            };
                            this.v4 = {
                                p0: ob.p0,
                                p1: this.p3
                            };
                            this.updateVector(this.v4, _delta, true);
                            if(this.v4.len <= this.v3.len && this.dotP(this.v4, ob) > 0) {
                                var t = this.v4.len / this.v3.len;
                                ob.p1 = {
                                    x: ob.p0.x + t * ob.vx,
                                    y: ob.p0.y + t * ob.vy
                                };
                                ob2.p1 = {
                                    x: ob2.p0.x + t * ob2.vx,
                                    y: ob2.p0.y + t * ob2.vy
                                };
                                this.vc = {
                                    p0: ob.p1,
                                    p1: ob2.p1
                                };
                                this.updateVector(this.vc, _delta, true);
                                newv = this.bounceBalls(ob, ob2, this.vc);
                                ob.vx = newv.vx1;
                                ob.vy = newv.vy1;
                                ob2.vx = newv.vx2;
                                ob2.vy = newv.vy2;
                                this.makeVector(ob2);
                                this.makeVector(ob);
                                ob.changeState("rebound");
                                ob2.changeState("rebound");
                                playSound("ballHit" + Math.ceil(Math.random() * 3));
                            }
                        }
                    }
                }
            }
            this.drawAll(_delta);
        };
        Physics2D.prototype.updateVector = function (v, _delta, frompoints) {
            if (typeof frompoints === "undefined") { frompoints = false; }
            _delta = 0.0167;
            if(frompoints == true) {
                v.vx = v.p1.x - v.p0.x;
                v.vy = v.p1.y - v.p0.y;
            } else {
                v.p1.x = v.p0.x + (v.vx * 60) * _delta;
                v.p1.y = v.p0.y + (v.vy * 60) * _delta;
            }
            this.makeVector(v);
        };
        Physics2D.prototype.makeVector = function (v) {
            v.len = Math.sqrt(v.vx * v.vx + v.vy * v.vy);
            if(v.len > 0) {
                v.dx = v.vx / v.len;
                v.dy = v.vy / v.len;
            } else {
                v.dx = 0;
                v.dy = 0;
            }
            v.rx = -v.dy;
            v.ry = v.dx;
            v.lx = v.dy;
            v.ly = -v.dx;
        };
        Physics2D.prototype.dotP = function (v1, v2) {
            var dp = v1.vx * v2.vx + v1.vy * v2.vy;
            return dp;
        };
        Physics2D.prototype.projectVector = function (v1, dx, dy) {
            var dp = v1.vx * dx + v1.vy * dy;
            var proj = {
            };
            proj.vx = dp * dx;
            proj.vy = dp * dy;
            return proj;
        };
        Physics2D.prototype.bounceBalls = function (v1, v2, v) {
            var proj11 = this.projectVector(v1, v.dx, v.dy);
            var proj12 = this.projectVector(v1, v.lx, v.ly);
            var proj21 = this.projectVector(v2, v.dx, v.dy);
            var proj22 = this.projectVector(v2, v.lx, v.ly);
            var P = v1.m * proj11.vx + v2.m * proj21.vx;
            var V = proj11.vx - proj21.vx;
            var v2fx = (P + V * v1.m) / (v1.m + v2.m);
            var v1fx = v2fx - V;
            P = v1.m * proj11.vy + v2.m * proj21.vy;
            V = proj11.vy - proj21.vy;
            var v2fy = (P + V * v1.m) / (v1.m + v2.m);
            var v1fy = v2fy - V;
            var proj = {
            };
            proj.vx1 = proj12.vx + v1fx;
            proj.vy1 = proj12.vy + v1fy;
            proj.vx2 = proj22.vx + v2fx;
            proj.vy2 = proj22.vy + v2fy;
            return proj;
        };
        Physics2D.prototype.bounce = function (curOb, v2) {
            var proj1 = this.projectVector(curOb, v2.dx, v2.dy);
            var proj2 = this.projectVector(curOb, v2.lx, v2.ly);
            var proj = {
            };
            proj2.len = Math.sqrt(proj2.vx * proj2.vx + proj2.vy * proj2.vy);
            proj2.vx = v2.lx * proj2.len;
            proj2.vy = v2.ly * proj2.len;
            proj.vx = curOb.f * v2.f * proj1.vx + curOb.b * v2.b * proj2.vx;
            proj.vy = curOb.f * v2.f * proj1.vy + curOb.b * v2.b * proj2.vy;
            return proj;
        };
        Physics2D.prototype.findIntersection = function (curOb, v2) {
            var v = {
            };
            var v3 = {
            };
            v3.vx = curOb.p1.x - v2.p0.x;
            v3.vy = curOb.p1.y - v2.p0.y;
            var dp = v3.vx * v2.dx + v3.vy * v2.dy;
            if(dp < 0) {
                v = v3;
            } else {
                var v4 = {
                };
                v4.vx = curOb.p1.x - v2.p1.x;
                v4.vy = curOb.p1.y - v2.p1.y;
                dp = v4.vx * v2.dx + v4.vy * v2.dy;
                if(dp > 0) {
                    v = v4;
                } else {
                    v = this.projectVector(v3, v2.lx, v2.ly);
                }
            }
            v.p0 = {
                x: 0,
                y: 0
            };
            v.p1 = {
                x: 0,
                y: 0
            };
            return v;
        };
        return Physics2D;
    })();
    Utils.Physics2D = Physics2D;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var SaveDataHandler = (function () {
        function SaveDataHandler(_saveDataId, _totalLevels) {
            this.saveDataId = _saveDataId;
            this.totalLevels = _totalLevels;
            this.clearData();
            this.setInitialData();
        }
        SaveDataHandler.prototype.clearData = function () {
            this.aLevelStore = new Array();
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            for(var i = 0; i < this.totalLevels - 1; i++) {
                if((i + 2) % 4 == 0) {
                    this.aLevelStore.push(5);
                } else {
                    this.aLevelStore.push(1);
                }
                this.aLevelStore.push(0);
            }
        };
        SaveDataHandler.prototype.setInitialData = function () {
            if(typeof (Storage) !== "undefined") {
                if(localStorage.getItem(this.saveDataId) != null) {
                    this.aLevelStore = localStorage.getItem(this.saveDataId).split(",");
                    for(var a in this.aLevelStore) {
                        this.aLevelStore[a] = parseInt(this.aLevelStore[a]);
                    }
                } else {
                    this.saveData();
                }
            }
        };
        SaveDataHandler.prototype.saveData = function () {
            if(typeof (Storage) !== "undefined") {
                var str = "";
                for(var i = 0; i < this.aLevelStore.length; i++) {
                    str += this.aLevelStore[i];
                    if(i < this.aLevelStore.length - 1) {
                        str += ",";
                    }
                }
                localStorage.setItem(this.saveDataId, str);
            }
        };
        return SaveDataHandler;
    })();
    Utils.SaveDataHandler = SaveDataHandler;    
})(Utils || (Utils = {}));
var requestAnimFrame = (function () {
    return window.requestAnimationFrame || (window).webkitRequestAnimationFrame || (window).mozRequestAnimationFrame || (window).oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60, new Date().getTime());
    };
})();
var previousTime;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;
var canvasX;
var canvasY;
var canvasScaleX;
var canvasScaleY;
var div = document.getElementById('viewporter');
var sound;
var music;
var audioType = 0;
var muted = false;
var splash;
var splashTimer = 0;
var assetLib;
var preAssetLib;
var rotatePause = false;
var manualPause = false;
var isMobile = false;
var gameState = "loading";
var aLangs = new Array("EN");
var curLang = "";
var isBugBrowser = false;
var isIE10 = false;
if(navigator.userAgent.match(/MSIE\s([\d]+)/)) {
    isIE10 = true;
}
var deviceAgent = navigator.userAgent.toLowerCase();
if(deviceAgent.match(/(iphone|ipod|ipad)/) || deviceAgent.match(/(android)/) || deviceAgent.match(/(iemobile)/) || deviceAgent.match(/iphone/i) || deviceAgent.match(/ipad/i) || deviceAgent.match(/ipod/i) || deviceAgent.match(/blackberry/i) || deviceAgent.match(/bada/i)) {
    isMobile = true;
    if(deviceAgent.match(/(android)/) && !/Chrome/.test(navigator.userAgent)) {
        isBugBrowser = true;
    }
}
var userInput = new Utils.UserInput(canvas, isBugBrowser);
resizeCanvas();
window.onresize = function () {
    setTimeout(function () {
        resizeCanvas();
    }, 1);
};
document.addEventListener("visibilitychange", function () {
    if(document.hidden) {
        Howler.mute();
    } else if(!muted) {
        Howler.unmute();
    }
}, false);
window.addEventListener("load", function () {
    setTimeout(function () {
        resizeCanvas();
    }, 0);
    window.addEventListener("orientationchange", function () {
        resizeCanvas();
    }, false);
});
if(!isIE10 && (typeof (window).AudioContext !== 'undefined' || typeof (window).webkitAudioContext !== 'undefined' || navigator.userAgent.indexOf('Android') == -1)) {
    audioType = 1;
    sound = new Howl({
        urls: [
            'audio/sound.ogg', 
            'audio/sound.m4a'
        ],
        sprite: {
            thud1: [
                0, 
                300
            ],
            thud2: [
                500, 
                300
            ],
            thud3: [
                1000, 
                300
            ],
            thud4: [
                1500, 
                400
            ],
            thud5: [
                2000, 
                400
            ],
            ballHit1: [
                2500, 
                400
            ],
            ballHit2: [
                3000, 
                400
            ],
            ballHit3: [
                3500, 
                400
            ],
            cue1: [
                4000, 
                700
            ],
            cue2: [
                5000, 
                600
            ],
            cue3: [
                6000, 
                450
            ],
            cue3: [
                6000, 
                450
            ],
            roach1: [
                6500, 
                500
            ],
            roach2: [
                7500, 
                300
            ],
            roach3: [
                8000, 
                400
            ],
            roach4: [
                8500, 
                200
            ],
            hole1: [
                9000, 
                500
            ],
            hole2: [
                10000, 
                600
            ],
            hole3: [
                11000, 
                600
            ],
            hole4: [
                12000, 
                600
            ],
            levelComplete: [
                13000, 
                900
            ],
            zombie1: [
                14500, 
                1500
            ],
            zombie2: [
                16500, 
                1300
            ],
            zombie3: [
                18000, 
                1600
            ],
            zombie4: [
                20000, 
                1000
            ],
            zombie5: [
                21500, 
                800
            ]
        }
    });
    music = new Howl({
        urls: [
            'audio/music.ogg', 
            'audio/music.m4a'
        ],
        volume: .5,
        loop: true
    });
} else {
    audioType = 0;
    music = new Audio('audio/music.ogg');
    music.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);
    music.play();
}
var panel;
var hud;
var background;
var totalScore = 0;
var levelScore = 0;
var levelNum = 0;
var aLevelUps;
var levelBonusScore;
var bonusScore;
var aTutorials = new Array();
var panelFrame;
var oLogoData = {
};
var oLogoBut;
var table;
var cueBall;
var arrow;
var physics2D;
var gameTouchState;
var oPosData = {
    prevBallX: 0,
    prevBallY: 0,
    stageX: 0,
    stageY: 0,
    targStageX: 0,
    targStageY: 0,
    startDragX: 0,
    startDragY: 0,
    startStageX: 0,
    startStageY: 0
};
var levelWidth = 800;
var levelHeight = 480;
var shotsSinceLastPot;
var shotScore;
var aimX;
var aimY;
var targAimX;
var targAimY;
var aHolePos = new Array();
var buffer = 40;
var aBalls;
var aHoles;
var aRoaches;
var levelButsPage = 0;
var saveDataHandler = new Utils.SaveDataHandler("zombilliards", 36);
var shotsTaken;
var isRoachLevel;
var roachTimer;
var roachChain;
var musicTween;
var aLevelData = new Array({
    aData: [
        {
            type: 'ball',
            p0: {
                x: 378,
                y: 135
            },
            p1: {
                x: 378,
                y: 135
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 664,
                y: 342
            },
            p1: {
                x: 664,
                y: 342
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 263,
                y: 248
            },
            p1: {
                x: 263,
                y: 248
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 579,
                y: 341
            },
            p1: {
                x: 598,
                y: 567
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 564,
                y: 333
            },
            p1: {
                x: 583,
                y: 560
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 150,
                y: 335
            },
            p1: {
                x: 150,
                y: 335
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 233,
                y: 117
            },
            p1: {
                x: 233,
                y: 117
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 147,
                y: 124
            },
            p1: {
                x: 147,
                y: 124
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 644,
                y: 142
            },
            p1: {
                x: 644,
                y: 142
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 599,
                y: 258
            },
            p1: {
                x: 599,
                y: 258
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 323,
                y: 213
            },
            p1: {
                x: 365,
                y: 234
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 334,
                y: 255
            },
            p1: {
                x: 380,
                y: 248
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 302,
                y: 235
            },
            p1: {
                x: 495,
                y: 251
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 301,
                y: 227
            },
            p1: {
                x: 499,
                y: 264
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 318,
                y: 229
            },
            p1: {
                x: 482,
                y: 276
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 608,
                y: 234
            },
            p1: {
                x: 608,
                y: 234
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 410,
                y: 344
            },
            p1: {
                x: 410,
                y: 344
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 549,
                y: 311
            },
            p1: {
                x: 549,
                y: 311
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 147,
                y: 201
            },
            p1: {
                x: 147,
                y: 201
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 385,
                y: 128
            },
            p1: {
                x: 385,
                y: 128
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 497,
                y: 296
            },
            p1: {
                x: 497,
                y: 296
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 285,
                y: 194
            },
            p1: {
                x: 285,
                y: 194
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 375,
                y: 173
            },
            p1: {
                x: 443,
                y: 189
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 364,
                y: 181
            },
            p1: {
                x: 454,
                y: 192
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 377,
                y: 207
            },
            p1: {
                x: 432,
                y: 192
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 346,
                y: 194
            },
            p1: {
                x: 445,
                y: 196
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 316,
                y: 434
            },
            p1: {
                x: 284,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 249,
                y: 340
            },
            p1: {
                x: 226,
                y: 299
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 290,
                y: 456
            },
            p1: {
                x: 261,
                y: 349
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 302,
                y: 459
            },
            p1: {
                x: 245,
                y: 307
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 312,
                y: 457
            },
            p1: {
                x: 217,
                y: 316
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'cueBall',
            p0: {
                x: 394,
                y: 254
            },
            p1: {
                x: 394,
                y: 254
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 386,
                y: 99
            },
            p1: {
                x: 508,
                y: 64
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 157
            },
            p1: {
                x: 638,
                y: 53
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 690,
                y: 382
            },
            p1: {
                x: 708,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 697,
                y: 374
            },
            p1: {
                x: 488,
                y: 464
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 103,
                y: 349
            },
            p1: {
                x: 164,
                y: 426
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 76,
                y: 176
            },
            p1: {
                x: 152,
                y: 66
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 416,
                y: 381
            },
            p1: {
                x: 195,
                y: 433
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 241,
                y: 363
            },
            p1: {
                x: 241,
                y: 363
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 276,
                y: 217
            },
            p1: {
                x: 276,
                y: 217
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 386,
                y: 140
            },
            p1: {
                x: 386,
                y: 140
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 601,
                y: 135
            },
            p1: {
                x: 601,
                y: 135
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 165,
                y: 321
            },
            p1: {
                x: 165,
                y: 321
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 567,
                y: 293
            },
            p1: {
                x: 567,
                y: 293
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 449,
                y: 302
            },
            p1: {
                x: 449,
                y: 302
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 399,
                y: 238
            },
            p1: {
                x: 399,
                y: 238
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 86,
                y: 167
            },
            p1: {
                x: 134,
                y: 73
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 711,
                y: 164
            },
            p1: {
                x: 663,
                y: 88
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 271,
                y: 221
            },
            p1: {
                x: 271,
                y: 221
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 203,
                y: 271
            },
            p1: {
                x: 203,
                y: 271
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 408,
                y: 221
            },
            p1: {
                x: 408,
                y: 221
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 579,
                y: 274
            },
            p1: {
                x: 579,
                y: 274
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 154,
                y: 338
            },
            p1: {
                x: 154,
                y: 338
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 562,
                y: 185
            },
            p1: {
                x: 562,
                y: 185
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 647,
                y: 337
            },
            p1: {
                x: 647,
                y: 337
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 144,
                y: 212
            },
            p1: {
                x: 144,
                y: 212
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 424,
                y: 154
            },
            p1: {
                x: 424,
                y: 154
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 413,
                y: 298
            },
            p1: {
                x: 478,
                y: 387
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 391,
                y: 305
            },
            p1: {
                x: 531,
                y: 402
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 382,
                y: 112
            },
            p1: {
                x: 378,
                y: 42
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 383,
                y: 98
            },
            p1: {
                x: 472,
                y: 83
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 386,
                y: 287
            },
            p1: {
                x: 358,
                y: 324
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 409,
                y: 288
            },
            p1: {
                x: 286,
                y: 405
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 413,
                y: 297
            },
            p1: {
                x: 272,
                y: 379
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'ball',
            p0: {
                x: 259,
                y: 186
            },
            p1: {
                x: 259,
                y: 186
            }
        }, 
        {
            type: 'blackBall',
            p0: {
                x: 649,
                y: 321
            },
            p1: {
                x: 649,
                y: 321
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 352,
                y: 325
            },
            p1: {
                x: 352,
                y: 325
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 261,
                y: 258
            },
            p1: {
                x: 261,
                y: 258
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 329,
                y: 148
            },
            p1: {
                x: 329,
                y: 148
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 534,
                y: 284
            },
            p1: {
                x: 534,
                y: 284
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 164,
                y: 341
            },
            p1: {
                x: 164,
                y: 341
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 393,
                y: 241
            },
            p1: {
                x: 393,
                y: 241
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 627,
                y: 382
            },
            p1: {
                x: 678,
                y: 366
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 525,
                y: 144
            },
            p1: {
                x: 584,
                y: 99
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 112,
                y: 283
            },
            p1: {
                x: 166,
                y: 238
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 128,
                y: 179
            },
            p1: {
                x: 171,
                y: 235
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 128,
                y: 179
            },
            p1: {
                x: 58,
                y: 174
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 525,
                y: 144
            },
            p1: {
                x: 480,
                y: 65
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 166,
                y: 402
            },
            p1: {
                x: 76,
                y: 338
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 709,
                y: 324
            },
            p1: {
                x: 654,
                y: 477
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'cueBall',
            p0: {
                x: 216,
                y: 282
            },
            p1: {
                x: 216,
                y: 282
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 386,
                y: 99
            },
            p1: {
                x: 508,
                y: 64
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 157
            },
            p1: {
                x: 638,
                y: 53
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 690,
                y: 382
            },
            p1: {
                x: 708,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 697,
                y: 374
            },
            p1: {
                x: 488,
                y: 464
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 103,
                y: 349
            },
            p1: {
                x: 164,
                y: 426
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 76,
                y: 176
            },
            p1: {
                x: 152,
                y: 66
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 416,
                y: 381
            },
            p1: {
                x: 195,
                y: 433
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }
    ]
}, {
    aData: [
        {
            type: 'ball',
            p0: {
                x: 497,
                y: 311
            },
            p1: {
                x: 497,
                y: 311
            }
        }, 
        {
            type: 'blackBall',
            p0: {
                x: 169,
                y: 242
            },
            p1: {
                x: 169,
                y: 242
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 248,
                y: 343
            },
            p1: {
                x: 248,
                y: 343
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 236,
                y: 141
            },
            p1: {
                x: 236,
                y: 141
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 504,
                y: 135
            },
            p1: {
                x: 504,
                y: 135
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 612,
                y: 247
            },
            p1: {
                x: 612,
                y: 247
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 531,
                y: 204
            },
            p1: {
                x: 531,
                y: 204
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 326,
                y: 201
            },
            p1: {
                x: 312,
                y: 219
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 435,
                y: 187
            },
            p1: {
                x: 489,
                y: 244
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 346,
                y: 164
            },
            p1: {
                x: 325,
                y: 245
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 346,
                y: 164
            },
            p1: {
                x: 417,
                y: 179
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 333,
                y: 249
            },
            p1: {
                x: 373,
                y: 302
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 387,
                y: 286
            },
            p1: {
                x: 485,
                y: 262
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 238,
                y: 242
            },
            p1: {
                x: 238,
                y: 242
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 424,
                y: 202
            },
            p1: {
                x: 424,
                y: 202
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 252,
                y: 152
            },
            p1: {
                x: 252,
                y: 152
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 536,
                y: 141
            },
            p1: {
                x: 536,
                y: 141
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 163,
                y: 187
            },
            p1: {
                x: 163,
                y: 187
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 579,
                y: 240
            },
            p1: {
                x: 579,
                y: 240
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 351,
                y: 172
            },
            p1: {
                x: 351,
                y: 172
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 187,
                y: 329
            },
            p1: {
                x: 187,
                y: 329
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 475,
                y: 333
            },
            p1: {
                x: 484,
                y: 417
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 661,
                y: 341
            },
            p1: {
                x: 742,
                y: 365
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 661,
                y: 341
            },
            p1: {
                x: 687,
                y: 422
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 130,
                y: 385
            },
            p1: {
                x: 105,
                y: 353
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 353
            },
            p1: {
                x: 118,
                y: 358
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 345,
                y: 260
            },
            p1: {
                x: 383,
                y: 321
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 312,
                y: 267
            },
            p1: {
                x: 343,
                y: 261
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 449,
                y: 317
            },
            p1: {
                x: 477,
                y: 397
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 377,
                y: 311
            },
            p1: {
                x: 444,
                y: 316
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 238,
                y: 401
            },
            p1: {
                x: 311,
                y: 266
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 526,
                y: 164
            },
            p1: {
                x: 526,
                y: 164
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 313,
                y: 129
            },
            p1: {
                x: 313,
                y: 129
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 201,
                y: 130
            },
            p1: {
                x: 201,
                y: 130
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 471,
                y: 125
            },
            p1: {
                x: 471,
                y: 125
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 140,
                y: 160
            },
            p1: {
                x: 140,
                y: 160
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 591,
                y: 115
            },
            p1: {
                x: 591,
                y: 115
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 255,
                y: 177
            },
            p1: {
                x: 255,
                y: 177
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 408,
                y: 235
            },
            p1: {
                x: 408,
                y: 235
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 580,
                y: 230
            },
            p1: {
                x: 724,
                y: 283
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 530,
                y: 247
            },
            p1: {
                x: 556,
                y: 234
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 404,
                y: 278
            },
            p1: {
                x: 570,
                y: 250
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 91,
                y: 269
            },
            p1: {
                x: 271,
                y: 286
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 236,
                y: 281
            },
            p1: {
                x: 378,
                y: 266
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 374,
                y: 264
            },
            p1: {
                x: 439,
                y: 294
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'cueBall',
            p0: {
                x: 596,
                y: 217
            },
            p1: {
                x: 596,
                y: 217
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 386,
                y: 99
            },
            p1: {
                x: 508,
                y: 64
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 157
            },
            p1: {
                x: 638,
                y: 53
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 690,
                y: 382
            },
            p1: {
                x: 708,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 697,
                y: 374
            },
            p1: {
                x: 488,
                y: 464
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 103,
                y: 349
            },
            p1: {
                x: 164,
                y: 426
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 76,
                y: 176
            },
            p1: {
                x: 152,
                y: 66
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 416,
                y: 381
            },
            p1: {
                x: 195,
                y: 433
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }
    ]
}, {
    aData: [
        {
            type: 'ball',
            p0: {
                x: 194,
                y: 227
            },
            p1: {
                x: 194,
                y: 227
            }
        }, 
        {
            type: 'blackBall',
            p0: {
                x: 161,
                y: 143
            },
            p1: {
                x: 161,
                y: 143
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 526,
                y: 155
            },
            p1: {
                x: 526,
                y: 155
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 341,
                y: 308
            },
            p1: {
                x: 341,
                y: 308
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 641,
                y: 159
            },
            p1: {
                x: 641,
                y: 159
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 407,
                y: 234
            },
            p1: {
                x: 407,
                y: 234
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 596,
                y: 281
            },
            p1: {
                x: 596,
                y: 281
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 235,
                y: 330
            },
            p1: {
                x: 235,
                y: 330
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 275,
                y: 261
            },
            p1: {
                x: 275,
                y: 261
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 369,
                y: 401
            },
            p1: {
                x: 405,
                y: 371
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 412,
                y: 408
            },
            p1: {
                x: 423,
                y: 362
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 380,
                y: 429
            },
            p1: {
                x: 471,
                y: 257
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 373,
                y: 427
            },
            p1: {
                x: 485,
                y: 259
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 381,
                y: 412
            },
            p1: {
                x: 489,
                y: 279
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 388,
                y: 67
            },
            p1: {
                x: 377,
                y: 112
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 346,
                y: 175
            },
            p1: {
                x: 324,
                y: 216
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 421,
                y: 78
            },
            p1: {
                x: 347,
                y: 160
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 417,
                y: 65
            },
            p1: {
                x: 320,
                y: 196
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 409,
                y: 58
            },
            p1: {
                x: 343,
                y: 214
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'ball',
            p0: {
                x: 237,
                y: 238
            },
            p1: {
                x: 237,
                y: 238
            }
        }, 
        {
            type: 'blackBall',
            p0: {
                x: 322,
                y: 241
            },
            p1: {
                x: 322,
                y: 241
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 195,
                y: 219
            },
            p1: {
                x: 195,
                y: 219
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 159,
                y: 200
            },
            p1: {
                x: 159,
                y: 200
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 161,
                y: 277
            },
            p1: {
                x: 161,
                y: 277
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 162,
                y: 240
            },
            p1: {
                x: 162,
                y: 240
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 508,
                y: 185
            },
            p1: {
                x: 508,
                y: 185
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 199,
                y: 257
            },
            p1: {
                x: 199,
                y: 257
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 531,
                y: 365
            },
            p1: {
                x: 515,
                y: 445
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 543,
                y: 343
            },
            p1: {
                x: 528,
                y: 363
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 636,
                y: 230
            },
            p1: {
                x: 559,
                y: 321
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 649,
                y: 157
            },
            p1: {
                x: 630,
                y: 234
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 671,
                y: 83
            },
            p1: {
                x: 648,
                y: 245
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'ball',
            p0: {
                x: 460,
                y: 222
            },
            p1: {
                x: 460,
                y: 222
            }
        }, 
        {
            type: 'blackBall',
            p0: {
                x: 614,
                y: 228
            },
            p1: {
                x: 614,
                y: 228
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 419,
                y: 303
            },
            p1: {
                x: 419,
                y: 303
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 397,
                y: 203
            },
            p1: {
                x: 397,
                y: 203
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 462,
                y: 273
            },
            p1: {
                x: 462,
                y: 273
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 364,
                y: 285
            },
            p1: {
                x: 364,
                y: 285
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 404,
                y: 255
            },
            p1: {
                x: 404,
                y: 255
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 363,
                y: 225
            },
            p1: {
                x: 363,
                y: 225
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 581,
                y: 351
            },
            p1: {
                x: 673,
                y: 413
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 538,
                y: 292
            },
            p1: {
                x: 579,
                y: 349
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 255,
                y: 235
            },
            p1: {
                x: 268,
                y: 232
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 154,
                y: 101
            },
            p1: {
                x: 255,
                y: 234
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 331,
                y: 127
            },
            p1: {
                x: 361,
                y: 100
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 473,
                y: 399
            },
            p1: {
                x: 522,
                y: 293
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 272,
                y: 234
            },
            p1: {
                x: 325,
                y: 132
            }
        }
    ]
}, {
    aData: [
        {
            type: 'cueBall',
            p0: {
                x: 244,
                y: 178
            },
            p1: {
                x: 244,
                y: 178
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 386,
                y: 99
            },
            p1: {
                x: 508,
                y: 64
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 157
            },
            p1: {
                x: 638,
                y: 53
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 690,
                y: 382
            },
            p1: {
                x: 708,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 697,
                y: 374
            },
            p1: {
                x: 488,
                y: 464
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 103,
                y: 349
            },
            p1: {
                x: 164,
                y: 426
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 76,
                y: 176
            },
            p1: {
                x: 152,
                y: 66
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 416,
                y: 381
            },
            p1: {
                x: 195,
                y: 433
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 475,
                y: 351
            },
            p1: {
                x: 475,
                y: 351
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 311,
                y: 348
            },
            p1: {
                x: 311,
                y: 348
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 144,
                y: 221
            },
            p1: {
                x: 144,
                y: 221
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 376,
                y: 239
            },
            p1: {
                x: 376,
                y: 239
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 617,
                y: 225
            },
            p1: {
                x: 617,
                y: 225
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 186,
                y: 323
            },
            p1: {
                x: 186,
                y: 323
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 503,
                y: 177
            },
            p1: {
                x: 503,
                y: 177
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 561,
                y: 305
            },
            p1: {
                x: 561,
                y: 305
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 219,
                y: 179
            },
            p1: {
                x: 219,
                y: 179
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 402,
                y: 301
            },
            p1: {
                x: 396,
                y: 347
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 366,
                y: 325
            },
            p1: {
                x: 389,
                y: 366
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 374,
                y: 288
            },
            p1: {
                x: 425,
                y: 475
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 381,
                y: 285
            },
            p1: {
                x: 414,
                y: 484
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 385,
                y: 301
            },
            p1: {
                x: 397,
                y: 472
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 400,
                y: 179
            },
            p1: {
                x: 397,
                y: 133
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 409,
                y: 64
            },
            p1: {
                x: 418,
                y: 18
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 365,
                y: 178
            },
            p1: {
                x: 412,
                y: 79
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 373,
                y: 189
            },
            p1: {
                x: 428,
                y: 36
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 382,
                y: 194
            },
            p1: {
                x: 400,
                y: 25
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 154,
                y: 271
            },
            p1: {
                x: 154,
                y: 271
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 377,
                y: 176
            },
            p1: {
                x: 377,
                y: 176
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 310,
                y: 203
            },
            p1: {
                x: 310,
                y: 203
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 376,
                y: 234
            },
            p1: {
                x: 376,
                y: 234
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 337,
                y: 169
            },
            p1: {
                x: 337,
                y: 169
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 347,
                y: 205
            },
            p1: {
                x: 347,
                y: 205
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 332,
                y: 239
            },
            p1: {
                x: 332,
                y: 239
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 513,
                y: 293
            },
            p1: {
                x: 513,
                y: 293
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 486,
                y: 148
            },
            p1: {
                x: 486,
                y: 148
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 253,
                y: 344
            },
            p1: {
                x: 253,
                y: 344
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 161,
                y: 151
            },
            p1: {
                x: 161,
                y: 151
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 386,
                y: 99
            },
            p1: {
                x: 508,
                y: 64
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 157
            },
            p1: {
                x: 638,
                y: 53
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 690,
                y: 382
            },
            p1: {
                x: 708,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 697,
                y: 374
            },
            p1: {
                x: 488,
                y: 464
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 103,
                y: 349
            },
            p1: {
                x: 164,
                y: 426
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 76,
                y: 176
            },
            p1: {
                x: 152,
                y: 66
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 416,
                y: 381
            },
            p1: {
                x: 195,
                y: 433
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 555,
                y: 157
            },
            p1: {
                x: 555,
                y: 157
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 561,
                y: 350
            },
            p1: {
                x: 561,
                y: 350
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 165,
                y: 149
            },
            p1: {
                x: 165,
                y: 149
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 640,
                y: 353
            },
            p1: {
                x: 640,
                y: 353
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 658,
                y: 272
            },
            p1: {
                x: 658,
                y: 272
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 225,
                y: 134
            },
            p1: {
                x: 225,
                y: 134
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 145,
                y: 237
            },
            p1: {
                x: 145,
                y: 237
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 395,
                y: 250
            },
            p1: {
                x: 395,
                y: 250
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 601,
                y: 277
            },
            p1: {
                x: 531,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 603,
                y: 314
            },
            p1: {
                x: 602,
                y: 230
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 603,
                y: 314
            },
            p1: {
                x: 529,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 210,
                y: 222
            },
            p1: {
                x: 266,
                y: 172
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 196,
                y: 187
            },
            p1: {
                x: 215,
                y: 239
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 196,
                y: 187
            },
            p1: {
                x: 268,
                y: 172
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 586,
                y: 306
            },
            p1: {
                x: 615,
                y: 244
            }
        }
    ]
}, {
    aData: [
        {
            type: 'cueBall',
            p0: {
                x: 529,
                y: 302
            },
            p1: {
                x: 529,
                y: 302
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 386,
                y: 99
            },
            p1: {
                x: 508,
                y: 64
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 157
            },
            p1: {
                x: 638,
                y: 53
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 690,
                y: 382
            },
            p1: {
                x: 708,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 697,
                y: 374
            },
            p1: {
                x: 488,
                y: 464
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 103,
                y: 349
            },
            p1: {
                x: 164,
                y: 426
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 76,
                y: 176
            },
            p1: {
                x: 152,
                y: 66
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 416,
                y: 381
            },
            p1: {
                x: 195,
                y: 433
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 619,
                y: 144
            },
            p1: {
                x: 619,
                y: 144
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 480,
                y: 348
            },
            p1: {
                x: 480,
                y: 348
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 152,
                y: 303
            },
            p1: {
                x: 152,
                y: 303
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 420,
                y: 152
            },
            p1: {
                x: 420,
                y: 152
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 230,
                y: 141
            },
            p1: {
                x: 230,
                y: 141
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 137,
                y: 201
            },
            p1: {
                x: 137,
                y: 201
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 303,
                y: 343
            },
            p1: {
                x: 303,
                y: 343
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 615,
                y: 243
            },
            p1: {
                x: 615,
                y: 243
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 456,
                y: 215
            },
            p1: {
                x: 497,
                y: 203
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 353,
                y: 195
            },
            p1: {
                x: 496,
                y: 220
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 281,
                y: 190
            },
            p1: {
                x: 364,
                y: 192
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 523,
                y: 278
            },
            p1: {
                x: 504,
                y: 204
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 473,
                y: 288
            },
            p1: {
                x: 524,
                y: 278
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 373,
                y: 284
            },
            p1: {
                x: 469,
                y: 290
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 278,
                y: 285
            },
            p1: {
                x: 374,
                y: 277
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 229,
                y: 312
            },
            p1: {
                x: 285,
                y: 274
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 187,
                y: 203
            },
            p1: {
                x: 197,
                y: 302
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 187,
                y: 203
            },
            p1: {
                x: 273,
                y: 186
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 361,
                y: 230
            },
            p1: {
                x: 361,
                y: 230
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 486,
                y: 260
            },
            p1: {
                x: 486,
                y: 260
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 349,
                y: 291
            },
            p1: {
                x: 349,
                y: 291
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 390,
                y: 170
            },
            p1: {
                x: 390,
                y: 170
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 463,
                y: 181
            },
            p1: {
                x: 463,
                y: 181
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 448,
                y: 314
            },
            p1: {
                x: 448,
                y: 314
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 404,
                y: 341
            },
            p1: {
                x: 404,
                y: 341
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 316,
                y: 189
            },
            p1: {
                x: 316,
                y: 189
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 97
            },
            p1: {
                x: 694,
                y: 97
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 426,
                y: 219
            },
            p1: {
                x: 399,
                y: 289
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 455,
                y: 243
            },
            p1: {
                x: 414,
                y: 206
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 455,
                y: 243
            },
            p1: {
                x: 397,
                y: 290
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 569,
                y: 245
            },
            p1: {
                x: 616,
                y: 249
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 595,
                y: 280
            },
            p1: {
                x: 634,
                y: 256
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 557,
                y: 273
            },
            p1: {
                x: 742,
                y: 215
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 553,
                y: 267
            },
            p1: {
                x: 751,
                y: 225
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 570,
                y: 262
            },
            p1: {
                x: 740,
                y: 243
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 203,
                y: 234
            },
            p1: {
                x: 159,
                y: 251
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 212,
                y: 267
            },
            p1: {
                x: 103,
                y: 254
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 220,
                y: 257
            },
            p1: {
                x: 57,
                y: 253
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 222,
                y: 246
            },
            p1: {
                x: 56,
                y: 282
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'blackBall',
            p0: {
                x: 139,
                y: 348
            },
            p1: {
                x: 139,
                y: 348
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 597,
                y: 365
            },
            p1: {
                x: 597,
                y: 365
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 265,
                y: 372
            },
            p1: {
                x: 265,
                y: 372
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 299,
                y: 113
            },
            p1: {
                x: 299,
                y: 113
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 617,
                y: 164
            },
            p1: {
                x: 617,
                y: 164
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 679,
                y: 268
            },
            p1: {
                x: 679,
                y: 268
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 123,
                y: 156
            },
            p1: {
                x: 123,
                y: 156
            }
        }, 
        {
            type: 'ball',
            p0: {
                x: 539,
                y: 114
            },
            p1: {
                x: 539,
                y: 114
            }
        }, 
        {
            type: 'cueBall',
            p0: {
                x: 396,
                y: 211
            },
            p1: {
                x: 396,
                y: 211
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 694,
                y: 384
            },
            p1: {
                x: 694,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 400
            },
            p1: {
                x: 400,
                y: 400
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 384
            },
            p1: {
                x: 107,
                y: 384
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 400,
                y: 80
            },
            p1: {
                x: 400,
                y: 80
            }
        }, 
        {
            type: 'hole',
            p0: {
                x: 107,
                y: 97
            },
            p1: {
                x: 107,
                y: 97
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 541,
                y: 286
            },
            p1: {
                x: 498,
                y: 404
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 515,
                y: 274
            },
            p1: {
                x: 497,
                y: 398
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 528,
                y: 264
            },
            p1: {
                x: 540,
                y: 279
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 673,
                y: 99
            },
            p1: {
                x: 691,
                y: 120
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 216,
                y: 225
            },
            p1: {
                x: 272,
                y: 182
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 216,
                y: 238
            },
            p1: {
                x: 281,
                y: 176
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 244,
                y: 245
            },
            p1: {
                x: 267,
                y: 192
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 214,
                y: 261
            },
            p1: {
                x: 279,
                y: 185
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 346,
                y: 321
            },
            p1: {
                x: 348,
                y: 397
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 382,
                y: 333
            },
            p1: {
                x: 330,
                y: 314
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 382,
                y: 333
            },
            p1: {
                x: 346,
                y: 398
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }
    ]
}, {
    aData: [
        {
            type: 'cueBall',
            p0: {
                x: 394,
                y: 254
            },
            p1: {
                x: 394,
                y: 254
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 386,
                y: 99
            },
            p1: {
                x: 508,
                y: 64
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 157
            },
            p1: {
                x: 638,
                y: 53
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 690,
                y: 382
            },
            p1: {
                x: 708,
                y: 306
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 697,
                y: 374
            },
            p1: {
                x: 488,
                y: 464
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 103,
                y: 349
            },
            p1: {
                x: 164,
                y: 426
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 76,
                y: 176
            },
            p1: {
                x: 152,
                y: 66
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 710,
                y: 127
            },
            p1: {
                x: 710,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 90,
                y: 127
            },
            p1: {
                x: 90,
                y: 354
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 401
            },
            p1: {
                x: 663,
                y: 400
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 436,
                y: 81
            },
            p1: {
                x: 663,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 81
            },
            p1: {
                x: 365,
                y: 80
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 416,
                y: 381
            },
            p1: {
                x: 195,
                y: 433
            }
        }, 
        {
            type: 'wall',
            p0: {
                x: 138,
                y: 401
            },
            p1: {
                x: 365,
                y: 400
            }
        }
    ]
});
loadPreAssets();
function initSplash() {
    gameState = "splash";
    resizeCanvas();
    splash = new Elements.Splash(assetLib.getData("splash"), canvas.width, canvas.height);
    userInput.addHitArea("moreGames", butEventHandler, null, "rect", {
        aRect: [
            0, 
            0, 
            canvas.width, 
            canvas.height
        ]
    }, true);
    previousTime = new Date().getTime();
    updateSplashScreenEvent();
}
function initStartScreen() {
    gameState = "start";
    userInput.removeHitArea("moreGames");
    if(audioType == 1) {
        if(musicTween) {
            musicTween.kill();
        }
        musicTween = TweenLite.to(music, 1, {
            volume: .5,
            ease: "Linear.easeNone"
        });
    }
    totalScore = 0;
    levelNum = 0;
    background = new Elements.Background(assetLib.getData("background"), canvas.width, canvas.height);
    userInput.addHitArea("mute", butEventHandler, null, "rect", {
        aRect: [
            740, 
            0, 
            canvas.width, 
            55
        ]
    }, true);
    var oPlayBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2, 
            280
        ],
        scale: 1,
        frame: 2
    };
    var oMoreGamesBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            580, 
            280
        ],
        scale: 1,
        frame: 1
    };
    var oCreditsBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            220, 
            280
        ],
        scale: 1,
        frame: 0
    };
    userInput.addHitArea("startGame", butEventHandler, null, "image", oPlayBut);
    userInput.addHitArea("moreGames", butEventHandler, null, "image", oMoreGamesBut);
    userInput.addHitArea("credits", butEventHandler, null, "image", oCreditsBut);
    var aButs = new Array(oPlayBut, oCreditsBut);
    panel = new Elements.Panel(assetLib.getData("panels"), assetLib.getData("levelNumbers"), assetLib.getData("endSymbols"), gameState, aButs, canvas.width, canvas.height);
    panel.startTween1();
    previousTime = new Date().getTime();
    updateStartScreenEvent();
}
function initCreditsScreen() {
    gameState = "credits";
    var oBackBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            90, 
            340
        ],
        scale: 1,
        frame: 6
    };
    userInput.addHitArea("backFromCredits", butEventHandler, null, "image", oBackBut);
    var aButs = new Array(oBackBut);
    panel = new Elements.Panel(assetLib.getData("panels"), assetLib.getData("levelNumbers"), assetLib.getData("endSymbols"), gameState, aButs, canvas.width, canvas.height);
    panel.startTween2();
    previousTime = new Date().getTime();
    updateCreditsScreenEvent();
}
function initLevelSelect() {
    gameState = "levelSelect";
    var aButs = new Array();
    for(var i = 0; i < 12; i++) {
        var posX = (i % 4) * 195 + 112;
        var posY = Math.floor(i / 4) * 89 + 93;
        var oLevelBut = {
            oImgData: assetLib.getData("levelButs"),
            aPos: [
                posX, 
                posY
            ],
            scale: 1,
            frame: saveDataHandler.aLevelStore[(i + levelButsPage * 12) * 2]
        };
        var levelImageId = saveDataHandler.aLevelStore[(i + levelButsPage * 12) * 2];
        if(levelImageId != 1 && levelImageId != 5) {
            userInput.addHitArea("startLevel", butEventHandler, {
                id: i + levelButsPage * 12
            }, "image", oLevelBut);
        }
        aButs.push(oLevelBut);
    }
    var oPrevBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            90, 
            357
        ],
        scale: 1,
        frame: 6
    };
    var oClearDataBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2 + 5, 
            357
        ],
        scale: 1,
        frame: 7
    };
    userInput.addHitArea("prevScreen", butEventHandler, null, "image", oPrevBut);
    userInput.addHitArea("clearData", butEventHandler, null, "image", oClearDataBut);
    aButs.push(oPrevBut, oClearDataBut);
    if(levelButsPage < 1) {
        var oNextBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                718, 
                357
            ],
            scale: 1,
            frame: 5
        };
        userInput.addHitArea("nextScreen", butEventHandler, null, "image", oNextBut);
        aButs.push(oNextBut);
    }
    panel = new Elements.Panel(assetLib.getData("panels"), assetLib.getData("levelNumbers"), assetLib.getData("endSymbols"), gameState, aButs, canvas.width, canvas.height);
    panel.oScoreData = {
        levelButsPage: levelButsPage
    };
    panel.startTween2();
    previousTime = new Date().getTime();
    updateLevelSelectEvent();
}
function initGame() {
    gameState = "game";
    if(audioType == 1) {
        musicTween.kill();
        musicTween = TweenLite.to(music, 2, {
            volume: 0,
            ease: "Linear.easeNone"
        });
    }
    shotsSinceLastPot = 1;
    levelScore = 0;
    shotScore = 100;
    shotsTaken = 0;
    roachTimer = 30;
    roachChain = 1;
    userInput.addHitArea("pause", butEventHandler, null, "rect", {
        aRect: [
            0, 
            0, 
            55, 
            55
        ]
    }, true);
    userInput.addHitArea("gameTouch", butEventHandler, {
        isDraggable: true,
        multiTouch: true
    }, "rect", {
        aRect: [
            0, 
            0, 
            canvas.width, 
            canvas.height
        ]
    }, true);
    hud = new Elements.Hud(assetLib.getData("hud"), assetLib.getData("levelNumbers"), canvas.width, canvas.height, totalScore, levelNum);
    var aLines = new Array();
    aBalls = new Array();
    aHoles = new Array();
    aRoaches = new Array();
    for(var i = 0; i < aLevelData[levelNum].aData.length; i++) {
        if(aLevelData[levelNum].aData[i].type == "cueBall") {
            cueBall = new Elements.Ball(assetLib.getData("ball"), assetLib.getData("potNumbers"), {
                type: "cueBall",
                x: aLevelData[levelNum].aData[i].p0.x,
                y: aLevelData[levelNum].aData[i].p0.y
            }, ballCallback, canvas.width, canvas.height);
            aBalls.push(cueBall);
        } else if(aLevelData[levelNum].aData[i].type == "hole") {
            aHoles.push({
                x: aLevelData[levelNum].aData[i].p0.x,
                y: aLevelData[levelNum].aData[i].p0.y
            });
        } else if(aLevelData[levelNum].aData[i].type == "ball") {
            var bomb = new Elements.Ball(assetLib.getData("ball"), assetLib.getData("potNumbers"), {
                type: "ball",
                timer: aLevelData[levelNum].aData[i].p1.x,
                x: aLevelData[levelNum].aData[i].p0.x,
                y: aLevelData[levelNum].aData[i].p0.y
            }, ballCallback, canvas.width, canvas.height);
            aBalls.push(bomb);
        } else if(aLevelData[levelNum].aData[i].type == "blackBall") {
            var bomb = new Elements.Ball(assetLib.getData("ball"), assetLib.getData("potNumbers"), {
                type: "blackBall",
                timer: aLevelData[levelNum].aData[i].p1.x,
                x: aLevelData[levelNum].aData[i].p0.x,
                y: aLevelData[levelNum].aData[i].p0.y
            }, ballCallback, canvas.width, canvas.height);
            aBalls.push(bomb);
        } else if(aLevelData[levelNum].aData[i].type == "wall") {
            aLines.push({
                p0: aLevelData[levelNum].aData[i].p0,
                p1: aLevelData[levelNum].aData[i].p1,
                b: 1,
                f: 1
            });
        }
    }
    oPosData = {
        prevBallX: cueBall.oData.x,
        prevBallY: cueBall.oData.y,
        stageX: -(levelWidth - canvas.width) / 2,
        stageY: -(levelHeight - canvas.height) / 2,
        targStageX: -(levelWidth - canvas.width) / 2,
        targStageY: -(levelHeight - canvas.height) / 2,
        startDragX: 0,
        startDragY: 0,
        startStageX: 0,
        startStageY: 0
    };
    gameTouchState = 0;
    if((levelNum + 1) % 4 == 0) {
        table = new Elements.Table(assetLib.getData("tableRoach"), canvas.width, canvas.height);
        isRoachLevel = true;
        for(var i = 0; i < 15; i++) {
            var roach = new Elements.Roach(assetLib.getData("roach"), assetLib.getData("potNumbers"), ballCallback, canvas.width, canvas.height);
            aRoaches.push(roach);
        }
    } else {
        isRoachLevel = false;
        table = new Elements.Table(assetLib.getData("table" + levelNum), canvas.width, canvas.height);
    }
    arrow = new Elements.Arrow(assetLib.getData("arrow"), assetLib.getData("cue"), canvas.width, canvas.height);
    aimX = targAimX = cueBall.startX;
    aimY = targAimY = cueBall.startY + oPosData.stageY;
    physics2D = new Utils.Physics2D(aLines, aBalls);
    previousTime = new Date().getTime();
    updateGameEvent();
}
function butEventHandler(_id, _oData) {
    switch(_id) {
        case "langSelect":
            curLang = _oData.lang;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            userInput.removeHitArea("langSelect");
            initLoadAssets();
            break;
        case "startGame":
            playSound("thud1");
            userInput.removeHitArea("startGame");
            userInput.removeHitArea("moreGames");
            userInput.removeHitArea("credits");
            initLevelSelect();
            break;
        case "credits":
            playSound("thud1");
            userInput.removeHitArea("startGame");
            userInput.removeHitArea("moreGames");
            userInput.removeHitArea("credits");
            initCreditsScreen();
            break;
        case "startLevel":
            playSound("thud1");
            userInput.removeHitArea("startLevel");
            userInput.removeHitArea("prevScreen");
            userInput.removeHitArea("clearData");
            userInput.removeHitArea("nextScreen");
            levelNum = _oData.id;
            initGame();
            break;
        case "prevScreen":
            playSound("thud1");
            userInput.removeHitArea("startLevel");
            userInput.removeHitArea("prevScreen");
            userInput.removeHitArea("clearData");
            userInput.removeHitArea("nextScreen");
            if(levelButsPage == 0) {
                initStartScreen();
            } else {
                levelButsPage = 0;
                initLevelSelect();
            }
            break;
        case "nextScreen":
            playSound("thud1");
            userInput.removeHitArea("startLevel");
            userInput.removeHitArea("prevScreen");
            userInput.removeHitArea("clearData");
            userInput.removeHitArea("nextScreen");
            levelButsPage++;
            initLevelSelect();
            break;
        case "clearData":
            playSound("thud1");
            userInput.removeHitArea("startLevel");
            userInput.removeHitArea("prevScreen");
            userInput.removeHitArea("clearData");
            userInput.removeHitArea("nextScreen");
            levelButsPage = 0;
            saveDataHandler.clearData();
            saveDataHandler.saveData();
            initLevelSelect();
            break;
        case "backFromCredits":
            playSound("thud1");
            userInput.removeHitArea("backFromCredits");
            initStartScreen();
            break;
        case "moreGames":
        case "moreGamesPause":
//            alert("moregame");//decamincow
            //window.location.href="objc://"+"moreGame:/0";// by decamincow
            break;
        case "continue":
            playSound("thud1");
            userInput.removeHitArea("continue");
            initGame();
            break;
        case "gameTouch":
            if(gameTouchState >= 3) {
                return;
            }
            if(_oData.isBeingDragged && !_oData.hasLeft) {
                if(gameTouchState == 2) {
                    targAimX = _oData.x;
                    targAimY = _oData.y;
                }
                arrow.alpha = 1;
            } else if(_oData.isDown) {
                TweenLite.killTweensOf(oPosData);
                toggleHudButs(false);
                if(_oData.x < cueBall.x + 40 && _oData.x > cueBall.x - 40 && _oData.y < cueBall.y + 40 && _oData.y > cueBall.y - 40) {
                    gameTouchState = 2;
                    aimX = targAimX = _oData.x;
                    aimY = targAimY = _oData.y;
                    cueBall.changeState("aiming");
                }
                if(_oData.hasLeft) {
                    arrow.alpha = .5;
                } else {
                    arrow.alpha = 1;
                }
            } else {
                toggleHudButs(true);
                if(gameTouchState == 2 && arrow.scaleX > .05) {
                    shotsTaken++;
                    gameTouchState = 3;
                    arrow.takeShot(cueBall);
                    if(arrow.scaleX < .5) {
                        playSound("cue3");
                    } else if(arrow.scaleX < .8) {
                        playSound("cue2");
                    } else {
                        playSound("cue1");
                    }
                    return;
                } else {
                    gameTouchState = 0;
                    if(cueBall.state != "waiting") {
                        cueBall.changeState("waiting");
                    }
                }
            }
            break;
        case "nextLevel":
            playSound("thud1");
            userInput.removeHitArea("replayFromEndLevel");
            userInput.removeHitArea("quitFromEndLevel");
            userInput.removeHitArea("nextLevel");
            userInput.removeHitArea("moreGames");
            levelNum++;
            if(levelNum < 24) {
                initGame();
            } else {
                initLevelSelect();
            }
            break;
        case "replayFromEndLevel":
            playSound("thud1");
            userInput.removeHitArea("replayFromEndLevel");
            userInput.removeHitArea("quitFromEndLevel");
            userInput.removeHitArea("nextLevel");
            userInput.removeHitArea("moreGames");
            levelScore = 0;
            initGame();
            break;
        case "quitFromEndLevel":
            playSound("thud1");
            userInput.removeHitArea("replayFromEndLevel");
            userInput.removeHitArea("quitFromEndLevel");
            userInput.removeHitArea("nextLevel");
            userInput.removeHitArea("moreGames");
            initStartScreen();
            break;
        case "mute":
            playSound("thud1");
            toggleMute();
            break;
        case "pause":
        case "resumeFromPause":
            playSound("thud1");
            toggleManualPause();
            break;
        case "replayFromPause":
            playSound("thud1");
            gameState = "pauseReplay";
            toggleManualPause();
            userInput.removeHitArea("pause");
            userInput.removeHitArea("gameTouch");
            userInput.removeHitArea("quitFromPause");
            userInput.removeHitArea("resumeFromPause");
            userInput.removeHitArea("replayFromPause");
            levelScore = 0;
            totalScore = 0;
            initGame();
            break;
        case "quitFromPause":
            playSound("thud1");
            toggleManualPause();
            userInput.removeHitArea("pause");
            userInput.removeHitArea("gameTouch");
            userInput.removeHitArea("quitFromPause");
            userInput.removeHitArea("resumeFromPause");
            userInput.removeHitArea("replayFromPause");
            levelScore = 0;
            totalScore = 0;
            initStartScreen();
            break;
    }
}
function updateScore(_inc) {
    levelScore += _inc;
    hud.updateScore(bonusScore, levelScore + totalScore);
}
function updateBonusScore(_inc) {
    bonusScore += _inc;
    levelBonusScore += _inc;
    hud.updateScore(bonusScore, levelScore + totalScore);
}
function initLevelComplete() {
//    alert("gameover");//decamincow
    //window.location.href="objc://"+"gameOver:/0"; //by decamincow
    gameState = "levelComplete";
    if(audioType == 1) {
        musicTween.kill();
        musicTween = TweenLite.to(music, .5, {
            volume: .5,
            ease: "Linear.easeNone"
        });
    }
    playSound("levelComplete");
    userInput.removeHitArea("pause");
    userInput.removeHitArea("gameTouch");
    var oReplayBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            488, 
            300
        ],
        scale: 1,
        frame: 4
    };
    var oQuitBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            142, 
            300
        ],
        scale: 1,
        frame: 3
    };
    var oNextLevelBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            658, 
            300
        ],
        scale: 1,
        frame: 8
    };
    var oMoreGamesBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            312, 
            300
        ],
        scale: 1,
        frame: 1
    };
    userInput.addHitArea("replayFromEndLevel", butEventHandler, null, "image", oReplayBut);
    userInput.addHitArea("quitFromEndLevel", butEventHandler, null, "image", oQuitBut);
    userInput.addHitArea("nextLevel", butEventHandler, null, "image", oNextLevelBut);
    userInput.addHitArea("moreGames", butEventHandler, null, "image", oMoreGamesBut);
    var aButs = new Array(oReplayBut, oQuitBut, oNextLevelBut);
    panel = new Elements.Panel(assetLib.getData("panels"), assetLib.getData("potNumbers"), assetLib.getData("endSymbols"), gameState, aButs, canvas.width, canvas.height);
    var levelStars = getLevelStars();
    if(saveDataHandler.aLevelStore[levelNum * 2] < levelStars + 1) {
        saveDataHandler.aLevelStore[levelNum * 2] = levelStars + 1;
    }
    if(saveDataHandler.aLevelStore[levelNum * 2 + 1] < levelScore) {
        saveDataHandler.aLevelStore[levelNum * 2 + 1] = levelScore;
    }
    if(levelNum < aLevelData.length - 1) {
        if(saveDataHandler.aLevelStore[(levelNum + 1) * 2] == 1 || saveDataHandler.aLevelStore[(levelNum + 1) * 2] == 5) {
            saveDataHandler.aLevelStore[(levelNum + 1) * 2] = 0;
        }
    }
    saveDataHandler.saveData();
    panel.oScoreData = {
        stars: levelStars,
        levelScore: levelScore,
        totalScore: getTotalScore()
    };
    panel.startTweenEndLevel();
    previousTime = new Date().getTime();
    updateLevelComplete();
}
function initRoachComplete() {
    gameState = "roachComplete";
    if(audioType == 1) {
        musicTween.kill();
        musicTween = TweenLite.to(music, .5, {
            volume: .5,
            ease: "Linear.easeNone"
        });
    }
    playSound("levelComplete");
    userInput.removeHitArea("pause");
    userInput.removeHitArea("gameTouch");
    var oReplayBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            488, 
            300
        ],
        scale: 1,
        frame: 4
    };
    var oQuitBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            142, 
            300
        ],
        scale: 1,
        frame: 3
    };
    var oNextLevelBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            658, 
            300
        ],
        scale: 1,
        frame: 8
    };
    var oMoreGamesBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            312, 
            300
        ],
        scale: 1,
        frame: 1
    };
    userInput.addHitArea("replayFromEndLevel", butEventHandler, null, "image", oReplayBut);
    userInput.addHitArea("quitFromEndLevel", butEventHandler, null, "image", oQuitBut);
    userInput.addHitArea("nextLevel", butEventHandler, null, "image", oNextLevelBut);
    userInput.addHitArea("moreGames", butEventHandler, null, "image", oMoreGamesBut);
    var aButs = new Array(oReplayBut, oQuitBut, oNextLevelBut);
    panel = new Elements.Panel(assetLib.getData("panels"), assetLib.getData("potNumbers"), assetLib.getData("endSymbols"), gameState, aButs, canvas.width, canvas.height);
    var levelStars = 1;
    saveDataHandler.aLevelStore[levelNum * 2] = 6;
    if(saveDataHandler.aLevelStore[levelNum * 2 + 1] < levelScore) {
        saveDataHandler.aLevelStore[levelNum * 2 + 1] = levelScore;
    }
    if(levelNum < aLevelData.length - 1) {
        if(saveDataHandler.aLevelStore[(levelNum + 1) * 2] == 1) {
            saveDataHandler.aLevelStore[(levelNum + 1) * 2] = 0;
        } else if(saveDataHandler.aLevelStore[(levelNum + 1) * 2] == 5) {
            saveDataHandler.aLevelStore[(levelNum + 1) * 2] = 6;
        }
    }
    saveDataHandler.saveData();
    panel.oScoreData = {
        stars: levelStars,
        levelScore: levelScore,
        totalScore: getTotalScore()
    };
    panel.startTweenEndLevel();
    previousTime = new Date().getTime();
    updateRoachComplete();
}
function getLevelStars() {
    var ballsToPot = 0;
    for(var i = 0; i < aLevelData[levelNum].aData.length; i++) {
        if(aLevelData[levelNum].aData[i].type == "ball" || aLevelData[levelNum].aData[i].type == "blackBall") {
            ballsToPot++;
        }
    }
    var stars = 1;
    if(shotsTaken <= ballsToPot * 1.5) {
        stars = 3;
    } else if(shotsTaken <= ballsToPot * 2.5) {
        stars = 2;
    }
    console.log(shotsTaken, (ballsToPot * 1.5), (ballsToPot * 2.5));
    return stars;
}
function getTotalScore() {
    var totalScore = 0;
    for(var i = 0; i < aLevelData.length; i++) {
        totalScore += saveDataHandler.aLevelStore[i * 2 + 1];
    }
    return totalScore;
}
function isNearHole(_ball, _hole) {
    var a = _ball.trackX - _hole.x;
    var b = _ball.trackY - _hole.y;
    var distance_squared = (a * a) + (b * b);
    if(distance_squared < 750) {
        if(_ball.oData.type != "cueBall") {
            if(_ball.oData.type == "blackBall") {
                var isLastBall = true;
                for(var i = 0; i < aBalls.length; i++) {
                    if((aBalls[i].state == "moving" || aBalls[i].state == "waiting") && aBalls[i].oData.type != "blackBall" && aBalls[i].oData.type != "cueBall") {
                        isLastBall = false;
                        break;
                    }
                }
                if(isLastBall) {
                    shotScore += 500;
                }
            }
            if(shotsSinceLastPot == 0) {
                shotScore += 50;
            }
            levelScore += shotScore;
            hud.score = levelScore;
            shotsSinceLastPot = 0;
        } else if(levelScore >= 50) {
            levelScore -= 50;
            hud.score = levelScore;
        }
        return true;
    } else {
        return false;
    }
}
function toggleHudButs(_on) {
    if(_on) {
        userInput.addHitArea("mute", butEventHandler, null, "rect", {
            aRect: [
                740, 
                0, 
                canvas.width, 
                55
            ]
        }, true);
        userInput.addHitArea("pause", butEventHandler, null, "rect", {
            aRect: [
                0, 
                0, 
                55, 
                55
            ]
        }, true);
        userInput.addHitArea("gameTouch", butEventHandler, {
            isDraggable: true,
            multiTouch: true
        }, "rect", {
            aRect: [
                0, 
                0, 
                canvas.width, 
                canvas.height
            ]
        }, true);
    } else {
        userInput.removeHitArea("mute");
        userInput.removeHitArea("pause");
    }
}
function ballCallback(_message, _oData) {
    if (typeof _oData === "undefined") { _oData = null; }
    switch(_message) {
        case "hitRoach":
            cueBall.hitRoach();
            if(roachChain == 0) {
                shotScore += 50;
            }
            roachChain = 0;
            updateScore(shotScore / 2);
            _oData.roach.roachScore = shotScore / 2;
            break;
        case "moveEnded":
            var allStopped = true;
            for(var i = 0; i < aBalls.length; i++) {
                if(aBalls[i].state == "moving") {
                    allStopped = false;
                    break;
                }
            }
            if(allStopped) {
                var onlyCueballLeft = true;
                for(var i = 0; i < aBalls.length; i++) {
                    if(aBalls[i].state == "waiting" && aBalls[i].oData.type != "cueBall" || aBalls.length == 1) {
                        onlyCueballLeft = false;
                        break;
                    }
                }
                if(onlyCueballLeft) {
                    return;
                }
                for(var i = 0; i < aBalls.length; i++) {
                    if(aBalls[i].state == "waiting" && aBalls[i].oData.type == "cueBall") {
                        aBalls[i].changeState("indicating");
                    }
                }
                aimX = targAimX = cueBall.x;
                aimY = targAimY = cueBall.y;
                arrow.renderFunc = arrow.renderAim;
                gameTouchState = 0;
                oPosData.prevBallX = cueBall.trackX;
                oPosData.prevBallY = cueBall.trackY;
                playSound("zombie" + Math.ceil(Math.random() * 5), .3);
                if(shotsSinceLastPot > 0) {
                    shotScore = 100;
                } else {
                    shotScore += 50;
                }
                roachChain = 1;
                shotsSinceLastPot++;
            }
            break;
        case "holeEnded":
            for(var i = 0; i < aBalls.length; i++) {
                if(aBalls[i].removeMe) {
                    if(aBalls[i].oData.type == "cueBall" && aBalls.length > 1) {
                        var safePos = false;
                        var quitInc = 0;
                        var tempX = aBalls[i].startX;
                        var tempY = aBalls[i].startY;
                        while(!safePos) {
                            for(var j = 0; j < aBalls.length; j++) {
                                if(tempX > aBalls[j].trackX - aBalls[j].radius && tempX < aBalls[j].trackX + aBalls[j].radius && tempY > aBalls[j].trackY - aBalls[j].radius && tempY < aBalls[j].trackY + aBalls[j].radius) {
                                    tempX = aBalls[i].startX + Math.random() * 160 - 80;
                                    tempY = aBalls[i].startY + Math.random() * 160 - 80;
                                    safePos = false;
                                    break;
                                } else {
                                    safePos = true;
                                }
                            }
                            if(++quitInc >= 200) {
                                safePos = true;
                            }
                        }
                        aBalls[i].changeState("reset", {
                            x: tempX,
                            y: tempY
                        });
                        aBalls[i].changeState("indicating");
                        aimX = targAimX = cueBall.x;
                        aimY = targAimY = cueBall.y;
                    } else {
                        aBalls.splice(i, 1);
                        break;
                    }
                }
            }
            if(aBalls.length == 1) {
                initLevelComplete();
            }
            break;
    }
}
function renderRoachTimer() {
    var tableNumberImgData = assetLib.getData("tableNumbers");
    for(var i = 0; i < Math.ceil(roachTimer).toString().length; i++) {
        var id = parseFloat(Math.ceil(roachTimer).toString().charAt(i));
        var imgX = (id * tableNumberImgData.oData.spriteWidth) % tableNumberImgData.img.width;
        var imgY = Math.floor(id / (tableNumberImgData.img.width / tableNumberImgData.oData.spriteWidth)) * tableNumberImgData.oData.spriteHeight;
        ctx.drawImage(tableNumberImgData.img, imgX, imgY, tableNumberImgData.oData.spriteWidth, tableNumberImgData.oData.spriteHeight, canvas.width / 2 + i * 75 - (75 * Math.ceil(roachTimer).toString().length) / 2, 200 + oPosData.stageY, tableNumberImgData.oData.spriteWidth, tableNumberImgData.oData.spriteHeight);
    }
}
function updateGameEvent() {
    if(manualPause || rotatePause || gameState != "game") {
        return;
    }
    var delta = getDelta();
    if(gameTouchState == 2) {
        aimX += ((targAimX - aimX) / .1) * delta;
        aimY += ((targAimY - aimY) / .1) * delta;
        if(targAimY < buffer && cueBall.trackY < 140) {
            oPosData.targStageY = -targAimY;
        } else if(targAimY > canvas.height - buffer && cueBall.trackY > 480 - 140) {
            oPosData.targStageY = -buffer - (buffer - (canvas.height - targAimY));
        } else {
            oPosData.targStageY = -buffer;
        }
        if(oPosData.targStageY > 0) {
            oPosData.targStageY = 0;
        } else if(oPosData.targStageY < -80) {
            oPosData.targStageY = -80;
        }
    } else {
        oPosData.targStageY = -buffer;
    }
    oPosData.stageY += ((oPosData.targStageY - oPosData.stageY) / .3) * delta;
    table.update(oPosData.stageX, oPosData.stageY, delta);
    table.render(ctx);
    if(gameTouchState == 3) {
        physics2D.update(delta);
    }
    if(isRoachLevel) {
        roachTimer -= delta;
        renderRoachTimer();
    }
    if(roachTimer < 0) {
        initRoachComplete();
    }
    for(var i = 0; i < aRoaches.length; i++) {
        aRoaches[i].update(oPosData.stageX, oPosData.stageY, delta);
        renderSprite(aRoaches[i]);
        if(gameTouchState == 3 && aRoaches[i].canHit && checkSpriteCollision(cueBall, aRoaches[i])) {
            aRoaches[i].hit();
            playSound("roach" + Math.ceil(Math.random() * 4));
        }
        if(aRoaches[i].removeMe) {
            aRoaches[i].reset();
        }
    }
    for(var i = 0; i < aBalls.length; i++) {
        for(var j = 0; j < aHoles.length; j++) {
            if(aBalls[i].state == "moving" && isNearHole(aBalls[i], aHoles[j])) {
                playSound("hole" + Math.ceil(Math.random() * 4));
                aBalls[i].changeState("holed", {
                    x: aHoles[j].x,
                    y: aHoles[j].y,
                    score: shotScore
                });
                break;
            }
        }
        aBalls[i].update(oPosData.stageX, oPosData.stageY, delta);
        renderSprite(aBalls[i]);
    }
    arrow.update(cueBall.x, cueBall.y, aimX, aimY, delta);
    arrow.render(ctx);
    hud.update(oPosData.stageX, oPosData.stageY, delta);
    hud.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateGameEvent);
}
function updateCreditsScreenEvent() {
    if(rotatePause || gameState != "credits") {
        return;
    }
    var delta = getDelta();
    panel.update(delta);
    panel.render(ctx, false);
    renderMuteBut();
    requestAnimFrame(updateCreditsScreenEvent);
}
function updateLevelComplete() {
    if(rotatePause || gameState != "levelComplete") {
        return;
    }
    var delta = getDelta();
    background.updateScroll(delta);
    background.renderScroll(ctx);
    panel.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateLevelComplete);
}
function updateRoachComplete() {
    if(rotatePause || gameState != "roachComplete") {
        return;
    }
    var delta = getDelta();
    background.updateScroll(delta);
    background.renderScroll(ctx);
    panel.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateRoachComplete);
}
function updateSplashScreenEvent() {
    if(rotatePause || gameState != "splash") {
        return;
    }
    var delta = getDelta();
    splashTimer += delta;
    if(splashTimer > 2.5) {
        if(audioType == 1 && !muted) {
            music.play();
        }
        initStartScreen();
        return;
    }
    splash.render(ctx, delta);
    requestAnimFrame(updateSplashScreenEvent);
}
function updateStartScreenEvent() {
    if(rotatePause || gameState != "start") {
        return;
    }
    var delta = getDelta();
    background.updateScroll(delta);
    background.renderScroll(ctx);
    panel.update(delta);
    panel.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateStartScreenEvent);
}
function updateLevelSelectEvent() {
    if(rotatePause || gameState != "levelSelect") {
        return;
    }
    var delta = getDelta();
    background.updateScroll(delta);
    background.renderScroll(ctx);
    panel.render(ctx);
    renderMuteBut();
    requestAnimFrame(updateLevelSelectEvent);
}
function getDelta() {
    var currentTime = new Date().getTime();
    var delta = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    if(delta > .5) {
        delta = 0;
    }
    return delta;
}
function renderSprite(_element) {
    ctx.save();
    ctx.translate(_element.x, _element.y);
    ctx.rotate(_element.rotation);
    ctx.globalAlpha = _element.alpha;
    ctx.scale(_element.scaleX, _element.scaleY);
    _element.render(ctx);
    ctx.restore();
}
function checkSpriteCollision(_s1, _s2) {
    var s1XOffset = _s1.x;
    var s1YOffset = _s1.y;
    var s2XOffset = _s2.x;
    var s2YOffset = _s2.y;
    var distance_squared = (((s1XOffset - s2XOffset) * (s1XOffset - s2XOffset)) + ((s1YOffset - s2YOffset) * (s1YOffset - s2YOffset)));
    var radii_squared = (_s1.radius) * (_s2.radius);
    if(distance_squared < radii_squared) {
        return true;
    } else {
        return false;
    }
}
function getScaleImageToMax(_oImgData, _aLimit) {
    var newScale;
    if(_oImgData.isSpriteSheet) {
        if(_aLimit[0] / _oImgData.oData.spriteWidth < _aLimit[1] / _oImgData.oData.spriteHeight) {
            newScale = Math.min(_aLimit[0] / _oImgData.oData.spriteWidth, 1);
        } else {
            newScale = Math.min(_aLimit[1] / _oImgData.oData.spriteHeight, 1);
        }
    } else {
        if(_aLimit[0] / _oImgData.img.width < _aLimit[1] / _oImgData.img.height) {
            newScale = Math.min(_aLimit[0] / _oImgData.img.width, 1);
        } else {
            newScale = Math.min(_aLimit[1] / _oImgData.img.height, 1);
        }
    }
    return newScale;
}
function getCentreFromTopLeft(_aTopLeft, _oImgData, _imgScale) {
    var aCentre = new Array();
    aCentre.push(_aTopLeft[0] + (_oImgData.oData.spriteWidth / 2) * _imgScale);
    aCentre.push(_aTopLeft[1] + (_oImgData.oData.spriteHeight / 2) * _imgScale);
    return aCentre;
}
function loadPreAssets() {
    if(aLangs.length > 1) {
        preAssetLib = new Utils.AssetLoader(curLang, [
            {
                id: "langSelect",
                file: "images/langSelect.jpg"
            }, 
            {
                id: "preloadImage",
                file: "images/preloadImage.jpg"
            }
        ], ctx, canvas.width, canvas.height, false);
        preAssetLib.onReady(initLangSelect);
    } else {
        curLang = aLangs[0];
        preAssetLib = new Utils.AssetLoader(curLang, [
            {
                id: "preloadImage",
                file: "images/preloadImage.jpg"
            }
        ], ctx, canvas.width, canvas.height, false);
        preAssetLib.onReady(initLoadAssets);
    }
}
function initLangSelect() {
    var oImgData = preAssetLib.getData("langSelect");
    ctx.drawImage(oImgData.img, canvas.width / 2 - oImgData.img.width / 2, canvas.height / 2 - oImgData.img.height / 2);
    var butSize = 140;
    for(var i = 0; i < aLangs.length; i++) {
        var px = canvas.width / 2 - (butSize * aLangs.length) / 2 + i * butSize;
        var py = canvas.height / 2 - butSize / 2;
        userInput.addHitArea("langSelect", butEventHandler, {
            lang: aLangs[i]
        }, "rect", {
            aRect: [
                px, 
                py, 
                px + butSize, 
                py + 140
            ]
        });
    }
}
function initLoadAssets() {
    var oImgData = preAssetLib.getData("preloadImage");
    ctx.drawImage(oImgData.img, 0, 0);
    loadAssets();
}
function loadAssets() {
    assetLib = new Utils.AssetLoader(curLang, [
        {
            id: "rotateDeviceMessage",
            file: "images/rotateDeviceMessage.jpg"
        }, 
        {
            id: "splash",
            file: "images/splashScreen.jpg"
        }, 
        {
            id: "background",
            file: "images/background.jpg"
        }, 
        {
            id: "hud",
            file: "images/hud.png"
        }, 
        {
            id: "uiButs",
            file: "images/" + curLang + "/uiButs_153x87.png"
        }, 
        {
            id: "panels",
            file: "images/" + curLang + "/panels_800x400.png"
        }, 
        {
            id: "levelButs",
            file: "images/levelButs_199x99.png"
        }, 
        {
            id: "tableNumbers",
            file: "images/tableNumbers_98x184.png"
        }, 
        {
            id: "potNumbers",
            file: "images/potNumbers_48x75.png"
        }, 
        {
            id: "levelNumbers",
            file: "images/levelNumbers_23x33.png"
        }, 
        {
            id: "muteBut",
            file: "images/mute_61x63.png"
        }, 
        {
            id: "endSymbols",
            file: "images/endSymbols_221x153.png"
        }, 
        {
            id: "ball",
            file: "images/balls_118x164.png",
            oAnims: {
                cueBallWaiting: [
                    0, 
                    1, 
                    2, 
                    3, 
                    4, 
                    5, 
                    6, 
                    7, 
                    8, 
                    9, 
                    10, 
                    11, 
                    12, 
                    13, 
                    14, 
                    15, 
                    16, 
                    17, 
                    18, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19, 
                    19
                ],
                cueBallMoving: [
                    19
                ],
                ballWaiting: [
                    20
                ],
                ballMoving: [
                    20
                ],
                blackBallWaiting: [
                    21
                ],
                blackBallMoving: [
                    21
                ],
                splash: [
                    21, 
                    22, 
                    23, 
                    24, 
                    25, 
                    26, 
                    27, 
                    28, 
                    29, 
                    30, 
                    31, 
                    32, 
                    33, 
                    34, 
                    35
                ]
            }
        }, 
        {
            id: "roach",
            file: "images/roach_128x116.png",
            oAnims: {
                running: [
                    0, 
                    1, 
                    2, 
                    3, 
                    4, 
                    5, 
                    6, 
                    7, 
                    8, 
                    9, 
                    10, 
                    11
                ],
                explode: [
                    12, 
                    13, 
                    14, 
                    15, 
                    16, 
                    17, 
                    18, 
                    19, 
                    20, 
                    21, 
                    22
                ]
            }
        }, 
        {
            id: "tableRoach",
            file: "images/" + curLang + "/tableRoach.jpg"
        }, 
        {
            id: "table0",
            file: "images/" + curLang + "/table0.jpg"
        }, 
        {
            id: "table1",
            file: "images/" + curLang + "/table1.jpg"
        }, 
        {
            id: "table2",
            file: "images/" + curLang + "/table2.jpg"
        }, 
        {
            id: "table4",
            file: "images/" + curLang + "/table4.jpg"
        }, 
        {
            id: "table5",
            file: "images/" + curLang + "/table5.jpg"
        }, 
        {
            id: "table6",
            file: "images/" + curLang + "/table6.jpg"
        }, 
        {
            id: "table8",
            file: "images/" + curLang + "/table8.jpg"
        }, 
        {
            id: "table9",
            file: "images/" + curLang + "/table9.jpg"
        }, 
        {
            id: "table10",
            file: "images/" + curLang + "/table10.jpg"
        }, 
        {
            id: "table12",
            file: "images/" + curLang + "/table12.jpg"
        }, 
        {
            id: "table13",
            file: "images/" + curLang + "/table13.jpg"
        }, 
        {
            id: "table14",
            file: "images/" + curLang + "/table14.jpg"
        }, 
        {
            id: "table16",
            file: "images/" + curLang + "/table16.jpg"
        }, 
        {
            id: "table17",
            file: "images/" + curLang + "/table17.jpg"
        }, 
        {
            id: "table18",
            file: "images/" + curLang + "/table18.jpg"
        }, 
        {
            id: "table20",
            file: "images/" + curLang + "/table20.jpg"
        }, 
        {
            id: "table21",
            file: "images/" + curLang + "/table21.jpg"
        }, 
        {
            id: "table22",
            file: "images/" + curLang + "/table22.jpg"
        }, 
        {
            id: "cue",
            file: "images/cue_510x75.png"
        }, 
        {
            id: "arrow",
            file: "images/arrow_100x27.png"
        }
    ], ctx, canvas.width, canvas.height);
    assetLib.onReady(initSplash);
}
function resizeCanvas() {
    var tempInnerWidth = window.innerWidth;
    var tempInnerHeight = window.innerHeight;
    if(tempInnerWidth > 480) {
        tempInnerWidth -= 1;
        tempInnerHeight -= 1;
    }
    if(window.innerWidth < window.innerHeight && isMobile) {
        if(gameState != "loading") {
            rotatePauseOn();
        }
        canvas.style.width = tempInnerWidth + "px";
        canvas.style.height = (tempInnerWidth / canvas.width) * canvas.height + "px";
        canvasX = 0;
        canvasY = ((tempInnerHeight - (tempInnerWidth / canvas.width) * canvas.height) / 2);
        canvasScaleX = canvasScaleY = canvas.width / tempInnerWidth;
        div.style.marginTop = canvasY + "px";
        div.style.marginLeft = canvasX + "px";
    } else if(!isMobile) {
        if(rotatePause) {
            rotatePauseOff();
        }
        if(tempInnerWidth / canvas.width < tempInnerHeight / canvas.height) {
            canvas.style.width = tempInnerWidth + "px";
            canvas.style.height = (tempInnerWidth / canvas.width) * canvas.height + "px";
            canvasX = 0;
            canvasY = ((tempInnerHeight - (tempInnerWidth / canvas.width) * canvas.height) / 2);
            canvasScaleX = canvasScaleY = canvas.width / tempInnerWidth;
            div.style.marginTop = canvasY + "px";
            div.style.marginLeft = canvasX + "px";
        } else {
            canvas.style.width = (tempInnerHeight / canvas.height) * canvas.width + "px";
            canvas.style.height = tempInnerHeight + "px";
            canvasX = ((tempInnerWidth - (tempInnerHeight / canvas.height) * canvas.width) / 2);
            canvasY = 0;
            canvasScaleX = canvasScaleY = canvas.height / tempInnerHeight;
            div.style.marginTop = canvasY + "px";
            div.style.marginLeft = canvasX + "px";
        }
    } else {
        if(rotatePause) {
            rotatePauseOff();
        }
        if(tempInnerWidth / canvas.width < tempInnerHeight / canvas.height) {
            canvas.style.width = tempInnerWidth + "px";
            canvas.style.height = (tempInnerWidth / canvas.width) * canvas.height + "px";
            canvasX = 0;
            canvasY = ((tempInnerHeight - (tempInnerWidth / canvas.width) * canvas.height) / 2);
            canvasScaleX = canvasScaleY = canvas.width / tempInnerWidth;
            div.style.marginTop = canvasY + "px";
            div.style.marginLeft = canvasX + "px";
        } else {
            canvas.style.width = (tempInnerHeight / canvas.height) * canvas.width + "px";
            canvas.style.height = tempInnerHeight + "px";
            canvasX = ((tempInnerWidth - (tempInnerHeight / canvas.height) * canvas.width) / 2);
            canvasY = 0;
            canvasScaleX = canvasScaleY = canvas.height / tempInnerHeight;
            div.style.marginTop = canvasY + "px";
            div.style.marginLeft = canvasX + "px";
        }
    }
    userInput.setCanvas(canvasX, canvasY, canvasScaleX, canvasScaleY);
}
function playSound(_id, _vol) {
    if (typeof _vol === "undefined") { _vol = 1; }
    if(audioType == 1) {
        sound.volume(_vol);
        sound.play(_id);
    }
}
function toggleMute() {
    muted = !muted;
    if(audioType == 1) {
        if(muted) {
            Howler.mute();
        } else {
            Howler.unmute();
        }
    } else if(audioType == 2) {
        if(muted) {
            music.pause();
        } else {
            music.play();
        }
    }
    renderMuteBut();
}
function renderLogoBut() {
    ctx.drawImage(oLogoBut.oImgData.img, 0, 0, oLogoBut.oImgData.img.width, oLogoBut.oImgData.img.height, oLogoBut.aPos[0] - (oLogoBut.oImgData.img.width / 2) * oLogoBut.scale, oLogoBut.aPos[1] - (oLogoBut.oImgData.img.height / 2) * oLogoBut.scale, oLogoBut.oImgData.img.width * oLogoBut.scale, oLogoBut.oImgData.img.height * oLogoBut.scale);
}
function renderMuteBut() {
    if(audioType == 0) {
        return;
    }
    var oImgData = assetLib.getData("muteBut");
    var id = 0;
    if(muted) {
        id = 1;
    }
    var imgX = (id * oImgData.oData.spriteWidth) % oImgData.img.width;
    var imgY = Math.floor(id / (oImgData.img.width / oImgData.oData.spriteWidth)) * oImgData.oData.spriteHeight;
    ctx.drawImage(oImgData.img, imgX, imgY, oImgData.oData.spriteWidth, oImgData.oData.spriteHeight, 742, 3, oImgData.oData.spriteWidth, oImgData.oData.spriteHeight);
}
function toggleManualPause() {
    if(!manualPause) {
        manualPause = true;
        pauseCoreOn();
        var oQuitBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                225, 
                300
            ],
            scale: 1,
            frame: 3
        };
        var oResumeBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                575, 
                300
            ],
            scale: 1,
            frame: 9
        };
        var oReplayLevelBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                canvas.width / 2, 
                300
            ],
            scale: 1,
            frame: 4
        };
        var aButs = new Array(oQuitBut, oResumeBut, oReplayLevelBut);
        userInput.addHitArea("quitFromPause", butEventHandler, null, "image", oQuitBut);
        userInput.addHitArea("resumeFromPause", butEventHandler, null, "image", oResumeBut);
        userInput.addHitArea("replayFromPause", butEventHandler, null, "image", oReplayLevelBut);
        panel = new Elements.Panel(assetLib.getData("panels"), assetLib.getData("levelNumbers"), assetLib.getData("endSymbols"), "pause", aButs, canvas.width, canvas.height);
        panel.render(ctx, false);
        renderMuteBut();
        userInput.addHitArea("pause", butEventHandler, null, "rect", {
            aRect: [
                0, 
                0, 
                55, 
                55
            ]
        }, true);
    } else {
        manualPause = false;
        userInput.removeHitArea("quitFromPause");
        userInput.removeHitArea("resumeFromPause");
        userInput.removeHitArea("replayFromPause");
        pauseCoreOff();
    }
}
function rotatePauseOn() {
    rotatePause = true;
    ctx.drawImage(assetLib.getImg("rotateDeviceMessage"), 0, 0);
    userInput.pauseIsOn = true;
    pauseCoreOn();
}
function rotatePauseOff() {
    rotatePause = false;
    userInput.removeHitArea("quitFromPause");
    userInput.removeHitArea("resumeFromPause");
    userInput.removeHitArea("replayFromPause");
    pauseCoreOff();
}
function pauseCoreOn() {
    if(audioType == 1) {
        Howler.mute();
    } else if(audioType == 2) {
        music.pause();
    }
    switch(gameState) {
        case "start":
            break;
        case "help":
            break;
        case "game":
            userInput.removeHitArea("gameTouch");
            break;
        case "end":
            break;
    }
}
function pauseCoreOff() {
    if(audioType == 1) {
        if(!muted) {
            Howler.unmute();
        }
    } else if(audioType == 2) {
        if(!muted) {
            music.play();
        }
    }
    previousTime = new Date().getTime();
    userInput.pauseIsOn = false;
    switch(gameState) {
        case "splash":
            updateSplashScreenEvent();
            break;
        case "start":
            initStartScreen();
            break;
        case "tutorial":
            break;
        case "credits":
            initCreditsScreen();
            break;
        case "levelSelect":
            initLevelSelect();
            break;
        case "levelComplete":
            initLevelComplete();
            break;
        case "roachComplete":
            initRoachComplete();
            break;
        case "game":
            manualPause = false;
            userInput.addHitArea("gameTouch", butEventHandler, {
                isDraggable: true,
                multiTouch: true
            }, "rect", {
                aRect: [
                    0, 
                    0, 
                    canvas.width, 
                    canvas.height
                ]
            }, true);
            updateGameEvent();
            break;
        case "gameOver":
            break;
    }
}
