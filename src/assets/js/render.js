class RenderButton {
    #button
    #ico
    
    constructor (elt){
        this.#button = elt

        this.#button.className = 'btn btn--primary'

        let ico = document.createElement("i")
        this.#button.appendChild(ico)

        this.#ico = ico
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
    },
    {
        name   : "dark mode",
        logo   : "fas fa-moon",
        css    : "dark"
    }
]


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
    }

}

class RenderElt{
    
    constructor(inputId, outputId){
        this.inputPanel = document.getElementById(inputId)
        this.outputFlag = document.getElementById(outputId)
        
        this.input = this.inputPanel.querySelector(".src")
        this.display = this.inputPanel.querySelector(".src-display")
        
        this.output = this.outputFlag.querySelector('.compilation-msg')

        this.colorButton = new RenderButton(this.inputPanel.querySelector(".color-btn"))
        // this.#colorButton.style.position = "absolute"
        // this.#colorButton.style.top = "0"
        // this.#colorButton.style.right = "10px"

        let txtin = this.input
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
        this.input.style.height = this.input.scrollHeight + "px"
        this.input.style.width = `${s}px`
    }

    resize(){
        this.input.style.height = this.input.scrollHeight + "px"
        this.input.style.width = `${this.display.clientWidth}px`
    }

    set errorTitle(s){
        this.outputFlag.classList.add("alert")
        this.output.innerHTML = `${s} : <br/>`
    }
}

class Render {
    #render
    #parser
    #ok
    #palette
    latency = 500
    
    constructor(renderElt, myParser){
        // this.#colorScheme = makeColor(myColorScheme)
        this.#render = renderElt
        this.#palette = new PaletteList()
        this.#parser = myParser        

        this.#render.colorButton.onclick = this.toggle.bind(this)

        this.updateBtn()

        // this.fullUpdate()
    }

    updateBtn(){
        this.#render.colorButton.title = this.#palette.nextName
        this.#render.colorButton.icoClass = this.#palette.nextLogo
    }

    toggle(){
        this.#palette.change()
        // alert(this.#palette.colors.name)
        this.updateBtn()
        this.fullUpdate()
    }

    fullUpdate(){
        console.time('processing')
        this.#ok = false
        let src_txt = this.#render.value
        this.#parser.reset()

        // alert (this.#palette.constructor.name)
        this.#render.reset(this.#palette)
        let errors = new Array()
        // let maxW = 0
        var m = src_txt.match(/^([^\n]*)\n/)
        while (m){
            errors = errors.concat(
                this.#parser.processLine(m[1])
                    .html(this.#render.display)
            )
            src_txt = src_txt.substring(m[0].length)
            m = src_txt.match(/^([^\n]*)\n/)
            // this.#render.addDisplay(out.elt)
            // errors = errors.concat(out.errors)
            // maxW = Math.max(maxW, out.elt.clientWidth)
        }
        // alert(src_txt)
        errors = errors.concat(
            this.#parser.processLine(src_txt)
                .html(this.#render.display)
        )
        this.#render.resize()
        errors = errors.concat(this.#parser.checkSpec())

        if (errors.length > 0){
            this.#render.errorTitle = "Spécification incorrecte"
            
            for (const e of errors.values())
                this.#render.addMsg(e.print(function (i) {return `idx-${i}`}))
        } else {
            this.#render.msg = "Aucune erreur trouvée, prêt à compiler."
            this.#ok = true
        }
        console.timeEnd('processing')
        return this.#parser.value

    }

    get value (){
        let p = this.fullUpdate()
        if (this.#ok){
            this.#render.msg = `Compilation réussie ! <br/> ${p.machine.summary}`
            return p
        } else {
            return false
        }
    }

    get ok(){
        return this.#ok
    }

    get colors(){
        return this.#palette.colors
    }

}
