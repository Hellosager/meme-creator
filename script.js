function readURL(input) {
  if (input.files && input.files[0]) {
	var reader = new FileReader();
	reader.onload = function(e) {
		currentImage = document.createElement("IMG");
		currentImage.src = reader.result;
		currentImage.onload = function() {
			canvas.width = currentImage.naturalWidth;
			canvas.height = currentImage.naturalHeight;
			ctx.drawImage(currentImage, 0, 0); // 2 parameter für scaling ergänzen	
		}
	}
	reader.readAsDataURL(input.files[0]);
  }
}

function inCurrentTextRect(x, y){
	return (x >= currentTextRect.x)
			&& (x <= currentTextRect.x + currentTextRect.width)
			&& (y >= currentTextRect.y)
			&& (y <= currentTextRect.y + currentTextRect.height);
}

canvas.onmousedown = function(event){
	mouseDown = true;
	var rect = canvas.getBoundingClientRect();
	x = event.clientX - rect.left;
	y = event.clientY - rect.top;
	mouseDownPoint = new ClickPoint(x, y);
	if(currentTextRect && currentTextRect.inRect(mouseDownPoint)){
		movingRect = true;
	}else if(highlightingRect){
		highlightingRect.x = x;
		highlightingRect.y = y;
	}else{
		highlightingRect = new Rect(x, y, 0, 0);
	}
	ctx.lineWidth = "1";
	ctx.strokeStyle = "red";
	ctx.setLineDash([5]);
}

canvas.onmouseup = function(event){
	mouseDown = false;
	var rect = canvas.getBoundingClientRect();
	x = event.clientX - rect.left;
	y = event.clientY - rect.top;
	var mouseUpPoint = new ClickPoint(x, y);
	if(!movingRect && !mouseUpPoint.equals(mouseDownPoint)){
		if(currentTextRect){
			currentTextRect.x = highlightingRect.x;
			currentTextRect.y = highlightingRect.y;
			currentTextRect.width = highlightingRect.width;
			currentTextRect.height = highlightingRect.height;					
		}else{
			currentTextRect = new Rect(highlightingRect.x, highlightingRect.y, highlightingRect.width, highlightingRect.height);
		}
	}
	movingRect = false;
}

canvas.onmousemove = function(event){
	var rect = canvas.getBoundingClientRect();
	x = event.clientX - rect.left;
	y = event.clientY - rect.top;		
	if(movingRect){
		currentTextRect.x = x-currentTextRect.width/2;
		currentTextRect.y = y-currentTextRect.height/2;
		redraw();
	}
	else if(mouseDown && highlightingRect){
		highlightingRect.width = x - highlightingRect.x;
		highlightingRect.height = y - highlightingRect.y;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawImage();
		ctx.beginPath();
		ctx.rect(highlightingRect.x, highlightingRect.y, highlightingRect.width, highlightingRect.height);
		ctx.stroke();
	}
}

text.onkeyup = function(event){
	currentText = textField.value;
	redraw();
}

function redraw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawImage();
	drawHighlights();
	drawText();
}

function drawImage(){
	if(currentImage){
		ctx.drawImage(currentImage, 0, 0);
	}
}

function drawHighlights(){
	if(currentTextRect.x && currentTextRect.y && currentTextRect.width && currentTextRect.height){
		ctx.lineWidth = "1";
		ctx.strokeStyle = "red";
		ctx.setLineDash([5]);
		ctx.beginPath();
		ctx.rect(currentTextRect.x, currentTextRect.y, currentTextRect.width, currentTextRect.height);
		ctx.stroke();
	}
}

function drawText() {
	if(currentText){
		ctx.font = "30px Comic Sans MS"
		ctx.textAlign = "center";
		ctx.textBaseline = "hanging";
		currentText = textField.value;
		ctx.fillText(textField.value, currentTextRect.x+currentTextRect.width/2, currentTextRect.y-15+currentTextRect.height/2);		
	}
}