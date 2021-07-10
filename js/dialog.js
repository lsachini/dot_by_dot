 function dialog(args) {
    var shadow = document.getElementById('shadow'),
        dlg = document.getElementById('dialog'),
        messageArea = document.getElementById('messageArea'),
        promptArea = document.getElementById('promptArea'),
        buttonArea = document.getElementById('buttonArea'),
        prompt = document.getElementById('prompt'),
        util = new Util(),
        retArgs,
        buttons,
        buttonOk,
        buttonCancel,
        buttonClose,
        hasButton = false,
        i,
        len;
    
    if (!shadow) { 
        shadow = document.createElement('DIV');
        
        shadow.id = 'shadow';
        shadow.name = 'shadow';
        shadow.style.display = 'none';
        
        document.body.appendChild(shadow);    
    
        dlg = document.createElement('DIV');
    
        dlg.id = 'dialog';
        dlg.name = 'dialog';
        dlg.style.display = 'none';
        
        document.body.appendChild(dlg);
        
        messageArea =  document.createElement('DIV');
        
        messageArea.id = 'messageArea';
        messageArea.name = 'messageArea';
        
        dlg.appendChild(messageArea);
        
        promptArea =  document.createElement('DIV');
        
        promptArea.id = 'promptArea';
        promptArea.name = 'promptArea';
        
        dlg.appendChild(promptArea);     

        prompt =  document.createElement('input');
        
        prompt.id = 'prompt';
        prompt.name = 'prompt';
        prompt.maxLength = 10;
        
        promptArea.appendChild(prompt);         
        
        buttonArea =  document.createElement('DIV');
        
        buttonArea.id = 'buttonArea';
        buttonArea.name = 'buttonArea';
        
        dlg.appendChild(buttonArea);        
    } 

    messageArea.innerHTML = args.message;

    if (args.prompt && args.prompt === true) {
        promptArea.style.display = 'block';
    } else {
        promptArea.style.display = 'none';
    }
    
    buttons = buttonArea.childNodes;
    
    
    for (i = (buttons.length - 1); i >= 0; i -= 1) {
        buttons[i].parentNode.removeChild(buttons[i]);
    }
    
    if (args.buttonOk) {
        buttonOk = newButton('buttonOk', util.getStringFromKey('ok'), 'ok');
    }

    if (args.buttonCancel) {
        buttonCancel =  newButton('buttonCancel', util.getStringFromKey('cancel'), 'cancel');
    }

    if (args.buttonClose) {
        buttonClose =  newButton('buttonClose', util.getStringFromKey('close'), 'close');
    } 

    function newButton(name, label, buttonType) {
        var obj;
        
        obj =  document.createElement('DIV');
        
        obj.id = name;
        obj.name = name;       
        obj.className = 'button button-medium';
        obj.innerHTML = label;   
        
        if (hasButton) {
            obj.style.cssFloat = 'right'; 
        } else {
            obj.style.cssFloat = 'left'; 
            hasButton = true;
        }
        
        buttonArea.appendChild(obj);     
        
        new FastButton(obj, 
                       function () {
                           // Bug no WebView/Android usando display:none, os combos 
                           // não ficavam acessíveis com display:none, por isso
                           // estou usando removeChild.
                           //dlg.style.display = 'none';
                           //shadow.style.display = 'none';
            
                           dlg.parentNode.removeChild(dlg);
                           shadow.parentNode.removeChild(shadow);
            
                           retArgs = { buttonPressed: buttonType };
            
                           if (args.prompt && args.prompt === true) {
                               retArgs.prompt = prompt.value;
                           }
            
                           args[name](retArgs);
                       }, 
                       false,
                       true
        );

        return obj;        
    }
    
    dlg.style.display = 'block';
    shadow.style.display = 'block';
    //shadow.style.height = (document.body.offsetHeight ? document.body.offsetHeight : document.body.scrollHeight) + 'px';
 }