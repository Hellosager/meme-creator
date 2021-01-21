document.addEventListener("DOMConentLoaded", initModal());

function readURL(input) {
	currentImage = document.createElement("IMG");
	currentImage.onload = function() {
		canvas.height = canvasHeight;
		scaleFactor = canvasHeight / currentImage.naturalHeight;
		canvas.width = currentImage.naturalWidth * scaleFactor;
		redraw();
	}

  if (input.files && input.files[0]) {
	var reader = new FileReader();
	reader.onload = function(e) {
		currentImage.src = reader.result;
	}
	reader.readAsDataURL(input.files[0]);
  } else {
	currentImage.src = input;
  }
}

function loadTemplate(event) {
	readURL(event.srcElement.src);
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

function inCurrentTextRect(x, y){ // useless? just use inRect?
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
		if(textRects[i].inRect(mouseDownPoint)){ // other rect was clicked
			currentTextRect = textRects[i];
			updateTextFieldFor(currentTextRect);	// remove after refactoring
			return true;
		}
	}
	return false;
}

canvas.onmousedown = function(event){
	event.preventDefault();
	mouseDown = true;
	var rect = canvas.getBoundingClientRect();
	x = event.clientX - rect.left;
	y = event.clientY - rect.top;
	mouseDownPoint = new ClickPoint(x, y);
	if(updateCurrentTextRect(mouseDownPoint) && currentTextRect){ // we want to drag rect
		movingRect = true;
		currentTextRect.textfield.focus();
		redraw();
	}else if(highlightingRect){
		highlightingRect.x = x;
		highlightingRect.y = y;
	}else{
		highlightingRect = new TextRect(x, y, 0, 0, "");
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
	if(!movingRect){ // we were not moving a rect
		if(!mouseUpPoint.equals(mouseDownPoint)){ // no click at same point, create new text boundaries
			currentTextRect = new TextRect(highlightingRect.x, highlightingRect.y, highlightingRect.width, highlightingRect.height, "");
			currentTextRect.id = "textListElement-" + textListElementCount;

			textRects.push(currentTextRect);
			var rectTextArea = document.createElement("textarea");
			rectTextArea.setAttribute('type', 'text');
			rectTextArea.setAttribute('value', 'default');
			rectTextArea.className = "textListElement";
			rectTextArea.id =  currentTextRect.id;
			rectTextArea.onclick = highlighTextElement;
			rectTextArea.onkeyup = onkeyup;
			currentTextRect.textfield = rectTextArea;

			textList.appendChild(rectTextArea);
			rectTextArea.focus();
			textListElementCount++;

//			if(currentTextRect && currentTextRect.text != ""){	// seems redundant, wtf is that case
//				textRects.push(currentTextRect);				
//			}
		}else{	// click at same point
			currentTextRect = null;
			saveButton.focus();
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

function onkeyup(event){
	if(currentTextRect){
		currentTextRect.text = currentTextRect.textfield.value.split("\n");		
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
}

function initModal() {
	// Get the modal
	var modal = document.getElementById("templateModal");

	// Get the button that opens the modal
	var btn = document.getElementById("openTemplates");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on the button, open the modal
	btn.onclick = function() {
		modal.style.display = "block";
	}

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
}

