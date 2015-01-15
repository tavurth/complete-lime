/**
 * complete.lime 1.0.4
 * MIT Licensing
 * Copyright (c) 2013 Lorenzo Puccetti
 * 
 * This Software shall be used for doing good things, not bad things.
 * 
 * Forked complete.ly.js to complete.lime.js 2014-12-27, Lennart Borgman
 * Copyright (c) 2015 Lennart Borgman (for my small additions only, of course)
 *
 **/  

// fix-me: Something can loop sometimes after CR, but what??? Maybe it was the "change" event??

function completeLime(container, config) {
    config = config || {};
    config.fontSize =                       config.fontSize   || '16px';
    config.fontFamily =                     config.fontFamily || 'sans-serif';
    config.height =                         config.height || '32px';
    config.padding =                        config.padding || '8px';
    config.promptInnerHTML =                config.promptInnerHTML || ''; 
    config.color =                          config.color || '#333';
    config.hintColor =                      config.hintColor || '#aaa';
    config.backgroundColor =                config.backgroundColor || '#fff';
    config.dropDownBorderColor =            config.dropDownBorderColor || '#aaa';
    config.dropDownZIndex =                 config.dropDownZIndex || '100'; // to ensure we are in front of everybody
    config.dropDownOnHoverBackgroundColor = config.dropDownOnHoverBackgroundColor || '#ddd';
    
    var txtInput = document.createElement('input');
    txtInput.type ='search';
    txtInput.spellcheck = false; 
    txtInput.style.fontSize =        config.fontSize;
    txtInput.style.fontFamily =      config.fontFamily;
    txtInput.style.height =          config.height;
    txtInput.style.padding =         config.padding;
    txtInput.style.color =           config.color;
    txtInput.style.backgroundColor = config.backgroundColor;
    txtInput.style.width = '100%';
    txtInput.style.outline = '0';
    txtInput.style.border =  '0';
    txtInput.style.margin =  '0';
    txtInput.style.verticalAlign = 'middle';
    
    var txtHint = txtInput.cloneNode(); 
    txtHint.tabIndex = '-1';
    txtHint.disabled='';        
    txtHint.style.position = 'absolute';
    txtHint.style.top =  '0';
    txtHint.style.left = '0';
    txtHint.style.borderColor = 'transparent';
    txtHint.style.boxShadow =   'none';
    txtHint.style.color = config.hintColor;
    
    txtInput.placeholder = 'Enter search string';
    txtInput.autofocus = true;
    txtInput.autocomplete ='search';
    txtInput.style.backgroundColor ='transparent';
    txtInput.style.position = 'relative';
    
    var wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.outline = '0';
    wrapper.style.border =  '0';
    wrapper.style.margin =  '0';
    wrapper.style.padding = '0';
    
    var prompt = document.createElement('div');
    prompt.style.position = 'absolute';
    prompt.style.outline = '0';
    prompt.style.margin =  '0';
    prompt.style.padding = '0';
    prompt.style.border =  '0';
    prompt.style.fontSize =   config.fontSize;
    prompt.style.fontFamily = config.fontFamily;
    prompt.style.color =           config.color;
    prompt.style.backgroundColor = config.backgroundColor;
    prompt.style.top = '0';
    prompt.style.left = '0';
    prompt.style.overflow = 'hidden';
    prompt.innerHTML = config.promptInnerHTML;
    prompt.style.background = 'transparent';
    if (document.body === undefined) {
        throw 'document.body is undefined. The library was wired up incorrectly.';
    }
    document.body.appendChild(prompt);            
    var w = prompt.getBoundingClientRect().right; // works out the width of the prompt.
    wrapper.appendChild(prompt);
    prompt.style.visibility = 'visible';
    prompt.style.left = '-'+w+'px';
    wrapper.style.marginLeft= w+'px';
    
    wrapper.appendChild(txtHint);
    wrapper.appendChild(txtInput);
    
    var dropDown = document.createElement('div');
    dropDown.style.position = 'absolute';
    dropDown.style.visibility = 'hidden';
    dropDown.style.outline = '0';
    dropDown.style.margin =  '0';
    dropDown.style.padding = '0';  
    dropDown.style.textAlign = 'left';
    dropDown.style.fontSize =   config.fontSize;      
    dropDown.style.fontFamily = config.fontFamily;
    dropDown.style.backgroundColor = config.backgroundColor;
    dropDown.style.zIndex = config.dropDownZIndex; 
    dropDown.style.cursor = 'default';
    dropDown.style.borderStyle = 'solid';
    dropDown.style.borderWidth = '1px';
    dropDown.style.borderColor = config.dropDownBorderColor;
    dropDown.style.overflowX= 'hidden';
    dropDown.style.whiteSpace = 'pre';
    // dropDown.style.overflowY = 'scroll';  // note: this might be ugly when the scrollbar is not required. however in this way the width of the dropDown takes into account
    dropDown.style.overflowY = 'auto';  // note: was too ugly, let the browser handle it! ;-)
    
    
    var createDropDownController = function(elem) {
        var rows = [];
        var ix = 0;
        var oldIndex = -1;
        
        // See: https://developer.mozilla.org/en/docs/Web/API/EventTarget.addEventListener
        // Fix-me: The outline does not show as expected, but it is there.
        var mouseOverHandler =  function(ths) { ths.style.outline = '1px solid #00f'; }
        var mouseOutHandler =   function(ths) { ths.style.outline = '0'; }
        var mouseDownHandler =  function(ths) { p.hide(); p.onmouseselection(ths.__hint); }
        
        var p = {
            hide :  function() { elem.style.visibility = 'hidden'; }, 
            isHidden : function() { return (elem.style.visibility === 'hidden'); }, 
            refresh : function(token, array) {
                elem.style.visibility = 'hidden';
                ix = 0;
                elem.innerHTML ='';
                var vph = (window.innerHeight || document.documentElement.clientHeight);
                var rect = elem.parentNode.getBoundingClientRect();
                var distanceToTop = rect.top - 6;                        // heuristic give 6px 
                var distanceToBottom = vph - rect.bottom -6;  // distance from the browser border.
                
                rows = [];
                var tokenRegex = new RegExp("^"+token,"i");
                var paddingLeft = config.padding;
                var paddingRight = config.padding;
                for (var i=0;i<array.length;i++) {
                    if (!tokenRegex.test(array[i])) { continue; }        // <-- case independent match
                    var divRow =document.createElement('div');
                    divRow.style.color = config.color;
                    divRow.style.lineHeight = config.height;
                    divRow.style.paddingLeft = paddingLeft;
                    divRow.style.paddingRight = paddingRight;
                    divRow.tabIndex = '0';
                    divRow.addEventListener("mouseover", function(){ mouseOverHandler(this); });
                    divRow.addEventListener("mouseout",  function(){ mouseOutHandler(this); });
                    divRow.addEventListener("mousedown", function(){ mouseDownHandler(this); });
                    divRow.__hint =    array[i];
                    divRow.innerHTML = token+'<b>'+array[i].substring(token.length)+'</b>';
                    rows.push(divRow);
                    elem.appendChild(divRow);
                }
                if (rows.length===0) { return; } // nothing to show.
                // do not show dropDown if it has only one element which matches what we display.
                if (rows.length===1 && token === rows[0].__hint) { return; }
                // if (rows.length<2) return; // Fix-me: Maybe better to show this? Touch. Completion.

                p.highlight(0);
                
                if (distanceToTop > distanceToBottom*3) {        // Heuristic (only when the distance to the to top is 4 times more than distance to the bottom
                    // elem.style.maxHeight =  distanceToTop+'px';  // we display the dropDown on the top of the input text
                    elem.style.top ='';
                    elem.style.bottom ='100%';
                } else {
                    elem.style.top = '100%';  
                    elem.style.bottom = '';
                    // elem.style.maxHeight =  distanceToBottom+'px';
                }
                elem.style.visibility = 'visible';
            },
            highlight : function(index) {
                if (oldIndex !=-1 && rows[oldIndex]) { 
                    rows[oldIndex].style.backgroundColor = config.backgroundColor;
                }
                rows[index].style.backgroundColor = config.dropDownOnHoverBackgroundColor; // <-- should be config
                oldIndex = index;
            },
            move : function(step) { // moves the selection either up or down (unless it's not possible) step is either +1 or -1.
                if (elem.style.visibility === 'hidden')             return ''; // nothing to move if there is no dropDown. (this happens if the user hits escape and then down or up)
                if (ix+step === -1 || ix+step === rows.length) return rows[ix].__hint; // NO CIRCULAR SCROLLING. 
                ix+=step; 
                p.highlight(ix);
                return rows[ix].__hint;//txtShadow.value = uRows[uIndex].__hint ;
            },
            onmouseselection : function() {} // it will be overwritten. 
        };
        return p;
    }

    function scrollToEnd() { txtInput.scrollLeft = 9000; txtHint.scrollLeft = txtInput.scrollLeft; }
    
    var dropDownController = createDropDownController(dropDown);
    
    dropDownController.onmouseselection = function(text) {
        // txtInput.value = txtHint.value = leftSide+text; 
        txtHint.value = leftSide+text; 
        copyCarefully2txtInput(leftSide+text); 
        scrollToEnd();
        rs.onChange(txtInput.value); // <-- forcing it.
        registerOnTextChangeOldValue = txtInput.value; // <-- ensure that mouse down will not show the dropDown now.
        // Something seems wrong in Chrome (and in IE).
        // txtInput becomes the document.activeElement, but still focus is not there.
        // Fix-me: File a bug report.
        setTimeout(function() { txtInput.focus(); },0);
    }
    
    wrapper.appendChild(dropDown);
    container.appendChild(wrapper);
    
    var spacer; 
    var leftSide; // <-- it will contain the leftSide part of the textfield (the bit that was already autocompleted)
    
    
    function calculateWidthForText(text) {
        if (spacer === undefined) { // on first call only.
            spacer = document.createElement('span'); 
            spacer.style.visibility = 'hidden';
            spacer.style.position = 'fixed';
            spacer.style.outline = '0';
            spacer.style.margin =  '0';
            spacer.style.padding = '0';
            spacer.style.border =  '0';
            spacer.style.left = '0';
            spacer.style.whiteSpace = 'pre';
            spacer.style.fontSize =   config.fontSize;
            spacer.style.fontFamily = config.fontFamily;
            spacer.style.fontWeight = 'normal';
            document.body.appendChild(spacer);    
        }        
        
        // Used to encode an HTML string into a plain text.
        // taken from http://stackoverflow.com/questions/1219860/javascript-jquery-html-encoding
        spacer.innerHTML = String(text).replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return spacer.getBoundingClientRect().right;
    }
   
    // Ensure case in input and hint are the same:
    function setHintValue(txt) {
        var str = txtInput.value;
        txtHint.value = str + txt.substring(str.length);
    }


    function onEnterActions() {
        if (rs.isTouchDevice) txtInput.blur(); // Get rid of virtual keyboard.
        rs.onEnter( dropDown.style.visibility != 'hidden' );
    }

    var rs = { 
        onArrowDown : function() {},               // defaults to no action.
        onArrowUp :   function() {},               // defaults to no action.
        onEnter :     function() {},               // defaults to no action.
        onTab :       function() {},               // defaults to no action.
        onChange:     function() { rs.repaint() }, // defaults to repainting.
        abortAuto:    function() {},               // for aborting auto comp still in progress after CR
        startFrom:    0,
        options:      [],
        wrapper : wrapper,      // For easy access to the HTML elements to the final user (customizations)
        input :  txtInput,      // For easy access to the HTML elements to the final user (customizations) 
        hint  :  txtHint,       // For easy access to the HTML elements to the final user (customizations)
        dropDown :  dropDown,   // For easy access to the HTML elements to the final user (customizations)
        prompt : prompt,
        // Fix-me: I want to detect here is virtual keyboard only, but there is no way to do that. Yet.
        isTouchDevice : "ontouchstart" in window,
        setText : function(text) {
            txtHint.value = text;
            // txtInput.value = text; 
            copyCarefully2txtInput(text); 
        },
        getText : function() {
            return txtInput.value; 
        },
        hideDropDown : function() {
            dropDownController.hide();
        },
        repaint : function() {
            var text = txtInput.value;
            var startFrom =  rs.startFrom; 
            var options =    rs.options;
            var optionsLength = options.length; 
            
            // breaking text in leftSide and token.
            var token = text.substring(startFrom);
            leftSide =  text.substring(0,startFrom);
            if (token.length + leftSide.length === 0) {
                dropDownController.hide();
                return;
            }
            
            // updating the hint. 
            txtHint.value ='';
            // console.log("txtHint.value = '', 1 updating hint", txtInput.value);
            var tokenRegex = new RegExp("^"+token,"i");
            for (var i=0;i<optionsLength;i++) {
                var opt = options[i];
                if (tokenRegex.test(opt)) { // <-- case independent match
                    // txtHint.value = leftSide +opt;
                    setHintValue( leftSide + opt );
                    break;
                }
            }
            
            // moving the dropDown and refreshing it.
            dropDown.style.left = calculateWidthForText(leftSide)+'px';
            dropDownController.refresh(token, rs.options);
        }
    };
    
    var registerOnTextChangeOldValue;

    /**
     * Register a callback function to detect changes to the content of the input-type-text.
     * Those changes are typically followed by user's action: a key-stroke event but sometimes it might be a mouse click.
     **/
    var registerOnTextChange = function(txt, callback) {
        registerOnTextChangeOldValue = txt.value;
        var handler = function() {
            var value = txt.value;
            if (registerOnTextChangeOldValue !== value) {
                registerOnTextChangeOldValue = value;
                callback(value);
            }
        };


        // For user's actions, we listen to both input events and key up events
        // It appears that input events are not enough so we defensively listen to key up events too.
        // source: http://help.dottoro.com/ljhxklln.php
        //
        // The cost of listening to three sources should be negligible
        // as the handler will invoke callback function only if the
        // text.value was effectively changed.
        //  
        // 
        txt.addEventListener("input",  handler, false);
        txt.addEventListener('keyup',  handler, false);
        txt.addEventListener('change', handler, false);
    };
    
    
    registerOnTextChange(txtInput,function(text) { // note the function needs to be wrapped as API-users will define their onChange
        rs.onChange(text);
    });

    // Avoid triggering a change event if we can. I suspect this
    // caused some looping, but I do not really understand what
    // happened. I just saw something was looping.
    function copyCarefully2txtInput(txt) {
        if (txtInput.value === txt) return;
        txtInput.value = txt;
    }
    
    
    var keyDownHandler = function(e) {
        // Fix-me: replace when this is supported:
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.key
        // console.log(e.keyCode, e.key);

        var keyCode = e.keyCode;
        
        if (keyCode == 33) { return; } // page up (do nothing)
        if (keyCode == 34) { return; } // page down (do nothing);
        
        if (keyCode == 27) { //escape
            e.preventDefault(); // We will empty the input field ourself - timing etc
            if (!dropDownController.isHidden()) {
                dropDownController.hide();
            } else {
                // txtInput.value = "";
                copyCarefully2txtInput(""); 
            }
            txtHint.value = txtInput.value; // ensure that no hint is left.
            txtInput.focus(); 
            return; 
        }
        
        if (keyCode == 39 || keyCode == 35 || keyCode == 9) { // right,  end, tab  (autocomplete triggered)
            if (keyCode == 9) {
                // for tabs we need to ensure that we override the
                // default behaviour: move to the next focusable
                // HTML-element since users might want to re-enable its
                // default behaviour or handle the call somehow.
                rs.onTab(); // tab was called with no action.
                return;
            }
            if (txtHint.value.length > 0) { // if there is a hint
                dropDownController.hide();
                // txtInput.value = txtHint.value;
                copyCarefully2txtInput(txtHint.value); 
                scrollToEnd();
                var hasTextChanged = registerOnTextChangeOldValue != txtInput.value
                registerOnTextChangeOldValue = txtInput.value; // <-- to avoid dropDown to appear again. 
                // for example imagine the array contains the
                // following words: bee, beef, beetroot user has hit
                // enter to get 'bee' it would be prompted with the
                // dropDown again (as beef and beetroot also match)
                if (hasTextChanged) {
                    rs.onChange(txtInput.value); // <-- forcing it.
                }
            }
            return; 
        }
        
        if (keyCode == 13) {       // enter  (autocomplete triggered)
            if (txtHint.value.length == 0) { // if there is a hint
                // if (rs.isTouchDevice) txtInput.blur(); // Get rid of virtual keyboard.
                // rs.onEnter();
                // console.log("13 hint length == 0, drop vis=", dropDown.style.visibility);
                onEnterActions();
            } else {
                var wasDropDownHidden = (dropDown.style.visibility == 'hidden');
                dropDownController.hide();
                
                if (wasDropDownHidden) {
                    // console.log("13 dropdown was hidden");
                    txtHint.value = txtInput.value; // ensure that no hint is left.
                    txtInput.focus();
                    // if (rs.isTouchDevice) txtInput.blur(); // Get rid of virtual keyboard.
                    // rs.onEnter();    
                    onEnterActions();
                    return; 
                }
                
                // console.log("13 dropdown was visible");
                // txtInput.value = txtHint.value;
                copyCarefully2txtInput(txtHint.value); 
                scrollToEnd();
                var hasTextChanged = registerOnTextChangeOldValue != txtInput.value
                registerOnTextChangeOldValue = txtInput.value; // <-- to avoid dropDown to appear again. 
                // for example imagine the array contains the
                // following words: bee, beef, beetroot user has hit
                // enter to get 'bee' it would be prompted with the
                // dropDown again (as beef and beetroot also match)
                if (hasTextChanged) {
                    rs.onChange(txtInput.value); // <-- forcing it.
                } else {
                    // Fix-me: abort auto
                    rs.abortAuto();
                }
                
            }
            return; 
        }
        
        if (keyCode == 40) {     // down
            var m = dropDownController.move(+1);
            if (m == '') { rs.onArrowDown(); }
            // txtHint.value = leftSide+m;
            setHintValue( leftSide + m );
            e.preventDefault();
            e.stopPropagation();
            return; 
        } 
        
        if (keyCode == 38 ) {    // up
            var m = dropDownController.move(-1);
            if (m == '') { rs.onArrowUp(); }
            // txtHint.value = leftSide+m;
            setHintValue( leftSide + m );
            e.preventDefault();
            e.stopPropagation();
            return; 
        }
        
        // it's important to reset the txtHint on key down.
        // think: user presses a letter (e.g. 'x') and never releases... you get (xxxxxxxxxxxxxxxxx)
        // and you would see still the hint
        txtHint.value =''; // resets the txtHint. (it might be updated onKeyUp)
        // console.log("txtHint.value = '', 2 resetting hint on key down", txtInput.value);
        
    };

    var clickHandler = function() {
        // In some browsers there is an "x" to the left in the input
        // field (when the type is "search") which clears the
        // field. Reset the txtHint if the input is empty.
        //
        // This seems to be necessary to do in a timer, at least in Chrome and IE now.
        // console.log("txtInput clicked", txtInput.value);
        setTimeout(function() {
            if (txtInput.value.length === 0) { txtHint.value =''; }
            dropDownController.hide();
        }, 0);
    };

    var blurHandler = function() {
        if (!rs.isTouchDevice) dropDownController.hide();
        txtHint.value ='';
        // console.log("txtHint.value = '', 3 blur", txtInput.value);
    };

    var scrollHandlerDoIt = function() {
        // console.log("scroll", txtInput.scrollLeft, txtInput.scrollTop);
        txtHint.scrollLeft = txtInput.scrollLeft;
        txtHint.scrollTop = txtInput.scrollTop;
    };
    var scrollHandler = (function() {
        var timer;
        return function(txt) {
            if (timer) return;
            timer = setTimeout(function() { scrollHandlerDoIt(); timer = null; }, 50);
        };
    })();
    
    txtInput.addEventListener("blur",    function()  { scrollHandler(); blurHandler(); });
    txtInput.addEventListener("change",  function()  { scrollHandler(); });
    txtInput.addEventListener("click",   function()  { scrollHandler(); clickHandler(); });
    txtInput.addEventListener("focus",   function()  { scrollHandler(); rs.repaint(); });
    txtInput.addEventListener("input",   function()  { scrollHandler(); });
    txtInput.addEventListener("keydown", function(e) { scrollHandler(); keyDownHandler(e); }, false);
    txtInput.addEventListener("keyup",   function()  { scrollHandler(); });
    // txtInput.addEventListener("scroll",  function() { scrollHandler(); });
    return rs;
}
