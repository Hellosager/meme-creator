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

function updateCurrentTextRect(mouseDownPoint){
	for(i = 0; i < textRects.length; i++){
		if(textRects[i].inRect(mouseDownPoint)){
			currentTextRect = textRects[i];
			return true;
		}
	}
	return false;
}

canvas.onmousedown = function(event){
	mouseDown = true;
	var rect = canvas.getBoundingClientRect();
	x = event.clientX - rect.left;
	y = event.clientY - rect.top;
	mouseDownPoint = new ClickPoint(x, y);
	if(updateCurrentTextRect(mouseDownPoint) && currentTextRect){
		movingRect = true;
	}else if(highlightingRect){
		highlightingRect.x = x;
		highlightingRect.y = y;
	}else{
		highlightingRect = new Rect(x, y, 0, 0, textField.value);
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
	if(!movingRect){ // not clicking in rect
		if(!mouseUpPoint.equals(mouseDownPoint)){ // no click at same point
			console.log("create");
			textField.value = "";
			currentTextRect = new Rect(highlightingRect.x, highlightingRect.y, highlightingRect.width, highlightingRect.height, textField.value);
			if(currentTextRect && currentTextRect.text != ""){
				textRects.push(currentTextRect);				
			}
		}else{
			if(currentTextRect && currentTextRect.text != ""){
				textRects.push(currentTextRect);				
			}
			currentTextRect = null;
		}
	}
	redraw();		
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
		redraw();
		ctx.beginPath();
		ctx.rect(highlightingRect.x, highlightingRect.y, highlightingRect.width, highlightingRect.height);
		ctx.stroke();
	}
}

text.onkeyup = function(event){
	if(currentTextRect){
		currentTextRect.text = textField.value;		
		redraw();
	}
}

function redraw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawImage();
	if(currentTextRect){
		drawHighlights(currentTextRect);
		drawText(currentTextRect);
	}
	for(i = 0; i < textRects.length; i++){
		console.log("draw");
		drawText(textRects[i]);
	}
}

function drawImage(){
	if(currentImage){
		ctx.drawImage(currentImage, 0, 0);
	}
}

function drawHighlights(textRect){
	if(textRect && textRect.x && textRect.y && textRect.width && textRect.height){
		ctx.lineWidth = "1";
		ctx.strokeStyle = "red";
		ctx.setLineDash([5]);
		ctx.beginPath();
		ctx.rect(textRect.x, textRect.y, textRect.width, textRect.height);
		ctx.stroke();
	}
}

function drawText(textRect) {
	if(textRect){
		ctx.font = "30px Comic Sans MS"
		ctx.textAlign = "center";
		ctx.textBaseline = "hanging";
	//	currentText = textField.value;
		ctx.fillText(textRect.text, textRect.x+textRect.width/2, textRect.y-15+textRect.height/2);		
	}
}

function saveCanvas() {
	var link = document.createElement('a');
	link.setAttribute('download', 'yourmeme.png');
	link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
	link.click();
}