class SimButton {
    #button
    #ico
    
    constructor (button, title, icoClass, create = false){
        if (create){
            this.#button = document.createElement("button")
            button.appendChild(this.#button)
        } else {
            this.#button = button
         }

        this.#button.className = 'btn btn--primary'

        let ico = document.createElement("i")
        this.#button.appendChild(ico)

        this.#ico = ico
        this.icoClass = icoClass
        this.title = title
    }

    disable(){
        this.#button.disabled = true
        this.#button.className = 'btn btn--inverse'
    }

    enable(){
        this.#button.disabled = false
        this.#button.className = 'btn btn--primary'
    }

    hide(){
        this.disable()
        this.#button.classList.add('hidden')
    }

    show(){
        this.enable()
        this.#button.classList.remove('hidden')
    }
    
    set title(txt){
        this.#button.title = txt
    }

    set icoClass(cls){
        this.#ico.className = cls
    }

    set onclick(fun){
        this.#button.onclick = fun
    }

    get style(){
        return this.#button.style
    }
}



const speeds = [["très lente", 2000],
                ["tranquille", 1000],
                ["confortable", 750],
                ["rapide", 500],
                ["véloce", 100],
                ["youhouhou!", 0]]


class Speedo{
    #delay
    #speedSelect
    
    constructor(elt, properElt = false, speed = 1000){
        this.#delay = speed
        
        var outer 
        if(properElt){
            outer = elt
        }else{
            outer = document.getElementById(elt)
        }
        
        outer.className = "speedo"

        let out = document.createElement("label")
        outer.appendChild(out)
        out.className = "elt"
        let ico = document.createElement("i")
        out.appendChild(ico)
        ico.className = "fas fa-tachometer-alt"
        out.innerHTML += "vitesse"

        out.setAttribute("for","speed-select")

        this.#speedSelect = document.createElement("select")
        outer.appendChild(this.#speedSelect)
        
        this.#speedSelect.id = "speed-select"
        
        let i = 0
        for (const s of speeds){
            let opt = document.createElement("option")
            this.#speedSelect.appendChild(opt)
            
            opt.setAttribute("value", `${i}`)
            opt.setAttribute("label", `${s[0]}`)
            i += 1
        }

        this.#speedSelect.onchange = this.update.bind(this)
        this.#speedSelect.value = 2
        
        this.update()
    }

    update (){
        let value = Math.trunc(this.#speedSelect.value)
        if (0 <= value && value < speeds.length){
            this.#delay = speeds[value][1]
        }
    }

    get delay(){
        return this.#delay
    }

    increment(){
        let lvl = Math.trunc(this.#speedSelect.value)
        if (lvl < speeds.length - 1){
            this.#speedSelect.value = lvl + 1
            this.update()
        }
    }

    decrement(){
        let lvl = Math.trunc(this.#speedSelect.value)
        if (lvl > 0){
            this.#speedSelect.value = lvl - 1
            this.update()
        }
    }
}


function makespaces(s){
    return s.replaceAll(' ','<span class="emptysymb">#</span>')
}

function formatTape(str){
    res = ""
    for (const s of str){
        res += formatSymb(s)
    }
    return res
}
function formatSymb(s){
    switch(s){
    case ' ':
        return '<span class="emptysymb">#</span>'
        break;
    case '<':
        return '<span>&lt</span>'
        break;
    case '>':
        return '<span>&gt</span>'
        break;
    default:
        return `<span>${s}</span>`
        break;
    }
}


class TapeVis{
    #display
    #body
    #stateElt
    #tapeElts

    constructor(displayElt, tapes){
        this.#display = displayElt
        let table = document.createElement("table")
        this.#display.appendChild(table)
        this.#body = document.createElement("tbody")
        table.appendChild(this.#body)
        this.#body.className = "simulator-frame"

        this.#tapeElts = new Array()
        
        let rowHead = document.createElement("tr")
        rowHead.className = "head-row"
        this.#body.appendChild(rowHead)

        rowHead.appendChild(document.createElement("td"))

        let cellHead = document.createElement("td")
        rowHead.appendChild(cellHead)

        this.#stateElt = document.createElement("div")
        cellHead.appendChild(this.#stateElt)
        this.#stateElt.className = "state"

        let divPointer = document.createElement("div")
        cellHead.appendChild(divPointer)
        divPointer.className = "pointer"

        rowHead.appendChild(document.createElement("td"))

        for (var row, cell, i = 0; i < tapes.length; i++){
            this.#tapeElts.push(this.addRow(i,tapes[i]))
        }
    }

    addRow(i, biInf=true){
        var row, cell
        if(i > 0){
            row = document.createElement("tr")
            row.className = "filler"
            this.#body.appendChild(row)
        }
        let tapeRef = new Object()
        row = document.createElement("tr")
        // row.id = `tape-${i}`
        row.className = "tape"
        if (! biInf) row.classList.add("half")

        this.#body.appendChild(row)
        cell = document.createElement("td")
        cell.className = "tape past-tape"
        row.appendChild(cell)
       
        // cell.id = `past-${i}`
        if (! biInf){
            cell.classList.add("half");
            let fill = document.createElement("span")
            fill.className = "filler"
            cell.appendChild(fill)
            let past = document.createElement("span")
            past.className = "content"
            cell.appendChild(past)
            tapeRef.past = past
        } else tapeRef.past = cell;
        
        cell = document.createElement("td")
        // cell.id = `current-${i}`
        cell.className = "tape current-tape"
        row.appendChild(cell)
        tapeRef.current = cell
        
        cell = document.createElement("td")
        // cell.id = `future-${i}`
        cell.className = "tape future-tape"
        row.appendChild(cell)
        tapeRef.future = cell
        
        return tapeRef
    }


    reset(myenv){
        let nb = myenv.machine.nb_tapes
        for (const t of this.#body.querySelectorAll("tr.tape, tr.filler"))
            t.remove()
        this.#tapeElts = new Array()
        for (var row, cell, i = 0; i < nb; i++){
            this.#tapeElts.push(this.addRow(i,myenv.machine.tapes[i]))
        }
    }
    
    update(myenv){
        let etat = myenv.etat,
            tapes = myenv.tapes
        
        this.#stateElt.innerHTML = etat

        for (var i = 0; i < this.#tapeElts.length; i++){
            if ((! myenv.machine.tapes[i]) && tapes[i].past.empty){
                    this.#tapeElts[i].past.innerHTML = ""
                    this.#tapeElts[i].past.classList.add("hidden")
            } else {
                this.#tapeElts[i].past.classList.remove("hidden")
                this.#tapeElts[i].past.innerHTML =
                    formatTape(tapes[i].content.past)
            }
            this.#tapeElts[i].current.innerHTML =
                formatSymb(tapes[i].content.present)
            this.#tapeElts[i].future.innerHTML =
                formatTape(tapes[i].content.future)
        }
    }

}


class PopUp{
#outer
#title
#status
    constructor(elt, closable=true){
        this.#outer = elt

        let div = document.createElement("div")
        div.className = "pop-up-outer"
        this.#outer.appendChild(div)

        let popup = document.createElement("div")
        popup.className = "pop-up"
        this.#outer.appendChild(popup)
        
        let title = document.createElement("h2")
        popup.appendChild(title)

        this.#status = document.createElement("i")
        title.appendChild(this.#status)

        this.#title = document.createElement("div")
        title.appendChild(this.#title)

        if(closable){
            let button = document.createElement("button")
            popup.appendChild(button)
            button.className = "close"
            button.title = "Fermer"
            
            let ico = document.createElement("i")
            ico.className = "fas fa-times"
            button.appendChild(ico)

            button.onclick = this.close.bind(this)
        }
       
        this.content = document.createElement("div")
        popup.appendChild(this.content)

         
    }
    set title(txt){
        this.#title.innerHTML = txt
    }
    set status(cls){
        this.#status.className = cls
    }
    
    open() {
        this.#outer.classList.remove("hidden")
        // this.#outer.scrollIntoView()
    }

    close (){
        this.#outer.classList.add("hidden")
    }

    activate(title, statusCls, msg){
        this.open()
        this.title = title
        this.status = statusCls

        this.content.innerHTML = msg
    }

    get hidden(){
        return this.#outer.classList.contains("hidden")
    }
}

class navClass extends PopUp{
#options
#transtbl
#callback
#tried = []
#innerTitle
    
    constructor(elt, callback){
        super(elt, false)
        
        this.#callback = callback
        
        // let form = document.createElement("form")
        // this.content.appendChild(form)
        // let fields = document.createElement("fieldset")
        // form.appendChild(fields)

        this.#innerTitle = document.createElement("legend")
        this.content.appendChild(this.#innerTitle)

        this.#options = document.createElement("div")
        this.#options.className = "options"
        this.content.appendChild(this.#options)
        let submit = document.createElement("div")
        this.content.appendChild(submit)

        let btn = document.createElement("button")
        btn.className = "btn btn--primary"
        submit.appendChild(btn)

        let ico = document.createElement("i")
        ico.className = "fas fa-arrow-right"
        btn.appendChild(ico)

        btn.onclick = (event) => { this.submit() }
    }

    get choice(){
        for (const opt of this.#transtbl){
            // alert(`${opt.tr.id} (${opt.tr.toString()}) : ${document.getElementById(opt.elt).checked}`)
            if (document.getElementById(opt.elt).checked){
                return opt
            }
        }
    }
    submit(){
        let opt = this.choice
        if (opt){
            this.close()
            this.#callback(opt.tr, this.#tried)
        }
    }

    set msg (m){
        this.#innerTitle.innerHTML = m
    }

    close (){
        this.#transtbl = new Array()
        this.#options.innerHTML = ""
        super.close()
    }

    update(){
        if (this.#tried.length > 0){
            this.title = "Backtracking"
            this.status = "fas fa-undo"
            this.msg = "L'exécution est bloquée : on retourne au plus récent choix non-déterministe, et on essaie une autre exécution."
        } else {
            this.title = "Choix non-déterministe"
            this.msg = "Les transitions suivantes sont disponibles :"
            this.status = "fas fa-question-circle"
       
        }
    }
    
    chooseTransition(available){
        this.open()
        this.#transtbl = new Array()

        let trList = available.av
        this.#tried = available.tried
        this.update()
        var prev, first
        let i = 0
        for(const tr of trList){
            let radioElt = document.createElement("input")
            radioElt.type = "radio"
            radioElt.setAttribute("value",i)
            radioElt.setAttribute("name","transition")
            radioElt.id = `transition_${i}`
            this.#options.appendChild(radioElt)
            if (i == 0){
                radioElt.setAttribute("checked",true)
                first = {
                    tr : tr,
                    elt : radioElt.id
                }
                prev = first
            } else {
                prev.next = radioElt.id
                this.#transtbl.push(prev)
                
                prev = {
                    tr : tr,
                    elt : radioElt.id,
                    prev : prev.elt
                }
            }
           
            let lblElt = document.createElement("label")
            lblElt.setAttribute("for", `transition_${i}`)
            lblElt.innerHTML = tr.toString()
            this.#options.appendChild(lblElt)
            this.#options.innerHTML += "<br/>"
            i += 1
        }
        first.prev = prev.elt
        prev.next = first.elt
        this.#transtbl.push(prev)
    }

    nextChoice(){
        let oldOpt = this.choice
        let newOpt = oldOpt.next
        document.getElementById(oldOpt.elt).setAttribute("checked","false")
        document.getElementById(newOpt).setAttribute("checked","true")        
    }
    prevChoice(){
        let oldOpt = this.choice
        let newOpt = oldOpt.prev
        document.getElementById(oldOpt.elt).setAttribute("checked","false")
        document.getElementById(newOpt).setAttribute("checked","true")        
    }
}

class InputPopup extends PopUp{

#inputElt
    
    constructor(elt, callback, w=""){
        super(elt, true)
        
        this.title = "Spécifier le mot d'entrée"
        this.status = "fas fa-question-circle"
        
        let inputFrame = document.createElement("div")
        inputFrame.className = "input-popup"
        this.content.appendChild(inputFrame)

        this.#inputElt = document.createElement("input")
        this.#inputElt.className = "input-field"
        this.#inputElt.type = "text"
        this.#inputElt.value = w
        
        inputFrame.appendChild(this.#inputElt)
        
        let btn = document.createElement("button")
        btn.className = "btn btn--primary"
        inputFrame.appendChild(btn)

        let ico = document.createElement("i")
        ico.className = "fa fa-arrow-right"
        btn.appendChild(ico)

        btn.onclick = (event) => {
            this.close();
            callback(this.#inputElt.value)
        }

        document.addEventListener('keydown', event => {
            if (! this.hidden){
                if (event.key === 'Enter') {
                    event.preventDefault()
                    event.stopPropagation() 
                    event.stopImmediatePropagation() 
                    this.close();
                    callback(this.#inputElt.value)
                } else if (event.key === 'Escape') {
                    event.preventDefault()
                    event.stopPropagation() 
                    event.stopImmediatePropagation() 
                    this.close();
                }
            }
        })

    }

    open(w){
        this.#inputElt.value = w
        super.open()
        this.#inputElt.focus()
    }
    
}

class Simulator{
#myenv = null
#inputword = null
    
#envClass
    
#mainDisplay
#popup
#inPopup
#graph
#steps
#mytape
#tmName
#speedo
#statusIco
#dirIco
#inputElts
#navElt
    
#sizeBtn
#runFBtn
#runBBtn
    
#run = false
#keeprunning = false
#finished = false
#forwards = true
#ndet = false
#finalTransitions = true
    
    constructor(mainDisplay,
                inputElts,
                graphClass,
                tmName,
                tapeClass,
                envClass){

        this.#envClass = envClass
        this.#finalTransitions = graphClass.finalTransitions
        this.#mainDisplay = document.getElementById(mainDisplay)
        this.#tmName = document.getElementById(tmName)


        let topPanel = document.createElement("div")
        topPanel.className = "top-panel"
        this.#mainDisplay.appendChild(topPanel)

        let statusPanel = document.createElement("div")
        statusPanel.className = "status-panel"
        topPanel.appendChild(statusPanel)

        let div = document.createElement("div")
        statusPanel.appendChild(div)
        div.innerHTML = "# d'étapes : "

        this.#steps = document.createElement("span")
        div.appendChild(this.#steps)
        
        let space = document.createElement("span")
        space.className = "space"
        div.appendChild(space)

        let statusDiv = document.createElement("div")
        div.appendChild(statusDiv)

        this.#statusIco = document.createElement("i")
        statusDiv.appendChild(this.#statusIco)
        this.#statusIco.className = "fas fa-pause"

        let dirDiv = document.createElement("div")
        div.appendChild(dirDiv)

        this.#dirIco = document.createElement("i")
        dirDiv.appendChild(this.#dirIco)
        this.#dirIco.className = "fas fa-forward"

        
        let ctrl = document.createElement("div")
        ctrl.className = "control-panel"
        topPanel.appendChild(ctrl)
        
        let btnPanel = document.createElement("div")
        ctrl.appendChild(btnPanel)
        btnPanel.className = "elt button-panel"
        this.#runBBtn = new SimButton(btnPanel, "Rembobiner",
                                      "fas fa-fast-backward", true)
        this.#runBBtn.onclick = this.runback.bind(this)
        let backBtn = new SimButton(btnPanel, "Étape précédente",
                                    "fas fa-step-backward", true)
        backBtn.onclick = this.back.bind(this)
        let stepBtn = new SimButton(btnPanel, "Étape suivante",
                                    "fas fa-step-forward", true)
        stepBtn.onclick = this.step.bind(this)
        this.#runFBtn = new SimButton(btnPanel, "Exécuter",
                                   "fas fa-fast-forward", true)
        this.#runFBtn.onclick = this.run.bind(this)
        let stopBtn = new SimButton(btnPanel, "Arrêter l'exécution",
                                    "fas fa-stop", true)
        stopBtn.onclick = this.stop.bind(this)
        
        let inputBtn = new SimButton(btnPanel, "Réinitialisation",
                                    "fas fa-undo", true)
        
        // let lockBtn = new SimButton(btnPanel, "Débloquer les rubans",
        //                             "fas fa-lock", true)
        let sizeBtn = new SimButton(btnPanel, "Maximiser le simulateur",
                                    "fas fa-expand-arrows-alt", true)
        this.#sizeBtn = sizeBtn
        sizeBtn.onclick = this.resize.bind(this)

        let speedDiv = document.createElement("div")
        speedDiv.className = "elt speedo-elt"
        ctrl.appendChild(speedDiv)
        
        this.#speedo = new Speedo(speedDiv,true)

        let navDiv = document.createElement("div")
        navDiv.className = "ndet-nav section hidden"
        this.#mainDisplay.appendChild(navDiv)
        this.#navElt = new navClass(navDiv, this.perform.bind(this))
        
        let tapeDiv = document.createElement("div")
        tapeDiv.className = "table-tape section"
        this.#mainDisplay.appendChild(tapeDiv)
        this.#mytape = new tapeClass(tapeDiv, [true])
        
        let graphDiv = document.createElement("div")
        graphDiv.className = "graph-visualizer section"
        this.#mainDisplay.appendChild(graphDiv)

        this.#graph = new graphClass(graphDiv)
        
        let popupDiv = document.createElement("div")
        popupDiv.className = "hidden"
        this.#mainDisplay.appendChild(popupDiv)
        this.#popup = new PopUp(popupDiv)
        
        let inPopupDiv = document.createElement("div")
        inPopupDiv.className = "hidden"
        this.#mainDisplay.appendChild(inPopupDiv)
        
        this.#inPopup = new InputPopup(inPopupDiv, this.loadWord.bind(this))
        inputBtn.onclick = (event) => {
            this.#inPopup.open(this.#inputword)
        }
 
        this.#inputElts = inputElts
        this.#inputElts.inputField.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault()
                event.stopPropagation() 
                this.load()
                this.focus()
            }
        })
        this.#inputElts.inputBtn.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                this.load()
                this.focus()
            }
        })
        this.#inputElts.inputBtn.addEventListener('click', event => {
            this.load()
            this.focus()
        })
        
        document.addEventListener(
            'keydown', event => {
                let elt = document.activeElement
                if ( this.#inPopup.hidden &&
                     ! elt.classList.contains("input-field")){
                    if (event.key === 'Enter') {
                        event.preventDefault()
                        if (!this.#navElt.hidden){
                            this.#navElt.submit()
                        }
                        else if (this.active){
                            this.toggleRun()
                        }else{
                            this.closeNotif()
                        }
                    } else if (event.key === ' '){
                        event.preventDefault()
                        if (this.active && (!this.#keeprunning)){
                            if (this.#forwards) this.step()
                            else this.back()
                        }
                    } else if (event.key === '+') {
                        event.preventDefault()
                        this.speedUp()
                    } else if (event.key === '-') {
                        event.preventDefault()
                        this.slowDown()
                    } else if ((!this.#navElt.hidden)
                               && (event.key === 'ArrowDown'
                                   || event.key === 'ArrowRight')) {
                        event.preventDefault()
                        this.#navElt.nextChoice()
                    } else if ((!this.#navElt.hidden)
                               && (event.key === 'ArrowUp'
                                   || event.key === 'ArrowLeft')) {
                        event.preventDefault()
                        this.#navElt.prevChoice()
                    } else if (this.#navElt.hidden
                               && this.#forwards
                               && event.key === 'ArrowRight') {
                        event.preventDefault()
                        this.run()
                    } else if (this.#navElt.hidden
                               && this.#forwards
                               && this.#keeprunning
                               && event.key === 'ArrowLeft') {
                        event.preventDefault()
                        this.stop()
                    } else if (this.#navElt.hidden
                               && this.#forwards
                               && (!this.#keeprunning)
                               && event.key === 'ArrowLeft') {
                        event.preventDefault()
                        this.#forwards = false
                        this.update_status()
                    } else if (this.#navElt.hidden
                               && (!this.#forwards)
                               && this.#keeprunning
                               && event.key === 'ArrowRight') {
                        event.preventDefault()
                        this.stop()
                    } else if (this.#navElt.hidden
                               && (!this.#forwards)
                               && (!this.#keeprunning)
                               && event.key === 'ArrowRight') {
                        event.preventDefault()
                        this.#forwards = true
                        this.update_status()
                    } else if (this.#navElt.hidden
                               && (!this.#forwards)
                               && event.key === 'ArrowLeft') {
                        event.preventDefault()
                        this.runback()
                    } 
                }
            }
        )

    }

    load(){
        let w = this.#inputElts.inputField.value
        if (w.search(/\s/) < 0){
            this.inputword = w
            this.#inputElts.inputField.blur()
        }else{
            this.#popup.activate("Entrée incorrecte :",
                                 "fas fa-times-circle",
                                 "Le mot d'entrée ne peut pas contenir d'espaces. Utilisez '_' si vous souhaitez insérer des cases vides dans le mot d'entrée.")
        }
    }

    loadWord(w){
        if (w.search(/\s/) < 0){
            this.inputword = w
        }else{
            this.#popup.activate("Entrée incorrecte :",
                                 "fas fa-times-circle",
                                 "Le mot d'entrée ne peut pas contenir d'espaces. Utilisez '_' si vous souhaitez insérer des cases vides dans le mot d'entrée.")
        }
    }
    
    set machine(mytm){
        this.#graph.upd(mytm)
        this.#myenv = new this.#envClass(mytm, '')
        this.#mytape.reset(this.#myenv)
        if (mytm.name != ""){
            this.#tmName.innerHTML = ` : ${mytm.name}`
        }else{
            this.#tmName.innerHTML = ""
        }
    }

    set ndet(nd){
        this.#ndet = nd
        // if (nd){
        //     console.log("non deterministic machine")
        // } else {
        //     console.log("deterministic machine")
        // }
    }

    set inputword(str){
        this.stop()
        this.#inputElts.inputField.value = str
        this.#inputword = str
        this.#myenv.reset(this.#inputword)
        // for(const t of this.#myenv.tapes){
        //     console.log(t.repr)
        // }
        this.#finished = this.#myenv.accepted
        this.#steps.innerHTML = this.#myenv.nb_steps
        this.#mytape.update(this.#myenv)
        this.update_status()
    }

    focus(){
        this.#mainDisplay.scrollIntoView()
    }
    
    step(){
        if (!this.#keeprunning && !this.#run){
            this.#forwards = true
            this.update_status()
            this.do_step()
        }
    }

    run(){
        if (!this.#keeprunning && !this.#run){
            this.#runFBtn.disable()
            this.#forwards = true
            this.#keeprunning = true
            this.update_status()
            this.do_step()
        }
    }

    back(){
        if (!this.#keeprunning && !this.#run){
            this.#forwards = false
            this.update_status()
            this.do_step()
        }
    }

    runback(){
        if (!this.#keeprunning && !this.#run){
            this.#runBBtn.disable()
            this.#forwards = false
            this.#keeprunning = true
            this.update_status()
            this.do_step()
        }
    }
    
    stop(){
        this.#run = false
        this.#keeprunning = false
        this.#runBBtn.enable()
        this.#runFBtn.enable()
    }

    get active(){
        return (this.#popup.hidden && this.#inPopup.hidden && this.#navElt.hidden)
    }

    toggleRun(){
        if (this.#keeprunning){
            this.stop()
        }else{
            this.run()
        }
    }
    
    highlight_current(){
        var eid
        let nid = `q_${this.#myenv.etat}`
        if (this.#finished && this.#myenv.accepted && this.#finalTransitions){
            eid = `e_${this.#myenv.etat}_final`
        } else if (this.#myenv.history.length > 0){
            eid = this.#myenv.history[this.#myenv.history.length - 1].trans.id
        }else{
            eid = 'e_init'
        }
        this.#graph.highlight(nid, eid)
    }

    update_status(){
        this.#statusIco.classList.remove('fa-check')
        this.#statusIco.classList.remove('fa-times')
        this.#statusIco.classList.remove('fa-pause')
        this.#statusIco.classList.remove('fa-spin')
        this.#statusIco.classList.remove('fa-cog')
        if(this.#forwards){
            this.#dirIco.classList.remove('fa-backward')
            this.#dirIco.classList.add('fa-forward')
        } else {
            this.#dirIco.classList.remove('fa-forward')
            this.#dirIco.classList.add('fa-backward')
        }
        if (this.#run || this.#keeprunning){
            this.#statusIco.classList.add('fa-spin')
            this.#statusIco.classList.add('fa-cog')
        } else if (this.#finished){
            this.#runBBtn.enable()
            this.#runFBtn.enable()
            if (this.#myenv.accepted){
                this.#statusIco.classList.add('fa-check')
            } else { 
                this.#statusIco.classList.add('fa-times')
            }
        } else {
            this.#statusIco.classList.add('fa-pause')
        }
        this.highlight_current()
    }

    do_step(){
        // alert(this.#speedo.delay)
        var success
        if (!this.#run){
            this.#run = true
            if (this.#forwards){
                if (this.#ndet){
                    let av_tr = this.#myenv.available_transitions
                    if (av_tr.length == 0){
                        if (this.#myenv.accepts()){
                            success = false
                        } else {
                            let br = this.#myenv.backtrack()
                            if (br){
                                this.#navElt.chooseTransition(br)
                                return false
                            } else {
                                success = false
                            }
                        } 
                    } else if (av_tr.length == 1){
                        this.#myenv.do_step(av_tr[0])
                        success = true
                    } else {
                        // this.freeze()
                        this.#navElt.chooseTransition({ av : av_tr, tried : []})
                        return false
                    }
                } else {
                    success = this.#myenv.step()
                }
            } else {
                success = this.#myenv.back()
            }

            this.upd_after_step(success)
        }
    }

    perform(tr,tried){
        this.#myenv.do_step(tr, true, tried)
        this.upd_after_step(true)
    }

    upd_after_step(success){
        this.#run = false
        
        this.#finished = this.#forwards
            && (((! this.#myenv.machine.eager) && this.#myenv.accepted )
                || !success)
        
        this.#keeprunning = this.#keeprunning && success && !this.#finished
        this.#mytape.update(this.#myenv)
        this.#steps.innerHTML = this.#myenv.nb_steps
        
        if (this.#keeprunning) {
            this.highlight_current()
            setTimeout(this.do_step.bind(this), this.#speedo.delay)
        } else{
            this.update_status()
            if(this.#finished){
                this.notifyResult()
            }
        }
    }
    
    notifyResult(){
        this.#popup.activate("Exécution terminée :", this.#statusIco.className,
                             this.#myenv.outputMsg)
    }

    closeNotif(){
        this.#popup.close()
    }

    speedUp(){
        this.#speedo.increment()
    }
    slowDown(){
        this.#speedo.decrement()
    }

    resize(){
        if(this.#mainDisplay.classList.contains("fullscreen")){
            this.#mainDisplay.classList.remove("fullscreen")
            this.#sizeBtn.icoClass = "fas fa-expand-arrows-alt"
            this.#sizeBtn.title = "Maximiser le simulateur"
            document.querySelector(".masthead").classList.remove("hidden")
            let s = document.querySelector(".sidebar")
            if (s) s.classList.remove("hidden")
            document.querySelector("#footer.page__footer").classList.remove("hidden")
        } else {
            this.#mainDisplay.classList.add("fullscreen")
            this.#sizeBtn.icoClass = "fas fa-compress-arrows-alt"
            this.#sizeBtn.title = "Minimiser le simulateur"
            document.querySelector(".masthead").classList.add("hidden")
            let s = document.querySelector(".sidebar")
            if (s) s.classList.add("hidden")
            document.querySelector("#footer.page__footer").classList.add("hidden")
        }
    }
}

