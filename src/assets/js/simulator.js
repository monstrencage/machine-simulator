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
    #slider
    #speedtxt
    
    constructor(elt, properElt = false, speed = 1000){
        this.#delay = speed
        
        var outer 
        if(properElt){
            outer = elt
        }else{
            outer = document.getElementById(elt)
        }
        
        outer.className = "speedo"

        let out = document.createElement("div")
        outer.appendChild(out)
        out.className = "elt"
        let ico = document.createElement("i")
        out.appendChild(ico)
        ico.className = "fas fa-tachometer-alt"
        out.innerHTML += " vitesse :"
        this.#speedtxt = document.createElement("div")
        out.appendChild(this.#speedtxt)
        this.#speedtxt.className = "speedtxt"

        this.#slider = document.createElement("input")
        outer.appendChild(this.#slider)
        
        this.#slider.className = "speedo"
        this.#slider.setAttribute("type","range")
        this.#slider.setAttribute("list","speeds")
        this.#slider.setAttribute("min","0")
        this.#slider.setAttribute("max",`${speeds.length - 1}`)
        this.#slider.setAttribute("value","2")


        let speedDataList = document.createElement("datalist")
        speedDataList.id = "speeds"
        outer.appendChild(speedDataList)
        let i = 0
        for (const s of speeds){
            let opt = document.createElement("option")
            speedDataList.appendChild(opt)
            
            opt.setAttribute("value", `${i}`)
            opt.setAttribute("label", `${s[0]}`)
            i += 1
        }

        this.#slider.onchange = this.update.bind(this)

        this.update()
    }

    update (){
        let value = Math.trunc(this.#slider.value)
        if (0 <= value && value < speeds.length){
            this.#delay = speeds[value][1]
            this.#speedtxt.innerHTML = speeds[value][0]
        }
    }

    get delay(){
        return this.#delay
    }

    increment(){
        let lvl = Math.trunc(this.#slider.value)
        if (lvl < speeds.length - 1){
            this.#slider.value = lvl + 1
            this.update()
        }
    }

    decrement(){
        let lvl = Math.trunc(this.#slider.value)
        if (lvl > 0){
            this.#slider.value = lvl - 1
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
    #lockedView = true
    #button

    constructor(displayElt, nb, button){
        this.#display = displayElt
        let table = document.createElement("table")
        this.#display.appendChild(table)
        this.#body = document.createElement("tbody")
        table.appendChild(this.#body)
        this.#body.className = "simulator-frame"

        this.#tapeElts = new Array(nb)
        
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

        for (var row, cell, i = 0; i < nb; i++){
            this.#tapeElts[i] = this.addRow(i)
        }
            
        this.button = button
    }

    addRow(i){
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
        this.#body.appendChild(row)
        cell = document.createElement("td")
        // cell.id = `past-${i}`
        cell.className = "tape past-tape"
        row.appendChild(cell)
        tapeRef.past = cell
        
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
        this.#tapeElts = new Array(nb)
        for (var row, cell, i = 0; i < nb; i++){
            this.#tapeElts[i] = this.addRow(i)
        }
    }

    set button(button){
        this.#button = button
        this.#button.title = "Débloquer les rubans"
        this.#button.icoClass = "fas fa-lock"
        this.#button.onclick = this.toggleLock.bind(this)
    }

    toggleLock(){
        this.#lockedView = ! this.#lockedView
        this.updateView()
    }

    updateView(){
        if(this.#lockedView){
            this.#button.icoClass = "fas fa-lock"
            this.#button.title = "Débloquer les rubans"
            this.focus()
        }else{
          this.#button.icoClass = "fas fa-lock-open"
          this.#button.title = "Centrer automatiquement les rubans"
        }
    }
    
    focus (){
        if (this.#lockedView){
            var bodyRect = this.#display.getBoundingClientRect(),
                elemRect = this.#stateElt.getBoundingClientRect(),
                offset = elemRect.left - bodyRect.left;
            bodyRect.scrollLeft = offset
      }
    }
    
    update(myenv){
        let etat = myenv.etat,
            tapes = myenv.tapes
        
        this.#stateElt.innerHTML = etat
        var content =  tapes.map(function (t) {return t.content})

        for (var i = 0; i < this.#tapeElts.length; i++){
            this.#tapeElts[i].past.innerHTML =
                formatTape(content[i].past)
            this.#tapeElts[i].current.innerHTML =
                formatSymb(content[i].present)
            this.#tapeElts[i].future.innerHTML =
                formatTape(content[i].future)
        }
        this.focus()
    }

}


class PopUp{
#outer
#title
#content
#status
    
    constructor(elt){
        this.#outer = elt

        let div = document.createElement("div")
        div.className = "pop-up-outer"
        this.#outer.appendChild(div)

        let popup = document.createElement("div")
        popup.className = "pop-up"
        this.#outer.appendChild(popup)
        
        this.#title = document.createElement("h2")
        popup.appendChild(this.#title)

        let button = document.createElement("button")
        popup.appendChild(button)
        button.className = "close"
        button.title = "Fermer"

        let ico = document.createElement("i")
        ico.className = "fas fa-times"
        button.appendChild(ico)

        this.#content = document.createElement("div")
        popup.appendChild(this.#content)

        button.onclick = this.close.bind(this)
        
    }

    close (){
        this.#outer.classList.add("hidden")
    }

    activate(title, statusCls, msg){
        this.#outer.classList.remove("hidden")

        this.#title.innerHTML = ""
        let status = document.createElement("i")
        status.className = statusCls
        this.#title.appendChild(status)
        this.#title.innerHTML += title
        this.#content.innerHTML = msg
    }

    get hidden(){
        return this.#outer.classList.contains("hidden")
    }
}


class Simulator{
#myenv = null
#inputword = null
    
#envClass
    
#mainDisplay
#popup
#graph
#steps
#mytape
#tmName
#speedo
#status
#inputElts
    
#run = false
#keeprunning = false
#finished = false
#forwards = true
#ndet = false
    
    constructor(mainDisplay,
                inputElts,
                graphClass,
                tmName,
                tapeClass,
                envClass){

        this.#envClass = envClass
        
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

        this.#status = document.createElement("i")
        statusDiv.appendChild(this.#status)
        this.#status.className = "fas fa-pause-circle"
        
        
        let ctrl = document.createElement("div")
        ctrl.className = "control-panel"
        topPanel.appendChild(ctrl)
        
        let btnPanel = document.createElement("div")
        ctrl.appendChild(btnPanel)
        btnPanel.className = "elt button-panel"
        let runbackBtn = new SimButton(btnPanel, "Rembobiner",
                                       "fas fa-fast-backward", true)
        runbackBtn.onclick = this.runback.bind(this)
        let backBtn = new SimButton(btnPanel, "Étape précédente",
                                    "fas fa-step-backward", true)
        backBtn.onclick = this.back.bind(this)
        let stepBtn = new SimButton(btnPanel, "Étape suivante",
                                    "fas fa-step-forward", true)
        stepBtn.onclick = this.step.bind(this)
        let runBtn = new SimButton(btnPanel, "Exécuter",
                                   "fas fa-fast-forward", true)
        runBtn.onclick = this.run.bind(this)
        let stopBtn = new SimButton(btnPanel, "Arrêter l'exécution",
                                    "fas fa-stop", true)
        stopBtn.onclick = this.stop.bind(this)
        
        let lockBtn = new SimButton(btnPanel, "Débloquer les rubans",
                                    "fas fa-lock", true)

        let speedDiv = document.createElement("div")
        speedDiv.className = "elt speedo-elt"
        ctrl.appendChild(speedDiv)
        
        this.#speedo = new Speedo(speedDiv,true)

        let tapeDiv = document.createElement("div")
        tapeDiv.className = "table-tape section"
        this.#mainDisplay.appendChild(tapeDiv)
        this.#mytape = new tapeClass(tapeDiv, 1, lockBtn)

        let graphDiv = document.createElement("div")
        graphDiv.className = "graph-visualizer section"
        this.#mainDisplay.appendChild(graphDiv)

        this.#graph = new graphClass(graphDiv)
        
        let popupDiv = document.createElement("div")
        popupDiv.className = "hidden"
        this.#mainDisplay.appendChild(popupDiv)
        
        this.#popup = new PopUp(popupDiv)

        this.#inputElts = inputElts
        this.#inputElts.inputField.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                this.load()
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
                if (! elt.classList.contains("input-field")){
                    if (event.key === 'Enter') {
                        if (this.active.bind(this)){
                            this.toggleRun.bind(this)()
                        }else{
                            this.closeNotif().bind(this)
                        }
                    } else if (event.key === '+') {
                        this.speedUp().bind(this)
                    } else if (event.key === '-') {
                        this.slowDown().bind(this)
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
            this.#popup.activate("Entrée incorrecte :","fas fa-times-circle","Le mot d'entrée ne peut pas contenir d'espaces. Utilisez '_' si vous souhaitez insérer des cases vides dans le mot d'entrée.")
        }
    }
    
    set machine(mytm){
        this.#graph.upd(mytm)
        this.#myenv = new this.#envClass(mytm, '')
        this.#mytape.reset(this.#myenv)
        if (mytm.name != ""){
            this.#tmName.innerHTML = ` : ${mytm.name}`
        }else{
            this.#tmName.getElementById("tm-name").innerHTML = ""
        }
    }

    set ndet(nd){
        this.#ndet = nd
        if (nd){
            console.log("non deterministic machine")
        } else {
            console.log("deterministic machine")
        }
    }

    set inputword(str){
        this.stop()
        this.#inputword = str
        this.#myenv.reset(this.#inputword)
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
            this.#forwards = false
            this.#keeprunning = true
            this.update_status()
            this.do_step()
        }
    }
    
    stop(){
        this.#run = false
        this.#keeprunning = false
    }

    get active(){
        return this.#popup.hidden
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
        if (this.#finished && this.#myenv.accepted){
            eid = 'e_final'
        } else if (this.#myenv.history.length > 0){
            eid = this.#myenv.history[this.#myenv.history.length - 1].trans.id
        }else{
            eid = 'e_init'
        }
        this.#graph.highlight(nid, eid)
    }

    update_status(){
        this.highlight_current()
        this.#status.classList.remove('fa-check-circle')
        this.#status.classList.remove('fa-times-circle')
        this.#status.classList.remove('fa-pause-circle')
        this.#status.classList.remove('fa-spin')
        this.#status.classList.remove('fa-cog')
        if (this.#run || this.#keeprunning){
            this.#status.classList.add('fa-spin')
            this.#status.classList.add('fa-cog')
        } else if (this.#finished){
            if (this.#myenv.accepted){
                this.#status.classList.add('fa-check-circle')
            } else { 
                this.#status.classList.add('fa-times-circle')
            }
        } else {
            this.#status.classList.add('fa-pause-circle')
        }
    }

    do_step(){
        // alert(this.#speedo.delay)
        var success
        if (!this.#run){
            this.#run = true
            if (this.#forwards){
                success = this.#myenv.step()
            } else {
                success = this.#myenv.back()
            }
            this.#run = false
            this.#keeprunning = this.#keeprunning && success
            this.#mytape.update(this.#myenv)
            this.#steps.innerHTML = this.#myenv.nb_steps
            if (this.#keeprunning) {
                this.highlight_current()
                setTimeout(this.do_step.bind(this), this.#speedo.delay)
            } else{
                this.#finished = this.#forwards && !success
                this.update_status()
                if(this.#finished){
                    this.notifyResult()
                }
            }
        }
    }
    
    notifyResult(){
        this.#popup.activate("Exécution terminée :", this.#status.className,
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
}

