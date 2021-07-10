function Dots() {
    var dot1 = null,
        dot2 = null,
        canvasBoard,
        ctxCanvas,
        ROWS = 7,
        COLS = 7,
        hSpaces,
        vSpaces,
        box,
        point,
        len,
        scorePlayer = 0,
        scoreOpponent = 0,
        scoreTotal,
        playerColor,
        opponentColor,
        timer,
        opponent,
        doc = window.document,
        DOT_SIZE = 25, // representa o tamanho do canvas onde será desenhado o ponto
        RADIUS = (DOT_SIZE / 2) - 3, // tamanho do ponto dentro canvas 
        LINE_SIZE = 11,
        BOARD_SIZE = 280,
        DOTS_SPACE = 35,
        margin,
        dotsGame,
        options,
        ranking,
        isMobile = (function () { return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent); }()),
		storage = window.storage,
		util = new Util(),
        gameMode;
    
    if (!storage) {
        storage = window.localStorage;
    } 

    // Força conversão para String
    gameMode = storage.getItem('mode') + '';
  
    // Funções privadas
    { // begin region
    function makeDot(parameters) {
	    var canvas,
            ctx,
            radius;

        radius = RADIUS;

        canvas = document.createElement('canvas');

	    canvas.width	= parameters.size;
	    canvas.height	= parameters.size;
        canvas.style.backgroundColor = 'transparent';
        
	    ctx	= canvas.getContext('2d');
	    ctx.fillStyle	= 'black';
	    ctx.beginPath();
        // x, y, raio, ângulo inicial, ângulo final
	    ctx.arc(DOT_SIZE / 2, DOT_SIZE / 2, radius, 0, Math.PI * 2, true);

        ctx.fill();

	    return canvas;
    }

    function selectDot(dot, selected) {
	    var ctx	= dot.getContext('2d');
	    ctx.fillStyle	= selected ? 'cyan' : 'black';
        ctx.fill();
    }

    function makeLine(parameters) {
        ctxCanvas.beginPath();
        ctxCanvas.strokeStyle = opponent ? 'red' : 'black';
        ctxCanvas.lineWidth = parameters.size;

        ctxCanvas.moveTo(parameters.startX, parameters.startY);
        ctxCanvas.lineTo(parameters.endX, parameters.endY);

        ctxCanvas.stroke();
    }

    function makeAnimatedLine(parameters) {
        var grad,
            tan,
            radian;

        ctxCanvas.beginPath();
        if (parameters.endX - parameters.startX !== 0 &&
            parameters.endY - parameters.startY !== 0) {
            tan = parameters.endX - parameters.startX / parameters.endY - parameters.startY;

            radian = Math.abs(Math.atan(tan));

            parameters.currentX += parseInt(Math.abs(Math.sin(radian) * 5), 10);
            parameters.currentY += parseInt(Math.abs(Math.cos(radian) * 5), 10);
        } else if (parameters.endX - parameters.startX === 0 &&
                   parameters.endY - parameters.startY === 0) {
            return;
        } else if (parameters.endX - parameters.startX !== 0) {
            if (parameters.currentX) {
                parameters.currentX = parameters.endX > parameters.startX ? parameters.currentX += 5 : parameters.currentX -= 5;
            } else {
               parameters.currentX =  parameters.endX > parameters.startX ? parameters.startX: parameters.startX;
            }

            parameters.currentY = parameters.startY;
        } else {
            parameters.currentX = parameters.startX;
            if (parameters.currentY) {
                parameters.currentY = parameters.endY > parameters.startY ? parameters.currentY += 5 : parameters.currentY -= 5;
            } else {
                parameters.currentY = parameters.endY > parameters.startY ? parameters.startY: parameters.startY;
            }
        }

        ctxCanvas.strokeStyle = parameters.opponent ? options.getValue('opponentColor') : options.getValue('playerColor');
        ctxCanvas.lineWidth = parameters.size;
        
        ctxCanvas.moveTo(parameters.startX, parameters.startY);
        ctxCanvas.lineTo(parameters.currentX, parameters.currentY);

        ctxCanvas.stroke();

        if ((parameters.endX > parameters.startX && parameters.currentX <= parameters.endX) ||
            (parameters.endX < parameters.startX && parameters.currentX >= parameters.endX) ||
            (parameters.endY > parameters.startY && parameters.currentY <= parameters.endY) ||
            (parameters.endY < parameters.startY && parameters.currentY >= parameters.endY)) {
            timer = setTimeout(function () { makeAnimatedLine(parameters); }, 35);
        } else {
            parameters.callback();
        }
    }

    function drawBox(parameters) {
        ctxCanvas.beginPath();

        ctxCanvas.rect(parameters.x, parameters.y, parameters.width, parameters.height);
        ctxCanvas.fillStyle = opponent ? options.getValue('opponentColor') : options.getValue('playerColor');

        ctxCanvas.fill();
    }
    
    function updateScore() {
        document.getElementById('tdPlayer').innerHTML = scorePlayer;
        document.getElementById('tdOpponent').innerHTML = scoreOpponent;
    }     
    
    function callbackPlay(result) {
        var found = false,
            i,
            x,
            y, 
            width,
            height,
            namePlayer,
            offset = canvasBoard.offsetLeft,
            margin = (DOT_SIZE - RADIUS * 2) / 2;
            
        for (i = 0; i < result.boxes.length; i += 1) {
            if (result.boxes[i].count === 4) {
                if (!opponent) {
                    scorePlayer += 1;
                } else {
                    scoreOpponent += 1;
                }
                    
                found = true;
                    
                // Ponto inicial do box que deve ser desenhado
                x = document.getElementById('dot' + result.boxes[i].lines[0].start.row + 'x' +
                                                    result.boxes[i].lines[0].start.col).offsetLeft - offset + DOT_SIZE - margin;
                y = document.getElementById('dot' + result.boxes[i].lines[0].start.row + 'x' +
                                                    result.boxes[i].lines[0].start.col).offsetTop + DOT_SIZE - margin;
                    
                // Tamanho do box que deve ser desenhado
                width = document.getElementById('dot' + result.boxes[i].lines[3].end.row + 'x' +
                                                        result.boxes[i].lines[3].end.col).offsetLeft - offset - x + margin;
                height = document.getElementById('dot' + result.boxes[i].lines[3].end.row + 'x' +
                                                         result.boxes[i].lines[3].end.col).offsetTop - y + margin;
                    
                drawBox({ 'x': x, 'y': y, 'width': width, 'height': height});                                                             
                    
                updateScore();
            }
        }
        
        // NÃ£o fechou nenhum box, entÃ£o oponente que joga         
        if (!found) {
            opponent = !opponent;
        }
 
        dot1 = null;
        dot2 = null;
        
        if (dotsGame.isGameOver()) {
            if (scorePlayer > scoreOpponent) {
                if (gameMode !== '2p') {
                    scoreTotal = parseInt(scorePlayer * (options.getValue('difficulty') === 'hard' ? 1.5 : 1), 10);
                    
                    if (ranking.isRanking(scoreTotal)) {
                        dialog({ message: util.getStringFromKey('top5').replace('{1}', scoreTotal), 
                                  prompt: true,
                                buttonOk: function (args) {
                                              var namePlayer = args.prompt;
                                              namePlayer = namePlayer && (namePlayer.replace(/^\s+|\s+$/g,'')) ? namePlayer.replace(/^\s+|\s+$/g,'') : 'Player';
                                              ranking.tryInsert(namePlayer, scoreTotal);                                
                                          }
                              });
                    } else {
                        dialog( { message: util.getStringFromKey('youWin'),
                                 buttonOk: function () { return; } } );
                    }
                } else {
                    dialog( { message: util.getStringFromKey('p1Win'),
                             buttonOk: function() { return; } } );                     
                }
            } else if (scorePlayer < scoreOpponent) {
                if (gameMode !== '2p') {
                    dialog( { message: util.getStringFromKey('youLose'),
                             buttonOk: function() { return; } } );                
                } else {
                    dialog( { message: util.getStringFromKey('p2Win'),
                             buttonOk: function() { return; } } );                     
                }
            } else {
                dialog( { message: util.getStringFromKey('draw'),
                         buttonOk: function() { return; } } );                   
            }
            
            return;
        }
 
        if (gameMode !== '2p' && opponent) {
            playComputer();
        }
    }   

    function click(e) {
        var dot = this,
            result,
            tempDot,
            startX,
            startY,
            endX,
            endY,             
            i,
            offset = canvasBoard.offsetLeft;
            
        // Não é a vez do usuário! Aguarde o computador jogar.
        if ( gameMode !== '2p' && opponent) {
            return;
        }
            
        if (dot1 && dot2) {
            return;
        }
        
        if (dotsGame.isGameOver()) {
            return;
        }
            
        if (dot1) {
            dot2 = dot;
            dot2.first = false;
            selectDot(dot1, false);
        } else {
            dot1 = dot;
            dot1.first = true;
            selectDot(dot1, true);
        }
            
        // Jogador ligou dois pontos
        if (dot2) {
            result = dotsGame.playUser( { 'row': dot1.row, 'col': dot1.col }, 
                                        { 'row': dot2.row, 'col': dot2.col } );
                
            // Boxes que tiveram count alterado virÃ£o no array, se nÃ£o alterou nada deve repetir a jogada
            if (result.code === dotsGame.getCode('OK')) {
                startX = dot1.first ? dot1.offsetLeft - offset + (DOT_SIZE / 2) : dot2.offsetLeft - offset + (DOT_SIZE / 2);
                startY = dot1.first ? dot1.offsetTop + (DOT_SIZE / 2) : dot2.offsetTop + (DOT_SIZE / 2);
                    
                endX = dot1.first ? dot2.offsetLeft - offset + (DOT_SIZE / 2) : dot1.offsetLeft - offset + (DOT_SIZE / 2);
                endY = dot1.first ? dot2.offsetTop + (DOT_SIZE / 2) : dot1.offsetTop + (DOT_SIZE / 2);
                    
                makeAnimatedLine({ 'startX': startX,
                                   'startY': startY,
                                   'endX': endX,
                                   'endY': endY,
                                   'size': LINE_SIZE,
                                   'opponent': opponent,
                                   'callback': function() { callbackPlay(result); } 
                                });
            } else if (result.code === dotsGame.getCode('BUSY')){
                dot1 = null;
                dot2 = null;
                
                dialog( { message: util.getStringFromKey('lineUsed'),
                         buttonOk: function() { return; } } );
            } else {
                dot1 = null;
                dot2 = null;
                
                if (result.code === dotsGame.getCode('ERROR')){
                    dialog( { message: util.getStringFromKey('error'), 
                              buttonOk: function() { return; } } );                    
                }
            }
        }                                        
    }
        
    function playComputer() {
        var result,
            startX,
            startY,
            endX,
            endY,
            offset = canvasBoard.offsetLeft;;
            
        result = dotsGame.playComputer();
            
        if (result.code === dotsGame.getCode('OK')) {
            dot1 = document.getElementById('dot' + result.dot1.row + 'x' + result.dot1.col);
            dot2 = document.getElementById('dot' + result.dot2.row + 'x' + result.dot2.col);
                
            startX = dot1.offsetLeft - offset + (DOT_SIZE / 2);
            startY = dot1.offsetTop + (DOT_SIZE / 2);
                
            endX = dot2.offsetLeft - offset + (DOT_SIZE / 2);
            endY = dot2.offsetTop + (DOT_SIZE / 2);
                
            makeAnimatedLine({ 'startX': startX,
                               'startY': startY,
                               'endX': endX,
                               'endY': endY,
                               'size': LINE_SIZE,
                               'opponent': opponent,
                               'callback': function () { callbackPlay(result); }
                            });
        } else if (result.code === dotsGame.getCode('GAME_OVER')) {
            dialog( { message: util.getStringFromKey('gameOver'),
                buttonOk: function() { return; } } );              
        } else {
            dialog( { message: util.getStringFromKey('error'),
                     buttonOk: function() { return; } } );                
        }
    }        
    } // end region
    
    // Funções públicas
    { // begin region
    function makeBoard() {
        var dot,
        i,
        j,
        board, 
        offset;
    
        if (!options) {
            options = new Options();
        }
        
        if (!ranking) {
            ranking = new Ranking();
        }
    
        options.loadValues();
    
        switch (options.getValue('boardSize')) {
            //case '8x8':
            //    ranking.setBoardType('ranking8x8');
            //    ROWS = COLS = 8;
            //    break;
        
            case '6x6':
                ranking.setBoardType('ranking6x6');            
                ROWS = COLS = 6;
                break;
        
            case '5x5':
                ranking.setBoardType('ranking5x5');            
                ROWS = COLS = 5;
                break;
        
            default:
                ranking.setBoardType('ranking7x7');            
                ROWS = COLS = 7;
                break;
        }
    
        board = doc.getElementById('board');
    
        //hSpaces = (BOARD_SIZE - (DOT_SIZE * COLS)) / (COLS);
        //vSpaces = (BOARD_SIZE - (DOT_SIZE * ROWS)) / (ROWS);
        margin = (BOARD_SIZE - (DOT_SIZE * COLS) - ((DOTS_SPACE - DOT_SIZE) * (COLS - 1))) / 2;
    
        board.innerHTML = '';
    
        canvasBoard = doc.createElement('canvas');
        canvasBoard.id = 'canvasBoard';
        canvasBoard.name = 'canvasBoard';
        //canvasBoard.style.position = 'absolute';
        //canvasBoard.style.left = '0px';
        //canvasBoard.style.top = '0px';
        canvasBoard.style.marginLeft = 'auto';
        canvasBoard.style.marginRight = 'auto';
        canvasBoard.width = BOARD_SIZE;
        canvasBoard.height = BOARD_SIZE;
        
        board.appendChild(canvasBoard);
    
        ctxCanvas = canvasBoard.getContext('2d');    
    
        // Apresenta e posiciona pontos 
        for (i = 0; i < ROWS; i += 1) {
            offset = canvasBoard.offsetLeft;
            
            for (j = 0; j < COLS; j += 1) {
                dot = makeDot({ 'size' : DOT_SIZE});
            
                dot.id = 'dot' + i + 'x' + j;
                dot.row = i;
                dot.col = j;
                dot.name = 'dot';
                dot.dots = [];
                new FastButton(dot, click, false);
            
                board.appendChild(dot);
            
                dot.style.position = 'absolute';
                offset = (offset + parseInt((j === 0 ? margin : DOTS_SPACE - DOT_SIZE) + (j === 0 ? 0 : DOT_SIZE), 10));
                dot.style.left = offset + 'px';
                dot.style.top = parseInt(((i + 1) * (DOTS_SPACE - DOT_SIZE)) + (i * DOT_SIZE), 10) + 'px';
            }
        }
    
        dotsGame = new DotsGame(options.getValue('difficulty'), COLS, ROWS);
    
        opponent = false;
    
        if (options.getValue('firstMove') === 'opponent') {
            opponent = true;
        
            if (gameMode !== '2p') {
                playComputer();
            }
        }  
    }
    this.makeBoard = makeBoard;
    
    function again() {
        var i, 
            dots,
            doc = document;
        
        // Para desenho de linha onde estiver
        clearTimeout(timer);
        
        // Desabilita botões para usuário não fazer besteira
        doc.getElementById('btnReiniciar').disabled = true;
        doc.getElementById('btnVoltar').disabled = true;
        
        // Remove board
        canvasBoard.parentNode.removeChild(canvasBoard);  
        
        // Reinicia placar e o atualiza na tela
        scoreOpponent = 0;
        scorePlayer = 0;
                        
        updateScore();
        
        // Limpa pontos selecionados
        dot1 = null;
        dot2 = null;
        
        // Jogador que deve iniciar
        opponent = options.getValue('firstMove') !== 'opponent' ? false : true;
        
        // Recria board
        makeBoard();
        
        // Board já está limpinho
        doc.getElementById('btnReiniciar').disabled = false;
        doc.getElementById('btnVoltar').disabled = false;        
    }
    this.again = again;
    
    function back() {
        window.location.assign('main.html');
    }
    this.back = back;    
    } // end region
}
