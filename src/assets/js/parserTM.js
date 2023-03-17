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
                src : line.line,
                etat : q,
                reads : actions
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
            name: ""
        }
        this.idx = 0
        this.tm = new TuringMachine(1,"q","q", Array())
    }

    reset(){
        this.spec = {
            nb : 0,
            trans : new Array(),
            output: 0,
            outputLn: 0,
            name: ""
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
        return line.html
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

    compile(){
        if (this.idx == 0){
            this.tm = new TuringMachine(this.spec.nb,
                                        this.spec.q0,
                                        this.spec.qf,
                                        this.spec.trans,
                                        this.spec.output,
                                        this.spec.name)      
        }
    }

    get value(){
        return this.tm
    }
}

