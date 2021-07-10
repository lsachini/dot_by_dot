function go() {
    setTimeout(_hideSplash, 4000);

    function _hideSplash() {
        window.location.assign('main.html');
    }
}