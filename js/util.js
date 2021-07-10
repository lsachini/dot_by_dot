function Util() {
    var nativeUtil = window.nativeUtil;

    this.getStringFromKey = getStringFromKey;
	function getStringFromKey(key) {
		if (nativeUtil) {	
        	return nativeUtil.getStringFromKey(key) + '';
       	}

        switch (key) {
            case '1player':
                return '1 Player';
            case '2players':
                return '2 Players';
            case 'ranking':
                return 'Ranking';
            case 'options':
                return 'Options';
            case 'player':
                return 'Player';
            case 'opponent':
                return 'Opponent';
            case 'back':
                return 'Back';
            case 'save':
                return 'Save';
            case 'clean':
                return 'Clean';
            case 'restart':
                return 'Restart';
            case 'ok':
                return 'Ok';
            case 'close':
                return 'Close';
            case 'board':
                return 'Board';
            case 'name':
                return 'Name';
            case 'score':
                return 'Score';
            case 'warning':
                return 'Warning!';
            case 'quitMessage':
                return 'Do you want to quit the game?';
            case 'yes':
                return 'Yes';
            case 'no':
                return 'No';
            case 'playerColor':
                return 'Player Color';
            case 'opponentColor':
                return 'Opponent Color';
            case 'firstMove':
                return 'First Move';
            case 'difficulty':
                return 'Difficulty';
            case 'normal':
                return 'Normal';
            case 'hard':
                return 'Hard';
            case 'red':
                return 'Red';
            case 'green':
                return 'Green';
            case 'blue':
                return 'Blue';   
            case 'cancel':
                return 'Cancel';
            case 'youWin':
                return 'You win!';
            case 'youLose':
                return 'You lose!';
            case 'p1Win':
                return 'Player 1 win!';
            case 'p2Win':
                return 'Player 2 win!';
            case 'draw':
                return 'Draw.';
            case 'lineUsed':
                return 'Line already used.';
            case 'error':
                return 'Error not defined, contact the developer.';
	        case 'equalColors':
	            return 'Player color and opponent color can\'t be equal.';
	        case 'cleanRanking':
	            return 'You are about to clean the score tables.\u003cbr\u003eDo you confirm this operation?';    
	        case 'top5':
	            return 'You won and now you are in the TOP 5 ranking, type your name: \u003cbr\u003eScore: {1}\u003cbr\u003e(Boxes X Difficulty factor)';
            case 'gameOver':
                return 'Game over, start other game.';
            case 'version':
                return 'Version 1.1.0';
            case 'programmers':
                return 'Programmers';
            case 'logo':
                return 'dot.png';                      
        }  	
    }
}
