function isTransInput(spec){
    return (spec.input_trans == false)
}



function processTail(line, q, spec) {
    let nb = spec.nb
    let i = 0
    let actions = new Array ()
    
    while (!line.isEmpty){
        let comma = line.splitRegex(/^(,)(.*)/)
        comma.addClass('comma')
        let x = line.splitRegex(/^([^,]*)(,.*)/)
        if (!x) {
            x = line.toElt()
        }
        if ((i < nb) || (nb == 0)){
            if (isTransInput(spec)){
                formatInSymbElt(x)
            } else {
                formatOutSymbElt(x, nb)
            }
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
                src : line.line,
                etat : q,
                reads : actions.map(t => t[0])
            }
        } else if ((i == 2 * spec.nb) && spec.input_trans){
            let i1 = spec.input_trans.ln
            let src1 = spec.input_trans.src
            let q1 = spec.input_trans.etat
            let reads = spec.input_trans.reads
            spec.input_trans = false
            let placeholder = ""
            if (i1 + 1 < line.index){
                placeholder = "\n[...]"
            }
            
            // alert (reads.map(c => c.constructor.name).join(','))

            spec.trans.push(
                new Transition(
                    i1,
                    `lignes ${i1}-${line.index}:\n${src1}${placeholder}\n${line.line}`,
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


class TMParser {
    
    constructor(){
        this.spec = {
            nb : 0,
            trans : new Array(),
            output: 0,
            outputLn: 0,
            name: "",
            input_trans : false,
            ndet : false
        }
        this.idx = 0
    }

    reset(){
        this.spec = {
            nb : 0,
            trans : new Array(),
            output: 0,
            outputLn: 0,
            name: "",
            input_trans : false,
            ndet : false
        }
        this.idx = 0
    }
    

    processLine(str){
        this.idx += 1
        let line = new Line(this.idx, str)
        let ok = parseEmpty(line)
        if (!ok){
            parseComment(line)
            line.splitRegex(/^(\s*)(.*)/)
            ok = line.isEmpty
        }
        if (!ok){
            ok = parseOptLn(line, this.spec)
        }
        if (!ok){
            ok = parseTrans(line, this.spec)
        }
        if (!ok){
            line.toElt()
            line.falsify = "Ligne incompréhensible."
        }
        return line
    }

    checkSpec(){
        let errors = Array()
        
        if (this.spec.output > this.spec.nb){
            errors.push(
                new Error(`Le ruban de sortie ${this.spec.output} n'existe pas, cette machine a ${this.spec.nb} rubans`,
                          this.spec.outputLn)
            )
        }
        if (! this.spec.q0){
            errors.push(new Error("état initial manquant."))
        }
        if (! this.spec.qf){
            errors.push(new Error("état final manquant."))
        }
        else if (this.spec.qf.length == 0){
            errors.push(new Error("état final manquant."))
        }
        if (this.spec.trans.length == 0){
            errors.push(new Error("transitions manquantes."))
        }
        if (this.spec.input_trans){
            errors.push(new Error("transition incomplète",
                                  this.spec.input_trans.ln))
        }
        if (errors.length == 0){
            this.idx = 0
        }
        return errors
    }

    get value(){
        if (this.idx == 0){
            return {
                machine : new TuringMachine(this.spec.nb,
                                            this.spec.q0,
                                            this.spec.qf,
                                            this.spec.trans,
                                            this.spec.output,
                                            this.spec.name),
                ndet : this.spec.ndet
            }
        } else {
            return false
        }
    }
}


function displaySymbs(tail){
    return tail.map(s => `<mark class="symb">${s}</mark>`).join('<mark class="comma">,</mark>')
}
function displayMoves(tail){
    return tail.map(s => `<mark class="dir">${s}</mark>`).join('<mark class="comma">,</mark>')
}
function displayErr(tail){
    return tail.join('<mark class="comma err">,</mark>')
}

class QuickParser {
    
    constructor(display, str){
        this.nb_tapes = 0
        this.idx = 0
        this.errors = new Array()
        this.display = display
        this.remainder = str
        this.finished = false

        this.display.innerHTML = ""
    }

    process(){
        this.idx += 1
        let temp = this.remainder 
        let output = ""
        let err = false
        let parts = this.remainder.split('\n',2)
        var myline = ""
        if (parts.length == 0){
            console.log(`processSrc : ${str} splits into 0 lines (weird)`)
        } else if (parts.length == 1){
            myline = parts[0]
            this.remainder = ""
            this.finished = true
        } else if (parts.length == 2){
            myline = parts[0]
            this.remainder = this.remainder.substring(myline.length +1)
            console.assert(temp == `${myline}\n${this.remainder}`, `called on ${temp}, split as ${myline}\n${this.remainder}`)
        } else {
            console.log(`processSrc : ${str} splits into ${parts.length} lines (weird)`)
        }

        myline = myline.replaceAll('<','&lt').replaceAll('<','&gt')

        parts = myline.split("//",2)
        if (parts.length == 2){
            output = `<mark class="comments">//${parts[1]}</mark>`
            myline = parts[0]
        }
        
        if (/^\s*$/.test(myline)){
            output = `${myline}${output}`
        } else {
            parts = myline.match(/^([^:]*):(.*)/)
            if (parts){
                switch(parts[1].trim()){
                case "init":
                case "initial":
                case "accept":
                case "final":
                    output = `<mark class="ppt">${parts[1]}</mark><mark class="colon">:</mark><mark class="state">${parts[2]}</mark>${output}`
                    break;
                case "sortie":
                case "output":
                    output = `<mark class="ppt">${parts[1]}</mark><mark class="colon">:</mark><mark class="int">${parts[2]}</mark>${output}`
                    break;
                case "name":
                case "nom":
                    output = `<mark class="ppt">${parts[1]}</mark><mark class="colon">:</mark><mark class="plain-txt">${parts[2]}</mark>${output}`
                    break;
                case "non-det":
                    output = `<mark class="ppt">${parts[1]}</mark><mark class="colon">:</mark><mark class="bool">${parts[2]}</mark>${output}`
                    break;
                default:
                    output = `<mark class="ppt err">${parts[1]}</mark><mark class="colon err">:</mark><mark class="plain-txt">${parts[2]}</mark>${output}`
                    err = true
                    break;
                }
            } else {
                parts = myline.match(/^([^,]*),(.*)/)
                if (parts){
                    let tail = parts[2].split(",")
                    if (this.nb_tapes == 0){
                        this.nb_tapes = tail.length
                    }
                    
                    if (this.nb_tapes == tail.length){
                        output = `<mark class="state">${parts[1]}</mark><mark class="comma">,</mark>${displaySymbs(tail)}${output}`
                    } else  if (2 * this.nb_tapes == tail.length){
                        let symbs = tail.slice(0, this.nb_tapes)
                        let moves = tail.slice(this.nb_tapes)
                        output = `<mark class="state">${parts[1]}</mark><mark class="comma">,</mark>${displaySymbs(symbs)}<mark class="comma">,</mark>${displayMoves(moves)}${output}`
                    } else {
                        err = true
                        output = `<mark class="state">${parts[1]}</mark><mark class="comma err">,</mark>${displayErr(tail)}${output}`
                    }
                } else {
                    err = true
                    output = `<mark class="err">${myline}</mark>${output}`
                }
            }
        }
        if (err){
           output = `<a id="idx-${this.idx}" class="line-idx alert"><span>${this.idx}:</span></a>${output}` 
        } else {
           output = `<a id="idx-${this.idx}" class="line-idx"><span>${this.idx}:</span></a>${output}` 
        }

        this.display.innerHTML += output
        if (! this.finished){
            if (err){
                this.errors.push(this.idx)
            }
            this.display.innerHTML += "<br/>"
            this.process()
        }
    }
}
