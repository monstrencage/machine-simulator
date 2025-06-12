class EdgeSet {
#content
#reference
    constructor(){
        this.#content = new Map()
        this.#reference = new Map()
    }
    add(tr){
        let edgeId = `${tr.etat_read}:${tr.etat_write}`
        let edgeLabel = `${tr.testString}/${tr.actionString}`
        this.#reference.set(tr.id,edgeId)
        // console.log(`adding ${tr.id} to ${edgeId}, current size:${this.#content.size}`)
        if (this.#content.has(edgeId)){
            this.#content.get(edgeId).label += `\n${edgeLabel}`
            this.#content.get(edgeId).title += `\n${tr.src}`
        } else {
            this.#content.set(edgeId,{
                id: edgeId,
                from : `q_${tr.etat_read}`,
                to: `q_${tr.etat_write}`,
                arrows: "to",
                label: edgeLabel,
                title: tr.src
            })
        }
    }
    
    extract(edges){
        
        for (const e of this.#content.values()){
            // console.log(`edge ${e.id}: ${e.label}`)
            edges.add(e)
        }
        return this.#reference
    }
}
class AutoEdgeSet {

    #content
    #reference

    constructor(){
        this.#content = new Map()
        this.#reference = new Map()
    }
    add(tr){
        let edgeId = `${tr.etat_read}:${tr.etat_write}`
        let edgeLabel = `${tr.testString}`
        this.#reference.set(tr.id,edgeId)
        // console.log(`adding ${tr.id} to ${edgeId}, current size:${this.#content.size}`)
        if (this.#content.has(edgeId)){
            this.#content.get(edgeId).label += `\n${edgeLabel}`
            this.#content.get(edgeId).title += `\n${tr.src}`
        } else {
            this.#content.set(edgeId,{
                id: edgeId,
                from : `q_${tr.etat_read}`,
                to: `q_${tr.etat_write}`,
                arrows: "to",
                label: edgeLabel,
                title: tr.src
            })
        }
    }

    extract(edges){

        for (const e of this.#content.values()){
            // console.log(`edge ${e.id}: ${e.label}`)
            edges.add(e)
        }
        return this.#reference
    }
}

class MealyEdgeSet {
    #content
    #reference
    constructor(){
        this.#content = new Map()
        this.#reference = new Map()
    }
    add(tr){
        let edgeId = `${tr.etat_read}:${tr.etat_write}`
        let edgeLabel = `${printRead(tr.symbols_read[0])}/${printWSymb(tr.writes[1][0])}`
        this.#reference.set(tr.id,edgeId)
        // console.log(`adding ${tr.id} to ${edgeId}, current size:${this.#content.size}`)
        if (this.#content.has(edgeId)){
            this.#content.get(edgeId).label += `\n${edgeLabel}`
            this.#content.get(edgeId).title += `\n${tr.src}`
        } else {
            this.#content.set(edgeId,{
                id: edgeId,
                from : `q_${tr.etat_read}`,
                to: `q_${tr.etat_write}`,
                arrows: "to",
                label: edgeLabel,
                title: tr.src
            })
        }
    }
    
    extract(edges){
        
        for (const e of this.#content.values()){
            // console.log(`edge ${e.id}: ${e.label}`)
            edges.add(e)
        }
        return this.#reference
    }
}

class GraphTM {
    static finalTransitions = true
    #color_normal = '#6f777d'
    #color_highlight = 'darkred'
    #nodes = new vis.DataSet([])
    #edges = new vis.DataSet([])
    #edgeRef = new Map()
    #current_node = "initial"
    #high_trans = "e_init"
    #options = {
        nodes:{
            borderWidth: 0,
            color: this.#color_normal,
            font:{
                color:'white'
            }
        },
        edges:{
            color: this.#color_normal,
            font:{
                color:'black'
            }
        }
    };
    #graph

    constructor(elt){
        this.#graph = new vis.Network(
            elt,
            { nodes: this.#nodes, edges: this.#edges},
            this.#options);
    }

    upd(tm){
        this.#nodes = new vis.DataSet([])
        for (let q of tm.states){
            this.#nodes.add({
                id: `q_${q}`,
                label:q})
        }
        this.#nodes.add({
            id: "initial",
            shape:"dot",
            size:1})

        const edgeSet = new EdgeSet()
        for (const t of tm.transList){ edgeSet.add(t) }
        this.#edges = new vis.DataSet([])
        this.#edgeRef = edgeSet.extract(this.#edges)
        this.#edges.add({
            id: "e_init",
            from: "initial",
            to: `q_${tm.init}`,
            arrows: "to"})
        
        for (const q of tm.finalStates){
            this.#nodes.add({
                id: `final_${q}`,
                shape:"dot",
                size:1})    
            this.#edges.add({
                id: `e_${q}_final`,
                from: `q_${q}`,
                to: `final_${q}`,
                arrows: "to"})
        }
        
        this.#graph.setData({nodes: this.#nodes, edges: this.#edges})

        this.#graph.redraw()

        this.#current_node = "initial"

        this.#high_trans = "e_init"

    }
    
    highlight(nid, tid){
        if (this.#current_node != nid){
            this.#nodes.updateOnly([
                {
                    id:this.#current_node,
                    color:this.#color_normal
                },{
                    id:nid,
                    color:this.#color_highlight
                }
            ])
        }
        let eid = ""
        if (this.#edgeRef.has(tid)){
            eid = this.#edgeRef.get(tid)
        } else {
            eid = tid
        }
        if (this.#high_trans != eid){
            this.#edges.updateOnly([
                {
                    id:this.#high_trans,
                    color:this.#color_normal
                }])
            this.#edges.updateOnly([{
                id:eid,
                color:this.#color_highlight
            }
                                   ])
        }else{
            this.#edges.updateOnly([
                {
                    id:eid,
                    color:this.#color_highlight
                }
            ])
        }
        this.#high_trans = eid
        this.#graph.focus(nid)
        this.#current_node = nid
    }
}


class GraphAuto {
    static finalTransitions = true
    #color_normal = '#6f777d'
    #color_highlight = 'darkred'
    #nodes = new vis.DataSet([])
    #edges = new vis.DataSet([])
    #edgeRef = new Map()
    #current_node = "initial"
    #high_trans = "e_init"
    #options = {
        nodes:{
            borderWidth: 0,
            color: this.#color_normal,
            font:{
                color:'white'
            }
        },
        edges:{
            color: this.#color_normal,
            font:{
                color:'black'
            }
        }
    };
    #graph

    constructor(elt){
        this.#graph = new vis.Network(
            elt,
            { nodes: this.#nodes, edges: this.#edges},
            this.#options);
    }

    upd(tm){
        this.#nodes = new vis.DataSet([])
        for (let q of tm.states){
            this.#nodes.add({
                id: `q_${q}`,
                label:q})
        }
        this.#nodes.add({
            id: "initial",
            shape:"dot",
            size:1})

        const edgeSet = new AutoEdgeSet()
        for (const t of tm.transList){ edgeSet.add(t) }
        this.#edges = new vis.DataSet([])
        this.#edgeRef = edgeSet.extract(this.#edges)

        this.#edges.add({
            id: "e_init",
            from: "initial",
            to: `q_${tm.init}`,
            arrows: "to"})

        for (const q of tm.finalStates){
            this.#nodes.add({
                id: `final_${q}`,
                shape:"dot",
                size:1})    
            this.#edges.add({
                id: `e_${q}_final`,
                from: `q_${q}`,
                to: `final_${q}`,
                arrows: "to"})
        }

        this.#graph.setData({nodes: this.#nodes, edges: this.#edges})

        this.#graph.redraw()

        this.#current_node = "initial"

        this.#high_trans = "e_init"

    }
    
    highlight(nid, tid){
        if (this.#current_node != nid){
            this.#nodes.updateOnly([
                {
                    id:this.#current_node,
                    color:this.#color_normal
                },{
                    id:nid,
                    color:this.#color_highlight
                }
            ])
        }
        let eid = ""
        if (this.#edgeRef.has(tid)){
            eid = this.#edgeRef.get(tid)
        } else {
            eid = tid
        }
        if (this.#high_trans != eid){
            this.#edges.updateOnly([
                {
                    id:this.#high_trans,
                    color:this.#color_normal
                }])
            this.#edges.updateOnly([{
                id:eid,
                color:this.#color_highlight
            }
                                   ])
        }else{
            this.#edges.updateOnly([
                {
                    id:eid,
                    color:this.#color_highlight
                }
            ])
        }
        this.#high_trans = eid
        this.#graph.focus(nid)
        this.#current_node = nid
    }
}

class GraphMealy {
    static finalTransitions = false
    #color_normal = '#6f777d'
    #color_highlight = 'darkred'
    #nodes = new vis.DataSet([])
    #edges = new vis.DataSet([])
    #edgeRef = new Map()
    #current_node = "initial"
    #high_trans = "e_init"
    #options = {
    nodes:{
        borderWidth: 0,
        color: this.#color_normal,
        font:{
            color:'white'
        }
    },
    edges:{
        color: this.#color_normal,
        font:{
            color:'black'
        }
    }
    };
    #graph

    constructor(elt){
        this.#graph = new vis.Network(
            elt,
            { nodes: this.#nodes, edges: this.#edges},
            this.#options);
    }

    upd(tm){
        this.#nodes = new vis.DataSet([])
        for (let q of tm.states){
            this.#nodes.add({
                id: `q_${q}`,
                label:q})
        }
        this.#nodes.add({
            id: "initial",
            shape:"dot",
            size:1})

        const edgeSet = new MealyEdgeSet()
        for (const t of tm.transList){ edgeSet.add(t) }
        this.#edges = new vis.DataSet([])
        this.#edgeRef = edgeSet.extract(this.#edges)

        this.#edges.add({
            id: "e_init",
            from: "initial",
            to: `q_${tm.init}`,
            arrows: "to"})

        this.#graph.setData({nodes: this.#nodes, edges: this.#edges})

        this.#graph.redraw()

        this.#current_node = "initial"

        this.#high_trans = "e_init"

    }

    highlight(nid, tid){
        if (this.#current_node != nid){
            this.#nodes.updateOnly([
                {
                    id:this.#current_node,
                    color:this.#color_normal
                },{
                    id:nid,
                    color:this.#color_highlight
                }
            ])
        }
        let eid = ""
        if (this.#edgeRef.has(tid)){
            eid = this.#edgeRef.get(tid)
        } else {
            eid = tid
        }
        if (this.#high_trans != eid){
            this.#edges.updateOnly([
                {
                    id:this.#high_trans,
                    color:this.#color_normal
                }])
            this.#edges.updateOnly([{
                id:eid,
                color:this.#color_highlight
            }
            ])
        }else{
            this.#edges.updateOnly([
                {
                    id:eid,
                    color:this.#color_highlight
                }
            ])
        }
        this.#high_trans = eid
        this.#graph.focus(nid)
        this.#current_node = nid
    }
}
