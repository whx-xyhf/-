import * as React from 'react';
import axios from 'axios';
import NodeLink from './NodeLink'
import * as d3 from 'd3';

interface Props {
    url: string,
    parent: any,
    num: number,
    dimensions: number,
    strWeight: number,
    attrWeight: number,
    attrChecked: attr,
    attrValue: attr,
}
type node = {
    id: number;
    x: number;
    y: number;
    [propName: string]: any,
}
type link = {
    source: node;
    target: node;
    end: boolean;
    [propName: string]: any,
}
type feature = {
    [propName: string]: any,
}
type attr = {
    [propName: string]: any,
}

class DrawPanel extends React.Component<Props, any>{
    private pen = "";//画笔类型
    private record: Array<string> = [];//画笔类型记录
    private svgRef: React.RefObject<SVGSVGElement>;
    public svgWidth: number = 0;
    public svgHeight: number = 0;
    public padding={top:10,bottom:10,left:10,right:10};
    private modelGraohs = [
        { id: -1, nodes: [1, 2, 3], edges: [[1, 2], [2, 3]] },
        { id: -2, nodes: [1, 2, 3, 4, 5, 6], edges: [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6]] },
        { id: -3, nodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], edges: [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [6, 7], [6, 8], [6, 9], [6, 10]] },
    ];
    constructor(props: Props) {
        super(props);
        this.state = { nodes: [], links: [] ,id:-4};
        this.svgRef = React.createRef();
        this.beginDrawNode = this.beginDrawNode.bind(this);
        this.beginDrawLine = this.beginDrawLine.bind(this);
        this.redo = this.redo.bind(this);
        this.undo = this.undo.bind(this);
        this.matchModel = this.matchModel.bind(this);
        this.drawNode = this.drawNode.bind(this);
        this.drawLine = this.drawLine.bind(this);
        this.drawDashLine = this.drawDashLine.bind(this);
        this.chooseModel = this.chooseModel.bind(this);
    }
    beginDrawNode(): void {
        this.pen = "node";
    }
    beginDrawLine(): void {
        this.pen = "line";
    }
    redo(): void {
        this.setState({ nodes: [], links: [] });
        this.record = [];
    }
    undo(): void {
        let lastType = this.record.pop();
        if (lastType === "node") {
            let nodes = this.state.nodes;
            nodes.pop();
            this.setState({ nodes: nodes });
        }
        else if (lastType === "line") {
            let links = this.state.links;
            links.pop();
            this.setState({ links: links });
        }
        else if (lastType === "model") {
            this.setState({ nodes: [], links: [] });
            this.record = [];
        }
    }
    //匹配与定制图相似的图
    matchModel(): void {
        let { links, nodes ,id} = this.state;
        const { url, dimensions, strWeight, attrWeight, attrChecked, attrValue } = this.props;
        if(this.record.indexOf('model')<0){
            id=-4;
        }
        let edges = links.map((value: link) => [value.source.id, value.target.id]);
        let features: feature = {};
        let nodesId:Array<number>=[];
        nodes.forEach((value: node) => {
            features[value.id] = 1;
            nodesId.push(value.id);
        })
        let checkedArr: any = [];
        for (let key in attrChecked) {
            checkedArr.push({ name: key, value: attrChecked[key] })
        }
        axios.post(url, {
            name:String(id),nodes:nodesId,edges: edges, features: features, num: this.props.num, dimensions: dimensions, strWeight: strWeight,
            attrWeight: attrWeight, attrChecked: checkedArr, attrValue: attrValue
        },{timeout:600000}).then(res => {
            console.log(res.data)
            this.props.parent.setReTsneData(res.data.all);
            setTimeout(()=>{
                this.props.parent.setChoosePoints(res.data.match);
                this.props.parent.setCenterPoint(res.data.center);
            },1500);
            
        })
    }
    //选择系统自带的模板
    chooseModel(nodesid: any, links: any,id:number): void {
        this.pen = "model";
        this.record.push("model");
        let x_max: number = d3.max(nodesid, (d: d3.SimulationNodeDatum): number => d.x || 0) || 0;
        let x_min: number = d3.min(nodesid, (d: d3.SimulationNodeDatum): number => d.x || 0) || 0;
        let y_max: number = d3.max(nodesid, (d: d3.SimulationNodeDatum): number => d.y || 0) || 0;
        let y_min: number = d3.min(nodesid, (d: d3.SimulationNodeDatum): number => d.y || 0) || 0;

        new Promise((resolve: any, reject: any) => {
            //获取纵横比
            let height_force = y_max - y_min;
            let width_force = x_max - x_min;
            let scaleWidth = this.svgWidth / 4 * 3;
            let scaleHeight = this.svgHeight / 4 * 3;
            if (x_max >= this.svgWidth || x_min <= 0 || y_min <= 0 || y_max >= this.svgHeight) {
                scaleWidth = this.svgWidth;
                scaleHeight = this.svgHeight;
            }

            if (height_force > width_force) {
                scaleWidth = (scaleHeight * width_force) / height_force;
                if (scaleWidth > this.svgWidth) {
                    scaleWidth = this.svgWidth;
                    scaleHeight = (scaleWidth * height_force) / width_force;
                }
            }
            else {
                scaleHeight = (scaleWidth * height_force) / width_force;
                if (scaleHeight > this.svgHeight) {
                    scaleHeight = this.svgHeight;
                    scaleWidth = (scaleHeight * width_force) / height_force;
                }
            }
            let xScale: d3.ScaleLinear<number, number> = d3.scaleLinear().domain([x_min, x_max]).range([(this.svgWidth - scaleWidth) / 2 + this.padding.left, (this.svgWidth - scaleWidth) / 2 + scaleWidth - this.padding.right]);
            let yScale: d3.ScaleLinear<number, number> = d3.scaleLinear().domain([y_min, y_max]).range([(this.svgHeight - scaleHeight) / 2 + this.padding.top, (this.svgHeight - scaleHeight) / 2 + scaleHeight - this.padding.bottom]);


            let newNodes = [];
            for (let i = 0; i < nodesid.length; i++) {
                newNodes.push({
                    id: nodesid[i].id,
                    x: xScale(nodesid[i].x),
                    y: yScale(nodesid[i].y)
                })
            }

            let newLinks = [];
            for (let i = 0; i < links.length; i++) {
                newLinks.push({
                    index: links[i].index,
                    source: { id: links[i].source.id, x: xScale(links[i].source.x), y: yScale(links[i].source.y) },
                    target: { id: links[i].target.id, x: xScale(links[i].target.x), y: yScale(links[i].target.y) },
                    end:true,
                })
            }

            resolve([newNodes, newLinks]);
        }).then((res: any) => {
            // console.log(res[0])
            this.setState({ nodes: res[0], links: res[1] ,id:id});
        })
    }
    drawNode(e: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
        const { nodes } = this.state;
        if (this.pen === "node") {
            let x = e.nativeEvent.offsetX;
            let y = e.nativeEvent.offsetY;
            nodes.push({ id: nodes.length, x: x, y: y })
            this.setState({ nodes: nodes })
            this.record.push("node");
        }

    }
    drawLine(node: node): void {
        const { links } = this.state;
        if (this.pen === "line") {
            if (links.length > 0) {
                let link = links[links.length - 1];
                if (link.end === true) {
                    links.push({ source: node, target: node, end: false });
                }
                else {
                    link.target = node;
                    link.end = true;
                    links[links.length - 1] = link;
                    this.record.push("line");
                }
            }
            else {
                links.push({ source: node, target: node, end: false });
            }
            this.setState({ links: links });

        }
    }
    drawDashLine(e: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
        const { links } = this.state;
        if (this.pen === "line") {
            if (links.length > 0) {
                let link = links[links.length - 1];
                if (link.end === false) {
                    let x = e.nativeEvent.offsetX;
                    let y = e.nativeEvent.offsetY;
                    link.target = { x: x, y: y }
                    links[links.length - 1] = link;
                    this.setState({ links: links });
                }
            }
        }
    }

    componentDidMount(): void {
        this.svgWidth = this.svgRef.current?.clientWidth || 0;
        this.svgHeight = this.svgRef.current?.clientHeight || 0;
    }
    render() {
        const { nodes, links } = this.state;
        const nodeEl = nodes.map((value: node, index: number) =>
            <circle r="3.5px" cx={value.x} cy={value.y} key={index} fill="white" strokeWidth="1px" stroke="#3072ad" onClick={this.drawLine.bind(this, value)}></circle>
        )
        const linkEl = links.map((value: link, index: number) =>
            <line x1={value.source.x} y1={value.source.y} x2={value.target.x}
                y2={value.target.y} fill="none" strokeWidth="1px" stroke="#ccc" key={index} strokeDasharray={value.end ? '0' : '5 5'}></line>
        )
        const nodeLinkEl = this.modelGraohs.map((value: any, index: number) =>
            <div className='modelGraph' key={index} >
                <NodeLink key={index} graph={value} parent={this} onClick={this.chooseModel} />
            </div>
        )

        return (
            <div className="content">
                <div className="tools">
                    <input type="button" className="btnGroup btnNode" title="node" onClick={this.beginDrawNode}></input>
                    <input type="button" className="btnGroup btnLine" title="link" onClick={this.beginDrawLine}></input>
                    <input type="button" className="btnGroup btnRedo" title="redo" onClick={this.redo}></input>
                    <input type="button" className="btnGroup btnUndo" title="undo" onClick={this.undo}></input>
                    <input type="button" className="btnGroup btnSearch" title="search" onClick={this.matchModel}></input>
                </div>
                <div className="panel">
                    <svg ref={this.svgRef} style={{ width: "100%", height: "100%", cursor: 'pointer' }} onClick={this.drawNode} onMouseMove={this.drawDashLine}>
                        {linkEl}
                        {nodeEl}
                    </svg>
                </div>
                <div className="model">
                    {nodeLinkEl}
                </div>
            </div>
        )
    }
}

export default DrawPanel;