class TapeSpec{
    constructor(bi = true){
        this.biInfinite = true
    }
}
    
class Error{
    #line = 0;
    #txt;

    constructor(txt, line = 0){
        this.#txt = txt
        this.#line = line
    }

    print(genId){
        // alert(`${this.#line}, ${this.#txt}`)
        let ln = document.getElementById(genId(this.#line)) 
        let msg = this.#txt.replaceAll('<','&lt').replaceAll('<','&gt')
        if (this.#line > 0){
            ln.classList.add('alert')
            if (ln.title){
                ln.title += `\n${this.#txt}`
            } else {
                ln.title = this.#txt
            }
            msg = `ligne ${this.#line}: ${msg}`
        }
        let span = document.createElement("span")
        span.innerHTML = msg
        return span
    }
}

class Elt {
    #css = ""
    #src = ""
    #semCat
    value;
    #error = false;
    #error_msg = "";

    constructor(txt){
        this.#src = txt.replaceAll('<','&lt').replaceAll('<','&gt')
        this.value = txt
        this.#semCat = "plain-txt"
    }

    addClass(cls){
        if (this.#css == ""){
            this.#css = ` ${cls} `
        } else {
            this.#css += `${cls} `
        }
    }

    set semCat(cat){
        this.#semCat = cat
        // this.#semCat = cat
    }

    removeClass(cls){
        this.#css = this.#css.replaceAll(` ${cls} `,' ')
    }

    set falsify(msg){
        this.#error = true
        this.addClass("err")
        if (this.#error_msg == []){
            this.#error_msg = msg
        } else {
            this.#error_msg = `${this.#error_msg}\n${msg}`
        }
    }

    get ok(){
        return (! this.#error)
    }

    getError(i){
        if (this.#error){
            return [new Error(this.#error_msg, i)]
        } else {
            return []
        }
    }

    // get error(){
    //     if (this.#error)
    //         return this.#error_msg
    //     else
    //         return false
    // }

    html(){
        // let span = document.createElement("span")
        // span.className = this.#css
        // if (scheme.entities.has(this.#semCat)){
        //     // alert(this.#semCat)
        //     if (this.#error){
        //         // span.classList.add(scheme.get(this.#semCat).err)
        //         span.style["color"] = scheme.entities.get(this.#semCat).err
        //     } else {
        //         // span.classList.add(scheme.get(this.#semCat).std)
        //         span.style["color"] = scheme.entities.get(this.#semCat).std
        //     }
        // }
        // span.innerHTML = this.#src
        return `<span class="${this.#css} ${this.#semCat}">${this.#src}</span>`
    }
}

function colon(){
    let c = new Elt(':')
    c.semCat = 'colon'
    return c
}
function colonErr(){
    let c = colon
    c.falsify("")
    return c
}

class Line {
    #idx = 0
    #src = ""
    #remaining
    #elts_pre = new Array();
    #elts_suff = new Array();
    #own_errors = new Array();
    
    constructor(idx, line){
        this.#idx = idx
        this.#src = line
        this.#remaining = line
    }

    get index(){
        return this.#idx
    }

    get line(){
        return this.#src
    }

    get isEmpty(){
        return this.#remaining === ""
    }

    get elts (){
        return this.#elts_pre.concat(this.#elts_suff)
    }

    toElt(){
        let elt = new Elt(this.#remaining)
        this.#remaining = ""
        this.#elts_pre.push(elt)
        return elt
    }

    parseRegex(r){
        let m = this.#remaining.match(r)
        if (m){
            return this.toElt()
        } else {
            return false
        }
    }

    splitRegex(r, forwards = true){
        let m = this.#remaining.match(r)
        if (m && forwards){
            this.#remaining = m[2]
            let elt = new Elt(m[1])
            this.#elts_pre.push(elt)
            return elt            
        } else if (m && !forwards){
            this.#remaining = m[1]
            let elt = new Elt(m[2])
            this.#elts_suff.unshift(elt)
            return elt            
        } else {
            return false
        }
            
    }
    get ok(){
        if (this.#own_errors.length > 0 || ! this.isEmpty )
            return false
        let ok = true
        for (const e of this.elts)
            if (! e.ok)
                return false
        return true
    }

    set falsify (msg){
        this.#own_errors.push(new Error(msg,this.index))
    }

    html (display){
        let errors = this.#own_errors
        const idx = document.createElement("a")
        display.appendChild(idx)
        idx.className = "line-idx"
        idx.id = `idx-${this.index}`
        let span = document.createElement("span")
        span.innerHTML = `${this.index}:`
        idx.appendChild(span)
        // const line = document.createElement("code")
        // div.appendChild(line)
        // line.className = "line"
        // line.id = `line-${this.index}`
        for (const elt of this.elts.values()){
            display.innerHTML += elt.html()
            errors = errors.concat(elt.getError(this.index))
        }
        display.innerHTML += "<br/>"
        return errors
    }
}


function parseComment(line){
    let m = line.splitRegex(/((?:[^/]|\/(?!\/))*)(\/\/.*)/, false);
    if (m){
        m.semCat = 'comments'
    }
}

function parseEmpty(line){
    let m = line.parseRegex(/^\s*$/)
    
    if (m) {
        m.addClass('emptyspan')
        return true
    } else {
        return false
    }
        
}
function formatTxtElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'plain-txt'
    if(! elt.value.match(/^.+$/)){
        elt.falsify = "La valeur d'un attribut ne doit pas être vide."
    }
}
function formatIntElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'int'
    if(! elt.value.match(/^[0-9]+$/) || elt.value.match(/^0*$/)){
        elt.falsify = "Cette valeur doit être un entier strictement positif."
    } else {
        elt.value = parseInt(elt.value)
    }
}
function formatBoolElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'bool'
    switch (elt.value){
    case "oui":
    case "yes":
    case "true":
    case "vrai":
        elt.value = true
        break;
    case "non":
    case "no":
    case "false":
    case "faux":
        elt.value = false
        break;
    default:
        elt.falsify = "Cette valeur doit être un booléen."
    }
}
function formatOptElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'plain-txt'
    switch (elt.value){
    case "non-det":
    case "eager":
        break;
    default:
        elt.falsify = "Cette option n'est pas reconnue."
    }
}

function formatStateElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'state'
    if(! elt.value.match(/^[^:,]+$/)){
        elt.falsify = "Un nom d'état ne doit pas être vide, ni contenir  ',' ou ':'."
    }
}

function formatListStateElt(line){
    let states = Array()
    while (!line.isEmpty){
        let q = line.splitRegex(/^([^,]*)(,.*)/)
        if (!q) {
            q = line.toElt()
        } else {
            let comma = line.splitRegex(/^(,)(.*)/)
            comma.addClass('comma')
        }
        formatStateElt(q)
        states.push(q.value)
    }
    return {
        ok : true,
        value: states
    }
}
function formatSymbElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'symb'
    if(! elt.value.match(/^[^:,]$/)){
        elt.falsify = "Un symbole doit être de longueur 1, et différent de ',' et de ':'."
    }
}

function formatInSymbElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'symb'

     if(elt.value.match(/^[^:,]$/)){
        elt.value = {type : "symb", value : elt.value}
    } else {
        let m = elt.value.match(/^\[([^:,\s]+)\]$/)
        if (m){
            let s = new Set()
            for (var c of m[1]){
                s.add(c)
            }
            // alert (`${s}`)
            elt.value = {type : "range", value : s}
        } else {
            elt.falsify = "Un test d'entrée doit être soit un symbole (de longueur 1, et différent de ',', ':', ou ' '), ou une liste non vide de symboles entre crochets."
        }
    }
}
function formatOutSymbElt(elt, nb){
    elt.value = elt.value.trim()
    elt.semCat = 'symb'
    if(elt.value.match(/^[^:,]$/)){
        elt.value = {type : "symb", value : elt.value}
    } else {
        let m = elt.value.match(/^[$]([0-9]+)$/)
        if (m){
            let i = parseInt(m[1])
            if (0 < i && i <= nb){
                elt.value = {type : "ref", value : i}
            } else {
                elt.falsify = "Une référence aux valeurs d'entrée doit être de la forme '$i', où i est un entier compris entre 1 et le nombre de rubans."
            }
        } else {
            elt.falsify = "Un symbole doit être de longueur 1, et différent de ',' et de ':'. Une référence aux valeurs d'entrée doit être de la forme '$i', où i est un entier compris entre 1 et le nombre de rubans."
        }
    }
}
function formatDirElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'dir'
    if(! elt.value.match(/^[<>-]$/)){
        elt.falsify = "Les directions acceptées sont '>', '<', et '-'."
    }
}

function formatPptElt(elt){
    elt.value = elt.value.trim()
    elt.semCat = 'ppt'
    switch (elt.value){ 
    case "init":
    case "initial":
    case "accept":
    case "final":
    case "sortie":
    case "output":
    case "demi ruban":
    case "half tape":
    case "name":
    case "nom":
    case "option":
        break;
    default:
        elt.falsify = "Propritété inconnue."
    }
}

function parseOptLn(line, spec){
    let ppt = line.splitRegex(/^([^:,]*)(:.*)$/)
    if (ppt){
        formatPptElt(ppt)
        let colon = line.splitRegex(/^(:)(.*)$/)
        colon.semCat = "colon"
        if (ppt.ok) {
            switch(ppt.value){
            case "init":
            case "initial":
                let val = line.toElt()
                formatStateElt(val)
                if (val.ok) {
                    spec.q0 = val.value
                }
                break;
            case "accept":
            case "final":
                let valQ = formatListStateElt(line)
                if (valQ.ok) {
                    spec.qf = valQ.value
                }
                break;
                
            case "sortie":
            case "output":                
                let valO = line.toElt()
                formatIntElt(valO)
                if (valO.ok) {
                    spec.output = valO.value
                    spec.outputLn = line.index
                }
                break;
            case "demi ruban":
            case "half tape":
                let valH = line.toElt()
                formatIntElt(valH)
                if (valH.ok) {
                    spec.half_tapes.push(valH.value)
                }
                break;
                
            case "name":
            case "nom":
                let valN = line.toElt()
                formatTxtElt(valN)
                if (valN.ok) {
                    spec.name = valN.value
                }
                break;
            case "option":
                let valOpt = line.toElt()
                formatOptElt(valOpt)
                if (valOpt.ok){
                    switch(valOpt.value){
                    case "non-det":
                        spec.ndet = true;
                        break;
                    case "eager":
                        spec.eager = true;
                        break;
                    default:
                        throw "Option inconnue"
                        break;
                    }
                }
                break;
            default:
                throw "Propriété inconnue"
                break;
            }
        }
        return true
    } else {
        return false
    }
}


let comma = {
    css : "comma",
    src : ","
}
let commaErr = { css : "comma-err",
                 src : "," ,
                 title: "Cette ligne de transition est trop longue."}


