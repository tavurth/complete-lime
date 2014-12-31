window.addEventListener("load", function(){
    autoLime = completeLime(document.getElementById('complete-lime-div'), {
    	fontSize : '16px',
    	fontFamily : 'Arial',
    	color:'#933',
    });
    autoLime.input.placeholder = "Type 'c' or 'o' to test!";
    autoLime.options = [
        'cocoa',
        'coffee only',
        'coffee with milk',
        'coffee with milk and a lot',
        'coffee with milk and a lot of cookies, maybe',
        'coffee with milk and a lot of cookies, or',
        'orange'];
    // autoLime.repaint(); 
    // setTimeout(function() { autoLime.input.focus(); },0);

    // Trace output
    var logDiv = document.getElementById("log");
    function log(txt) {
        var div = document.createElement("div");
        div.innerHTML = txt;
        logDiv.appendChild(div);
    }
    autoLime.onEnter = function() {
        log("onEnter called, .getText()=>\""+autoLime.getText()+"\"");
    };
    // log("isTouchDevice: "+autoLime.isTouchDevice);
    if (window.location.host !== "htmlpreview.github.io") {
        document.getElementById("preview-info").style.display = "block";
    }
});
