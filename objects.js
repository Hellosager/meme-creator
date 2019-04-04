var textField = document.getElementById("text");
var canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 400;
var ctx = canvas.getContext("2d");
var currentImage = null;
var textRects = [];

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

function Rect(x, y, width, height, text) {
	this.text = text;
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