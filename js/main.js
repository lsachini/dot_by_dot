function Main() {
    var storage = window.storage;
    
    if (!storage) {
        storage = window.localStorage;
    } 
    
    // Funções Públicas
    { // begin region
    
    function startGame(mode) {
        storage.setItem('mode', mode);

        window.location.assign('dots.html');
    }
    this.startGame = startGame;
    
    function goOptions() {
        window.location.assign('options.html');
    }
    this.goOptions = goOptions;

    function goRanking() {
        window.location.assign('ranking.html');
    }
    this.goRanking = goRanking; 
    
    function goAbout() {
        window.location.assign('about.html');
    }
    this.goAbout = goAbout; 
    } // end region
}
