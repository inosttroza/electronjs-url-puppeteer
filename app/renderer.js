// DOM Elements
const seccionNewElementos = document.querySelector('.seccionNewElementos')
const errorMessage = document.querySelector('.error-message')
const formRegistro = document.querySelector('.formRegistro')
const txtUrl = document.querySelector('.txtUrl')
const btnGuardar = document.querySelector('.btnGuardar')
const btnClearStorage = document.querySelector('.btnClearStorage')
const imgPuppeteer = document.querySelector('.imgPuppeteer')
const spinner = document.querySelector('.spinner')

const parser = new DOMParser();
const { shell } = require('electron');
const urlExists = require("url-exists");//funca solo con internet
const puppeteer = require('puppeteer');


// Create HTML Elements
const createLinkElement = link => {
    return `
        <div class="seccionNewElementos">            
           <p>${link.title}          
           <a id="${link.url}" href="${link.url}">${link.url}</a>  
           <button id="${link.url}" class="btnEliminar">Elimnar</button>    
           </p>          
        </div>
        <hr>
    `;
};
const getLinks = () => {
    return Object.keys(localStorage)
        .map(key => JSON.parse(localStorage.getItem(key)));
};
const renderRegistrosStorage = () => {
    const newRegistro = getLinks().map(createLinkElement).join('');
    seccionNewElementos.innerHTML = newRegistro;
};
renderRegistrosStorage();


//valido input url
txtUrl.addEventListener('keyup', () => {
    //debugger;    
    //btnGuardar.disabled = !txtUrl.validity.valid;
    try {
        btnGuardar.disabled = true;
        urlExists(txtUrl.value, function (err, exists) {
            if (!exists) return;
            btnGuardar.disabled = false;
        });
    } catch (error) {
        btnGuardar.disabled = true;
    }
});

//muestro mensajes por un tiempo de 5 seg.
const handleError = (error, url) => {
    errorMessage.innerHTML = `
        Error en la url "${url}": ${error.message}
    `.trim();
    setTimeout(() => {
        errorMessage.innerText = null;
    }, 5000);
};

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = txtUrl.value;
    try {
        let response = await fetch(url);
        response = validateResponse(response);
        const text = await response.text();
        const html = parserResponse(text);
        const title = findTitle(html);
        almacenaUrl(title, url);
        clearInput();
        renderRegistrosStorage();
    } catch (e) {
        handleError(e, url);
    }
});

//almacena en Local Storage
const almacenaUrl = (title, url) => {
    localStorage.setItem(url, JSON.stringify({ title, url }));
};
const validateResponse = response => {
    if (response.ok) { return response; }
    throw new Error(`Status Code of ${response.status} ${response.statusText}`);
};
const parserResponse = text => {
    return parser.parseFromString(text, 'text/html');
};
const findTitle = (nodes) => {
    return nodes.querySelector('title').innerText;
};

//limpia el localStorage
btnClearStorage.addEventListener('click', () => {
    localStorage.clear();
    seccionNewElementos.innerHTML = '';
    defaultColScreenshot();
})
const clearInput = () => {
    txtUrl.value = null;
    txtUrl.value = "http://www.";
};


seccionNewElementos.addEventListener('click', async (e) => {
    if (e.target && e.target.tagName === 'P') {
        showLoading();
        await screenshot(e.target.querySelector('a').text);
    }
    if (e.target.href) {
        e.preventDefault();
        //abre url en navegador y no en ventana de app
        shell.openExternal(e.target.href);
    }
    else {
        //elimina un elemento
        localStorage.removeItem(e.target.id);
        renderRegistrosStorage();
    }
})

const screenshot = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //await page.goto('https://github.com/inosttroza');    
    await page.goto(url);
    page.setViewport({ width: 600, height: 600 })
    await page.screenshot({ path: `images/${url.split('://')[1].toString()}.png` });
    await browser.close();
    loadImg(url);
    hiddenLoading();
}

const loadImg = (url) => {    
    const ruta = `../images/${url.split('://')[1]}.png`;
    console.log(ruta);
    imgPuppeteer.src = ruta;
}
const showLoading = () => {
    spinner.hidden = false;
    document.querySelector('.h3spinner').hidden = true;  
    document.querySelector('.loaderXL').hidden = false;
}
const hiddenLoading = () => {
    spinner.hidden = true;
    document.querySelector('.h3spinner').hidden = true;
    document.querySelector('.loaderXL').hidden = true;
}
const defaultColScreenshot = () => {
    imgPuppeteer.hidden = true;
    document.querySelector('.h3spinner').hidden = false;
}
