// Settings and default values
let expr = `t`
let fpsCap = 2;
let asciiEnabled = true;
let scrollerMode = false;
let width = 32;
let height = 16;
let fontSize = 25;
let scrollerBufsize = 64;

// Globals
let bufSize;
let term;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(e) {
    term = new Terminal({
        cols: width,
        rows: height,
        fontSize: fontSize,
        
    });
    term.open(document.getElementById('terminal'));

    let t = 0;
    let i = 0;
    
    const buf=[]
    
    while (true) 
    {
        updateLiveSettings()

        let evalexp = eval(expr);
        
        let color = evalexp % 256;
        let ch = ' ';
    
        if(t%width==0) term.write('\n')
        
        if(asciiEnabled)
        {
            ch = String.fromCharCode(evalexp % 64 + 32);
        }
        
        buf[i]=(`\x1b[48;5;${color}m${ch}`);
        
        i += 1; 
        if(i >= bufSize)
        {
            i=0;
            term.write(''.join(buf));
            await sleep(1000/fpsCap);
        }
        t += 1;
    }
}

function updateLiveSettings()
{
    if(scrollerMode)
    {
        bufSize = scrollerBufsize;
    }
    else
    {
        bufSize = term.cols * term.rows;
    }
}

document.getElementById('applyButton').onclick = function() {
    console.log('Updating values')
    expr = document.getElementById('exprField').value;
    fpsCap = parseInt(document.getElementById('fpsField').value);
    asciiEnabled = document.getElementById('asciiEnabledCheckbox').checked;
    console.log(`expr=${expr}`)
    console.log(`fpsCap=${fpsCap}`)
}

document.getElementById('linkButton').onclick = function() {
    let link = `http://190.195.94.176:9502/ansiedad?expr=${btoa(expr)}&fps=${fpsCap}`

    if(!asciiEnabled)
    {
        link += `&asciiOff`
    }

    console.log(`Link: ${link}`)
    document.getElementById('linkField').value = link
}

// Read input parameters. If parameters are not specified, the values will hold the default values defined at the program start

const urlParams = new URLSearchParams(window.location.search);

if(urlParams.has('expr'))
{
    expr = atob(urlParams.get('expr'));
}

if(urlParams.has('fps'))
{
    fpsCap = urlParams.get('fps');
}

if(urlParams.has('asciiOff'))
{
    asciiEnabled = !urlParams.has('asciiOff')
}

if(urlParams.has('scroller'))
{
    scrollerMode = urlParams.has('scroller')
}

if(urlParams.has('scrollerBuf'))
{
    scrollerBufsize = urlParams.get('scrollerBuf')
}


// Set view
document.getElementById('exprField').value = expr;
document.getElementById('fpsField').value = fpsCap;
document.getElementById('asciiEnabledCheckbox').checked = asciiEnabled;
main();