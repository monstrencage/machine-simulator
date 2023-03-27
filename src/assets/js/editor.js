class EditorButton {
    #button
    #ico
    
    constructor (button, title, icoClass){
        this.#button = document.createElement("button")
        button.appendChild(this.#button)

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

const palettes = [
    {
        name   : "light mode",
        logo   : "fas fa-sun",
        css    : "light"
        // entities : [
        //     ["colon","darkgreen","red"],
        //     ["comment","peru","crimson"],
        //     ["plain-txt","#3d4144","crimson"],
        //     ["int","darkmagenta","crimson"],
        //     ["state","dodgerblue","crimson"],
        //     ["symb","darkslategray","crimson"],
        //     ["dir","chocolate","crimson"],
        //     ["ppt","darkgreen","crimson"],
        //     ["comma","deepskyblue","red"]
        // ],
        // idx : "#506882",
        // basic: "#3d4144",
        // background: "white"
    },
    {
        name   : "dark mode",
        logo   : "fas fa-moon",
        css    : "dark"
        // entities : [
        //     ["colon","seagreen","red"],
        //     ["comment","burlywood","pink"],
        //     ["plain-txt","#eeffff","pink"],
        //     ["int","violet","pink"],
        //     ["state","lightblue","pink"],
        //     ["symb","white","pink"],
        //     ["dir","orange","pink"],
        //     ["ppt","springgreen","pink"],
        //     ["comma","skyblue","red"]
        // ],
        // idx : "#506882",
        // basic: "#eeffff",
        // background: "#263238"
    }
]

// for (const sch of palettes){
//     let map = new Map()
//     for(const cat of sch.entities){
//         map.set(cat[0],{std : cat[1], err: cat[2]})
//     }
//     sch.entities = map
// }

class PaletteList{
#list
#current
#nb
#previous = false
    
    constructor(){
        this.#current = 0
        this.#previous = 0
        this.#list = palettes
        this.#nb = palettes.length
        // alert(this.#nb)
    }
    
    get name(){
        return this.#list[this.#current].name
    }
    get logo(){
        return this.#list[this.#current].logo
    }
    get css (){
        return this.#list[this.#current].css
    }
    get colors(){
        return this.#list[this.#current]
    }
    get nextName(){
        // for (const key of this.#list.keys()) {
        //     console.log(`${key}: ${this.#list[key]}`);
        // }
        // console.log(this.#list.constructor.name)
        if (this.#current == this.#nb - 1){
            return this.#list[0].name
        } else {
            return this.#list[this.#current+1].name
        }
    }
    get nextLogo(){
        if (this.#current == this.#nb - 1){
            return this.#list[0].logo
        } else {
            return this.#list[this.#current+1].logo
        }
    } 

    get previous(){
        return this.#list[this.#previous]
    }
    change(){
        this.#previous = this.#current
        if (this.#current == this.#nb - 1){
            this.#current = 0
        } else {
            this.#current += 1
        }
        // alert (`${before} -> ${this.#current}`)
    }

}

class EditorElt{
    
    constructor(inputId, outputId){
        this.inputPanel = document.getElementById(inputId)
        this.outputFlag = document.getElementById(outputId)
        
        this.input = this.inputPanel.querySelector(".input-field")
        this.display = this.inputPanel.querySelector(".src-display")
        
        this.output = this.outputFlag.querySelector('.compilation-msg')

        let txtin = this.input
        this.input.addEventListener('keydown', event => {
            if (event.key === 'Tab') {
                const start = txtin.selectionStart
                const end = txtin.selectionEnd
                txtin.value = txtin.value.substring(0, start)
                    + '\t' + txtin.value.substring(end)
            
                event.preventDefault()
            }
        })
    }

    get value(){
        return this.input.value
    }

    reset(colors){
        this.display.innerHTML = ""
        this.output.innerHTML = ""
        this.outputFlag.classList.remove("alert")

        console.log(`color change :\n current classes ${this.inputPanel.className}\n${colors.previous.css} -> ${colors.css}`)
        this.inputPanel.classList.remove(colors.previous.css)
        this.inputPanel.classList.add(colors.css)
        
        // alert(colors.name)
     
        // this.inputPanel.style.background = colors.background
        // this.inputPanel.style.color = colors.basic
        // this.inputPanel.style["border-color"] = colors.background
        // this.display.style.background = colors.background
        // this.display.style.color = colors.basic
        // this.input.style.background = "transparent"
        // this.input.style.color = "transparent"
        // this.input.style["caret-color"] = colors.basic
    }

    addMsg(elt){
        this.output.appendChild(elt)
    }
    appMsg(txt){
        this.output.innerHTML += txt
    }
    
    set msg(txt){
        this.output.innerHTML = txt
    }

    addDisplay(elt){
        this.display.innerHTML += elt.innerHTML + "<br/>"
    }

    set size(s){
        this.input.style.height = "1px"
        this.input.style.height = this.input.scrollHeight + "px"
        this.input.style.width = `${s}px`
    }

    resize(){
        this.input.style.height = "1px"
        this.input.style.height = this.input.scrollHeight + "px"
        this.input.style.width = `${this.display.clientWidth}px`
    }

    set errorTitle(s){
        this.outputFlag.classList.add("alert")
        this.output.innerHTML = `${s} : <br/>`
    }

    set update(myFun){
        this.input.oninput = myFun
    }

}

class Editor {
    #editor
    #parser
    #quickParser
    #ok
    #colorButton
    #palette
    latency = 500
    
    constructor(editorElt, myParser, myQuickParser){
        // this.#colorScheme = makeColor(myColorScheme)
        this.#editor = editorElt
        this.#palette = new PaletteList()
        this.#parser = myParser
        this.#quickParser = myQuickParser
        this.#editor.update = this.upd.bind(this)
        
        this.#colorButton = new EditorButton(this.#editor.inputPanel, "", "")
        this.#colorButton.style.position = "sticky"
        this.#colorButton.style.top = "0"
        this.#colorButton.style.right = "10px"
        this.#colorButton.style.float = "right"
        this.#colorButton.onclick = this.toggle.bind(this)
        this.updateBtn()

        // this.quickUpdate()
    }

    updateBtn(){
        this.#colorButton.title = this.#palette.nextName
        this.#colorButton.icoClass = this.#palette.nextLogo
    }

    toggle(){
        this.#palette.change()
        // alert(this.#palette.colors.name)
        this.updateBtn()
        this.quickUpdate()
    }

    fullUpdate(){
        console.time('processing')
        this.#ok = false
        let src_txt = this.#editor.value
        this.#parser.reset()

        // alert (this.#palette.constructor.name)
        this.#editor.reset(this.#palette)
        let errors = new Array()
        // let maxW = 0
        var m = src_txt.match(/^([^\n]*)\n/)
        while (m){
            errors = errors.concat(
                this.#parser.processLine(m[1])
                    .html(this.#editor.display)
            )
            src_txt = src_txt.substring(m[0].length)
            m = src_txt.match(/^([^\n]*)\n/)
            // this.#editor.addDisplay(out.elt)
            // errors = errors.concat(out.errors)
            // maxW = Math.max(maxW, out.elt.clientWidth)
        }
        // alert(src_txt)
        errors = errors.concat(
            this.#parser.processLine(src_txt)
                .html(this.#editor.display)
        )
        this.#editor.resize()
        errors = errors.concat(this.#parser.checkSpec())

        if (errors.length > 0){
            this.#editor.errorTitle = "Spécification incorrecte"
            
            for (const e of errors.values())
                this.#editor.addMsg(e.print(function (i) {return `idx-${i}`}))
        } else {
            this.#editor.msg = "Aucune erreur trouvée, prêt à compiler."
            this.#ok = true
        }
        console.timeEnd('processing')
    }
    get value (){
        this.fullUpdate()
        if (this.#ok){
            this.#parser.compile()
            this.#editor.msg = `Compilation réussie ! <br/> ${this.#parser.value.summary}`
            return this.#parser.value
        } else {
            return false
        }
    }

    upd(){
        this.lastEntry = Date.now()
        this.#editor.input.classList.add("visible")
        setTimeout(this.tryUpdate.bind(this),this.latency)
    }

    tryUpdate(){
        if (Date.now() - this.lastEntry >= this.latency){
            this.#editor.input.classList.remove("visible")
            this.quickUpdate()
        }
    }
    quickUpdate(){
        this.#editor.reset(this.#palette)
        let p = new this.#quickParser(this.#editor.display, this.#editor.value)
        console.time("quick processing")
        p.process()
        console.timeEnd("quick processing")
        console.log(`processed ${p.idx} lines`)
        this.#editor.resize()
        if (p.errors.length > 0){
            this.#editor.errorTitle = "Spécification incorrecte"
            if (p.errors.length == 1)
            {
                this.#editor.appMsg(`erreur détectée ligne ${p.errors[0]}.<br/>`)
                this.#editor.appMsg("Essayez de compiler pour obtenir plus d'informations sur cette erreur.")
            } else {
                this.#editor.appMsg(`erreurs détectées lignes ${p.errors.join(",")}.<br/>`)
                this.#editor.appMsg("Essayez de compiler pour obtenir plus d'informations sur ces erreurs.")
            }
            this.#ok = false
        } else {
            this.#editor.msg = "Aucune erreur trouvée, prêt à compiler."
            this.#ok = true
        }

    }

    get ok(){
        return this.#ok
    }

    get colors(){
        return this.#palette.colors
    }

}
