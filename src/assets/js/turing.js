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

    get empty(){
        return false
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


class Stack{
    
    constructor(init = '', forward = true){
        this.forward = forward
        this.content = init.split('')
    }

    get empty(){
        return (this.content.length == 0)
    }

    pop (){
        if (this.content.length > 0){
            if (this.forward){
                return this.content.shift()
            } else {
                return this.content.pop()
            }
        } else {
            return false
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
    #biInfinite
    constructor(init='', biInfinite=true){
        this.#biInfinite = biInfinite
        if (this.#biInfinite){
            this.past = new InfStack('', false)
        } else {
            this.past = new Stack('', false)
        }
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

    testMove(direction){
        if(this.#biInfinite || direction != "<"){
            return true
        } else {
            return (! this.past.empty)
        }   
    }

    move(direction){
        switch(direction){
        case "-":
            break;
        case "<":
            if (!this.#biInfinite)
                if (this.past.empty) break;
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
            future: this.future.string,
            biInfinite:this.#biInfinite
        }
    }

    get repr (){
        if (this.#biInfinite){
            return `${this.past.string} >${print_symb(this.currentSymb)}< ${this.future.string}`
        } else {
            return `|-${this.past.string} >${print_symb(this.currentSymb)}< ${this.future.string}`
        }
    }

    static from_object (obj){
        // console.log(Object.keys(obj))
        let tape = new Tape('', obj.biInfinite)
        tape.past = new InfStack(obj.past,false)
        if (obj.present == ' '){
            tape.current = '_'
        }else{
            tape.current = obj.present
        }
        tape.future = new InfStack(obj.future,true)

        return tape
    }
}

function printTapeContent(cnt){
     return `${cnt.past} >${cnt.present}< ${cnt.future}`
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
    static fromAuto(t){
        return new Transition(t.id,t.src,t.in,t.out,[t.symb],[[t.symb,'>']])
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

    automatonToString(){
        return `${this.etat_read} -- ${this.testString} --> ${this.etat_write}`
    }

}

class Config {
    constructor(q0, w, tapes) {
        if (tapes.length < 1) {
            throw new TuringException(`Bad number of tapes : ${nb_tapes}`);
        }
        this.etat_courant = q0;
        this.inputword = w

        this.tapes = []

        for (var i = 0; i < tapes.length; i++){
            if (i == 0)
                this.tapes.push(new Tape(w, tapes[i]));
            else
                this.tapes.push(new Tape('', tapes[i]));
        }
       
    }

    get repr(){
        let s = `etat : ${this.etat_courant}\n`
        for (const t of this.tapes){
            s += `${t.repr}\n`
        }
        return s
    }

    get snap (){
        let tapes = new Array()
        for (const t of this.tapes){
            tapes.push(t.content)
        }
        return {
            etat : this.etat_courant,
            tapes : tapes
        }
    }

    restore(snap){
        // console.log("coucou1")
    
        this.etat_courant = snap.etat
        // console.log("coucou2")
    
        this.tapes = new Array()
        for (const t of snap.tapes){
            // console.log(printTapeContent(t))
            // console.log(`restore ${Object.keys(t)}`)
            let tape = Tape.from_object(t)
            this.tapes.push(tape)
            // console.log(`restore - ${this.tapes.length}`)    
            // console.log(tape.repr)
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

    reset(q0, w, tapes){
        // console.log(tapes)
        this.etat_courant = q0;
        this.inputword = w
        let tape = new Tape()
        for (var i = 0; i < tapes.length; i++) {
            if (i == 0)
                tape = new Tape(w, tapes[i])
            else
                tape = new Tape('', tapes[i])
            this.tapes[i] = tape;
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
                } else if (! this.tapes[i].testMove(tr.writes[i][1])){
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
    constructor(tapes, q0, qf, tr, output=0, name="", eager=false) {
        this.nb_tapes = tapes.length;
        this.tapes = tapes;
        this.init = q0;
        this.finalStates = qf;
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
        this.eager = eager
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
        for(const q of this.finalStates.values()){
            states.add(q)
        }
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
                            // console.log(`(r) add ${c}, result ${prtset(alphabet)} (size ${alphabet.size})`) 
                        }
                        break;
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
        let trans_list = this.transList.map(tr => tr.toString().replaceAll('<','&lt').replaceAll('<','&gt')).join(",<br/>  ")
        let etat_list = this.states
        return `${this.nb_tapes} rubans<br/>${etat_list.size} états : ${prtset(this.states).replaceAll('<','&lt').replaceAll('<','&gt')}<br/>transitions : {<br/>  ${trans_list}<br/> }<br/>état initial : ${this.init.replaceAll('<','&lt').replaceAll('<','&gt')}, états finaux : ${prtset(this.finalStates).replaceAll('<','&lt').replaceAll('<','&gt')}<br/> alphabet : ${prtset(this.alphabet).replaceAll('<','&lt').replaceAll('<','&gt')}`
    }
    
}

class Automaton extends TuringMachine{
    constructor(q0,qf,trans,name=""){
        super ([true],q0,qf,[],0,name,true)
        var tr_map = new Map();
        for (const t of trans){
            if (tr_map.has(t.in)){
                tr_map.get(t.in).push(Transition.fromAuto(t))
            }else{
                tr_map.set(t.in, new Array(Transition.fromAuto(t)))
            }
        }
        this.transitions = tr_map
    }

    get summary(){
        let trans_list = this.transList.map(tr => tr.automatonToString()).join(",<br/>  ")
        let etat_list = this.states
        return `${etat_list.size} états : ${prtset(this.states).replaceAll('<','&lt').replaceAll('<','&gt')}<br/>transitions : {<br/>  ${trans_list}<br/> }<br/>état initial : ${this.init.replaceAll('<','&lt').replaceAll('<','&gt')}, états finaux : ${prtset(this.finalStates).replaceAll('<','&lt').replaceAll('<','&gt')}<br/> alphabet : ${prtset(this.alphabet).replaceAll('<','&lt').replaceAll('<','&gt')}`
    }

}

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
        super(tm.init, w, tm.tapes);
        this.machine = tm;
        this.nb_steps = 0;
        this.accepted = tm.finalStates.includes(tm.init);
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
                // console.log("checking "+tr.toString())
                while (ok && (i < this.machine.nb_tapes)){
                    // console.log(`tape ${i} (type ${tr.symbols_read[i].type}), ${tr.symbols_read[i].value} vs ${r[i]}.`)
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
                    ok = ok && this.tapes[i].testMove(tr.writes[i][1])
                        
                    i++
                }
                // console.log(ok)
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
            this.do_step(t);
            return true;
        }else{
            return false
        }
    }

    do_step(t, mark = false, tried = []) {
        let symbs = this.currentSymbs
        let conf = this.snap
        this.execute(t);
        this.history.push({
            trans : t,
            symbs : symbs,
            config : conf,
            marked : mark,
            tried : [t.id]+tried
        });
        this.nb_steps ++;
        this.upd_accepted();
    }

    backtrack(){
        console.log('backtracking...')
        while (this.history.length > 0){
            let c = this.history.pop()
            // console.log(`${c.marked} trans no ${c.trans.id} - ${c.trans.toString()}`)
            if (c.marked){
                let snap = c.config
                // console.log(snap.etat)
                // for (const t of snap.tapes){
                //     console.log(printTapeContent(t))
                // }
                this.restore(snap)

                // console.log(this.repr)

                let av = new Array()
                for (const t of this.available_transitions){
                    // console.log(t.id)
                    if (! c.tried.includes(t.id)){
                        av.push(t)
                    }
                }
                if (av.length > 0){
                    return {
                        av : av,
                        tried : c.tried
                    }    
                }
            }
        }
        return false
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
                                        
                    ok = ok && this.tapes[i].testMove(tr.writes[i][1])
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
        this.accepted = this.machine.finalStates.includes(this.etat);
    }

    accepts() {
        return this.accepted & !this.timed_out;
    }

    reset(w){
        this.history = new Array();
        this.nb_steps = 0;
        super.reset(this.machine.init, w, this.machine.tapes);
        this.upd_accepted();
        this.timed_out = false;
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
