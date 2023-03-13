function parseComment(idx, line, spec){
    let m = line.match(/((?:[^/]|\/(?!\/))*)(\/\/.*)/);

    if (m){
        return {
            content: m[1],
            comment: [{
                css : "comment",
                src : m[2]
            }]
        }
    } else {
        return {
            content: line,
            comment: []
        }
    }
}

function parseOptLn(idx, line, spec){
    let m = line.match(/^([^:,]*):(.*)/)
    if (m){
        const ppt = {
            css : "ppt",
            src : m[1],
            value : m[1].trim()
        }
        const val = {
            css : "",
            src : m[2],
            value : m[2].trim()
        }
        switch(ppt.value){
        case "init":
        case "initial":
            val.css = "state"
            spec.q0 = val.value
            break;
        case "accept":
        case "final":
            val.css = "state"
            spec.qf = val.value
            break;
            
            // case "finaux": // todo : multiple final states.
            //     break;     //
            
        case "sortie":
        case "output":
            if (val.value.match(/^[0-9]*$/)){
                val.value = parseInt(val.value)
                if (val.value > 0 ){
                    val.css = "int"
                    spec.output = val.value
                    spec.outputLn = idx
                } else {
                    val.css = "err"
                    spec.errors.push({
                        type: 'bad tape index for output',
                        line: idx,
                        txt: "La valeur de cet attribut doit être un entier strictement positif."        
                    })
                }
            } else {
                val.css = "err"
                spec.errors.push({
                    type: 'bad tape index for output',
                    line: idx,
                    txt: "La valeur de cet attribut doit être un entier strictement positif."        
                })
            }
            break;
        case "name":
        case "nom":
            val.css = "plain-txt"
            spec.name = val.value
            break;
        default:
            ppt.css = "plain-txt"
            break;
        }
        return [ppt,{css : "colon", src : ':' }, val]
    } else {
        return false
    }
}

function insertLine (parsedLn,container){
    for (const elt of parsedLn){
        switch (elt.css){
        case "":
        case "plain-txt":
            container.innerHTML += elt.src.replaceAll('<','&lt').replaceAll('<','&gt')
            break;
        default:
            let span = document.createElement("span")
            span.className = `tm-${elt.css}`
            span.innerHTML = elt.src.replaceAll('<','&lt').replaceAll('<','&gt')
            if (elt.txt){
                span.title = elt.txt
            }
            container.appendChild(span)
        }
    }
}

let comma = {
    css : "comma",
    src : ","
}
let commaErr = { css : "comma-err",
                 src : "," ,
                 title: "Cette ligne de transition est trop longue."}

function parseTail(idx, tail, spec, q) {
    let nb = spec.nb
    var errors = new Array ()
    var result = new Array ()
    var i = 0
    for (var elt of tail){
        i += 1
        let val = elt.trim()
        if ((i <= nb) || (nb == 0)){
            switch (val.length){
            case 1 :
                result.push(
                    comma,
                    {
                        css : "symb",
                        src : elt,
                        value : val
                    }
                )
                break;
            case 0 :
            default:
                errors.push({
                    type: 'bad symbol',
                    line: idx,
                    txt: `'${val}' n'est pas un symbole valide.`
                })
                result.push(
                    comma,
                    {
                        css : "err err-wdth",
                        src : elt,
                        txt: `'${val}' n'est pas un symbole valide.`
                    }
                )
            }
        } else if (i <= 2*nb) {
            switch (val){
            case "<":
            case ">":
            case "-":
                result.push(
                    comma,
                    {css : "dir", src: elt, value:val}
                )
                break;
            default:
                errors.push({
                    type: 'bad dir',
                    line: idx,
                    txt: `'${val}' n'est pas une direction valide.`
                })
                result.push(
                    comma,
                    {
                        css : "err err-dir",
                        src : elt,
                        txt: `'${val}' n'est pas un symbole valide.`
                    }
                )
            }
        } else {
            errors.push({
                type: 'trans line too long',
                line: idx,
                txt : "Cette ligne de transition est trop longue."
            })
            result.push(
                commaErr,
                {
                    css : "err err-idx",
                    src : elt,
                    txt : "Cette ligne de transition est trop longue."
                }
            )
        }
    }
    if (errors.length > 0 ){
        spec.errors = spec.errors.concat(errors)
        spec.input_trans = false
    } else if (spec.input_trans){
        let i1 = spec.input_trans.ln
        let q1 = spec.input_trans.etat
        let reads = spec.input_trans.reads
        spec.input_trans = false
        if (tail.length == 2 * nb){
            let writes = tail.slice(0, nb)
            let moves = tail.splice(nb)
            let actions = new Array(nb)
            for (var i = 0; i < nb; i++){
                actions[i]=[writes[i].trim(),moves[i].trim()]
            }
            spec.trans.push(new Transition(i1,
                                           idx,
                                           q1,
                                           q,
                                           reads,
                                           actions))
        } else if (tail.length < 2 * nb){
            spec.errors.push({
                type: 'trans line too short',
                line: idx,
                txt : "Cette ligne de transition est trop courte."
            })
        } else {
            spec.errors.push({
                type: 'unknown, should not happen',
                line: idx,
                txt: '??'
            })
        }
    } else {
        if (tail.length == nb){
            spec.input_trans = {
                ln : idx,
                etat : q,
                reads : tail.map(function(s){return s.trim()})
            }
        } else if (tail.length < nb){
            spec.errors.push({
                type: 'trans line short',
                line: idx,
                txt: "Cette ligne de transition est trop courte."
            })
        } else {
            spec.errors.push({
                type: 'too many symbols for input',
                line: idx,
                txt: "Cette ligne de transition est trop longue."
            })
        }
    }
    return result
}

function parseTrans(idx, line, spec){
    let m = line.match(/^([^,]*),(.*)/)
    if (m){
        let state = { css : "state", src : m[1], value : m[1].trim() }
        let tail = m[2].split(',')
        if (spec.nb == 0){
            spec.nb = tail.length
        }
        return [state].concat(parseTail(idx, tail, spec, state.value))
    } else {
        if (line.trim().length > 0){
            spec.errors.push({
                type: 'not recognized',
                line: idx,
                txt: "Cette ligne est incompréhensible."
            })
        }
        return [ {css : "", src : line} ]
    }
}


function parseLine(idx, line, spec, container){
    let parts = parseComment(idx, line,spec)
    let optln = parseOptLn(idx, parts.content, spec)
    if (optln){
        insertLine(optln.concat(parts.comment), container)
    } else {
        let trln = parseTrans(idx, parts.content,spec)
        insertLine(trln.concat(parts.comment), container)
    }
}

function createLine(i, str, spec){
    const div = document.createElement("pre")
    div.className = "pretty-line"
    div.id = `pretty-line-${i}`
    const idx = document.createElement("div")
    div.appendChild(idx)
    idx.className = "line-idx"
    idx.id = `idx-${i}`
    const idxC = document.createElement("code")
    idx.appendChild(idxC)
    idxC.innerHTML = i
    const line = document.createElement("code")
    div.appendChild(line)
    line.className = "line"
    line.id = `line-${i}`

    parseLine(i, str, spec, line)
    
    return div
}

function prtset(s){
    let out = "{"
    let init = true
    for (const i of s){
        if (init){
            init = false
        } else {
            out += ','
        }
        out += i
    }
    return (out+"}")
}
function summary(tm){
    return `${tm.nb_tapes} rubans<br/>états : ${prtset(tm.states)}<br/>transitions : { ${tm.transList.join(',<br/>')} }<br/>état initial : ${tm.init}, état final : ${tm.finalState}<br/> alphabet : ${prtset(tm.alphabet)}`
}


function transitionToEdge(tr, src_txt){
    let src = src_txt.split('\n').slice(tr.ln1-1, tr.ln2 + 1).join('\n')
    return {
        id: tr.id,
        from : `q_${tr.etat_read}`,
        to: `q_${tr.etat_write}`,
        arrows: "to",
        label: `${tr.test}/${tr.action}`,
        title: `lignes ${tr.ln1}-${tr.ln2}:\n${src}`
    }
}

function genGraph(tm, src_txt){
    var nodes = new Array(), edges = new Array()
    for (let q of tm.states){
        nodes.push({id: `q_${q}`, label:q})
    }
    nodes.push({id: "initial", shape:"dot", size:1}, {id: "final", shape:"dot", size:1})
    edges.push({id: "e_init", from: "initial", to: `q_${tm.init}`, arrows: "to"},
               {id: "e_final", from: `q_${tm.finalState}`, to: "final", arrows: "to"})
    for (const t of tm.transList){
        edges.push(transitionToEdge(t, src_txt))
    }
    return {
        nodes: nodes,
        edges: edges
    }
}

function parseTM(textarea, displayarea){
    const lines = textarea.value.split('\n')
    const nbLines = lines.length;
    var maxW = 0
    const spec = {
        nb : 0,
        trans : new Array(),
        output: 0,
        outputLn: 0,
        name: "",
        errors : new Array()
    }
    
    
    displayarea.innerHTML = ""

    for (var l, id = 1; id <= nbLines; id++){
        l = createLine(id, lines[id-1], spec)
        displayarea.appendChild(l)
        maxW = Math.max(maxW,  l.clientWidth)
    }
    textarea.style.width = `${maxW}px`

    if (spec.output > spec.nb){
        spec.errors.push({
            type : 'output tape index is larger than nb of tapes',
            line : spec.errors.outputLn,
            txt : `Le ruban de sortie ${spec.output} n'existe pas, cette machine a ${spec.nb} rubans`
        })
    }
    if (spec.errors.length > 0){
        document.getElementById("compilation-panel").classList.add("alert")
        errElt = document.getElementById("compilation-msg")
        errElt.innerHTML = "Spécification incorrecte : <br/>"
        for (const e of spec.errors){
            let ln = document.getElementById(`idx-${e.line}`)
            ln.classList.add('alert')
            if(ln.title){
                ln.title += `\n${e.txt}`
            } else {
                ln.title = e.txt
            }
            errElt.innerHTML += `<br/>ligne ${e.line}: ${e.txt.replaceAll('<','&lt').replaceAll('<','&gt')}`
        }
        return false
    } else if (spec.q0 && spec.qf && spec.trans.length > 0) {
        let mytm = new TuringMachine(spec.nb, spec.q0, spec.qf, spec.trans, spec.output, spec.name)
        document.getElementById("compilation-panel").classList.remove("alert")
        document.getElementById("compilation-msg").innerHTML = `Compilation réussie ! <br/> ${summary(mytm)}`
        return mytm
    } else {
        document.getElementById("compilation-panel").classList.add("alert")
        errElt = document.getElementById("compilation-msg")
        errElt.innerHTML = "Spécification incomplète : <br/>"
        if (! spec.q0){
            errElt.innerHTML += "<br/> état initial manquant."
        }
        if (! spec.qf){
            errElt.innerHTML += "<br/> état final manquant."
        }
        if (spec.trans.length == 0){
            errElt.innerHTML += "<br/> transitions manquantes."
        }
        return false
    }
}
