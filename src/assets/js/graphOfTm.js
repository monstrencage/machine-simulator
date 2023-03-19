function transitionToEdge(tr){
    return {
        id: tr.id,
        from : `q_${tr.etat_read}`,
        to: `q_${tr.etat_write}`,
        arrows: "to",
        label: `${tr.testString}/${tr.actionString}`,
        title: tr.src
    }
}

class GraphTM {
    #color_normal = '#6f777d'
    #color_highlight = 'darkred'
    #nodes = new vis.DataSet([])
    #edges = new vis.DataSet([])
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
        var states = new Array(), transitions = new Array()
        for (let q of tm.states){
            states.push({id: `q_${q}`, label:q})
        }
        states.push({id: "initial", shape:"dot", size:1},
                    {id: "final", shape:"dot", size:1})
        transitions.push({id: "e_init", from: "initial", to: `q_${tm.init}`,
                          arrows: "to"},
                         {id: "e_final", from: `q_${tm.finalState}`, to: "final",
                          arrows: "to"})
        for (const t of tm.transList){
            transitions.push(transitionToEdge(t))
        }
        this.#nodes = new vis.DataSet(states)
        this.#edges = new vis.DataSet(transitions)
        this.#graph.setData({nodes: this.#nodes, edges: this.#edges})
        this.#graph.redraw()
        this.#current_node = "initial"
        this.#high_trans = "e_init"

    }
    
    highlight(etat, eid){
        let nid = `q_${etat}`
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
