// Settings and default values

//*
let expr = `t%16 + 240 >> 2`
let fps = 15;
let asciiEnabled = true;
let drawBg = true;
let width = 128;
let height = 32;
let fontSize = 16;
let scrollerMode = false;
let scrollerBufsize = 64;
/*/
let expr = `t`;
let fps = 1;
let asciiEnabled = true;
let drawBg = false;
let width = 128;
let height = 32;
let fontSize = 16;
let scrollerMode = true;
let scrollerBufsize = 1;
//*/

// Globals
let bufSize;
let term;
let error = false;

// Init expression public variables
let t = 0; // Increments on each character
let q = 0; // Increments on each frame
let w = width;
let h = height;

// FPS control
let fpsInterval, startTime, now, then, elapsed;
let stop = false;

const buf = [];

let exprResultElement = document.getElementById("exprResult");
let tElement = document.getElementById("t");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function onSubmit(e) {
    if (e.keyCode === 13) {
        updateSettings();
    }
}

let i = 0;
async function main(e) {
    term = new Terminal({
        cols: width,
        rows: height,
        fontSize: fontSize,
        fontFamily: "unscii",
    });
    term.open(document.getElementById("terminal"));

    if (scrollerMode) {
        bufSize = scrollerBufsize;
    } else {
        bufSize = width * height;
    }

    // Start FPS controlled step function
    fpsInterval = 1000 / fps;
    then = window.performance.now();
    startTime = then;
    step();
}

// Put a character into the buffer and write to terminal once buffer is full
function step(time) {
    try {
        if (stop) {
            return;
        }

        window.requestAnimationFrame(step);

        now = time;
        elapsed = now - then;

        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);

            while (i < bufSize) {

                // Save next char into buffer
               

                let evalexp = eval(expr);
                let color = Math.floor(evalexp % 256);
                let ch = " ";

                if (asciiEnabled) {
                    ch = String.fromCharCode((evalexp % 64) + 32);
                }

                r = (color + 100) % 256;
                g = 0;
                b = 0;
                if (drawBg) {
                    b = color;
                }

                buf[i] = `\x1b[38;5;${r}m\x1b[48;5;${b}m${ch}`;
                exprResultElement.value = color;
                tElement.value = t;
                i += 1;
                t += 1; // Increment character varying variable
            }

            i = 0; // Reset buffer iterator
            q += 1; // Increment frame uniform variable

            if (error) { // TODO: Render only if we have no errors?
                error = false;
                document.getElementById("errorMessage").innerHTML = ``;
            } else {
                // Write buffer to console
                let joined = buf.join("");
                term.write(joined);
            }
        }
    } catch (err) {
        if (!error) {
            error = true;
            document.getElementById(
                "errorMessage"
            ).innerHTML = `Error in expression: ${err.message}`;
        }
    }

}

function updateSettings() {
    console.log("Updating values");

    expr = document.getElementById("exprField").value;
    fps = parseInt(document.getElementById("fpsField").value);
    asciiEnabled = document.getElementById("asciiEnabledCheckbox").checked;
    drawBg = document.getElementById("drawBgCheckbox").checked;
}

document.getElementById("linkButton").onclick = function () {
    let encodedExpr = encodeURI(expr).replace("&", "%26");
    let link = `http://190.195.94.176:9502/ansiedad?cols=${width}&rows=${height}&expr=${encodedExpr}&fps=${fps}`;

    if (!asciiEnabled) {
        link += `&asciiOff`;
    }

    if (scrollerMode) {
        link += `&scrollBuf=${scrollerBufsize}`;
    }

    if (!drawBg) {
        link += `&hideBg=${!drawBg}`;
    }

    console.log(`Link: ${link}`);
    document.getElementById("linkField").value = link;
};

// Read input parameters. If parameters are not specified, the values will hold the default values defined at the program start
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("expr")) {
    let param = urlParams.get("expr");
    expr = decodeURI(param.replace("%26", "&"));
}

if (urlParams.has("fps")) {
    fps = urlParams.get("fps");
}

if (urlParams.has("asciiOff")) {
    asciiEnabled = !urlParams.has("asciiOff");
}

if (urlParams.has("scrollBuf")) {
    scrollerMode = true;
    scrollerBufsize = urlParams.get("scrollBuf");
}

if (urlParams.has("cols")) {
    width = urlParams.get("cols");
}

if (urlParams.has("rows")) {
    height = urlParams.get("rows");
}

if (urlParams.has("hideBg")) {
    drawBg = !urlParams.has("hideBg");
}

// Set view
document.getElementById("exprField").value = expr;
document.getElementById("fpsField").value = fps;
document.getElementById("asciiEnabledCheckbox").checked = asciiEnabled;
document.getElementById("drawBgCheckbox").checked = drawBg;
document.addEventListener("keydown", onSubmit);

// Make everything visible only after the font is loaded
document.getElementsByTagName("body")[0].style.display = "none"; // Hide everything

if (document && document.fonts) {
    setTimeout(function () {
        // Do not block page loading
        document.fonts.load("16px unscii").then(() => {
            document.getElementsByTagName("body")[0].style.display = ""; // Show everything back
            main();
        });
    }, 0);
} else {
    // Fallback if API does not exist
    document.getElementsByTagName("body")[0].style.display = "";
}

main();
