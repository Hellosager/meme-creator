var textField = document.getElementById("text");
var canvas = document.getElementById("canvas");
var textList = document.getElementById("textList");
var saveButton = document.getElementById("save");
const canvasHeight = window.innerHeight / 2;
const canvasWidth = window.innerWidth / 2;
var scaleFactor = 1;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
var ctx = canvas.getContext("2d");
var currentImage = null;
var textRects = [];
var textListElementCount = 0;
const keyCodeEnter = 13;

document.getElementById("fileChooser").addEventListener("change", function() {
	readURL(this);
});

function ClickPoint(x, y) {
	this.x = x;
	this.y = y;
	this.equals = function(clickPoint) {
		return this.x == clickPoint.x && this.y == clickPoint.y;
	}
}

function TextRect(x, y, width, height, text, textfield){
	Rect.call(this, x, y, width, height);
	this.text = text.split("\n");
	this.textfield = textfield;
	var id;
	this.draw = function(ctx){
		this.drawHighlighs(ctx);
		this.drawText(ctx);
	}
	
	this.drawHighlighs = function(ctx){
		if(this.x && this.y && this.width && this.height){
			ctx.lineWidth = "1";
			ctx.strokeStyle = "red";
			ctx.setLineDash([5]);
			ctx.beginPath();
			ctx.rect(this.x, this.y, this.width, this.height);
			ctx.stroke();
		}
	}
	
	this.drawText = function(ctx){
		var fontSize = "30";
		ctx.font = fontSize + "px Comic Sans MS";
		ctx.textAlign = "center";
		ctx.textBaseline = "hanging";
		for(line = 0; line < this.text.length; line++){
			var transY = (this.y - 15 + this.height / 2) + (line * fontSize);
			ctx.fillText(this.text[line], (this.x + this.width / 2), transY);		
		}
	}
}

function Rect(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.inRect = function(clickPoint) {
			return (clickPoint.x >= this.x)
			&& (clickPoint.x <= this.x + this.width)
			&& (clickPoint.y >= this.y)
			&& (clickPoint.y <= this.y + this.height);
	}
}

var currentText = null;
var mouseDown = false;
var movingRect = false;
var mouseDownPoint = null;
var highlightingRect = null;
var currentTextRect = null;