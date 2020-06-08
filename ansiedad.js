// Settings and default values

//*
let expr = `y`
let fps = 60;
let asciiEnabled = false;
let drawBg = false;
let width = 80;
let height = 25;
let fontSize = 16;
let scrollerMode = false;
let scrollerBufsize = 1;

// Globals
let bufSize;
let term;
let error = false;

// Init expression public variables
let t = 0.0; // Increments on each character
let q = 0; // Increments on each frame
let w = width;
let h = height;
let x = 0; // fragCoord.x
let y = 0; // fragCoord.y

// FPS control
let fpsInterval, startTime, now, then, elapsed;
let stop = false;

const buf = [];

let colorElement = document.getElementById("colorField");
let resultElement = document.getElementById("resultField");
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
                // Set character coord values
                let col = (t % w);
                if (col == (w - 1)) col = w; // Snap
                row = Math.ceil(((t % (w * h)) + 1) / w);

                x = col / w;
                y = row / h;

                // Process expression
                let evalexp = eval(expr);
                resultElement.value = evalexp;
                let ch = " ";
                
                // Save next char into buffer
                if (asciiEnabled) {
                    //ch = String.fromCharCode((evalexp % 64) + 32);
                    ch = String.fromCharCode((evalexp % 10) + 0x2502);
                    //ch = String.fromCharCode(0x0001);
                }
                
                let color = Math.floor(evalexp * 255);
                let r = color;
                let g = color;
                let b = color;
                if (drawBg) {
                    b = color;
                }
                buf[i] = `\x1b[38;5;${r}m\x1b[48;2;${r};${g};${b}m${ch}`;

                colorElement.value = color;
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
