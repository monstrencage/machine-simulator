function parseMealyTrans(line, spec){
    let q0 = line.splitRegex(/^([^,]*)(,.*)/)
    if (q0){
        formatStateElt(q0)
        let comma1 = line.splitRegex(/^(,)(.*)/)
        comma1.addClass('comma')
        let symb1 = line.splitRegex(/^([^,]*)([/].*)/)
        formatInSymbElt(symb1)
        let slash = line.splitRegex(/^([/])(.*)/)
        slash.addClass('comma')
        let symb2 = line.splitRegex(/^([^,]*)(,.*)/)
        formatOutSymbElt(symb2,1)
        let comma2 = line.splitRegex(/^(,)(.*)/)
        comma2.addClass('comma')
        let q1 = line.toElt()
        formatStateElt(q1)
        spec.trans.push({in: q0.value, out:q1.value, symb1:symb1.value,symb2:symb2.value, src:line.src, id:line.index})
        return true
    } else {
        return false
    }
}


class MealyParser {
    
    constructor(){
        this.spec = {
            trans : new Array(),
            outputLn: 0,
            name: "",
            ndet : false
        }
        this.idx = 0
    }

    reset(){
        this.spec = {
            trans : new Array(),
            outputLn: 0,
            name: "",
            ndet : false
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
            ok = parseMealyTrans(line, this.spec)
        }
        if (!ok){
            line.toElt()
            line.falsify = "Ligne incompréhensible."
        }
        return line
    }

    checkSpec(){
        let errors = Array()
        
        if (! this.spec.q0){
            errors.push(new Error("état initial manquant."))
        }
        if (this.spec.qf){
            errors.push(new Error("Les machines de Mealy n'ont pas d'état final."))
        }
        if (this.spec.trans.length == 0){
            errors.push(new Error("transitions manquantes."))
        }
        if (errors.length == 0){
            this.idx = 0
        }
        if (this.spec.eager){
            errors.push(new Error("l'option eager n'est pas disponible pour les machines de Mealy."))
            
        }
        return errors
    }

    get value(){
        if (this.idx == 0){
            return {
                machine : new Mealy(this.spec.q0,
                                        this.spec.trans,
                                        this.spec.name),
                ndet : this.spec.ndet
            }
        } else {
            return false
        }
    }
}

class QuickMealyParser {
    
    constructor(display, str){
        this.idx = 0
        this.errors = new Array()
        this.display = display
        this.remainder = str
        this.finished = false

        this.display.innerHTML = ""
    }

    process(){
        this.idx += 1
        let temp = this.remainder 
        let output = ""
        let err = false
        let parts = this.remainder.split('\n',2)
        var myline = ""
        if (parts.length == 0){
            console.log(`processSrc : ${str} splits into 0 lines (weird)`)
        } else if (parts.length == 1){
            myline = parts[0]
            this.remainder = ""
            this.finished = true
        } else if (parts.length == 2){
            myline = parts[0]
            this.remainder = this.remainder.substring(myline.length +1)
            console.assert(temp == `${myline}\n${this.remainder}`, `called on ${temp}, split as ${myline}\n${this.remainder}`)
        } else {
            console.log(`processSrc : ${str} splits into ${parts.length} lines (weird)`)
        }

        myline = myline.replaceAll('<','&lt').replaceAll('<','&gt')

        parts = myline.split("//",2)
        if (parts.length == 2){
            output = `<mark class="comments">//${parts[1]}</mark>`
            myline = parts[0]
        }
        
        if (/^\s*$/.test(myline)){
            output = `${myline}${output}`
        } else {
            parts = myline.match(/^([^:]*):(.*)/)
            if (parts){
                switch(parts[1].trim()){
                case "init":
                case "initial":
                case "accept":
                    output = `<mark class="ppt">${parts[1]}</mark><mark class="colon">:</mark><mark class="state">${parts[2]}</mark>${output}`
                    break;
                case "name":
                case "nom":
                    output = `<mark class="ppt">${parts[1]}</mark><mark class="colon">:</mark><mark class="plain-txt">${parts[2]}</mark>${output}`
                    break;
                case "option":
                    output = `<mark class="ppt">${parts[1]}</mark><mark class="colon">:</mark><mark class="plain-txt">${parts[2]}</mark>${output}`
                    break;
                default:
                    output = `<mark class="ppt err">${parts[1]}</mark><mark class="colon err">:</mark><mark class="plain-txt">${parts[2]}</mark>${output}`
                    err = true
                    break;
                }
            } else {
                parts = myline.match(/^([^,:]*),([^,]*)[/]([^,]*),([^,:]*)/)
                if (parts){
                    let symb1 = parts[2].match(/[^,]|\[[^,]*\]/)
                    let symb2 = parts[3].match(/[^,]|[$]1/)
                    let cls1 = "symb"
                    let cls2 = "symb"
                    if (! symb1) {cls1 = "err"}
                    if (! symb2) {cls2 = "err"}
                    output = `<mark class="state">${parts[1]}</mark><mark class="comma">,</mark><mark class="${cls1}">${parts[2]}</mark><mark class="comma">/</mark><mark class="${cls2}">${parts[3]}</mark><mark class="comma">,</mark><mark class="state">${parts[4]}</mark>${output}`
                    
                } else {
                    err = true
                    output = `<mark class="err">${myline}</mark>${output}`
                }
            }
        }
        if (err){
           output = `<a id="idx-${this.idx}" class="line-idx alert"><span>${this.idx}:</span></a>${output}` 
        } else {
           output = `<a id="idx-${this.idx}" class="line-idx"><span>${this.idx}:</span></a>${output}` 
        }

        this.display.innerHTML += output
        if (! this.finished){
            if (err){
                this.errors.push(this.idx)
            }
            this.display.innerHTML += "<br/>"
            this.process()
        }
    }
}
