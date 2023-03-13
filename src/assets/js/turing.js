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

class Case {
    constructor(mydiv, symb = '_', focus=false){
        this.div = mydiv
        this.symbDiv = document.createElement("div")
        this.div.appendChild(this.symbDiv)
        this.div.classList.add('tm-cell')
        this.symbDiv.classList.add('tm-cell-content')
        this.content = symb
        if (this.content == '_'){
            this.symbDiv.innerHTML = ''
        }else{
            this.symbDiv.innerHTML = symb
        }
        this.focus = focus
        if(focus){
            this.div.classList.add('tm-current')
        }
    }

    get print_symb(){
        if (this.content == '_'){
            return ' '
        }else{
            return this.content
        }
    }
    get symb(){
        return this.content
    }

    set symb(s){
        this.content = s
        if (this.content == '_'){
            this.symbDiv.innerHTML = ''
        }else{
            this.symbDiv.innerHTML = s
        }
    }

    get elt(){
        return this.div
    }

    toggle_focused(){
        if (this.focus){
            this.div.classList.remove('tm-current')
            this.focus=false
        }else{
            this.div.classList.add('tm-current')
            this.focus = true
        }
    }

}

class Extra {
    constructor(){
        this.content = new Array()
    }

    pop (){
        if (this.content.length == 0){
            return new Case(document.createElement("div"))
        }else{
            return this.content.pop()
        }
    }
    push(c){
        this.content.push(c)
    }
}

class PieceOfTape{
    constructor(div, size, init='', past = false){
        this.container = div
        this.past = past
        this.reserve = new Extra()
        this.pot = new Array()

        for (let i = 0; i < init.length; i++){
            if (i < size){
                this.pot[i] = new Case(document.createElement("div"),init[i])
                if (this.past){
                    this.container.insertBefore(this.pot[i].div,this.container.firstChild)
                }else{
                    this.container.appendChild(this.pot[i].div)
                }   
            }else{
                this.reserve.push(new Case(document.createElement("div"),init[i]))
            }
        }
        for (let i = init.length; i < size; i++){
            this.pot[i] = new Case(document.createElement("div"))
            if (this.past){
                this.container.insertBefore(this.pot[i].div,this.container.firstChild)
            }else{
                this.container.appendChild(this.pot[i].div)
            }            
        }
        if (! this.past){
            this.pot.reverse()
            this.reserve.content.reverse()
        }
    }

    pop(){
        let last = this.reserve.pop()
        let first = this.pot.pop()
        this.container.removeChild(first.div)
        this.pot.unshift(last)
        if (this.past){
            this.container.insertBefore(last.div, this.container.firstChild)
        }else{
            this.container.appendChild(last.div)
        }
        return first
    }

    
    push(c){
        let last = this.pot.shift()
        this.reserve.push(last)
        this.container.removeChild(last.div)
        this.pot.push(c)
        if (this.past){
            this.container.appendChild(c.div)
        }else{
            this.container.insertBefore(c.div, this.container.firstChild)
        }
    }

    resize(size){
        const old_size = this.pot.length
        // alert(`old size : ${old_size}, new size ${size}`)
        if (old_size < size){
            for (var i = 0; i < size - old_size; i++){
                let last = this.reserve.pop()
                this.pot.unshift(last)
                if (this.past){
                    this.container.insertBefore(last.div, this.container.firstChild)
                }else{
                    this.container.appendChild(last.div)
                }
            }
        }else{
           for (var i = 0; i < old_size - size; i++){
               let last = this.pot.shift()
               this.reserve.push(last)
               this.container.removeChild(last.div)
            }
        }   
    }

    get content(){
        var cnt = this.reserve.content.map(c => c.print_symb).concat(this.pot.map(c => c.print_symb))
        if (! this.past){
            cnt.reverse()
        }
        return cnt
    }
}

class Tape {
    constructor(idDiv, init=''){
        let container = document.getElementById(idDiv)
        this.container = container
        let width = container.clientWidth
            - parseFloat(getComputedStyle(container).paddingRight||'0')
            - parseFloat(getComputedStyle(container).paddingLeft||'0')
        

        let tape = document.createElement("div")
        let pointer = document.createElement("div")
        let pastDiv = document.createElement("div")
        this.currentDiv = document.createElement("div")
        let futureDiv = document.createElement("div")
        tape.classList.add("tape")
        pointer.classList.add("pointer")
        pastDiv.classList.add("past-tape")
        this.currentDiv.classList.add("current-tape")
        futureDiv.classList.add("future-tape")

        container.appendChild(tape)
        tape.appendChild(pointer)
        tape.appendChild(pastDiv)
        tape.appendChild(this.currentDiv)
        tape.appendChild(futureDiv)
        
        let myelt = document.createElement("div")
        if (init != ''){
            this.current = new Case(myelt, init[0], true)
        }else{
            this.current = new Case(myelt, '_', true)
        }
        this.currentDiv.appendChild(myelt)

        let caseWidth = myelt.clientWidth
            + parseFloat(getComputedStyle(myelt).borderRight||'0')
            + parseFloat(getComputedStyle(myelt).borderLeft||'0')
            + parseFloat(getComputedStyle(myelt).marginRight||'0')
            + parseFloat(getComputedStyle(myelt).marginLeft||'0')

        let size = Math.trunc((width - caseWidth)/(2*caseWidth))
        // alert(`largeur détectée : ${width}\ntaille dimension case : ${caseWidth}\n-> nb cases : ${size}`) 

        this.past = new PieceOfTape(pastDiv,size,'',true)
        this.future = new PieceOfTape(futureDiv,size,init.slice(1),false)
    }

    get currentSymb(){
        return this.current.symb
    }

    set currentSymb(s){
        this.current.symb = s
    }

    move(direction){
        if (direction != '-' && direction != '<' && direction != '>'){
            throw new TuringException(`Direction invalide ${direction}`)
        }else if (direction != '-'){            
            this.current.toggle_focused()
            this.currentDiv.removeChild(this.current.div)
            if (direction == '<'){
                this.future.push(this.current)
                this.current = this.past.pop()
            }else{
                this.past.push(this.current)
                this.current = this.future.pop()
            }   
            this.current.toggle_focused()
            this.currentDiv.appendChild(this.current.div)
        }
    }

    resize(){
        let myelt = this.current.div
        let width = this.container.clientWidth
            - parseFloat(getComputedStyle(this.container).paddingRight||'0')
            - parseFloat(getComputedStyle(this.container).paddingLeft||'0')

        let caseWidth = myelt.clientWidth
            + parseFloat(getComputedStyle(myelt).borderRight||'0')
            + parseFloat(getComputedStyle(myelt).borderLeft||'0')
            + parseFloat(getComputedStyle(myelt).marginRight||'0')
            + parseFloat(getComputedStyle(myelt).marginLeft||'0')

        let size = Math.trunc((width - caseWidth)/(2*caseWidth))
        // alert(`largeur détectée : ${width}\ntaille dimension case : ${caseWidth}\n-> nb cases : ${size}`) 
        this.past.resize(size)
        this.future.resize(size)
        
    }

    get content(){
        return {
            past : this.past.content.join(''),
            present: this.current.print_symb ,
            future: this.future.content.join('')
        }
    }
}


class Transition {
    constructor(id, r, w, sr, sw) {
        if (sr.length !== sw.length) {
            throw "Bad transition : not the same number of tapes between input and output.";
        }
        this.id = id;
        this.etat_write = w;
        this.etat_read = r;
        this.symbols_read = sr.join('');
        this.writes = sw;
    }

}


function trimstr(s){ return s.trim() }

function getTransition(id, srd, swt){
    var reads = srd.split(',').map(trimstr), writes = swt.split(',').map(trimstr);
    
    let q1 = reads.shift()
    let q2 = writes.shift()
    let nb = reads.length
    let msg = `Transition ${q1} -[${reads}/${writes}]->${q2} incorrecte :`
    if (writes.length != 2 * nb){
        throw new TuringException(`${msg}<br/>nombre de rubans incohérent.`)
    }
    let wrt = []
    for (var i = 0; i < nb; i++){
        if (! isSymb(reads[i])){
            throw new TuringException(`${msg}<br/>'${reads[i]}' n'est pas un symbole valide.`)            
        }else if (! isSymb(writes[i])){
            throw new TuringException(`${msg}<br/>'${writes[i]}' n'est pas un symbole valide.`)            
        }else if (isDir(writes[nb+i])){
            wrt[i] = [writes[i],writes[nb+i]]
        } else {
            throw new TuringException(`${msg}<br/>'${writes[nb+i]}' n'est pas une direction valide.<br/> Les directions valides sont '<', '>', et '-'.`)
        }
    }
    return new Transition(id, q1,q2,reads,wrt)
}

function getEdge(raw_info, srd, swt){
    var reads = srd.split(',').map(trimstr), writes = swt.split(',').map(trimstr);
    
    let q1 = reads.shift()
    let q2 = writes.shift()
    let nb = reads.length
    let wrt = []
    for (var i = 0; i < nb; i++){
        wrt[i] = [writes[i],writes[nb+i]]
    }
    return {
        id: raw_info.id,
        from : `q_${q1}`,
        to: `q_${q2}`,
        arrows: "to",
        label: `${reads.join(',')}/${writes.join(',')}`,
        title: `lignes ${raw_info.line_start}-${raw_info.line_end}:\n${raw_info.text}`
    }
}

class Config {
    constructor(q0, w, nb_tapes, idDiv) {
        if (nb_tapes < 1) {
            throw new TuringException(`Bad number of tapes : ${nb_tapes}`);
        }
        this.containerId = idDiv
        this.etat_courant = q0;

        this.etatDiv = document.createElement("div")
        this.etatDiv.classList.add("tm-state")
        this.etatDiv.innerHTML = this.etat_courant
        document.getElementById(this.containerId).appendChild(this.etatDiv);
        
        this.tapes = [new Tape(idDiv, w)];

        for (var i = 0; i < nb_tapes - 1; i ++) {
            this.tapes.push(new Tape(idDiv));
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
        this.etatDiv.innerHTML = this.etat_courant
    }

    reset(q0, w){
        document.getElementById(this.containerId).innerHTML = '';
        let nb_tapes = this.tapes.length
        this.etat_courant = q0;

        this.etatDiv = document.createElement("div")
        this.etatDiv.classList.add("tm-state")
        this.etatDiv.innerHTML = this.etat_courant
        document.getElementById(this.containerId).appendChild(this.etatDiv);

        this.tapes = [new Tape(this.containerId, w)];
        for (var i = 0; i < nb_tapes - 1; i ++) {
            this.tapes.push(new Tape(this.containerId));
        }
        
    }

    resize(){
        for (const t of this.tapes){
            t.resize()
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

    get states() {
        var states = new Set();
        states.add(this.init)
        states.add(this.finalState)

        for (const ts of this.transitions.values()){
            for (const tt of ts.values()){
                for (const t of tt){ 
                    states.add(tt.etat_read);
                    states.add(tt.etat_write);
                }
            }
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
}

function uncomment(ln){
    var m = ln.match(/(.*)\/\/.*/);
    if (m){
        return (m[1].trim())
    }else{
        return (ln.trim())
    }
}

function getTuringMachine(inputStr){
    var raw_lines = inputStr.split('\n');
    var lines = raw_lines.map(uncomment), cleanLines = [];
    let nb = lines.length;
    for (var i = 0; i < nb; i++){
        if (lines[i] != ''){
            cleanLines.push([i, lines[i]])
        }
    }
    nb = cleanLines.length
    var header = true,
        init='',
        accept='',
        output = 0,
        name = "",
        trans = [],
        nb_tapes = 0;
    var edges = new Array(),
        etats = new Set();
    var src_trans = [];
    
    
    for (var m, tr, trans_raw, srd_line, srd = '', i = 0; i < nb; i++){
        if(header){
            m = cleanLines[i][1].match(/^([^:]*):(.*)/)
            if(m){
                if (m[1].trim() == 'init'){
                    init = m[2].trim()
                    etats.add(init)
                }else if(m[1].trim() == 'accept'){
                    accept = m[2].trim()
                    etats.add(accept)
                }else if(m[1].trim() == 'output'){
                    output = parseInt(m[2].trim())
                }else if(m[1].trim() == 'name'){
                    name = m[2].trim()
                }
            }else{
                if (init == '' || accept == ''){
                    throw new CompileException(`En-tête incomplet : il faut au moins une valeur pour 'init' et 'accept'.`, 1, i)
                }
                    
                header = false
                srd = cleanLines[i][1]
                srd_line = cleanLines[i][0]
            }
        }else{
            if(srd == ''){
                srd = cleanLines[i][1]
                srd_line = cleanLines[i][0]
            }else{
                trans_raw = {
                    id: `e_${srd_line}`,
                    line_start: srd_line+1,
                    line_end: cleanLines[i][0]+1,
                    text: raw_lines.slice(srd_line, cleanLines[i][0]+1).join('\n'),
                    textHtml: raw_lines.slice(srd_line, cleanLines[i][0]+1).join('<br/>')
                    
                }
                try {
                    tr = getTransition(trans_raw.id, srd, cleanLines[i][1])
                } catch (err){
                    if (err.name === "TuringException"){
                        throw new CompileException(
                            `${err.message}<br/>
---<br/>
lignes ${trans_raw.line_start}-${trans_raw.line_end}:<br/>
${trans_raw.textHtml}`,
                            trans_raw.line_start,
                            trans_raw.line_end
                        )
                    }
                }
                
                edges.push(getEdge(trans_raw, srd, cleanLines[i][1]))
                etats.add(tr.etat_read, tr.etat_write)
                src_trans.push(trans_raw)
                if (nb_tapes == 0){
                    nb_tapes = tr.symbols_read.length
                }else if (nb_tapes != tr.symbols_read.length){
                    throw new TuringException(
                        `Nombre de rubans incohérent : on en attend ${nb_tapes}, mais cette transition en utilise ${tr.symbols_read.length}.<br/>
---<br/>
lignes ${trans_raw.line_start}-${trans_raw.line_end}:<br/>
${trans_raw.textHtml}`,
                        trans_raw.line_start,
                        trans_raw.line_end
                    )
                }
                trans.push(tr)
                srd = ''                
            }
        }
    }
    var nodes = new Array()
    for (let q of etats){
        nodes.push({id: `q_${q}`, label:q})
    }
    nodes.push({id: "initial", shape:"dot", size:1}, {id: "final", shape:"dot", size:1})
    edges.push({id: "e_init", from: "initial", to: `q_${init}`, arrows: "to"},
               {id: "e_final", from: `q_${accept}`, to: "final", arrows: "to"})
    if(! (output > 0 && output <= nb_tapes) ){
        output = 0
    }
    return {
        machine : new TuringMachine(nb_tapes, init, accept, trans, output, name),
        graph: {
            nodes: nodes,
            edges: edges
        },
        src_trans: src_trans
    }
}

function is_available(tr, cnf){
    if( (!tr.constructor === Transition)|| !cnf.constructor === Config ){
        throw new TuringException (`is_available: bad arguments ${tr} ${cnf}`)
    }
    if (tr.etat_read === cnf.etat){
        var nb = tr.symbols_read.length
        var curr = cnf.currentSymbs
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

function execute(tr, cnf){
    if( (!tr.constructor === Transition)|| !cnf.constructor === Config ){
        throw new TuringException (`execute: bad arguments ${tr} ${cnf}`)
    }
    cnf.etat = tr.etat_write;
    for (var i=0; i < cnf.tapes.length; i++) {
        cnf.tapes[i].currentSymb = tr.writes[i][0];
        cnf.tapes[i].move(tr.writes[i][1]);
    }
}

function isDir(direction){
    return (direction == '>' || direction == '<' || direction == '-')
}

function isSymb(symb){
    return (symb.length == 1)
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

function cancel(tr, cnf){
    if( (!tr.constructor === Transition)|| !cnf.constructor === Config ){
        throw new TuringException (`execute: bad arguments ${tr} ${cnf}`)
    }
    cnf.etat = tr.etat_read;
    for (var i=0; i < cnf.tapes.length; i++) {
        cnf.tapes[i].move(invDir(tr.writes[i][1]));
        cnf.tapes[i].currentSymb = tr.symbols_read[i];
    }
}

class TuringEnv {
    constructor(tm, w, idDiv) {
        this.machine = tm;
        this.current = new Config(tm.init, w, tm.nb_tapes, idDiv);
        this.nb_steps = 0;
        this.accepted = tm.init === tm.finalState;
        this.timed_out = false;
        this.history = new Array ()
    }

    get available_transitions () {
        const q = this.current.etat
        if (this.machine.transitions.has(q)){
            const m = this.machine.transitions.get(q)
            const r = this.current.currentSymbs
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
            execute(t, this.current);
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

            if (is_available(t, this.current)) {
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
            cancel(tr, this.current);
            this.nb_steps --;
            this.upd_accepted();
            return true;
        }
    }

    upd_accepted() {
        this.accepted = this.current.etat === this.machine.finalState;
    }

    accepts() {
        return this.accepted & !this.timed_out;
    }

    reset(w){
        this.history = new Array();
        this.nb_steps = 0;
        this.accepted = tm.init === tm.finalState;
        this.timed_out = false;
        this.current.reset(this.machine.init, w);
    }
}
