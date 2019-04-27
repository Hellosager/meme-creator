function readURL(input) {
  if (input.files && input.files[0]) {
	var reader = new FileReader();
	reader.onload = function(e) {
		currentImage = document.createElement("IMG");
		currentImage.src = reader.result;
		currentImage.onload = function() {
			canvas.height = canvasHeight;
			scaleFactor = canvasHeight / currentImage.naturalHeight;
			canvas.width = currentImage.naturalWidth * scaleFactor;
			redraw();
		}
	}
	reader.readAsDataURL(input.files[0]);
  }
}

//function maintainHeight(){
//	canvas.height = canvasHeight;
//	const scaleFactor = canvasHeight / currentImage.naturalHeight;
//	canvas.width = currentImage.naturalWidth * scaleFactor;
//	ctx.drawImage(currentImage, 0, 0, currentImage.width * scaleFactor, canvasHeight); // 2 parameter für scaling ergänzen	
//}

//function maintainWidth(){
//	canvas.width = canvasWidth;
//	const scaleFactor = canvasWidth / currentImage.naturalWidth;
//	canvas.height = currentImage.naturalHeight * scaleFactor;
//	ctx.drawImage(currentImage, 0, 0, canvasWidth, currentImage.height * scaleFactor); // 2 parameter für scaling ergänzen	
//}

function inCurrentTextRect(x, y){
	return (x >= currentTextRect.x)
			&& (x <= currentTextRect.x + currentTextRect.width)
			&& (y >= currentTextRect.y)
			&& (y <= currentTextRect.y + currentTextRect.height);
}

function updateCurrentTextRect(mouseDownPoint){
	if(currentTextRect && inCurrentTextRect(mouseDownPoint.x, mouseDownPoint.y)){
		return true;
	}
	for(i = 0; i < textRects.length; i++){
		if(textRects[i].inRect(mouseDownPoint)){
			currentTextRect = textRects[i];
			updateTextFieldFor(currentTextRect);
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
		redraw();
	}else if(highlightingRect){
		highlightingRect.x = x;
		highlightingRect.y = y;
	}else{
		highlightingRect = new TextRect(x, y, 0, 0, textField.value);
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
			currentTextRect = new TextRect(highlightingRect.x, highlightingRect.y, highlightingRect.width, highlightingRect.height, textField.value);
			currentTextRect.id = "textListElement-" + textListElementCount;
			if(currentTextRect && currentTextRect.text != ""){
				textRects.push(currentTextRect);				
			}
		}else{	// click at same point
			if(currentTextRect && currentTextRect.text != "" && !textRects.includes(currentTextRect)){
				textRects.push(currentTextRect);
				var rectDiv = document.createElement("div");
				rectDiv.className = "textListElement";
				rectDiv.id =  currentTextRect.id;
				rectDiv.onclick = highlighTextElement;
				for(line = 0; line < currentTextRect.text.length; line++){
					var lineBreak = document.createElement("br");			
					var rectText = document.createTextNode(currentTextRect.text[line]);
					rectDiv.appendChild(rectText);
					rectDiv.appendChild(lineBreak);
				}
				textList.appendChild(rectDiv);
				textListElementCount++;
			}
			textField.value = "";
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
		currentTextRect = null;
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
		currentTextRect.text = textField.value.split("\n");		
		var listElement = document.getElementById(currentTextRect.id);
		if(listElement){
			for(node = listElement.childNodes.length-1; node >= 0; node--){
				listElement.childNodes[node].remove();
			}			
			for(line = 0; line < currentTextRect.text.length; line++){
				var lineBreak = document.createElement("br");			
				var rectText = document.createTextNode(currentTextRect.text[line]);
				listElement.appendChild(rectText);
				listElement.appendChild(lineBreak);
			}
		}
		redraw();
	}
}

function redraw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawImage();
	if(currentTextRect){
		currentTextRect.draw(ctx);
	}
	for(i = 0; i < textRects.length; i++){
		console.log("draw");
		textRects[i].drawText(ctx);
	}
}

function drawImage(){
	if(currentImage){
	ctx.drawImage(currentImage, 0, 0, currentImage.width * scaleFactor, canvasHeight); // 2 parameter für scaling ergänzen	
	}
}

function saveCanvas() {
	//var link = document.createElement('a');
	var link = document.getElementById("download");
	link.setAttribute('download', 'yourmeme.png');
	link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
	link.click();
}

function highlighTextElement(e){
		var id = e.target.id;
		for(i = 0; i < textRects.length; i++){
		if(textRects[i].id === id){
			currentTextRect = textRects[i];
			updateTextFieldFor(currentTextRect);
			redraw();
		}
	}
}

function updateTextFieldFor(textRect){
	var textFieldValue = "";
	for(line = 0; line < textRect.text.length; line++){
		textFieldValue += textRect.text[line];
		if(line != (textRect.text.length-1)){
			textFieldValue += "\n";
		}
	}
	textField.value = textFieldValue;
}