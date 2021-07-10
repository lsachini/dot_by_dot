function Ranking() {
    var list,
        boardType,
        SCORES_QTY = 5,
        storage = window.storage;

    if (!storage) {
        storage = window.localStorage;
    }
   
    function _saveJson() {
        var temp,
            len,
            i;
        
        if (list) {
            len = list.length;
        
            temp = '[';
        
            for (i = 0; i < len; i += 1) {
                temp += '{ "name":"' + list[i].name + '",' +
                         '"score":"' + list[i].score + '" },';
            }
        
            temp = temp.substr(0, temp.length - 1);
        
            temp += ']';
        
            storage.setItem(boardType, temp);
        }
    }
    
    function _getObject() {
        var ret = storage.getItem(boardType);
        
        if (!ret) {
            list = [];
            
            return;
        }
        
        // ver comentário em options.js na função loadValues
        ret += '';
        
        list = JSON.parse(ret);
    }

    function _htmlEncoded(html) {
        return String(html).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');        
    }    

    function back() {
            window.location.assign('main.html');     
    }
    this.back = back;    
    
    function clean() {
        dialog({ message: util.getStringFromKey('cleanRanking'), 
            buttonOk: function (args) {
                          if (storage.getItem('ranking5x5')) {
                              storage.removeItem('ranking5x5');
                          }
                          
                          if (storage.getItem('ranking6x6')) {
                              storage.removeItem('ranking6x6');
                          }

                          if (storage.getItem('ranking7x7')) {
                              storage.removeItem('ranking7x7');
                          }

                          if (storage.getItem('ranking8x8')) {
                              storage.removeItem('ranking8x8');
                          }     

                          populateTable();                          
                      },
            buttonCancel: function (args) { return; }
        });
    }
    this.clean = clean;
    
    function isRanking(score) {
        var len,
            i;
        
        if (!list) {
            return true;
        } else {
            len = list.length;
            
            if (len < SCORES_QTY) {
                return true;
            } else {
                for (i = 0; i < len; i += 1) {
                    if (score > list[i].score) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    this.isRanking = isRanking;
    
    function tryInsert(name, score) {
        var len,
            i,
            temp1 = null,
            temp2 = null,
            found = false;
            
        if (!boardType) {
            return false;
        }
        
        if (!list) {
            list = [];
        }
        
        len = list.length;

        for (i = 0; i < len; i += 1) {
            if (!temp1) {
                if (score > list[i].score) {
                    temp1 = list[i];
                    list[i] = { 'name': name,
                                'score': score };
                
                    found = true;
                }   
            } else {
                temp2 = list[i];
                list[i] = temp1;
                temp1 = temp2;
            }
        }
        
        if (len < SCORES_QTY) {
            if (found) {
                if (temp1) {
                    list[len] = temp1; 
                }   
            } else {
                list[len] = { 'name': name,
                              'score': score }; 
                          
                found = true;
            }
        }
        
        if (found) {
            _saveJson();
        }
        
        return found;
    }
    this.tryInsert = tryInsert;
    
    function populateTable() {
        var i,
            len,
            names = document.getElementsByName('tdName'),
            scores = document.getElementsByName('tdScore');
            
        setBoardType(document.getElementById('boardType').value);
        
        for (i = 0; i < names.length; i += 1) {
            names[i].innerHTML = '';
            scores[i].innerHTML = '';
        }        
        
        if (!list) {
            return;
        }
        
        len = list.length;
        
        for (i = 0; i < len; i += 1) {
            names[i].innerHTML = _htmlEncoded(list[i].name);
            scores[i].innerHTML = list[i].score;
        }
    }
    this.populateTable = populateTable;
    
    function setBoardType(bType) {
        boardType = bType;
        
        _getObject();
    }
    this.setBoardType = setBoardType;
}
