import * as d3 from 'd3';
import * as React from 'react';
import viz from './viz';

interface Props {
    graph: graph,
}
type graph = {
    id: number,
    // nodes:Array<number>,
    // edges:Array<edges>,
    [propName: string]: any,
}

class SangJi extends React.Component<Props, any>{
    public color = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"];
    constructor(props: Props) {
        super(props);
        this.draw = this.draw.bind(this);
    }
    componentWillReceiveProps(nextProps: Props): void {
        if (nextProps.graph !== this.props.graph) {
            this.draw(nextProps.graph);
        }
    }

    draw(graph:graph) {
        

        const svg = d3.select("#sangji" + graph.id);
        let authorNames: Array<string> = [];
        let titles: Array<string> = [];
        let linksData: any = [];
        for (let i in graph['authorInfo']) {
            authorNames.push(graph["authorInfo"][i]["name"]);
            // let title: Array<React.ReactElement> = [];
            for (let paper in graph["authorInfo"][i]["paper"]) {
                if (titles.indexOf(graph["authorInfo"][i]["paper"][paper]["title"]) < 0) {
                    titles.push(graph["authorInfo"][i]["paper"][paper]["title"])
                }
                if (linksData.indexOf([graph["authorInfo"][i]["name"], graph["authorInfo"][i]["paper"][paper]["title"]]) < 0) {
                    linksData.push([graph["authorInfo"][i]["name"], graph["authorInfo"][i]["paper"][paper]["title"], 1]);
                }

            }

            var bp = viz().biPartite(svg.attr("height"), svg.attr("width"), d3.schemeCategory10, authorNames.length, this.color, {})
                .data(linksData)
            svg.append("g").call(bp);



        }
    }

    render(): React.ReactElement {
        return (
            <svg id={"sangji" + this.props.graph.id} style={{ width: '100%', height: '100%' }}>

            </svg>
        )
    }

}
export default SangJi;