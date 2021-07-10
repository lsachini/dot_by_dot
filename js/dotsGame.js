function DotsGame(mode, cols, rows) {
    var boxes,
        dot1,
        dot2,
        selected,
        count,
        boxesClosed,
        loop,
        OK = 0,       // Execução OK
        BUSY = 1,     // Todas linhas já estão ocupadas
        INV_LINE = 2,
        GAME_OVER = 3, // Pontos inválidos para formar uma linha
        ERROR =  4,    // Erro não previsto 
        NOT_FOUND;     // Erro não encontrado
        
    function init() {
        var dot,
            i,
            j,
            board,
            lines,
            box, 
            len;
        
        boxesClosed = 0;
        
        boxes = [];
        
        // Cria estrutura para controle das jogadas
        for (i = 0; i < rows - 1; i += 1) {
            len = boxes.length;
            
            boxes[len] = [];
            
            for (j = 0; j < cols - 1; j += 1) {
                box = boxes[len][boxes[len].length] = {};
                
                box.row = i;
                box.col = j;
                box.count = 0;
                
                lines = [];
                
                // Cada box é composto por 4 pontos (é um quadrado/retângulo, óbvio)
                lines.push( { 'row': i, 'col': j } );
                lines.push( { 'row': i, 'col': (j + 1) } );
                lines.push( { 'row': (i + 1), 'col':  j } );
                lines.push( { 'row': (i + 1), 'col': (j + 1) } );
                
                // Sendo quadrado/retângulo tem quatro lados, bah....
                box.lines = [ { start: lines[0],
                                end: lines[1],
                                busy: false },
                              { start: lines[0],
                                end: lines[2],
                                busy: false },
                              { start: lines[2],
                                end: lines[3],
                                busy: false },
                              { start: lines[1],
                                end: lines[3],
                                busy: false } ];
            }
        }
    }
    
    function playHardMode() {
        var ret,
            parameters;
        
        dot1 = null;
        dot2 = null;
        
        if (isGameOver()) {
            parameters = { 'code': GAME_OVER };
            
            return parameters;
        }
        
        // Vamos tentar fechar alguns boxes, mas de maneira segura
        // sem abrir caminho para jogadas perigosas do usuário
        if (has3Sides('safe')){
            changeLineState();
        // Ver se existem boxes que podem ser fechados, mas antes vamos
        // verificar se podemos fazer alguma jogada em lugar seguro
        } else if (has3Sides('normal')) {
            // Posso fechar alguns boxes e fazer a última jogada num lugar seguro!
            if (hasSafePlace()) {
                // Vamos fecha um box.
                closeBox();
            } else {
                sacrifice();
            }	
        // Não conseguindo fechar nenhum box, mas posso fazer alguma jogada segura?
        } else if (hasSafePlace()) {
            changeLineState();
        // Tem box solitário, com 2 lados preenchidos, para deixar o adversário
        // fechar ?
        } else if (oneGiftForYou()) {
            changeLineState();
        // Tem sequência de 2 boxes para deixar o adversário fechar?
        } else if (twoGiftsForYou()) {
            changeLineState();
        } else {
            // Não se decidiu? Faz qualquer coisa 
            if (makeAnyMove()) {
                changeLineState();  
            }            
        }
           
        if (dot1) {
            parameters = { 'code': OK };
            
            boxesChanged = getBoxes();
            
            parameters.dot1 = { 'row': dot1.row, 'col': dot1.col };
            parameters.dot2 = { 'row': dot2.row, 'col': dot2.col };
            parameters.boxes = boxesChanged;    
        } else {
            parameters = { 'code': ERROR };
        }
        
        return parameters;        
    }
    
    // Verifica se tem algum box com 3 lados
    function has3Sides(mode) {
        var i,
            j,
            line,
            box,
            found;
        
        for (i = 0; i < (rows - 1); i += 1) {
            for (j = 0; j < (cols - 1); j += 1) {
                box = boxes[i][j];
                
                if (box.count === 3) {
                    switch (mode) {
                        // Retorna qualquer linha faltante de qualquer box com 3 lados preenchidos
                        case 'normal':
                            line = getDots(box, false);
                            dot1 = line.dot1;
                            dot2 = line.dot2;
                            
                            selected = box;                            
                        
                            return true;
                        
                        // Fechar todas os boxes que possuam 3 lados preenchidos, mas não podemos
                        // abrir caminho para jogadas perigosas do adversário, jogada segura
                        case 'safe':
                            if (!box.lines[0].busy) {
                                if (i === 0 || boxes[i - 1][j].count !== 2) {
                                    line = getDots(box, false);
                                    dot1 = line.dot1;
                                    dot2 = line.dot2;
                                    
                                    selected = box;
                                    
                                    return true;
                                }
                            } else if (!box.lines[1].busy) {
                                if (j === 0 || boxes[i][j - 1].count !== 2) {
                                    line = getDots(box, false);
                                    dot1 = line.dot1;
                                    dot2 = line.dot2;    

                                    selected = box;                                    
                                    
                                    return true;
                                }
                            } else if (!box.lines[2].busy) {
                                if (i === (rows - 2) || boxes[i + 1][j].count !== 2) {
                                    line = getDots(box, false);
                                    dot1 = line.dot1;
                                    dot2 = line.dot2;    

                                    selected = box;                                    
                                    
                                    return true;
                                    
                                }
                            } else {
                                if (j === (cols - 2) || boxes[i][j + 1].count !== 2) {
                                    line = getDots(box, false);
                                    dot1 = line.dot1;
                                    dot2 = line.dot2;
                                    
                                    selected = box;                                    
                                    
                                    return true;
                                }
                            }
                            break;
                            
                        case 'not':
                            if (selected.row !== box.row || selected.col !== box.col) {
                                line = getDots(box, false);
                                dot1 = line.dot1;
                                dot2 = line.dot2;
                                
                                selected = box;                                
                                    
                                return true;
                            }
                                                
                    }
                }
            }
        }
        
        return false;
    }
    
    // Em busca de uma jogada segura
    function hasSafePlace() {     
        var i = Math.round(Math.random() * (rows - 2));
        var j = Math.round(Math.random() * (cols - 2));
        
        if (randomPlace(i, j)) {
            return true;
        } 
        
        return false;
    }    
    
    function randomPlace(i, j) {
        var x = i;
        var y = j;
        
        do {
            if (isSafePlace(x, y)) {
                return true;
            }
            else {
                y++;
                
                if (y >= (cols - 1)) {
                    y = 0;
                    x++;
                    if (x >= (rows - 1)) {
                        x = 0;
                    }
                }
            }
        } while (x !== i || y !== j);

        return false;
    }    
    
    function isSafePlace(i, j) {
        var line,
            x,
            box, 
            found;
        
        box = boxes[i][j];
        
        for (x = 0; x < box.lines.length; x += 1) {
            found = false;
            
            if (!box.lines[x].busy) {
                // Linhas horizontais
                // Pode ver na montagem dos boxes na função init()
                if (x === 0 || x === 2) {
                    if (box.lines[x].start.row === 0) { // start e end estão na mesma linha
                        if (box.count < 2) {
                            found = true;
                        }
                    } else if (box.lines[x].start.row === (rows - 1)) { // start e end estão na mesma linha
                        if (box.count < 2) {
                           found = true;
                        }
                    } else if ((box.count < 2 && x === 0 && boxes[i - 1][j].count < 2) ||
                               (box.count < 2 && x === 2 && boxes[i + 1][j].count < 2)) {
                        found = true;
                    }
                } 
                // Linhas verticais
                else {
                    if (box.lines[x].start.col === 0) { // start e end estão na mesma coluna
                        if (box.count < 2) {
                            found = true;
                        }
                    } else if (box.lines[x].start.col === (cols - 1)) { // start e end estã na mesma coluna
                        if (box.count < 2) {
                            found = true;
                        } 
                    } else if ((box.count < 2 && x === 1 && boxes[i][j - 1].count < 2) ||
                               (box.count < 2 && x === 3 && boxes[i][j + 1].count < 2)){
                        found = true;
                    }
                }
                
                if (found) {
                    dot1 = box.lines[x].start;
                    dot2 = box.lines[x].end;
                    
                    selected = box;
                    
                    return true;
                }
            }
        }
        
        return false
    }    

    // Sacrifica 2 quadrados
    function sacrifice() { 
        var temp = [],
            line,
            i;
        
        count = 0;
        
        loop = false;
        
        // Conta boxes que podem ser fechados em sequência
        countBoxesInPath('', selected);
        
        // Não achou boxes em sequência, então tenta achar outros
        // boxes que podem ser fechados no tabuleiro
        if (!has3Sides('not')) {
            if (boxesClosed + count !== ((cols - 1) * (rows - 1))) {    
                if (count === 2) {
                    if (!selected.lines[0].busy) {
                        line = selected.lines[0];
                        temp = boxes[selected.row - 1][selected.col];
                    } else if (!selected.lines[1].busy) {
                        line = selected.lines[1];                    
                        temp = boxes[selected.row][selected.col - 1]; 
                    } else if (!selected.lines[2].busy) {
                        line = selected.lines[2];                    
                        temp = boxes[selected.row + 1][selected.col];                    
                    } else if (!selected.lines[3].busy) {
                        line = selected.lines[3];                    
                        temp = boxes[selected.row][selected.col + 1];                    
                    }
                
                    for (i = 0; i < temp.lines.length; i++) {
                        if (!temp.lines[i].busy) {
                            if (temp.lines[i].start.row !== line.start.row ||
                                temp.lines[i].start.col !== line.start.col ||
                                temp.lines[i].end.row !== line.end.row ||
                                temp.lines[i].end.col !== line.end.col) {
                                dot1 = temp.lines[i].start;
                                dot2 = temp.lines[i].end;
                                
                                selected = temp;
                            }
                        }
                    }                
                }
            }
        }

        changeLineState();
    }    
    
    function countBoxesInPath(skip, box) { 
        var i,
            j;

        count += 1;              
        
        i = box.row;
        j = box.col;
        
        if (skip !== 'left' && !box.lines[1].busy) {     
            if (box.col > 0) {
                if (boxes[i][j - 1].count > 2) {
                    count += 1;
                    loop = true;
                } else if (boxes[i][j - 1 ].count > 1) {
                    countBoxesInPath('right', boxes[i][j - 1]);
                }
            }
        } else if (skip !== 'up' && !box.lines[0].busy) {
            if (box.row > 0) {
                if (boxes[i - 1][j].count > 2) {
                    count += 1;
                    loop = true;
                } else if (boxes[i - 1][j].count > 1) {
                    countBoxesInPath('down', boxes[i - 1][j]);
                }
            }
        } else if (skip !== 'right' && !box.lines[3].busy) {
            if (box.col < (cols - 2)) {
                if (boxes[i][j + 1].count > 2) {
                    count += 1;
                    loop = true;
                } else if (boxes[i][j + 1].count > 1) {
                    countBoxesInPath('left', boxes[i][j + 1]);
                }
            }
        } else if (skip !== 'down' && !box.lines[2].busy) {
            if (box.row < (rows - 2)) {
                if (boxes[i + 1][j].count > 2) {
                    count += 1;
                    loop = true;
                } else if (boxes[i + 1][j].count > 1) {
                    countBoxesInPath('up', boxes[i + 1][j]);
                }
            }
        }
    }    
    
    // Jogadas perigosas, tenta encontrar algum box isolado para deixar que o usuário feche
    function oneGiftForYou() {    
        var count, 
            i, 
            j, 
            x,
            box;      
        
        for (i = 0; i < (rows - 1); i++) {
            for (j = 0; j < (cols - 1); j++) {
                box = boxes[i][j];
                
                if (box.count === 2) {
                    count = 0;
                    
                    for(x = 0; x < box.lines.length; x++) {  
                        if (!box.lines[x].busy) {
                            if (x === 0) {
                                if (box.row === 0 || 
                                    boxes[i - 1][j].count < 2) {
                                    count += 1;
                                }
                            } else if (x === 1) {
                                if (box.col === 0 || 
                                    boxes[i][j - 1].count < 2) {
                                    count += 1;
                                }
                            } else if (x === 2) {
                                if (box.row === (rows - 2) || 
                                    boxes[i + 1][j].count < 2) {
                                    count += 1;
                                }
                            } else if (x === 3) {
                                if (box.col === (cols - 2) || 
                                    boxes[i][j + 1].count < 2) {
                                    count += 1;
                                }
                            }
                        }
                        
                        if (count === 2) {
                            dot1 = box.lines[x].start;
                            dot2 = box.lines[x].end;
                            
                            selected = box;
                            
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }    
    
    // Tabuleiro está sem opções de jogadas seguras, não há box isolado para deixar para o usuário fechar,
    // então tenta achar dois boxes em sequência para deixar para o usuário.
    function twoGiftsForYou() {     
        var i,
            j,
            x;
            
        for (i = 0; i < (rows - 1); i++) {
            for (j = 0; j < (cols - 1); j++) {
                box = boxes[i][j];
                
                if (j < (cols - 2) && box.count === 2 && boxes[i][j + 1].count == 2 && !box.lines[3].busy) {
                    if (checkSides(box, [ 'left', 'up', 'down' ]) && 
                        checkSides(boxes[i][j + 1], [ 'right', 'up', 'down'])) {
                        dot1 = box.lines[3].start;
                        dot2 = box.lines[3].end;
                        
                        selected = box;
                        
                        return true;
                    }
                } else if (i < (rows - 2) && box.count === 2 && boxes[i + 1][j] === 2 && !box.lines[2].busy) {
                    if (checkSides(box, [ 'left', 'right', 'up' ]) && 
                        checkSides(boxes[i + 1][j], [ 'left', 'right', 'down'])) {
                        dot1 = box.lines[2].start;
                        dot2 = box.lines[2].end;
                        
                        selected = box;
                        
                        return true;
                    }
                }
            }
        }

        return false
    }    
    
    function checkSides(box, list) {
        var i;
        
        for(i = 0; i < list.length; i += 1) {
            switch(list[i]) {
                case 'up':
                    if (!box.lines[0].busy) {
                        if (box.row === 0 || boxes[box.row - 1][box.col].count < 2) {
                            return true;
                        }
                    }
                    break;
                    
                case 'left':
                    if (!box.lines[1].busy) {
                        if (box.col === 0 || boxes[box.row][box.col - 1].count < 2) {
                            return true;
                        }                        
                    }                
                    break;
                    
                case 'down':
                    if (!box.lines[2].busy) {
                        if (box.row === (rows - 2) || boxes[box.row + 1][box.col].count < 2) {
                            return true;
                        }                        
                    }                
                    break;
                    
                case 'right':
                    if (!box.lines[3].busy) {
                        if (box.col === (cols - 2) || boxes[box.row][box.col + 1].count < 2) {
                            return true;
                        }                        
                    }                
                    break;
            }
        }
        
        return false;
    }
    
    function closeBox() {
        has3Sides('normal');
        
        changeLineState();
    }    
    
    // Nenhuma regra pode ser aplicada, então jogue em qualquer lugar livre.
    function makeAnyMove() {
        var x,
            i,
            j;
            
        for (i = 0; i < (rows - 1); i++) {
            for (j = 0; j < (cols - 1); j++) {
                for (x = 0; x < boxes[i][j].lines.length; x++) {
                    if (!boxes[i][j].lines[x].busy) {
                        dot1 = boxes[i][j].lines[x].start;
                        dot2 = boxes[i][j].lines[x].end;
                        
                        return true;
                    }
                }
            }
        }
        
        return false;
    }    
    
    // Normal Mode
    {
    function getDots(box, random) {
        var i,
            tempDot1,
            tempDot2,
            list = [];
                    
        for (i = 0; i < box.lines.length; i += 1) {
            if (!box.lines[i].busy) {
                tempDot1 = box.lines[i].start;
                tempDot2 = box.lines[i].end;
                          
                list.push({ 'dot1': tempDot1, 'dot2': tempDot2 });
            }
        }
                    
        if (list.length > 0) {
            return list[Math.round(Math.random() * (list.length - 1))];
        }
                    
        return null;
    }    
    
    function getBoxes() {
        var list = [];
                    
        // Obtém os boxes associados a linha selecionada
        if (dot1.row === dot2.row) {
            if (dot1.row > 0) {
                list.push(boxes[dot1.row - 1][dot1.col]);
            }
            if (dot1.row < rows - 1) {
                list.push(boxes[dot1.row][dot1.col]);
            }
        } else {
            if (dot1.col > 0) {
                list.push(boxes[dot1.row][dot1.col - 1]);
            }
            if (dot1.col < cols - 1) {
                list.push(boxes[dot1.row][dot1.col]);
            }
        }
         
        return list;
    }    
    
    function changeLineState() {
        // Obtém os boxes associados a linha selecionada
        var list = getBoxes(),
            box,
            i,
            j,
            width,
            height,
            found = false;
                    
        // Percorre os boxes associados a linha selecionada
        for (i = 0; i < list.length; i += 1) {
            box = list[i];
            
            if (box.count !== 4) {
                // Estado da linha do box muda para ocupada ou já utilizada
                for (j = 0; j < box.lines.length; j += 1) {
                    if (box.lines[j].start.row === dot1.row && box.lines[j].start.col === dot1.col &&
                        box.lines[j].end.row === dot2.row && box.lines[j].end.col === dot2.col &&
                        !box.lines[j].busy) {
                        found = true;    
                        
                        box.lines[j].busy = true;
                        
                        // Indica que mais uma linha associada ao box foi utilizada
                        box.count += 1;       

                        if (box.count === 4) {
                            boxesClosed += 1;
                        }
                                
                        break;
                    }
                }
            }
        }
        
        return found;
    }    
    
    function playNormalMode() {
        var i,
            j,
            box,
            ret,
            result = 0,
            rand,
            parameters = null,
            list = [ [], [], [], [] ],
            boxesChanged;

        for (i = 0; i < boxes.length; i += 1) {
            for (j = 0; j < boxes[i].length; j += 1) {
                box = boxes[i][j];

                if (list[box.count]) {
                    list[box.count].push(box);
                }
            }
        }

        // Primeiro, percorre os blocos em busca de algum que pode ser fechado.
        for (i = 0; i < list[3].length; i += 1) {
            box = list[3][i];

            ret = getDots(box, false);
            if (ret) {
                break;
            }

            ret = null;
        }

        // Tenta algum box sem nenhuma linha utilizada
        if (!ret && list[0].length > 0) {
            rand = Math.round(Math.random() * (list[0].length - 1));
            box = list[0][rand];

            ret = getDots(box, true);
        }

        // Agora tenta com box com apenas uma linha preenchida.
        if (!ret && list[1].length > 0) {
            rand = Math.round(Math.random() * (list[1].length - 1));
            box = list[1][rand];

            ret = getDots(box, true);
        }

        // E por último, box com 2 linhas preenchidas
        if (!ret && list[2].length > 0) {
            rand = Math.round(Math.random() * (list[2].length - 1));
            box = list[2][rand];

            ret = getDots(box, true);
        }

        if (ret) {
            dot1 = ret.dot1;
            dot2 = ret.dot2;

            found = changeLineState();
            
            boxesChanged = found ? getBoxes() : [];
            
            parameters = { 'code': OK };
            
            parameters.dot1 = { 'row': dot1.row, 'col': dot1.col };
            parameters.dot2 = { 'row': dot2.row, 'col': dot2.col };
            parameters.boxes = boxesChanged;            
        } else {
            parameters = { 'code': ERROR };
        }
                 
        return parameters;
    }  
    }    
    
    function playComputer() {
        switch(mode) {
            case 'hard':
                return playHardMode();

            case 'normal':
                return playNormalMode();
                
            case 'easy':
                break;
        }
    }
    this.playComputer = playComputer;
    
    function playUser(d1, d2) {
        var tempDot,
            result = 0,
            parameters;
        
        dot1 = d1;
        dot2 = d2;
        
        if (!dot1 || !dot2) {
            return parameters = { 'code': INV_LINE };
        }
        
        if (dot1.row === dot2.row) {
            if (dot1.col > dot2.col) {
                tempDot = dot1;
                
                dot1 = dot2;
                dot2 = tempDot;
            }
            
            result = dot1.col - dot2.col;
        } else if (dot1.col === dot2.col) {
            if (dot1.row > dot2.row) {
                tempDot = dot1;
                
                dot1 = dot2;
                dot2 = tempDot;
            }
            
            result = dot1.row - dot2.row;
        }        
        
        parameters = { 'dot1': { 'row': dot1.row, 'col': dot1.col },
                       'dot2': { 'row': dot2.row, 'col': dot2.col },
                       'code': OK };       
        
        // Indica que os pontos selecionados devem estar imediatamente uma ao lado do outro
        if (Math.abs(result) === 1) {        
            found = changeLineState();
           
            if (found) {
                boxesChanged = getBoxes();
            
                parameters.boxes = boxesChanged;
            } else {
                parameters.code = BUSY;
            }
        } else {
            parameters.code = INV_LINE;
        }

        return parameters;        
    }    
    this.playUser = playUser;
    
    function isGameOver() {
        if (boxesClosed >= ((cols - 1) * (rows - 1))) {
            return true;
        }
        
        return false;
    }
    this.isGameOver = isGameOver;
    
    function getCode(name) {
        switch(name) {
            case 'OK':
                return OK;
            case 'BUSY':
                return BUSY;
            case 'INV_LINE':
                return INV_LINE;
            case 'GAME_OVER':
                return GAME_OVER;
            case 'ERROR':
                return ERROR;                
        }
        
        return NOT_FOUND;
    }
    this.getCode = getCode;
    
    init();
}