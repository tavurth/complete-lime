window.addEventListener("load", function(){
    var auto = completely(document.getElementById('complete-lime-div'), {
    	fontSize : '16px',
    	fontFamily : 'Arial',
    	color:'#933',
    });
    auto.options = ['cocoa','coffee','orange'];
    // auto.repaint(); 
    setTimeout(function() { auto.input.focus(); },0); // See bug info in compile.lime.js

    // Trace output
    var logDiv = document.getElementById("log");
    function log(txt) {
        var div = document.createElement("div");
        div.innerHTML = txt;
        logDiv.appendChild(div);
    }
    auto.onEnter = function() {
        log("onEnter called, .getText()=>\""+auto.getText()+"\"");
    };
    log("isTouchDevice: "+auto.isTouchDevice);
});
