window.addEventListener("load", function(){
   var auto = completely(document.getElementById('complete-lime-div'), {
    	fontSize : '16px',
    	fontFamily : 'Arial',
    	color:'#933',
   });
   auto.options = ['cocoa','coffee','orange'];
   auto.repaint(); 
   setTimeout(function() {
   	auto.input.focus();
   },0);
});
