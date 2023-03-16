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
    value;
    #error = false;
    #error_msg = "";

    constructor(txt){
        this.#src = txt.replaceAll('<','&lt').replaceAll('<','&gt')
        this.value = txt
    }

    addClass(cls){
        if (this.#css == ""){
            this.#css = ` ${cls} `
        } else {
            this.#css += `${cls} `
        }
    }

    removeClass(cls){
        this.#css = this.#css.replaceAll(` ${cls} `,' ')
    }

    set falsify(msg){
        this.#error = true
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

    get html(){
        let span = document.createElement("span")
        span.className = this.#css
        if (this.#error){
            span.classList.add("error")
        }
        span.innerHTML = this.#src
        return span
    }
}

function colon(){
    let c = new Elt(':')
    c.addClass('colon')
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

    get isWhite(){
        return this.#remaining.trim() === ""
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

    get html (){
        let errors = this.#own_errors
        const div = document.createElement("pre")
        div.className = "pretty-line"
        div.id = `pretty-line-${this.index}`
        const idx = document.createElement("code")
        div.appendChild(idx)
        idx.className = "line-idx"
        idx.id = `idx-${this.index}`
        idx.innerHTML = this.index
        const line = document.createElement("code")
        div.appendChild(line)
        line.className = "line"
        line.id = `line-${this.index}`
        for (const elt of this.elts.values()){
            line.appendChild(elt.html)
            errors = errors.concat(elt.getError(this.index))
        }
        return {
            elt : div,
            errors: errors
        }
    }
}


function parseComment(line){
    let m = line.splitRegex(/((?:[^/]|\/(?!\/))*)(\/\/.*)/, false);
    if (m){
        m.addClass('comment')
    } 
}

function formatTxtElt(elt){
    elt.value = elt.value.trim()
    elt.addClass('plain-txt')
    if(! elt.value.match(/^.+$/)){
        elt.falsify = "La valeur d'un attribut ne doit pas être vide."
    }
}
function formatIntElt(elt){
    elt.value = elt.value.trim()
    elt.addClass('int')
    if(! elt.value.match(/^[0-9]+$/) || elt.value.match(/^0*$/)){
        elt.falsify = "Cette valeur doit être un entier strictement positif."
    } else {
        elt.value = parseInt(elt.value)
    }
}
function formatStateElt(elt){
    elt.value = elt.value.trim()
    elt.addClass('state')
    if(! elt.value.match(/^[^:,]+$/)){
        elt.falsify = "Un nom d'état ne doit pas être vide, ni contenir  ',' ou ':'."
    }
}
function formatSymbElt(elt){
    elt.value = elt.value.trim()
    elt.addClass('symb')
    if(! elt.value.match(/^[^:,]$/)){
        elt.falsify = "Un symbole doit être de longueur 1, et différent de ',' et de ':'."
    }
}
function formatDirElt(elt){
    elt.value = elt.value.trim()
    elt.addClass('dir')
    if(! elt.value.match(/^[<>-]$/)){
        elt.falsify = "Les directions acceptées sont '>', '<', et '-'."
    }
}

function formatPptElt(elt){
    elt.value = elt.value.trim()
    elt.addClass('ppt')
    switch (elt.value){ 
    case "init":
    case "initial":
    case "accept":
    case "final":
        // case "finaux": // todo : multiple final states.
    case "sortie":
    case "output":
    case "name":
    case "nom":
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
        colon.addClass("comma")
        let val = line.toElt()
        if (ppt.ok) {
            switch(ppt.value){
            case "init":
            case "initial":
                formatStateElt(val)
                if (val.ok) {
                    spec.q0 = val.value
                }
                break;
            case "accept":
            case "final":
                formatStateElt(val)
                if (val.ok) {
                    spec.qf = val.value
                }
                break;
                // case "finaux": // todo : multiple final states.
                //     break;     //
                
            case "sortie":
            case "output":                
                formatIntElt(val)
                if (val.ok) {
                    spec.output = val.value
                    spec.outputLn = line.index
                }
                break;
            case "name":
            case "nom":
                formatTxtElt(val)
                if (val.ok) {
                    spec.name = val.value
                }
                break;
            default:
                throw "should not happen"
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


function processTail(line, q, spec) {
    let nb = spec.nb
    let i = 0
    let actions = new Array ()
    
    while (!line.isEmpty){
        let comma = line.splitRegex(/(,)(.*)/)
        comma.addClass('comma')
        let x = line.splitRegex(/([^,]*)(,.*)/)
        if (!x) {
            x = line.toElt()
        }
        if ((i < nb) || (nb == 0)){
            formatSymbElt(x)
            actions[i] = [x.value]
        } else if (i < 2*nb) {
            formatDirElt(x)
            actions[i-nb][1] = x.value
        } else {
            comma.falsify = "Cette ligne de transition est trop longue."
        }
        i ++
    }
    if (nb == 0)
        spec.nb = i
    if (line.ok) {
        if (i == spec.nb && ! spec.input_trans){
            spec.input_trans = {
                ln : line.index,
                etat : q,
                reads : actions
            }
        } else if ((i == 2 * spec.nb) && spec.input_trans){
            let i1 = spec.input_trans.ln
            let q1 = spec.input_trans.etat
            let reads = spec.input_trans.reads
            spec.input_trans = false
            spec.trans.push(
                new Transition(
                    i1,
                    line.index,
                    q1,
                    q,
                    reads,
                    actions)
            )
        } else if (i != 2 * spec.nb && spec.input_trans){
            spec.input_trans = false
            line.falsify = "Cette ligne de transition est trop courte."
        } else if (i < spec.nb && ! spec.input_trans){
            line.falsify = "Cette ligne de transition est trop courte."
        } else if (i > spec.nb && ! spec.input_trans){
            line.falsify = "Cette ligne de transition est trop longue."
        }
    } else {
        spec.input_trans = false
    }
}

function parseTrans(line, spec){
    let state = line.splitRegex(/^([^,]*)(,.*)/)
    if (state){
        formatStateElt(state)
        processTail(line, state.value, spec)
        return true
    } else {
        return false
    }
}


function parseLine(idx, line_src, spec){
    let line = new Line(idx, line_src)
    parseComment(line)
    if (line.isWhite) {
        let e = line.toElt()
        return line
    } else if (parseOptLn(line, spec)){
        return line
    } else if (parseTrans(line,spec)){
        return line
    } else {
        let e = line.toElt()
        line.falsify = "Ligne incompréhensible."
        return line
    }
}



function parseTM(editor, output){
    const lines = editor.input.value.split('\n')
    const nbLines = lines.length;
    var maxW = 0
    var errors = new Array()
    const spec = {
        nb : 0,
        trans : new Array(),
        output: 0,
        outputLn: 0,
        name: ""
    }
    
    editor.output.innerHTML = ""

    for (var l, id = 1; id <= nbLines; id++){
        l = parseLine(id, lines[id-1], spec).html
        errors = errors.concat(l.errors)
        editor.output.appendChild(l.elt)
        maxW = Math.max(maxW,  l.elt.clientWidth)
    }
    editor.input.style.width = `${maxW}px`

    if (spec.output > spec.nb){
        errors.push(
            new Error(`Le ruban de sortie ${spec.output} n'existe pas, cette machine a ${spec.nb} rubans`, spec.outputLn)
        )
    }
    if (! spec.q0){
        errors.push(new Error("état initial manquant."))
    }
    if (! spec.qf){
        errors.push(new Error("état final manquant."))
    }
    if (spec.trans.length == 0){
        errors.push(new Error("transitions manquantes."))
    }
    if (errors.length > 0){
        output.ok = false
        output.value = 0
        editor.dialogue_outer.classList.add("alert")
        editor.dialogue_inner.innerHTML = "Spécification incorrecte : <br/>"

        for (const e of errors.values())
            editor.dialogue_inner.appendChild(e.print(function (i) {return `idx-${i}`}))
    } else {
        output.ok = true
        output.value = new TuringMachine(spec.nb, spec.q0, spec.qf, spec.trans, spec.output, spec.name)
        editor.dialogue_outer.classList.remove("alert")
        editor.dialogue_inner.innerHTML = `Compilation réussie ! <br/> ${output.value.summary}`
    }
}

function makeEditor(editor, output, action){
    let textarea = editor.input

    let upd = function (){
        textarea.style.height = textarea.scrollHeight + "px"
        parseTM(editorElts, output)
    }
    
    textarea.addEventListener('input', event => upd())
    
    textarea.addEventListener('keydown', event => {
        if (event.key === 'Tab') {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end)
            
            event.preventDefault()
        } else if (event.key === 'Enter' && event.ctrlKey) {
            if (output.ok){
                action(output.value)
            }
        }
    })

    editor.button.onclick = function () {
        if (output.ok){
            action(output.value)
        }
    }
    
    upd()
    
}
