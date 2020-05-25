let width = 64;
let height = 16;
let fontSize = 25;

window.brysleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.term = new Terminal({
    cols: width,
    rows: height,
    fontSize: fontSize,
});

term.open(document.getElementById('terminal'));