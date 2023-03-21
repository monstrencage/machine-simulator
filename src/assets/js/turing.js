class TuringException extends Error{
    constructor(message){
        super(message)
        this.name = "TuringException"
    }
}
class CompileException extends Error{
    constructor(message, lineStart, lineEnd){
        super(message)
        this.name = "CompileException"
        this.lineStart = lineStart
        this.lineEnd = lineEnd
    }
}

function print_symb(s){
    if (s == '_'){
        return ' '
    }else{
        return s
    }
}

function prtset(s){
    let out = "{ "
    let init = true
    for (const i of s){
        if (init){
            init = false
        } else {
            out += ', '
        }
        out += i
    }
    return (out+" }")
}


class InfStack{
    constructor(init = '', forward = true){
        this.forward = forward
        this.content = init.split('')
    }

    pop (){
        if (this.content.length > 0){
            if (this.forward){
                return this.content.shift()
            } else {
                return this.content.pop()
            }
        } else {
            return '_'
        }
    }
    push (s){
        if (this.forward){
            return this.content.unshift(s)
        } else {
            return this.content.push(s)
        }
    }
    get string (){
        return this.content.map(print_symb).join('')
    }
}

class Tape {
    constructor(init=''){
        this.past = new InfStack('', false)
        if (init.length > 0){
            this.current = init[0]
        } else {
            this.current = '_'
        }
        if (init.length > 1){
            this.future = new InfStack(init.slice(1), true)
        } else {
            this.future = new InfStack()
        }
    }

    get currentSymb(){
        return this.current
    }

    set currentSymb(s){
        this.current = s
    }

    move(direction){
        switch(direction){
        case "-":
            break;
        case "<":
            this.future.push(this.current)
            this.current = this.past.pop()
            break;
        case ">":
            this.past.push(this.current)
            this.current = this.future.pop()
            break;
        default:
            throw new TuringException(`Direction invalide ${direction}`)
        }
    }

    get content(){
        return {
            past : this.past.string,
            present: print_symb(this.currentSymb),
            future: this.future.string
        }
    }
}

function printWrites(wrts){
    let sw = Array(wrts.length),
        mw = Array(wrts.length)
    for (const i of wrts.keys()){
        mw[i] = wrts[i][1]
        switch (wrts[i][0].type){
        case "symb":
            sw[i] = wrts[i][0].value
            break;
        case "ref":
            sw[i] = `\$${wrts[i][0].value}`
            break;
        }
        
    }
    return `${sw},${mw}`
}

function printSet(s){
    var res = ""
    for (const c of s){
        res = res.concat(c)
    }
    return res
}
    
function printReads(reads){
    let sr = Array()
    for (const c of reads){
        switch (c.type){
        case "symb":
            sr.push(`${c.value}`)
            break;
        case "range":
            sr.push(`[${printSet(c.value)}]`)
            break;
        default: 
            sr.push(`${c.type}:${c.value}`)
            break;
        }
        
    }
    return sr.join(",")
}

class Transition {
    constructor(id, src, r, w, sr, sw) {
        if (sr.length !== sw.length) {
            throw "Bad transition : not the same number of tapes between input and output.";
        }
        // alert (sr.map(c => c.constructor.name).join(','))
        
        this.id = id;
        this.src = src;
        this.etat_write = w;
        this.etat_read = r;
        this.writes = sw;
        this.nb = sr.length
        this.symbols_read = sr
    }

    get testString(){
        return printReads(this.symbols_read)
    }

    get actionString () {
        return printWrites(this.writes)
     }

    toString(){
        return `${this.etat_read} -[${this.testString}/${this.actionString}]-> ${this.etat_write}`
    }
    
}

class Config {
    constructor(q0, w, nb_tapes) {
        if (nb_tapes < 1) {
            throw new TuringException(`Bad number of tapes : ${nb_tapes}`);
        }
        this.etat_courant = q0;
        this.inputword = w
        
        this.tapes = [new Tape(w)];

        for (var i = 0; i < nb_tapes - 1; i ++) {
            this.tapes.push(new Tape());
        }

    }

    get currentSymbs(){
        var symbs = "";

        for (var i=0; i < this.tapes.length; i++) {
            symbs+= this.tapes[i].currentSymb;
        }

        return symbs;
    }

    get etat(){
        return this.etat_courant
    }

    set etat(q){
        this.etat_courant = q;
    }

    reset(q0, w){
        let nb_tapes = this.tapes.length
        this.etat_courant = q0;
        this.inputword = w
        this.tapes = [new Tape(w)];
        for (var i = 0; i < nb_tapes - 1; i ++) {
            this.tapes.push(new Tape());
        }
        
    }

    is_available(tr){
        if (!tr.constructor === Transition){
            throw new TuringException (`is_available: bad argument ${tr}`)
        }
        if (tr.etat_read === this.etat){
            var nb = tr.symbols_read.length
            var curr = this.currentSymbs
            for(var i = 0; i<nb;i++){
                if (tr.symbols_read[i] != curr[i]){
                    // alert(`difference found between ${[(tr.etat_read,tr.symbols_read),(cnf.etat, cnf.currentSymbs)]}, on tape ${i}`)
                    return false
                }
            }
            return true
        }else{
            // alert(`different states : ${[tr.etat_read,tr.symbols_read,cnf.etat, cnf.currentSymbs]}\n${tr.etat_read}:${typeof(tr.etat_read)}\n${cnf.etat}:${typeof(cnf.etat)}`)
            return false
        }
    }

    execute(tr){
        if(!tr.constructor === Transition){
            throw new TuringException (`execute: bad argument ${tr}`)
        }
        this.etat = tr.etat_write;
        let inSymbs = Array(this.tapes.length)
        for (var i=0; i < this.tapes.length; i++) {
            inSymbs[i] = this.tapes[i].currentSymb
        }
        for (var i=0; i < this.tapes.length; i++) {
            switch (tr.writes[i][0].type){
            case "symb":
                this.tapes[i].currentSymb = tr.writes[i][0].value;
                break;
            case "ref":
                // alert(`${tr.id} : write on tape ${i+1} symbol ${inSymbs[tr.writes[i][0].value - 1]}`)
                this.tapes[i].currentSymb = inSymbs[tr.writes[i][0].value - 1];
                break;
            }
            this.tapes[i].move(tr.writes[i][1]);
        }
    }

    cancel(tr){
        this.etat = tr.trans.etat_read;
        for (var i=0; i < this.tapes.length; i++) {
            this.tapes[i].move(invDir(tr.trans.writes[i][1]));
            this.tapes[i].currentSymb = tr.symbs[i];
        }
    }

}

class TuringMachine {
    constructor(nb, q0, qf, tr, output=0, name="") {
        this.nb_tapes = nb;
        this.init = q0;
        this.finalState = qf;
        this.output = output
        this.name = name
        var tr_map = new Map();
        for (const t of tr){
            if (tr_map.has(t.etat_read)){
                tr_map.get(t.etat_read).push(t)
            }else{
                tr_map.set(t.etat_read, new Array(t))
            }
        }
        this.transitions = tr_map
    }

    get transList(){
        var res = new Array()
        for (const t of this.transitions.values()){
            res = res.concat(t)
        }
        return res
    }
    
    get states() {
        var states = new Set();
        states.add(this.init)
        states.add(this.finalState)
        for(const tr of this.transList.values()){
            states.add(tr.etat_read);
            states.add(tr.etat_write);
        }
        return states;
    }

    get alphabet() {
        var alphabet = new Set();


        for (const ts of this.transitions.values()){
            for (const t of ts.values()){
                for (const s of t.symbols_read){
                    switch (s.type){
                    case "symb":
                        alphabet.add(s.value)
                        // console.log(`(si) add ${s.value}, result ${prtset(alphabet)} (size ${alphabet.size})`)
                        break;
                    case "range":
                        // console.log(`${t.id} - range ${prtset(s.value)}`)
                        for (const c of s.value){
                            alphabet.add(c)    
                            // console.log(`(r) add ${c}, result ${prtset(alphabet)} (size ${alphabet.size})`) }
                            break;
                        }
                    }
                }
                for (const w of t.writes){
                    switch(w[0].type){
                    case "symb":
                        alphabet.add(w[0].value)
                        // console.log(`(so) add ${w[0].value}, result ${prtset(alphabet)} (size ${alphabet.size})`)
                        break;
                    case "type":
                        break;
                    }
                }
            }
        }
        return alphabet;
    }

    get summary(){
        let trans_list = this.transList.map(tr => tr.toString()).join(",<br/>  ")
        return `${this.nb_tapes} rubans<br/>états : ${prtset(this.states)}<br/>transitions : {<br/>  ${trans_list}<br/> }<br/>état initial : ${this.init}, état final : ${this.finalState}<br/> alphabet : ${prtset(this.alphabet)}`
    }
    
}

// function uncomment(ln){
//     var m = ln.match(/(.*)\/\/.*/);
//     if (m){
//         return (m[1].trim())
//     }else{
//         return (ln.trim())
//     }
// }


function invDir(direction){
    switch (direction){
    case '>' :
        return '<';
    case '<' :
        return '>';
    case '-' :
        return '-';
    default :
        return direction;
    }
}

class TuringEnv extends Config {
    constructor(tm, w) {
        super(tm.init, w, tm.nb_tapes);
        this.machine = tm;
        this.nb_steps = 0;
        this.accepted = tm.init === tm.finalState;
        this.timed_out = false;
        this.history = new Array ()
    }

    get available_transitions () {
        const q = this.etat
        const res = new Array()
        if (this.machine.transitions.has(q)){
            const trList = this.machine.transitions.get(q)
            const r = this.currentSymbs
            for (const tr of trList){
                var ok = true
                var i = 0
                while (ok && (i < this.machine.nb)){
                    switch (tr.type){
                    case "symb":
                        ok = ok && tr.value == r[i]
                        break;
                    case "range":
                        ok = ok && tr.value.has(r[i])
                        break;
                    }
                    i++
                }
                if (ok){
                    res.push(tr)
                }
            }
            
        }
        return res
    }

    step() {
        const t = this.next_transition
        if (t){
            let symbs = this.currentSymbs
            this.execute(t);
            this.history.push({
                trans : t,
                symbs : symbs
            });
            this.nb_steps ++;
            this.upd_accepted();
            return true;
        }else{
            return false
        }
    }

    get next_transition() {
        const q = this.etat
        if (this.machine.transitions.has(q)){
            const trList = this.machine.transitions.get(q)
            const r = this.currentSymbs
            for (const tr of trList){
                var ok = true
                var i = 0
                while (ok && (i < this.machine.nb_tapes)){
                    
                    switch (tr.symbols_read[i].type){
                    case "symb":
                        ok = ok && (tr.symbols_read[i].value == r[i])
                        break;
                    case "range":
                        ok = ok && (tr.symbols_read[i].value.has(r[i]))
                        break;
                    default:
                        break;
                    }
                    i++
                }
                if (ok){
                    return tr
                }
            }
            
        }
        return false
    }

    

    back(){
        var tr;
        if (this.history.length != this.nb_steps){
            throw new TuringException(
                `Pbm de marche arrière: this.history.length=${this.history.length},
this.nb_steps=${this.nb_steps}`)
        }
        if (this.history.length == 0){
            return false;
        }else{
            tr = this.history.pop();
            this.cancel(tr);
            this.nb_steps --;
            this.upd_accepted();
            return true;
        }
    }

    upd_accepted() {
        this.accepted = this.etat === this.machine.finalState;
    }

    accepts() {
        return this.accepted & !this.timed_out;
    }

    reset(w){
        this.history = new Array();
        this.nb_steps = 0;
        this.upd_accepted();
        this.timed_out = false;
        super.reset(this.machine.init, w);
    }

    get outputMsg(){
        let msg = ""
        
        if (this.accepted){       
            msg = `Le mot "${this.inputword}" est accepté.`
        } else {    
            msg = `Le mot "${this.inputword}" est rejetté.`
        }
        if (this.machine.output > 0){
            var output = this.tapes[this.machine.output - 1].content
            msg +=
                `<br>Sortie : ${output.past}${output.present}${output.future}`
        }
        return msg
    }
}
