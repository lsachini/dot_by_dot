function Options() {
    var opponentColor,
        playerColor,
        boardSize,
        firstMove,
        difficulty,
        util = new Util();
        storage = window.storage;
        
    if (!storage) {
        storage = window.localStorage;
    }
        
    // FunÃ§Ãµes pÃºblicas
    { // begin region
    function init() {
        var doc = document;
        
        loadValues();
        
        doc.getElementById('opponentColor').value = opponentColor;
        doc.getElementById('playerColor').value = playerColor;
        doc.getElementById('boardSize').value = boardSize;
        doc.getElementById('firstMove').value = firstMove;
        doc.getElementById('difficulty').value = difficulty;       
        
        doc.getElementById('opponentColor').disabled = false;
        doc.getElementById('playerColor').disabled = false;
        doc.getElementById('boardSize').disabled = false;
        doc.getElementById('firstMove').disabled = false;
        doc.getElementById('difficulty').disabled = false;        
    }
    this.init = init;
    
    function loadValues() {
        var doc = document;
        
        opponentColor = storage.getItem('opponentColor');
        playerColor = storage.getItem('playerColor');
        boardSize = storage.getItem('boardSize');
        firstMove = storage.getItem('firstMove');
        difficulty = storage.getItem('difficulty');

        // + '' é necessário para conversão do tipo object, retornado
        // pelo JavaScriptInterface no Android, para string. Se não fizer isso
        // comparações com === e !== não funcionam (poderia ter sido utilizado
        // comparadores == ou !=, que também funcionaria)        
        opponentColor = opponentColor ? opponentColor + '' : 'red';
        playerColor = playerColor ? playerColor + '' : 'blue';
        boardSize = boardSize ? boardSize + '' : '7x7';
        firstMove = firstMove ? firstMove + '' : 'player';
        difficulty = difficulty ? difficulty + '' : 'normal';
    }
    this.loadValues = loadValues;
    
    function saveValues() {
        var doc = document;
        
        opponentColor = doc.getElementById('opponentColor').value; 
        playerColor = doc.getElementById('playerColor').value;
        boardSize = doc.getElementById('boardSize').value;
        firstMove = doc.getElementById('firstMove').value;
        difficulty = doc.getElementById('difficulty').value;

        if (playerColor === opponentColor) {
            dialog( { message: util.getStringFromKey('equalColors'),
                      buttonOk: function() { return; } } );   
            
            return;
        }
        
        storage.setItem('opponentColor', opponentColor);
        storage.setItem('playerColor', playerColor);
        storage.setItem('boardSize', boardSize);
        storage.setItem('firstMove', firstMove);
        storage.setItem('difficulty', difficulty);        
        
        back();
    }
    this.saveValues = saveValues;
    
    function getValue(name) {
        switch (name) {
            case 'opponentColor':
                return opponentColor;
                
            case 'playerColor':
                return playerColor;
                
            case 'boardSize':
                return boardSize;
                
            case 'firstMove':
                return firstMove;
                
            case 'difficulty':
                return difficulty;
                
            default:
                break;
        }
        
        return '';
    }
    this.getValue = getValue;
    
    function back() {
        window.location.assign('main.html');
    }
    this.back = back;
    } // end region
}