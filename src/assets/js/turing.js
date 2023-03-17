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
    let sw = wrts.map(function(p){return p[0]}).join(',')
    let mw = wrts.map(function(p){return p[1]}).join(',')
    return `${sw},${mw}`
}

class Transition {
    constructor(id, src, r, w, sr, sw) {
        if (sr.length !== sw.length) {
            throw "Bad transition : not the same number of tapes between input and output.";
        }
        this.id = id;
        this.src = src;
        this.etat_write = w;
        this.etat_read = r;
        this.symbols_read = sr.join('');
        this.writes = sw;
    }

    get test(){
        return this.symbols_read.split('').join(',')
    }

    get action () {
        return printWrites(this.writes)
     }

    toString(){
        return `${this.etat_read} -[${this.test}/${this.action}]-> ${this.etat_write}`
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
        for (var i=0; i < this.tapes.length; i++) {
            this.tapes[i].currentSymb = tr.writes[i][0];
            this.tapes[i].move(tr.writes[i][1]);
        }
    }

    cancel(tr){
        if(!tr.constructor === Transition){
            throw new TuringException (`execute: bad argument ${tr}`)
        }
        this.etat = tr.etat_read;
        for (var i=0; i < this.tapes.length; i++) {
            this.tapes[i].move(invDir(tr.writes[i][1]));
            this.tapes[i].currentSymb = tr.symbols_read[i];
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
                var m = tr_map.get(t.etat_read)
                if (m.has(t.symbols_read)){
                    m.set(t.symbols_read,m.get(t.symbols_read).push(t))
                } else {
                    m.set(t.symbols_read,[t])
                }
            }else{
                var m = new Map()
                m.set(t.symbols_read,[t])
                tr_map.set(t.etat_read,m)
            }
        }
        this.transitions = tr_map
    }

    get transList(){
        var tr = new Array()
        for (const t of this.transitions.keys()){
            for(const tt of this.transitions.get(t).keys()){
                for(const ttt of this.transitions.get(t).get(tt)){
                    tr.push(ttt)
                }
            }
        }
        return tr
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
            for (const tt of ts.values()){
                for (const t of tt){ 
                    for (const s of t.symbols_read){
                        alphabet.add(s)
                    }
                    for (const w of t.writes){
                        alphabet.add(w[0])
                    }
                }
            }
        }
        return alphabet;
    }

    get summary(){
        return `${this.nb_tapes} rubans<br/>états : ${prtset(this.states)}<br/>transitions : { ${this.transList.join(',<br/>')} }<br/>état initial : ${this.init}, état final : ${this.finalState}<br/> alphabet : ${prtset(this.alphabet)}`
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
        if (this.machine.transitions.has(q)){
            const m = this.machine.transitions.get(q)
            const r = this.currentSymbs
            if (m.has(r)){
                return m.get(r)
            }else{
                return []
            }
        }else{
            return []
        }
    }

    step() {
        const tr = this.available_transitions
        if (tr.length > 0){
            const t = tr[0] 
            this.execute(t);
            this.history.push(t);
            this.nb_steps ++;
            this.upd_accepted();
            return true;
        }else{
            return false
        }
    }

    get next_transition() {
        for (var t, i = 0; i < this.machine.transitions.length; i++){
            t = this.machine.transitions[i];

            if (this.is_available(t)) {
                return t.id;
            }
        }

        return null;
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
