// Settings and default values
let expr = `t<<1 | t>>5`
let fpsCap = 15;
let asciiEnabled = true;
let drawBg = true;
let scrollerMode = false;
let width = 128;
let height = 32;
let fontSize = 16;
let scrollerBufsize = 64;

// Globals
let bufSize;
let term;
let error = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onSubmit(e)
{
    if(e.keyCode === 13)
    {
        updateSettings()
    }
}

async function main(e) {
    
    term = new Terminal({
        cols: width,
        rows: height,
        fontSize: fontSize,
        fontFamily: 'unscii'
    });
    term.open(document.getElementById('terminal'));

    let t = 0;
    let i = 0;
    
    const buf=[]

    let exprResultElement = document.getElementById('exprResult')
    let tElement = document.getElementById('t')
    
    while (true) 
    {
        try 
        {
            if(scrollerMode)
            {
                bufSize = scrollerBufsize;
            }
            else
            {
                bufSize = term.cols * term.rows;
            }

        
            let evalexp = eval(expr);
            
            //let color = evalexp % 256
            let color = Math.floor(evalexp % 256)
            let ch = ' ';
        
            if(asciiEnabled)
            {
                ch = String.fromCharCode(evalexp % 64 + 32);
            }
            
            r=(color+100)%256
            //g=(color+50)%256
            b=0
            if(drawBg)
            {
                b=color;
            }


            buf[i]=(`\x1b[38;5;${r}m\x1b[48;5;${b}m${ch}`);
            exprResultElement.value = color
            tElement.value = t
            
            i += 1; 
            if(i >= bufSize)
            {
                i=0;
                term.write(buf.join(''));
                await sleep(1000/fpsCap);
            }
            t += 1;
            if(error)
            {
                error = false;
                document.getElementById("errorMessage").innerHTML = ``;
            }
        }
        catch(err)
        {
            if(!error)
            {
                error = true;
                document.getElementById("errorMessage").innerHTML = `Error in expression: ${err.message}`;
            }
            await sleep(1000/fpsCap);
        }
    }
    
}

function updateSettings()
{
    console.log('Updating values')

    expr = document.getElementById('exprField').value;
    fpsCap = parseInt(document.getElementById('fpsField').value);
    asciiEnabled = document.getElementById('asciiEnabledCheckbox').checked;
    drawBg = document.getElementById('drawBgCheckbox').checked;
}

document.getElementById('linkButton').onclick = function() {
    let encodedExpr = encodeURI(expr)
    let link = `http://190.195.94.176:9502/ansiedad?cols=${width}&rows=${height}&expr=${encodedExpr}&fps=${fpsCap}`

    if(!asciiEnabled)
    {
        link += `&asciiOff`
    }

    if(scrollerMode)
    {
        link += `&scrollBuf=${scrollerBufsize}`
    }

    if(!drawBg)
    {
        link += `&hideBg=${!drawBg}`
    }

    console.log(`Link: ${link}`)
    document.getElementById('linkField').value = link
}

// Read input parameters. If parameters are not specified, the values will hold the default values defined at the program start
const urlParams = new URLSearchParams(window.location.search);

if(urlParams.has('expr'))
{
    let param = urlParams.get('expr')
    expr = decodeURI(param);
}

if(urlParams.has('fps'))
{
    fpsCap = urlParams.get('fps');
}

if(urlParams.has('asciiOff'))
{
    asciiEnabled = !urlParams.has('asciiOff')
}

if(urlParams.has('scrollBuf'))
{
    scrollerMode = true;
    scrollerBufsize = urlParams.get('scrollBuf')
}

if(urlParams.has('cols'))
{
    width = urlParams.get('cols');
}

if(urlParams.has('rows'))
{
    height = urlParams.get('rows');
}

if(urlParams.has('hideBg'))
{
    drawBg = !urlParams.has('hideBg');
}

// Set view
document.getElementById('exprField').value = expr;
document.getElementById('fpsField').value = fpsCap;
document.getElementById('asciiEnabledCheckbox').checked = asciiEnabled;
document.getElementById('drawBgCheckbox').checked = drawBg;
document.addEventListener('keydown', onSubmit);

 // Make everything visible only after the font is loaded 
 document.getElementsByTagName("body")[0].style.display = "none"; // Hide everything

 if (document && document.fonts) {    
    setTimeout(function () { // Do not block page loading
      document.fonts.load('16px unscii').then(() => {
        document.getElementsByTagName("body")[0].style.display = ""; // Show everything back
        main()
      })
    }, 0)
  } else {
    // Fallback if API does not exist 
    document.getElementsByTagName("body")[0].style.display = "";
  }

main();