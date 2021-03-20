import * as React from 'react';
import axios from 'axios';
import NodeLink from './NodeLink'
import * as d3 from 'd3';
import TargetTree from './TargetTree';

interface Props {
    url: string,
    parent: any,
    num: number,
    dimensions: number,
    strWeight: number,
    attrWeight: number,
    attrChecked: attr,
    attrValue: attr,
    dataType: string,
}
type node = {
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
    private svgWidth: number = 0;
    private svgHeight: number = 0;
    private circleR:number=5;
    private padding = { top: 10, bottom: 10, left: 40, right: 10 };
    private modelGraohs = [
        { id: -1, nodes: [1, 2, 3], edges: [[1, 2], [2, 3]] },
        { id: -2, nodes: [1, 2, 3, 4, 5, 6], edges: [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6]] },
        { id: -3, nodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], edges: [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [6, 7], [6, 8], [6, 9], [6, 10]] },
    ];
    private modelTrees = [
        { id: -4, children: [{ id: 1, children: [{ id: 2 }] }] },


        { id: -5, children: [{ id: 1, children: [{ id: 2 }, { id: 3 }, { id: 4 }] }] },


        { id: -6, children: [{ id: 1, children: [{ id: 2, children: [{ id: 3 }, { id: 4 }] }, { id: 5, children: [{ id: 6 }, { id: 7 }] }] }] },


        { id: -7, children: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
    ];
    constructor(props: Props) {
        super(props);
        this.state = { nodes: [], links: [], id: -10 };
        this.svgRef = React.createRef();
        this.beginDrawNode = this.beginDrawNode.bind(this);
        this.beginDrawLine = this.beginDrawLine.bind(this);
        this.redo = this.redo.bind(this);
        this.undo = this.undo.bind(this);
        this.matchModel = this.matchModel.bind(this);
        this.drawNode = this.drawNode.bind(this);
        this.drawLine = this.drawLine.bind(this);
        this.drawDashLine = this.drawDashLine.bind(this);
        this.chooseModelGraph = this.chooseModelGraph.bind(this);
        this.chooseModelTree = this.chooseModelTree.bind(this);
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
        let { links, nodes, id } = this.state;
        const { url, dimensions, strWeight, attrWeight, attrChecked, attrValue, dataType } = this.props;
        if (this.record.indexOf('model') < 0) {
            id = -10;
        }
        let edges = links.map((value: link) => 
        ['id' in value.source?value.source.id:value.source.data.id, 'id' in value.target?value.target.id:value.target.data.id]);
        let features: feature = {};
        let nodesId: Array<number> = [];
        nodes.forEach((value: node) => {
            let id='id' in value?value.id:value.data.id;
            features[id] = 'depth' in value?value.depth:1;
            nodesId.push(id);
        })
        
        let checkedArr: any = [];
        for (let key in attrChecked) {
            checkedArr.push({ name: key, value: attrChecked[key] })
        }
        axios.post(url, {
            name: String(id), nodes: nodesId, edges: edges, features: features, num: this.props.num, dimensions: dimensions, strWeight: strWeight,
            attrWeight: attrWeight, attrChecked: checkedArr, attrValue: attrValue, dataType: dataType
        }, { timeout: 1200000 }).then(res => {
            // console.log(res.data)
            this.props.parent.setReTsneData(res.data.all);
            setTimeout(() => {
                this.props.parent.setChoosePoints(res.data.match);
                this.props.parent.setCenterPoint(res.data.center);
            }, 1500);

        })
    }
    //选择系统自带的模板图
    chooseModelGraph(graph:any,nodesid: any, links: any, id: number): void {
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
                    end: true,
                })
            }

            resolve([newNodes, newLinks]);
        }).then((res: any) => {
            // console.log(res[0])
            this.setState({ nodes: res[0], links: res[1], id: id });
        })
    }
    //选择系统自带的模板树
    chooseModelTree(data: any): void {
        this.pen = "model";
        this.record.push("model");
        let treeData = d3.tree().size([this.svgHeight - this.padding.top, this.svgWidth - this.padding.left])(d3.hierarchy(data));
        let treeDataLinks = treeData.links();
        treeDataLinks.forEach((value: any) => {
            value.d = d3.linkHorizontal()  //d3.linkVertical()  d3.linkHorizontal().x(d => d.y).y(d => d.x)
                .x((d: any) => d.y)
                .y((d: any) => d.x)(value)
            value.end=true;
        })
        let treeDataNodes = treeData.descendants();
        treeDataNodes.forEach((value:any)=>{
            let x=value.x;
            value.x=value.y+this.circleR;
            value.y=x;
        })

        this.setState({ nodes: treeDataNodes, links: treeDataLinks, id: data.id });
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
                    if (this.props.dataType === 'Family') {
                        let createLink = d3.linkHorizontal()  //d3.linkVertical()  d3.linkHorizontal().x(d => d.y).y(d => d.x)
                            .x((d: any) => d.x)
                            .y((d: any) => d.y)
                        link.d = createLink(link);
                    }
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
                    if (this.props.dataType === 'Family') {
                        let createLink = d3.linkHorizontal()  //d3.linkVertical()  d3.linkHorizontal().x(d => d.y).y(d => d.x)
                            .x((d: any) => d.x)
                            .y((d: any) => d.y)
                        link.d = createLink(link);
                    }
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
    componentWillReceiveProps(nextProps:Props){
        if(this.props.dataType!==nextProps.dataType){
            this.pen='';
            this.record=[];
            this.setState({nodes:[],links:[],id:-10});
        }
    }
    render() {
        const { nodes, links } = this.state;
        const { dataType } = this.props;
        const nodeEl = nodes.map((value: node, index: number) =>
            <circle r={this.circleR} cx={value.x} cy={value.y} key={index} fill="white" strokeWidth="1px" stroke="#3072ad" onClick={this.drawLine.bind(this, value)}></circle>
        )
        const linkEl = dataType === 'Author' ? links.map((value: link, index: number) =>
            <line x1={value.source.x} y1={value.source.y} x2={value.target.x}
                y2={value.target.y} fill="none" strokeWidth="1px" stroke="#ccc" key={index} strokeDasharray={value.end ? '0' : '5 5'}></line>
        ) : links.map((value: link, index: number) =>
            <path d={value.d}
                 fill="none" strokeWidth="1px" stroke="#ccc" key={index} strokeDasharray={value.end ? '0' : '5 5'}></path>
        )
        const model = dataType === 'Author' ? this.modelGraohs.map((value: any, index: number) =>
            <div className='modelGraph' key={index} style={{ width: '109px', left: `${112 * index+3}px`}}>
                <NodeLink key={index} graph={value} parent={this} onClick={this.chooseModelGraph} />
            </div>
        ) : this.modelTrees.map((value: any, index: number) =>
            <div className='modelGraph' key={index} style={{ width: '109px', left: `${112 * index+3}px`}}>
                <TargetTree key={index} graph={value} parent={this} onClick={this.chooseModelTree} />
            </div>
        )

        return (
            <div style={{width:'100%',height:'100%'}}>
                <div className="tools">
                    <input type="button" className="btnGroup btnNode" title="node" onClick={this.beginDrawNode}></input>
                    <input type="button" className="btnGroup btnLine" title="link" onClick={this.beginDrawLine}></input>
                    <input type="button" className="btnGroup btnRedo" title="redo" onClick={this.redo}></input>
                    <input type="button" className="btnGroup btnUndo" title="undo" onClick={this.undo}></input>
                    <input type="button" className="btnGroup btnSearch" title="search" onClick={this.matchModel}></input>
                </div>
                <div className="panel" style={{padding:'0 5px'}}>
                    <svg ref={this.svgRef} style={{ width: "100%", height: "100%", cursor: 'pointer' }} onClick={this.drawNode} onMouseMove={this.drawDashLine}>
                        {linkEl}
                        {nodeEl}
                    </svg>
                </div>
                <div className="model">
                    {model}
                </div>
            </div>
        )
    }
}

export default DrawPanel;