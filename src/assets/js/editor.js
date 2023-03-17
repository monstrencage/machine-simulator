class EditorElt{
    constructor(inputId, displayId, outputId, outputFlagId){
        this.input = document.getElementById(inputId)
        this.display = document.getElementById(displayId)
        this.output = document.getElementById(outputId)
        this.outputFlag = document.getElementById(outputFlagId)

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

    reset (){
        this.display.innerHTML = ""
        this.output.innerHTML = ""
        this.outputFlag.classList.remove("alert")
    }

    addMsg(elt){
        this.output.appendChild(elt)
    }
    
    set msg(txt){
        this.output.innerHTML = txt
    }

    addDisplay(elt){
        this.display.appendChild(elt)
    }

    set size(s){
        this.input.style.height = this.input.scrollHeight + "px"
        this.input.style.width = `${s}px`
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
    #ok
    
    constructor(editorElt, myParser){
        this.#editor = editorElt
        this.#parser = myParser
        this.#editor.update = this.upd.bind(this)
        this.upd()
    }

    upd () {
        this.#ok = false
        let src_txt = this.#editor.value.split('\n')
        this.#parser.reset()
        this.#editor.reset ()
        let errors = new Array()
        let maxW = 0
        for(var l of src_txt){
            let out = this.#parser.processLine(l)
            this.#editor.addDisplay(out.elt)
            errors = errors.concat(out.errors)
            maxW = Math.max(maxW, out.elt.clientWidth)
        }
        this.#editor.size = maxW
        errors = errors.concat(this.#parser.checkSpec())

        if (errors.length > 0){
            this.#editor.errorTitle = "Spécification incorrecte"

            for (const e of errors.values())
                this.#editor.addMsg(e.print(function (i) {return `idx-${i}`}))
        } else {
            this.#parser.compile()
            this.#editor.msg = `Compilation réussie ! <br/> ${this.#parser.value.summary}`
            this.#ok = true
        }
    }
    
    get value (){
        return this.#parser.value
    }

    get ok(){
        return this.#ok
    }
}
